import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import TempPasswordManager from './student-management/TempPasswordManager';
import StudentEditor from './student-management/StudentEditor';
import CourseManager from './student-management/CourseManager';
import StudentAdder from './student-management/StudentAdder';
import TagManager from './student-management/TagManager';
import CourseAssignmentModal from './student-management/CourseAssignmentModal';
import StudentTable from './student-management/StudentTable';
import useUserCourses from './student-management/useUserCourses';
import TodayActiveModal from './student-management/TodayActiveModal';
import DailyReportManagement from './DailyReportManagement';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StudentManagementRefactored = ({ teacherId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // 基本状態管理
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  // フィルター関連のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // 今日の活動メッセージ関連のstate
  const [showTodayActiveModal, setShowTodayActiveModal] = useState(false);

  // 学習コース追加モーダルの状態
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);

  // 日報管理モーダルの状態
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [selectedStudentForReports, setSelectedStudentForReports] = useState(null);

  // コース情報を取得するカスタムフック
  const { userCourses, refetch: refetchUserCourses } = useUserCourses();

  // 利用者データを取得
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const result = await response.json();
        const users = result.data?.users || result;
        const studentUsers = users.filter(user => user.role === 1);
        
        console.log('=== 利用者データ取得デバッグ ===');
        console.log('全ユーザー数:', users.length);
        console.log('利用者数:', studentUsers.length);
        
        // 各利用者のタグと一時パスワード情報を確認
        studentUsers.forEach((student, index) => {
          // タグデータを適切に処理
          let processedTags = [];
          if (student.tags) {
            if (typeof student.tags === 'string') {
              // 文字列の場合はカンマで分割
              processedTags = student.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(student.tags)) {
              // 配列の場合はそのまま使用
              processedTags = student.tags;
            }
          }
          
          // 学習コースを除外するフィルタリング
          const courseKeywords = [
            'ITリテラシー・AI',
            'LP制作（HTML・CS',
            'SNS運用の基礎・画像生',
            'ITリテラシー・AIの基',
            'LP制作（HTML・',
            'SNS運用の基礎・画'
          ];
          
          processedTags = processedTags.filter(tag => {
            // 学習コースに関連するキーワードを含むタグを除外
            return !courseKeywords.some(keyword => tag.includes(keyword));
          });
          
          // 処理済みタグを設定
          student.tags = processedTags;
          
          console.log(`利用者${index + 1} (${student.name}):`, {
            id: student.id,
            name: student.name,
            tags: student.tags,
            tagsType: typeof student.tags,
            temp_password: student.temp_password,
            expires_at: student.expires_at,
            instructor_name: student.instructor_name,
            is_remote_user: student.is_remote_user,
            course_names: student.course_names
          });
        });
        
        setStudents(studentUsers);
      } else {
        console.error('利用者データ取得エラー:', response.status);
      }
    } catch (error) {
      console.error('利用者データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 指導員データを取得
  const fetchInstructors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const result = await response.json();
        const users = result.data?.users || result;
        const instructorUsers = users.filter(user => user.role === 4);
        setInstructors(instructorUsers);
      }
    } catch (error) {
      console.error('指導員データ取得エラー:', error);
    }
  };

  // 子コンポーネントのフックを使用
  const tempPasswordManager = TempPasswordManager({ 
    students, 
    onStudentsUpdate: setStudents 
  });

  const studentEditor = StudentEditor({ 
    student: null, 
    onUpdate: fetchStudents, 
    onClose: () => {}, 
    instructors 
  });

  const courseManager = CourseManager({ 
    students, 
    onStudentsUpdate: setStudents 
  });

  const studentAdder = StudentAdder({ 
    onStudentAdded: fetchStudents, 
    instructors 
  });

  const tagManager = TagManager({ 
    students, 
    onStudentsUpdate: fetchStudents 
  });

  // 利用者削除
  const deleteStudent = async (studentId) => {
    if (!window.confirm('この利用者を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('利用者が削除されました');
        fetchStudents();
      } else {
        alert('利用者削除に失敗しました');
      }
    } catch (error) {
      console.error('利用者削除エラー:', error);
      alert('利用者削除に失敗しました');
    }
  };

  // 利用者ステータス切り替え
  const toggleStudentStatus = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      const newStatus = student.status === 1 ? 0 : 1;
      
      const response = await fetch(`${API_BASE_URL}/api/users/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`利用者のステータスが${newStatus === 1 ? '稼働中' : '停止中'}に変更されました`);
        fetchStudents();
      } else {
        alert('ステータス変更に失敗しました');
      }
    } catch (error) {
      console.error('ステータス変更エラー:', error);
      alert('ステータス変更に失敗しました');
    }
  };

  // 編集モーダルを開く
  const openEditModal = (student) => {
    studentEditor.openEditModal(student);
  };

  // 日報確認モーダルを開く
  const openDailyReportModal = (student) => {
    setSelectedStudentForReports(student);
    setShowDailyReportModal(true);
  };

  // 日報確認モーダルを閉じる
  const closeDailyReportModal = () => {
    setShowDailyReportModal(false);
    setSelectedStudentForReports(null);
  };

  // フィルター機能
  const getFilteredStudents = () => {
    return students.filter(student => {
      // 検索フィルター
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.login_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.instructor_name && student.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // ステータスフィルター
      const matchesStatus = statusFilter === 'all' || student.status.toString() === statusFilter;

      // タグフィルター
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => student.tags && student.tags.includes(tag));

      return matchesSearch && matchesStatus && matchesTags;
    });
  };

  // 全てのフィルターをクリア
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setStatusFilter('all');
  };

  // タグの選択/解除
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 利用者選択の処理
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 全利用者選択/選択解除
  const handleSelectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  // コース更新時の処理
  const handleCoursesUpdated = () => {
    refetchUserCourses();
  };

  useEffect(() => {
    fetchStudents();
    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                👥 利用者一覧
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">指導員ダッシュボード</p>
                  <p className="text-sm text-gray-500">※利用者の管理と一時パスワード発行を行います</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                onClick={() => tagManager.setShowTagModal(true)}
              >
                🏷️ タグ一括追加
              </button>
                             <button 
                 className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                 onClick={() => setShowTodayActiveModal(true)}
               >
                 🔑 本日有効
               </button>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                onClick={() => setShowCourseAssignmentModal(true)}
              >
                📚 学習コース追加
              </button>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                onClick={() => studentAdder.setShowAddForm(true)}
              >
                + 新しい利用者を追加
              </button>
            </div>
          </div>
        </div>

        {/* フィルター部分 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="space-y-6">
            {/* トップフィルター */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="利用者名、ログインコード、指導員名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>
              <div className="flex gap-3">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">全てのステータス</option>
                  <option value="1">稼働中</option>
                  <option value="0">停止中</option>
                </select>
                <button 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={clearFilters}
                >
                  クリア
                </button>
              </div>
            </div>

            {/* タグフィルター */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">タグフィルター:</label>
              <div className="flex flex-wrap gap-2">
                {tagManager.getAllTags().map(tag => (
                  <button
                    key={tag}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedTags.includes(tag) 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* フィルターサマリー */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span className="font-semibold text-gray-700">
                  表示中: {filteredStudents.length}名 / 全{students.length}名
                </span>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">選択中のタグ:</span>
                  <div className="flex gap-1">
                    {selectedTags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 利用者一覧 */}
        <div className="mb-8">
          <StudentTable
            students={filteredStudents}
            selectedStudents={selectedStudents}
            onSelectStudent={handleSelectStudent}
            onSelectAllStudents={handleSelectAllStudents}
            onIssueTemporaryPassword={tempPasswordManager.issueTemporaryPassword}
            onEditStudent={openEditModal}
            onToggleStatus={toggleStudentStatus}
            onDeleteStudent={deleteStudent}
            userCourses={userCourses}
            onViewDailyReports={openDailyReportModal}
          />
        </div>

        {/* モーダル類 */}
        {/* タグ一括追加モーダル */}
        {tagManager.showTagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">🏷️ タグ一括追加</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={tagManager.resetModal}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="flex">
                {/* 左側：利用者選択エリア */}
                <div className="w-1/2 p-6 border-r border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">利用者選択</h4>
                  
                  {/* 検索フィルター */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
                    <input
                      type="text"
                      value={tagManager.searchTerm}
                      onChange={(e) => tagManager.setSearchTerm(e.target.value)}
                      placeholder="利用者名、ログインコード、指導員名で検索..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* タグフィルター */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">タグフィルター</label>
                    <div className="flex flex-wrap gap-2">
                      {tagManager.getAllTags().map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => tagManager.toggleTagFilter(tag)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            tagManager.selectedTags.includes(tag)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 全選択ボタン */}
                  <div className="mb-4">
                    <button
                      onClick={tagManager.toggleAllStudents}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                    >
                      {tagManager.selectedStudents.length === tagManager.getFilteredStudents().length 
                        ? '全選択解除' 
                        : '全選択'}
                    </button>
                    <span className="ml-2 text-sm text-gray-600">
                      {tagManager.selectedStudents.length} / {tagManager.getFilteredStudents().length} 選択中
                    </span>
                  </div>

                  {/* 利用者リスト */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {tagManager.getFilteredStudents().length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        条件に一致する利用者がいません
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {tagManager.getFilteredStudents().map((student) => (
                          <div
                            key={student.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              tagManager.selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => tagManager.toggleStudentSelection(student.id)}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={tagManager.selectedStudents.includes(student.id)}
                                onChange={() => tagManager.toggleStudentSelection(student.id)}
                                className="mr-3 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.login_code}</div>
                                {student.instructor_name && (
                                  <div className="text-xs text-gray-400">指導員: {student.instructor_name}</div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-32">
                                {student.tags && student.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded truncate"
                                    title={tag}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {student.tags && student.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{student.tags.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 右側：タグ選択エリア */}
                <div className="w-1/2 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">追加するタグ</h4>
                  
                                     <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       タグ例
                     </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tagManager.customTags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => tagManager.toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            tagManager.tagsToAdd.includes(tag)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagManager.newTagName}
                        onChange={(e) => tagManager.setNewTagName(e.target.value)}
                        placeholder="新しいタグ名を入力"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={tagManager.addNewTag}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                      >
                        追加
                      </button>
                    </div>
                  </div>

                  {/* 選択されたタグの表示 */}
                  {tagManager.tagsToAdd.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        追加予定のタグ ({tagManager.tagsToAdd.length}個)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tagManager.tagsToAdd.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 選択された利用者の表示 */}
                  {tagManager.selectedStudents.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選択された利用者 ({tagManager.selectedStudents.length}名)
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {tagManager.selectedStudents.map((studentId) => {
                          const student = students.find(s => s.id === studentId);
                          return student ? (
                            <div key={studentId} className="text-sm text-gray-700 py-1">
                              {student.name} ({student.login_code})
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* フッター */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {tagManager.selectedStudents.length > 0 && tagManager.tagsToAdd.length > 0 && (
                      <span>
                        {tagManager.selectedStudents.length}名の利用者に{tagManager.tagsToAdd.length}個のタグを追加します
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={tagManager.resetModal}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={tagManager.handleBulkAddTags}
                      disabled={tagManager.selectedStudents.length === 0 || tagManager.tagsToAdd.length === 0}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      タグを追加 ({tagManager.selectedStudents.length}名)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* 本日有効・一括利用設定モーダル */}
         <TodayActiveModal
           isOpen={showTodayActiveModal}
           onClose={() => setShowTodayActiveModal(false)}
           students={students}
           selectedStudents={selectedStudents}
           onStudentsUpdate={fetchStudents}
           onSelectStudents={setSelectedStudents}
         />

        {/* 学習コース追加モーダル */}
        <CourseAssignmentModal
          isOpen={showCourseAssignmentModal}
          onClose={() => setShowCourseAssignmentModal(false)}
          students={students}
          instructors={instructors}
          onCoursesUpdated={handleCoursesUpdated}
        />

        {/* 利用者追加モーダル */}
        {studentAdder.showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">新しい利用者を追加</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={() => {
                      studentAdder.setShowAddForm(false);
                      studentAdder.setBulkInputMode(false);
                      studentAdder.setBulkInputText('');
                      studentAdder.setBulkInstructorId('');
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      !studentAdder.bulkInputMode 
                        ? 'bg-white text-indigo-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => studentAdder.setBulkInputMode(false)}
                  >
                    個別入力
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      studentAdder.bulkInputMode 
                        ? 'bg-white text-indigo-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => studentAdder.setBulkInputMode(true)}
                  >
                    一括入力
                  </button>
                </div>
                
                {!studentAdder.bulkInputMode ? (
                  // 個別入力モード
                  <form onSubmit={studentAdder.handleAddStudent} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">利用者名</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={studentAdder.newStudent.name}
                          onChange={studentAdder.handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="login_code" className="block text-sm font-semibold text-gray-700 mb-2">ログインコード</label>
                        <input
                          type="text"
                          id="login_code"
                          name="login_code"
                          value={studentAdder.newStudent.login_code}
                          onChange={studentAdder.handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="instructor_id" className="block text-sm font-semibold text-gray-700 mb-2">担当指導員</label>
                      <select
                        id="instructor_id"
                        name="instructor_id"
                        value={studentAdder.newStudent.instructor_id}
                        onChange={studentAdder.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">指導員を選択</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">タグ（カンマ区切り）</label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={studentAdder.newStudent.tags.join(', ')}
                        onChange={studentAdder.handleTagChange}
                        placeholder="優秀, 要フォロー"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => studentAdder.setShowAddForm(false)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200"
                      >
                        追加
                      </button>
                    </div>
                  </form>
                ) : (
                  // 一括入力モード
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">利用者情報（1行1人、カンマ区切り）</label>
                      <textarea
                        value={studentAdder.bulkInputText}
                        onChange={(e) => studentAdder.setBulkInputText(e.target.value)}
                        placeholder="利用者名,ログインコード&#10;利用者名,ログインコード"
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">担当指導員（全員共通）</label>
                      <select
                        value={studentAdder.bulkInstructorId}
                        onChange={(e) => studentAdder.setBulkInstructorId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">指導員を選択</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => studentAdder.setShowAddForm(false)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={studentAdder.handleBulkAddStudents}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200"
                      >
                        一括追加
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {studentEditor.showEditModal && studentEditor.editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">✏️ 利用者情報編集</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={() => studentEditor.setShowEditModal(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); studentEditor.handleUpdateStudent(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="edit_name" className="block text-sm font-semibold text-gray-700 mb-2">利用者名</label>
                      <input
                        type="text"
                        id="edit_name"
                        name="name"
                        value={studentEditor.editFormData.name}
                        onChange={studentEditor.handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit_instructor_id" className="block text-sm font-semibold text-gray-700 mb-2">担当指導員</label>
                      <select
                        id="edit_instructor_id"
                        name="instructor_id"
                        value={studentEditor.editFormData.instructor_id}
                        onChange={studentEditor.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">指導員を選択</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit_tags" className="block text-sm font-semibold text-gray-700 mb-2">タグ（カンマ区切り）</label>
                    <input
                      type="text"
                      id="edit_tags"
                      name="tags"
                      value={studentEditor.editFormData.tags.join(', ')}
                      onChange={studentEditor.handleTagChange}
                      placeholder="優秀, 要フォロー"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  {/* 個別支援計画 */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">個別支援計画</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="long_term_goal" className="block text-sm font-semibold text-gray-700 mb-2">長期目標</label>
                        <textarea
                          id="long_term_goal"
                          name="long_term_goal"
                          value={studentEditor.supportPlanData.long_term_goal}
                          onChange={studentEditor.handleSupportPlanChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="short_term_goal" className="block text-sm font-semibold text-gray-700 mb-2">短期目標</label>
                        <textarea
                          id="short_term_goal"
                          name="short_term_goal"
                          value={studentEditor.supportPlanData.short_term_goal}
                          onChange={studentEditor.handleSupportPlanChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="needs" className="block text-sm font-semibold text-gray-700 mb-2">ニーズ</label>
                        <textarea
                          id="needs"
                          name="needs"
                          value={studentEditor.supportPlanData.needs}
                          onChange={studentEditor.handleSupportPlanChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="support_content" className="block text-sm font-semibold text-gray-700 mb-2">支援内容</label>
                        <textarea
                          id="support_content"
                          name="support_content"
                          value={studentEditor.supportPlanData.support_content}
                          onChange={studentEditor.handleSupportPlanChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="goal_date" className="block text-sm font-semibold text-gray-700 mb-2">目標達成予定日</label>
                        <input
                          type="date"
                          id="goal_date"
                          name="goal_date"
                          value={studentEditor.supportPlanData.goal_date}
                          onChange={studentEditor.handleSupportPlanChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => studentEditor.setShowEditModal(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200"
                    >
                      更新
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 日報管理モーダル */}
        {showDailyReportModal && selectedStudentForReports && (
          <DailyReportManagement
            student={selectedStudentForReports}
            onClose={closeDailyReportModal}
          />
        )}
      </div>
    </div>
  );
};

export default StudentManagementRefactored;
