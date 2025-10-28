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
      console.log('モーダルが開かれました。拠点情報とユーザー情報を取得します。');
      
      // 現在のユーザー情報を取得
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('取得したユーザー情報:', storedUser);
        setCurrentUser(storedUser);
      } catch (error) {
        console.error('ユーザー情報のパースエラー:', error);
      }

      // sessionStorageから拠点情報を取得
      const storedLocation = sessionStorage.getItem('selectedSatellite');
      console.log('sessionStorageの拠点情報:', storedLocation);
      
      if (storedLocation) {
        try {
          const locationData = JSON.parse(storedLocation);
          console.log('パースした拠点情報:', locationData);
          setCurrentSatellite(locationData);
        } catch (error) {
          console.error('拠点情報のパースエラー:', error);
          setMessage('拠点情報の取得に失敗しました');
          setMessageType('error');
        }
      } else {
        console.log('sessionStorageに拠点情報がありません。フォールバック処理を実行します。');
        // フォールバック: localStorageからユーザー情報を取得
        try {
          const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (storedUser.satellite_ids && storedUser.satellite_ids.length > 0) {
            // 簡易的な拠点情報を作成
            const fallbackSatellite = {
              id: storedUser.satellite_ids[0],
              name: storedUser.location?.name || '拠点名未設定'
            };
            console.log('フォールバック拠点情報:', fallbackSatellite);
            setCurrentSatellite(fallbackSatellite);
          } else {
            console.log('ユーザー情報に拠点IDがありません。');
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
    console.log('拠点情報チェック:', currentSatellite);
    if (currentSatellite?.id) {
      console.log('拠点情報が取得できました。指導員と利用者を取得します。');
      fetchInstructors();
      fetchUsers();
    } else {
      console.log('拠点情報が取得できていません。');
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
      setMessage('');
      setMessageType('');
      
      console.log('指導員取得開始 - 拠点ID:', currentSatellite.id);
      
      if (!currentSatellite.id) {
        throw new Error('拠点IDが設定されていません');
      }
      
      const response = await getSatelliteInstructorsForHomeSupport(currentSatellite.id);
      console.log('指導員取得レスポンス:', response);
      
      if (response.success) {
        console.log('取得した指導員データ:', response.data);
        setInstructors(response.data || []);
        // 初期状態では指導員は選択されていない
        setSelectedInstructors([]);
        
        if (!response.data || response.data.length === 0) {
          setMessage('この拠点には指導員が登録されていません');
          setMessageType('warning');
        }
      } else {
        console.error('指導員取得失敗:', response.message);
        setMessage('指導員の取得に失敗しました: ' + (response.message || '不明なエラー'));
        setMessageType('error');
        setInstructors([]);
      }
    } catch (error) {
      console.error('指導員取得エラー:', error);
      setMessage('指導員の取得に失敗しました: ' + error.message);
      setMessageType('error');
      setInstructors([]);
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
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
          <div className={
            messageType === 'success' 
              ? 'bg-green-50 border-l-4 border-green-400 p-4' 
              : messageType === 'warning'
              ? 'bg-yellow-50 border-l-4 border-yellow-400 p-4'
              : 'bg-red-50 border-l-4 border-red-400 p-4'
          }>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : messageType === 'warning' ? (
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={
                  messageType === 'success' 
                    ? 'text-sm text-green-700' 
                    : messageType === 'warning'
                    ? 'text-sm text-yellow-700'
                    : 'text-sm text-red-700'
                }>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* コンテンツ - スクロール可能 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 指導員選択 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👨‍🏫 指導員選択</h4>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">指導員を読み込み中...</p>
                </div>
              ) : instructors.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>指導員が見つかりませんでした</p>
                  <p className="text-sm mt-2">拠点に指導員が登録されているか確認してください</p>
                  <div className="mt-4 text-xs text-gray-500">
                    <p>デバッグ情報:</p>
                    <p>拠点ID: {currentSatellite?.id}</p>
                    <p>指導員数: {instructors.length}</p>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
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