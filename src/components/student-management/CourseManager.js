import React, { useState, useEffect } from 'react';
import { 
  getSatelliteUserCourses,
  getSatelliteAvailableCourses,
  getSatelliteAvailableCurriculumPaths,
  bulkAssignCoursesToUsers,
  bulkRemoveCoursesFromUsers,
  bulkAssignCurriculumPathsToUsers
} from '../../utils/api';

const CourseManager = ({ students, onStudentsUpdate }) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableCurriculumPaths, setAvailableCurriculumPaths] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCurriculumPath, setSelectedCurriculumPath] = useState('');

  // コースデータを取得する関数
  const fetchCourses = () => {
    // ローカルストレージからコースデータを取得
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      setAvailableCourses(JSON.parse(storedCourses));
    } else {
      // デフォルトのコースデータ（管理者画面と同じ）
      const defaultCourses = [
        {
          id: 'course001',
          title: 'オフィスソフトの操作・文書作成',
          category: '選択科目',
          description: 'Word、Excel、PowerPointの基本操作を学び、実務で使える文書作成スキルを習得',
          duration: '3ヶ月',
          difficulty: 'beginner',
          totalLessons: 6,
          enrolledStudents: 12,
          completionRate: 85,
          status: 'active',
          createdDate: '2023-06-01',
          lastUpdated: '2024-01-10',
          tags: ['Word', 'Excel', 'PowerPoint', '文書作成', '選択科目'],
          isElective: true,
          prerequisites: [],
          order: 0
        },
        {
          id: 'course002',
          title: 'ITリテラシー・AIの基本',
          category: '必修科目',
          description: 'ITの基礎知識とAIの基本概念を学び、デジタル社会で活躍するための土台を構築',
          duration: '3ヶ月',
          difficulty: 'beginner',
          totalLessons: 6,
          enrolledStudents: 15,
          completionRate: 92,
          status: 'active',
          createdDate: '2023-06-01',
          lastUpdated: '2024-01-15',
          tags: ['IT基礎', 'AI', 'デジタルリテラシー', '必修科目'],
          isElective: false,
          prerequisites: [],
          order: 1
        }
      ];
      setAvailableCourses(defaultCourses);
      localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
  };

  // 利用者のコース情報を取得
  const fetchUserCourses = async () => {
    try {
      const result = await getSatelliteUserCourses();
      if (result.success) {
        // 利用者のコース情報を更新
        onStudentsUpdate(prevStudents => 
          prevStudents.map(student => {
            const userCourses = result.data.filter(uc => uc.user_id === student.id);
            return {
              ...student,
              courses: userCourses
            };
          })
        );
      }
    } catch (error) {
      console.error('利用者コース取得エラー:', error);
    }
  };

  // 利用可能なコースを取得
  const fetchSatelliteAvailableCourses = async () => {
    try {
      const result = await getSatelliteAvailableCourses();
      if (result.success) {
        setAvailableCourses(result.data);
      }
    } catch (error) {
      console.error('利用可能コース取得エラー:', error);
    }
  };

  // 利用可能なカリキュラムパスを取得
  const fetchAvailableCurriculumPaths = async () => {
    try {
      const result = await getSatelliteAvailableCurriculumPaths();
      if (result.success) {
        setAvailableCurriculumPaths(result.data);
      }
    } catch (error) {
      console.error('利用可能カリキュラムパス取得エラー:', error);
    }
  };

  // コース一括割り当て
  const handleBulkAssignCourses = async () => {
    if (selectedStudents.length === 0 || selectedCourses.length === 0) {
      alert('利用者とコースを選択してください');
      return;
    }

    try {
      const result = await bulkAssignCoursesToUsers(selectedStudents, selectedCourses);
      if (result.success) {
        alert('コースの一括割り当てが完了しました');
        setSelectedStudents([]);
        setSelectedCourses([]);
        fetchUserCourses(); // 利用者コース情報を更新
      } else {
        alert(`コースの一括割り当てに失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('コース一括割り当てエラー:', error);
      alert('コースの一括割り当てに失敗しました');
    }
  };

  // コース一括削除
  const handleBulkRemoveCourses = async () => {
    if (selectedStudents.length === 0 || selectedCourses.length === 0) {
      alert('利用者とコースを選択してください');
      return;
    }

    if (!window.confirm('選択された利用者からコースを削除しますか？')) {
      return;
    }

    try {
      const result = await bulkRemoveCoursesFromUsers(selectedStudents, selectedCourses);
      if (result.success) {
        alert('コースの一括削除が完了しました');
        setSelectedStudents([]);
        setSelectedCourses([]);
        fetchUserCourses(); // 利用者コース情報を更新
      } else {
        alert(`コースの一括削除に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('コース一括削除エラー:', error);
      alert('コースの一括削除に失敗しました');
    }
  };

  // カリキュラムパス一括割り当て
  const handleBulkAssignCurriculumPath = async () => {
    if (selectedStudents.length === 0 || !selectedCurriculumPath) {
      alert('利用者とカリキュラムパスを選択してください');
      return;
    }

    try {
      const result = await bulkAssignCurriculumPathsToUsers(selectedStudents, selectedCurriculumPath);
      if (result.success) {
        alert('カリキュラムパスの一括割り当てが完了しました');
        setSelectedStudents([]);
        setSelectedCurriculumPath('');
        fetchUserCourses(); // 利用者コース情報を更新
      } else {
        alert(`カリキュラムパスの一括割り当てに失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('カリキュラムパス一括割り当てエラー:', error);
      alert('カリキュラムパスの一括割り当てに失敗しました');
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSatelliteAvailableCourses();
    fetchAvailableCurriculumPaths();
    fetchUserCourses();
  }, []);

  return {
    availableCourses,
    availableCurriculumPaths,
    selectedStudents,
    setSelectedStudents,
    selectedCourses,
    setSelectedCourses,
    selectedCurriculumPath,
    setSelectedCurriculumPath,
    handleBulkAssignCourses,
    handleBulkRemoveCourses,
    handleBulkAssignCurriculumPath,
    fetchUserCourses
  };
};

export default CourseManager;
