import React, { useState, useEffect } from 'react';
import { 
  getSatelliteUsersForHomeSupport, 
  getSatelliteInstructorsForHomeSupport,
  bulkUpdateHomeSupportFlag 
} from '../utils/api';

const HomeSupportUserAdditionModal = ({ isOpen, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [currentSatellite, setCurrentSatellite] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ストレージから拠点情報とユーザー情報を取得
  useEffect(() => {
    if (isOpen) {
      // 現在のユーザー情報を取得
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(storedUser);
      } catch (error) {
        console.error('ユーザー情報のパースエラー:', error);
      }

      // sessionStorageから拠点情報を取得
      const storedLocation = sessionStorage.getItem('selectedSatellite');
      if (storedLocation) {
        try {
          const locationData = JSON.parse(storedLocation);
          setCurrentSatellite(locationData);
        } catch (error) {
          console.error('拠点情報のパースエラー:', error);
          setMessage('拠点情報の取得に失敗しました');
          setMessageType('error');
        }
      } else {
        // フォールバック: localStorageからユーザー情報を取得
        try {
          const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (storedUser.satellite_ids && storedUser.satellite_ids.length > 0) {
            // 簡易的な拠点情報を作成
            setCurrentSatellite({
              id: storedUser.satellite_ids[0],
              name: storedUser.location?.name || '拠点名未設定'
            });
          } else {
            setMessage('拠点が選択されていません。拠点を選択してから再度お試しください。');
            setMessageType('error');
          }
        } catch (error) {
          console.error('ユーザー情報のパースエラー:', error);
          setMessage('拠点情報の取得に失敗しました');
          setMessageType('error');
        }
      }
    }
  }, [isOpen]);

  // 拠点情報が取得できたら指導員と利用者を取得
  useEffect(() => {
    if (currentSatellite?.id) {
      fetchInstructors();
      fetchUsers();
    }
  }, [currentSatellite]);

  // 指導員選択が変更されたら利用者を再取得
  useEffect(() => {
    if (currentSatellite?.id) {
      fetchUsers();
    }
  }, [selectedInstructors, currentSatellite]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await getSatelliteInstructorsForHomeSupport(currentSatellite.id);
      if (response.success) {
        setInstructors(response.data);
        // 初期状態では指導員は選択されていない
        setSelectedInstructors([]);
      } else {
        setMessage('指導員の取得に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('指導員取得エラー:', error);
      setMessage('指導員の取得に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 指導員が選択されていない場合は現在のユーザーのみの利用者を取得
      const instructorIds = selectedInstructors.length > 0 ? selectedInstructors : [currentUser?.id].filter(Boolean);
      const response = await getSatelliteUsersForHomeSupport(currentSatellite.id, instructorIds);
      if (response.success) {
        console.log('取得した利用者データ:', response.data);
        setUsers(response.data);
        setSelectedUsers([]); // ユーザーリストが更新されたら選択をリセット
      } else {
        setMessage('利用者の取得に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('利用者取得エラー:', error);
      setMessage('利用者の取得に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorToggle = (instructorId) => {
    setSelectedInstructors(prev => 
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    const allUserIds = users.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const handleDeselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const handleBulkUpdateHomeSupport = async (isRemoteUser) => {
    if (selectedUsers.length === 0) {
      setMessage('利用者を選択してください');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const response = await bulkUpdateHomeSupportFlag(selectedUsers, isRemoteUser);
      if (response.success) {
        setMessage(response.message);
        setMessageType('success');
        setSelectedUsers([]);
        fetchUsers(); // ユーザーリストを再取得
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setMessage(response.message || '在宅支援フラグの更新に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('在宅支援フラグ更新エラー:', error);
      setMessage('在宅支援フラグの更新に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    // 現在は全てのユーザーを表示（将来的にフィルター機能を追加可能）
    return users;
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSelectedInstructors([]);
    setMessage('');
    setMessageType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー部分 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">👥 在宅支援利用者追加</h3>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">通所利用者を在宅支援対象に追加</p>
                  <p className="text-sm text-gray-500">
                    選択中の拠点: {currentSatellite?.name || '拠点名未設定'}
                  </p>
                </div>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-xl border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message}</span>
              <button
                onClick={clearMessage}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* 指導員選択 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👨‍🏫 指導員選択</h4>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {instructors.map(instructor => (
                  <button
                    key={instructor.id}
                    onClick={() => handleInstructorToggle(instructor.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedInstructors.includes(instructor.id)
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {instructor.name} ({instructor.student_count}名)
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                選択中の指導員: {selectedInstructors.length}名
              </p>
            </div>
          </div>

          {/* 利用者一覧 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-800">👤 利用者一覧</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSelectAllUsers}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  全選択
                </button>
                <button
                  onClick={handleDeselectAllUsers}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  選択解除
                </button>
                <button
                  onClick={() => handleBulkUpdateHomeSupport(true)}
                  disabled={selectedUsers.length === 0 || loading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  {loading ? '処理中...' : `${selectedUsers.length}名を在宅支援対象に追加`}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">データを読み込み中...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredUsers().length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>表示する利用者がいません</p>
                    <p className="text-sm mt-2">指導員を選択するか、拠点に利用者が登録されているか確認してください</p>
                  </div>
                ) : (
                  getFilteredUsers().map(user => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-xl transition-all duration-200 bg-white ${
                        selectedUsers.includes(user.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-800">{user.name}</h5>
                            <div className="flex items-center gap-2">
                              {user.is_remote_user ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  在宅支援対象
                                </span>
                              ) : null}
                              <span className="text-sm text-gray-500">{user.login_code}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>担当指導員: {user.instructor_name || '未設定'}</span>
                            <span>企業: {user.company_name || '未設定'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="mt-6 text-sm text-gray-600">
              <p>表示中: {getFilteredUsers().length}名</p>
              <p>選択中: {selectedUsers.length}名</p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              onClick={handleClose}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSupportUserAdditionModal;