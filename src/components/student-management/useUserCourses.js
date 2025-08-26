import { useState, useEffect } from 'react';
import { getSatelliteUserCourses } from '../../utils/api';

const useUserCourses = () => {
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 現在ログイン中の指導員情報を取得
  const getCurrentInstructor = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser;
  };

  const currentInstructor = getCurrentInstructor();

  // 現在選択されている拠点IDを取得
  const getCurrentSatelliteId = () => {
    const selectedSatellite = JSON.parse(localStorage.getItem('selectedSatellite') || '{}');
    return selectedSatellite.id || currentInstructor.satellite_ids?.[0] || 1; // デフォルト値
  };

  // 利用者のコース関連付けを取得
  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteUserCourses(satelliteId);
      if (response.success) {
        // 重複データを除去
        const uniqueCourses = (response.data || []).filter((course, index, self) => 
          index === self.findIndex(c => 
            c.user_id === course.user_id && 
            c.course_id === course.course_id
          )
        );
        setUserCourses(uniqueCourses);
      }
    } catch (error) {
      console.error('利用者のコース関連付け取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchUserCourses();
  }, []);

  return {
    userCourses,
    loading,
    refetch: fetchUserCourses
  };
};

export default useUserCourses;
