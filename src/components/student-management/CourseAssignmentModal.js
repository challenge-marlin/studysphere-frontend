import React, { useState, useEffect } from 'react';
import { 
  getSatelliteUserCourses,
  getSatelliteAvailableCourses,
  getSatelliteAvailableCurriculumPaths,
  bulkAssignCoursesToUsers,
  bulkRemoveCoursesFromUsers,
  bulkAssignCurriculumPathsToUsers
} from '../../utils/api';

const CourseAssignmentModal = ({ 
  isOpen, 
  onClose, 
  students, 
  instructors, 
  onCoursesUpdated 
}) => {
  // 学習コース管理用の状態変数
  const [userCourses, setUserCourses] = useState([]);
  const [satelliteAvailableCourses, setSatelliteAvailableCourses] = useState([]);
  const [availableCurriculumPaths, setAvailableCurriculumPaths] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCurriculumPath, setSelectedCurriculumPath] = useState('');
  const [courseAssignmentNotes, setCourseAssignmentNotes] = useState('');
  const [courseModalActiveTab, setCourseModalActiveTab] = useState('courses'); // 'courses' or 'curriculum'
  const [courseModalFilterText, setCourseModalFilterText] = useState('');
  const [courseModalFilterInstructor, setCourseModalFilterInstructor] = useState('');
  const [courseModalFilterStatus, setCourseModalFilterStatus] = useState('all');

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

  // 学習コース管理機能のAPI関数
  const fetchUserCourses = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteUserCourses(satelliteId);
      if (response.success) {
        setUserCourses(response.data || []);
      }
    } catch (error) {
      console.error('利用者のコース関連付け取得エラー:', error);
    }
  };

  const fetchSatelliteAvailableCourses = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteAvailableCourses(satelliteId);
      if (response.success) {
        setSatelliteAvailableCourses(response.data || []);
      }
    } catch (error) {
      console.error('利用可能なコース取得エラー:', error);
    }
  };

  const fetchAvailableCurriculumPaths = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteAvailableCurriculumPaths(satelliteId);
      if (response.success) {
        setAvailableCurriculumPaths(response.data || []);
      }
    } catch (error) {
      console.error('利用可能なカリキュラムパス取得エラー:', error);
    }
  };

  const handleBulkAssignCourses = async () => {
    if (selectedStudents.length === 0) {
      alert('一括操作する利用者を選択してください');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('割り当てるコースを選択してください');
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkAssignCoursesToUsers(satelliteId, {
        userIds: selectedStudents,
        courseIds: selectedCourses,
        notes: courseAssignmentNotes
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCourses([]);
        setCourseAssignmentNotes('');
        onClose();
        if (onCoursesUpdated) {
          onCoursesUpdated();
        }
        alert(response.message);
      } else {
        throw new Error(response.message || 'コースの一括割り当てに失敗しました');
      }
    } catch (error) {
      console.error('コース一括割り当てエラー:', error);
      alert(`コースの一括割り当てに失敗しました: ${error.message}`);
    }
  };

  const handleBulkRemoveCourses = async () => {
    if (selectedStudents.length === 0) {
      alert('削除対象の利用者を選択してください');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('削除するコースを選択してください');
      return;
    }

    if (!window.confirm(`選択された${selectedStudents.length}名の利用者から${selectedCourses.length}個のコースを削除しますか？`)) {
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkRemoveCoursesFromUsers(satelliteId, {
        userIds: selectedStudents,
        courseIds: selectedCourses
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCourses([]);
        onClose();
        if (onCoursesUpdated) {
          onCoursesUpdated();
        }
        alert(response.message);
      } else {
        throw new Error(response.message || 'コースの一括削除に失敗しました');
      }
    } catch (error) {
      console.error('コース一括削除エラー:', error);
      alert(`コースの一括削除に失敗しました: ${error.message}`);
    }
  };

  const handleBulkAssignCurriculumPath = async () => {
    if (selectedStudents.length === 0) {
      alert('一括操作する利用者を選択してください');
      return;
    }
    if (!selectedCurriculumPath) {
      alert('割り当てるカリキュラムパスを選択してください');
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkAssignCurriculumPathsToUsers(satelliteId, {
        userIds: selectedStudents,
        curriculumPathId: selectedCurriculumPath,
        notes: courseAssignmentNotes
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCurriculumPath('');
        setCourseAssignmentNotes('');
        onClose();
        if (onCoursesUpdated) {
          onCoursesUpdated();
        }
        alert(response.message);
      } else {
        throw new Error(response.message || 'カリキュラムパスの一括割り当てに失敗しました');
      }
    } catch (error) {
      console.error('カリキュラムパス一括割り当てエラー:', error);
      alert(`カリキュラムパスの一括割り当てに失敗しました: ${error.message}`);
    }
  };

  // カリキュラムパス選択時のコース自動チェック
  const handleCurriculumPathSelect = (pathId) => {
    setSelectedCurriculumPath(pathId);
    
    if (pathId) {
      const selectedPath = availableCurriculumPaths.find(path => path.id === parseInt(pathId));
      if (selectedPath && selectedPath.courses) {
        const courseIds = selectedPath.courses.map(course => course.course_id);
        setSelectedCourses(courseIds);
      }
    } else {
      setSelectedCourses([]);
    }
  };

  // モーダル内の利用者フィルタリング
  const getFilteredStudentsForModal = () => {
    let filteredStudents = students;
    
    if (courseModalFilterText) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(courseModalFilterText.toLowerCase()) ||
        student.email?.toLowerCase().includes(courseModalFilterText.toLowerCase()) ||
        student.instructor_name?.toLowerCase().includes(courseModalFilterText.toLowerCase())
      );
    }
    
    if (courseModalFilterInstructor) {
      filteredStudents = filteredStudents.filter(student =>
        student.instructor_id === parseInt(courseModalFilterInstructor)
      );
    }
    
    if (courseModalFilterStatus !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.status === parseInt(courseModalFilterStatus)
      );
    }
    
    return filteredStudents;
  };

  // モーダルを閉じる際のリセット処理
  const handleClose = () => {
    setSelectedStudents([]);
    setSelectedCourses([]);
    setSelectedCurriculumPath('');
    setCourseAssignmentNotes('');
    setCourseModalActiveTab('courses');
    setCourseModalFilterText('');
    setCourseModalFilterInstructor('');
    setCourseModalFilterStatus('all');
    onClose();
  };

  // 初期データ取得
  useEffect(() => {
    if (isOpen) {
      fetchUserCourses();
      fetchSatelliteAvailableCourses();
      fetchAvailableCurriculumPaths();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">📚 学習コース・カリキュラムパス管理</h3>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 利用者選択セクション */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👥 対象利用者選択</h4>
            
            {/* 利用者フィルター */}
            <div className="mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="利用者名、メール、指導員名で検索..."
                    value={courseModalFilterText}
                    onChange={(e) => setCourseModalFilterText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <select 
                    value={courseModalFilterInstructor} 
                    onChange={(e) => setCourseModalFilterInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">全ての指導員</option>
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select 
                    value={courseModalFilterStatus} 
                    onChange={(e) => setCourseModalFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">全てのステータス</option>
                    <option value="1">稼働中</option>
                    <option value="0">停止中</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-700">
                  表示中: <strong className="text-orange-600">{getFilteredStudentsForModal().length}名</strong> / 
                  選択中: <strong className="text-orange-600">{selectedStudents.length}名</strong>
                </p>
                <button 
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-all duration-200"
                  onClick={() => {
                    const filteredStudents = getFilteredStudentsForModal();
                    if (selectedStudents.length === filteredStudents.length) {
                      setSelectedStudents([]);
                    } else {
                      setSelectedStudents(filteredStudents.map(s => s.id));
                    }
                  }}
                >
                  {selectedStudents.length === getFilteredStudentsForModal().length ? '全選択解除' : '全選択'}
                </button>
              </div>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {getFilteredStudentsForModal().map(student => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => {
                      setSelectedStudents(prev => 
                        prev.includes(student.id) 
                          ? prev.filter(id => id !== student.id)
                          : [...prev, student.id]
                      );
                    }}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <span className="text-sm text-gray-500 ml-2">担当: {student.instructor_name || '未設定'}</span>
                    <span className="text-sm text-gray-500 ml-2">メール: {student.email || '未設定'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      student.status === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status === 1 ? '稼働中' : '停止中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* タブ切り替え */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button 
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  courseModalActiveTab === 'courses' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setCourseModalActiveTab('courses')}
              >
                📖 個別コース選択
              </button>
              <button 
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  courseModalActiveTab === 'curriculum' 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setCourseModalActiveTab('curriculum')}
              >
                🛤️ カリキュラムパス選択
              </button>
            </div>

            {courseModalActiveTab === 'courses' ? (
              /* コース選択セクション */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">選択中のコース: <strong className="text-blue-600">{selectedCourses.length}個</strong></p>
                  <button 
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-200"
                    onClick={() => setSelectedCourses([])}
                  >
                    全選択解除
                  </button>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {satelliteAvailableCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => {
                          setSelectedCourses(prev => 
                            prev.includes(course.id) 
                              ? prev.filter(id => id !== course.id)
                              : [...prev, course.id]
                          );
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{course.title}</span>
                        <span className="text-sm text-gray-500 ml-2">カテゴリ: {course.category}</span>
                        <span className="text-sm text-gray-500 ml-2">レッスン数: {course.lesson_count}回</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* カリキュラムパス選択セクション */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    選択中のパス: <strong className="text-purple-600">
                      {selectedCurriculumPath ? availableCurriculumPaths.find(p => p.id === parseInt(selectedCurriculumPath))?.name : 'なし'}
                    </strong>
                  </p>
                  <button 
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-all duration-200"
                    onClick={() => {
                      setSelectedCurriculumPath('');
                      setSelectedCourses([]);
                    }}
                  >
                    選択解除
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {availableCurriculumPaths.map(path => (
                    <div key={path.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="curriculumPath"
                          value={path.id}
                          checked={selectedCurriculumPath === path.id.toString()}
                          onChange={(e) => handleCurriculumPathSelect(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">{path.name}</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {path.total_courses}コース
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                          
                          {/* 含まれるコース一覧 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">含まれるコース:</p>
                            <div className="space-y-1">
                              {path.courses?.map((course, index) => (
                                <div key={course.course_id} className="flex items-center gap-2 text-xs">
                                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-medium">
                                    {index + 1}
                                  </span>
                                  <span className="text-gray-700">{course.course_title}</span>
                                  <span className="text-gray-500">({course.course_category})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 備考入力セクション */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📝 備考（オプション）</h4>
            <textarea
              value={courseAssignmentNotes}
              onChange={(e) => setCourseAssignmentNotes(e.target.value)}
              placeholder="コース割り当てに関する備考を入力してください..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

        </div>
        
        {/* フッター - 固定 */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button 
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              onClick={handleClose}
            >
              キャンセル
            </button>
            {courseModalActiveTab === 'courses' ? (
              <>
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleBulkRemoveCourses}
                  disabled={selectedStudents.length === 0 || selectedCourses.length === 0}
                >
                  🗑️ 一括削除
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleBulkAssignCourses}
                  disabled={selectedStudents.length === 0 || selectedCourses.length === 0}
                >
                  ➕ 一括追加
                </button>
              </>
            ) : (
              <button 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={handleBulkAssignCurriculumPath}
                disabled={selectedStudents.length === 0 || !selectedCurriculumPath}
              >
                ➕ カリキュラムパス追加
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignmentModal;
