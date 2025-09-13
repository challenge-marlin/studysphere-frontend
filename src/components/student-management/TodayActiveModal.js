import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../utils/api';

const TodayActiveModal = ({ 
  isOpen, 
  onClose, 
  students, 
  selectedStudents, 
  onStudentsUpdate,
  onSelectStudents 
}) => {
  // 基本状態管理
  const [tempPasswordUsers, setTempPasswordUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [expiryTime, setExpiryTime] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [tempPasswordLoading, setTempPasswordLoading] = useState(false);
  

  
  // モーダルが開かれた時の初期化
  useEffect(() => {
    if (isOpen) {
      initializeModal();
    }
  }, [isOpen]);

  // selectedInstructorsが変更された時に一時パスワード対象利用者を再取得
  useEffect(() => {
    if (isOpen) {
      fetchTempPasswordUsers();
    }
  }, [selectedInstructors, isOpen]);

  // モーダル初期化
  const initializeModal = async () => {
    try {
      setTempPasswordLoading(true);
      
      // 指導員一覧を取得（自分自身を除外）
      const instructorResponse = await apiGet('/api/temp-passwords/instructors');
      if (instructorResponse.success) {
        // 現在ログインしている指導員を除外
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const filteredInstructors = instructorResponse.data.filter(instructor => 
          instructor.id !== currentUser?.id
        );
        setInstructors(filteredInstructors);
      }
      
      // 一時パスワード対象利用者を取得
      await fetchTempPasswordUsers();
      
    } catch (error) {
      console.error('一時パスワード機能初期化エラー:', error);
      alert('一時パスワード機能の初期化に失敗しました。');
    } finally {
      setTempPasswordLoading(false);
    }
  };

  // 一時パスワード対象利用者を取得
  const fetchTempPasswordUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedInstructors.length > 0) {
        selectedInstructors.forEach(instructorId => {
          params.append('selected_instructor_ids', instructorId);
        });
      }
      
      const response = await apiGet(`/api/temp-passwords/users?${params}`);
      
      if (response.success) {
        setTempPasswordUsers(response.data);
        // 全選択状態でスタート
        const allSelected = response.data.map(user => user.id);
        onSelectStudents(allSelected);
      }
    } catch (error) {
      console.error('一時パスワード対象利用者取得エラー:', error);
    }
  };

  // ユーザータイプに応じた表示名を取得
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'my_user':
        return '自分の担当利用者';
      case 'no_instructor_no_temp':
        return '担当なし・パスワード未発行';
      case 'selected_instructor':
        return '選択指導員の担当利用者';
      default:
        return 'その他';
    }
  };

  // 一時パスワード発行実行
  const sendTodayActiveEmails = async () => {
    if (selectedStudents.length === 0) {
      alert('一時パスワード発行対象の利用者を選択してください。');
      return;
    }
    
    try {
      setTempPasswordLoading(true);
      const requestData = {
        user_ids: selectedStudents,
        expiry_time: expiryTime || null,
        announcement_title: announcementTitle || null,
        announcement_message: announcementMessage || null
      };

      const response = await apiPost('/api/temp-passwords/issue', requestData);
      
      if (response.success) {
        alert(`${selectedStudents.length}名の利用者に一時パスワードを発行しました。`);
        
        // 利用者一覧を更新
        onStudentsUpdate();
        
        // モーダルを閉じて状態をリセット
        handleClose();
      } else {
        alert('一時パスワードの発行に失敗しました。');
      }
    } catch (error) {
      console.error('一時パスワード発行エラー:', error);
      alert('一時パスワードの発行に失敗しました。');
    } finally {
      setTempPasswordLoading(false);
    }
  };



  // モーダルを閉じる
  const handleClose = () => {
    setExpiryTime('');
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setSelectedInstructors([]);
    onClose();
  };

  // 全選択/全解除
  const toggleAllUsers = () => {
    if (selectedStudents.length === tempPasswordUsers.length) {
      onSelectStudents([]);
    } else {
      onSelectStudents(tempPasswordUsers.map(user => user.id));
    }
  };

  // 個別選択/選択解除
  const toggleUserSelection = (userId) => {
    const newSelected = selectedStudents.includes(userId)
      ? selectedStudents.filter(id => id !== userId)
      : [...selectedStudents, userId];
    onSelectStudents(newSelected);
  };

  // 指導員選択/選択解除
  const toggleInstructorSelection = (instructorId) => {
    const newSelected = selectedInstructors.includes(instructorId)
      ? selectedInstructors.filter(id => id !== instructorId)
      : [...selectedInstructors, instructorId];
    
    setSelectedInstructors(newSelected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
                     <div className="flex items-center justify-between">
             <h3 className="text-2xl font-bold text-gray-800">
               🔑 本日有効 - 一時パスワード発行
             </h3>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
        
                          <div className="p-6 space-y-8">
             <>
                               {/* 別担当者選択 */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-semibold mb-4">別担当者選択（オプション）</h4>
                                     <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto">
                     {instructors.map(instructor => (
                       <button
                         key={instructor.id}
                         onClick={() => toggleInstructorSelection(instructor.id)}
                         className={`px-4 py-2 rounded-lg border transition-all duration-200 min-w-0 flex-1 basis-64 text-left ${
                           selectedInstructors.includes(instructor.id)
                             ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                             : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                         }`}
                       >
                         <div className="font-medium truncate">{instructor.name}</div>
                         <div className={`text-sm truncate ${
                           selectedInstructors.includes(instructor.id)
                             ? 'text-blue-100'
                             : 'text-gray-600'
                         }`}>
                           {instructor.company_name} / {instructor.satellite_name}
                         </div>
                       </button>
                     ))}
                   </div>
                  <p className="text-sm text-gray-600 mt-2">
                    選択すると、その指導員のパスワード未発行担当利用者もリストに追加されます
                  </p>
                </div>

              {/* 利用者選択 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">利用者選択</h4>
                  <button
                    onClick={toggleAllUsers}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    {selectedStudents.length === tempPasswordUsers.length ? '全解除' : '全選択'}
                  </button>
                </div>

                {tempPasswordLoading ? (
                  <div className="text-center py-4">読み込み中...</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tempPasswordUsers.map(user => (
                      <div key={user.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">
                            {user.company_name} / {user.satellite_name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {getUserTypeLabel(user.user_type)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 有効期限設定 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4">有効期限設定（オプション）</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    placeholder="HH:DD（例：23:59）"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-600">まで有効</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  指定なしの場合は日本時間23:59まで有効です（HH:DD形式で入力してください）
                </p>
              </div>

              {/* アナウンスメッセージ */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4">アナウンスメッセージ（オプション）</h4>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="アナウンスタイトル"
                  className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="アナウンスメッセージ"
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-2">
                  選択された利用者のダッシュボードで閲覧できるアナウンスメッセージを一括送信します
                </p>
              </div>
                         </>

          {/* アクションボタン */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button 
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              onClick={handleClose}
            >
              キャンセル
            </button>
                         <button 
               className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
               onClick={sendTodayActiveEmails}
               disabled={tempPasswordLoading || selectedStudents.length === 0}
             >
               {tempPasswordLoading 
                 ? '処理中...' 
                 : `${selectedStudents.length}名に一時パスワードを発行`
               }
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayActiveModal;
