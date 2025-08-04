import React, { useState, useEffect } from 'react';
import SanitizedInput from './SanitizedInput';
import { addOperationLog } from '../utils/operationLogManager';

const SatelliteManagement = () => {
  const [satellites, setSatellites] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // 拠点一覧取得
  const fetchSatellites = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/satellites');
      if (!response.ok) {
        throw new Error('拠点一覧の取得に失敗しました');
      }
      const data = await response.json();
      setSatellites(data.data || []);
      setError(null);
    } catch (err) {
      console.error('拠点取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 企業一覧取得
  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/companies');
      if (!response.ok) {
        throw new Error('企業一覧の取得に失敗しました');
      }
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (err) {
      console.error('企業取得エラー:', err);
    }
  };

  // 管理者一覧取得
  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users?role=5');
      if (!response.ok) {
        throw new Error('管理者一覧の取得に失敗しました');
      }
      const data = await response.json();
      setManagers(data.data || []);
    } catch (err) {
      console.error('管理者取得エラー:', err);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchSatellites();
    fetchCompanies();
    fetchManagers();
  }, []);

  // 拠点作成
  const createSatellite = async (satelliteData) => {
    try {
      const response = await fetch('http://localhost:5000/satellites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(satelliteData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '拠点の作成に失敗しました');
      }

      await fetchSatellites();
      showNotification(result.message, 'success');
      
      // 操作ログを記録
      await addOperationLog({
        action: '拠点作成',
        details: `拠点「${satelliteData.name}」を作成しました`
      });
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error('拠点作成エラー:', err);
      showNotification(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 拠点更新
  const updateSatellite = async (satelliteId, satelliteData) => {
    try {
      const response = await fetch(`http://localhost:5000/satellites/${satelliteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(satelliteData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '拠点の更新に失敗しました');
      }

      await fetchSatellites();
      showNotification(result.message, 'success');
      
      // 操作ログを記録
      await addOperationLog({
        action: '拠点更新',
        details: `拠点「${satelliteData.name}」の情報を更新しました`
      });
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error('拠点更新エラー:', err);
      showNotification(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 拠点削除
  const deleteSatellite = async (satelliteId) => {
    try {
      const response = await fetch(`http://localhost:5000/satellites/${satelliteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '拠点の削除に失敗しました');
      }

      await fetchSatellites();
      showNotification(result.message, 'success');
      
      // 操作ログを記録
      await addOperationLog({
        action: '拠点削除',
        details: `拠点ID: ${satelliteId} を削除しました`
      });
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error('拠点削除エラー:', err);
      showNotification(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 管理者追加
  const addManagerToSatellite = async (satelliteId, managerId) => {
    try {
      const response = await fetch(`http://localhost:5000/satellites/${satelliteId}/managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manager_id: managerId })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '管理者の追加に失敗しました');
      }

      await fetchSatellites();
      showNotification(result.message, 'success');
      
      // 操作ログを記録
      await addOperationLog({
        action: '拠点管理者追加',
        details: `拠点ID: ${satelliteId} に管理者ID: ${managerId} を追加しました`
      });
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error('管理者追加エラー:', err);
      showNotification(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 管理者削除
  const removeManagerFromSatellite = async (satelliteId, managerId) => {
    try {
      const response = await fetch(`http://localhost:5000/satellites/${satelliteId}/managers/${managerId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '管理者の削除に失敗しました');
      }

      await fetchSatellites();
      showNotification(result.message, 'success');
      
      // 操作ログを記録
      await addOperationLog({
        action: '拠点管理者削除',
        details: `拠点ID: ${satelliteId} から管理者ID: ${managerId} を削除しました`
      });
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error('管理者削除エラー:', err);
      showNotification(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 通知表示
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // 管理者名を取得
  const getManagerNames = (managerIds) => {
    if (!managerIds) return [];
    const ids = Array.isArray(managerIds) ? managerIds : JSON.parse(managerIds);
    return managers
      .filter(manager => ids.includes(manager.id))
      .map(manager => manager.name);
  };

  // 企業名を取得
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : '不明';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">拠点管理</h1>
        <p className="text-gray-600">拠点の作成、編集、削除、管理者の割り当てを行います。</p>
      </div>

      {/* 通知 */}
      {notification.show && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* 拠点一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">拠点一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  拠点名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  企業
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利用者数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  管理者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  トークン有効期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {satellites.map((satellite) => (
                <tr key={satellite.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{satellite.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCompanyName(satellite.company_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{satellite.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {satellite.current_users || 0} / {satellite.max_users}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getManagerNames(satellite.manager_ids).join(', ') || '未設定'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {satellite.token_expiry_at ? new Date(satellite.token_expiry_at).toLocaleDateString('ja-JP') : '未設定'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      satellite.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {satellite.status === 1 ? '稼働中' : '停止中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {/* 編集モーダルを開く */}}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deleteSatellite(satellite.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新規拠点追加ボタン */}
      <div className="mt-6">
        <button
          onClick={() => {/* 新規作成モーダルを開く */}}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          新規拠点追加
        </button>
      </div>
    </div>
  );
};

export default SatelliteManagement; 