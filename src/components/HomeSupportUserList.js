import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/userContext';
import { getSatelliteUsersForHomeSupport } from '../utils/api';

const HomeSupportUserList = ({ instructorId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSatellite, setCurrentSatellite] = useState(null);

  useEffect(() => {
    // 現在のユーザー情報を取得
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // 現在の拠点情報を取得
    const selectedSatellite = sessionStorage.getItem('selectedSatellite');
    if (selectedSatellite) {
      setCurrentSatellite(JSON.parse(selectedSatellite));
    } else if (user?.satellite_ids && user.satellite_ids.length > 0) {
      // ユーザーの拠点IDから拠点情報を設定
      setCurrentSatellite({
        id: user.satellite_ids[0],
        name: '現在の拠点'
      });
    }
  }, []);

  useEffect(() => {
    if (currentSatellite?.id) {
      fetchUsers();
    }
  }, [currentSatellite, instructorId]);

  // 在宅利用者追加イベントをリッスン
  useEffect(() => {
    const handleUserAdded = () => {
      fetchUsers();
    };

    window.addEventListener('homeSupportUserAdded', handleUserAdded);
    
    return () => {
      window.removeEventListener('homeSupportUserAdded', handleUserAdded);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 指導員IDを指定して在宅利用者を取得
      const instructorIds = instructorId ? [instructorId] : [currentUser?.id].filter(Boolean);
      const response = await getSatelliteUsersForHomeSupport(currentSatellite.id, instructorIds);
      
      if (response.success) {
        // 在宅利用者（is_remote_user = true）のみをフィルタリング
        const remoteUsers = response.data.filter(user => user.is_remote_user);
        setUsers(remoteUsers);
      } else {
        setError('利用者の取得に失敗しました');
      }
    } catch (error) {
      console.error('在宅利用者取得エラー:', error);
      setError('在宅利用者の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">在宅利用者を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">在宅利用者一覧</h3>
          <p className="text-gray-600 mt-1">
            {currentSatellite?.name} ({users.length}名)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            🔄 更新
          </button>
          <button
            onClick={() => {
              // 在宅利用者追加モーダルを開く
              if (window.openHomeSupportModal) {
                window.openHomeSupportModal();
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            ➕ 在宅利用者追加
          </button>
        </div>
      </div>

             {/* 利用者リスト */}
       {users.length === 0 ? (
         <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
           <p className="text-gray-500">在宅利用者が登録されていません</p>
         </div>
       ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {user.name}
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      在宅利用
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">ログインコード:</span>
                      <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                        {user.login_code || '未設定'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">担当指導員:</span>
                      <span className="ml-2">
                        {user.instructor_name || '未設定'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">所属会社:</span>
                      <span className="ml-2">
                        {user.company_name || '未設定'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">利用者ID:</span>
                      <span className="ml-2 font-mono text-gray-500">
                        {user.id}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors duration-300"
                    onClick={() => {
                      // 利用者詳細ページへの遷移（実装予定）
                      console.log('利用者詳細を表示:', user.id);
                    }}
                  >
                    詳細
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統計情報 */}
      {users.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 統計情報</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">総利用者数:</span>
              <span className="ml-2 font-semibold text-gray-800">{users.length}名</span>
            </div>
            <div>
              <span className="text-gray-600">担当指導員数:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {new Set(users.map(u => u.instructor_id).filter(Boolean)).size}名
              </span>
            </div>
            <div>
              <span className="text-gray-600">所属会社数:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {new Set(users.map(u => u.company_id).filter(Boolean)).size}社
              </span>
            </div>
            <div>
              <span className="text-gray-600">最終更新:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSupportUserList;
