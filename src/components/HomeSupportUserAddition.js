import React, { useState, useEffect } from 'react';
import { 
  getSatelliteUsersForHomeSupport, 
  getSatelliteInstructorsForHomeSupport,
  bulkUpdateHomeSupportFlag 
} from '../utils/api';

const HomeSupportUserAddition = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // 現在の拠点IDを取得
  const currentSatelliteId = currentUser?.location?.id || currentUser?.satellite_ids?.[0];

  useEffect(() => {
    if (currentSatelliteId) {
      fetchInstructors();
      fetchUsers();
    }
  }, [currentSatelliteId]);

  useEffect(() => {
    if (currentSatelliteId) {
      fetchUsers();
    }
  }, [selectedInstructors, currentSatelliteId]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await getSatelliteInstructorsForHomeSupport(currentSatelliteId);
      if (response.success) {
        setInstructors(response.data);
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
      const instructorIds = selectedInstructors.length > 0 ? selectedInstructors : null;
      const response = await getSatelliteUsersForHomeSupport(currentSatelliteId, instructorIds);
      if (response.success) {
        setUsers(response.data);
        setSelectedUsers([]); // ユーザーリストが更新されたら選択をリセット
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

  if (!currentSatelliteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="text-center text-gray-600">
            <p className="text-lg">拠点が選択されていません</p>
            <p className="text-sm mt-2">拠点を選択してから再度お試しください</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              👥 在宅支援利用者追加
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">📍</span>
              <div>
                <p className="font-medium">通所利用者を在宅支援対象に追加</p>
                <p className="text-sm text-gray-500">選択中の拠点: {currentUser?.location?.name || '拠点名未設定'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
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

      {/* 指導員選択 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">👨‍🏫 指導員選択</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {instructors.map(instructor => (
              <button
                key={instructor.id}
                onClick={() => handleInstructorToggle(instructor.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedInstructors.includes(instructor.id)
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {instructor.name} ({instructor.student_count}名)
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            選択中の指導員: {selectedInstructors.length > 0 ? selectedInstructors.length + '名' : '全ての指導員'}
          </p>
        </div>
      </div>

      {/* 利用者一覧 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">👤 利用者一覧</h3>
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
          <div className="space-y-3">
            {getFilteredUsers().length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>表示する利用者がいません</p>
                <p className="text-sm mt-2">指導員を選択するか、拠点に利用者が登録されているか確認してください</p>
              </div>
            ) : (
              getFilteredUsers().map(user => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-xl transition-all duration-200 ${
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
                        <h4 className="font-semibold text-gray-800">{user.name}</h4>
                        <div className="flex items-center gap-2">
                          {user.is_remote_user && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              在宅支援対象
                            </span>
                          )}
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
  );
};

export default HomeSupportUserAddition;
