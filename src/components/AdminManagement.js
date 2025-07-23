import React, { useState, useEffect } from 'react';
import { logAdminAccountOperation } from '../utils/adminLogger';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [operationLogs, setOperationLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    status: 'active',
    isDeleted: false
  });
  // 削除済みも表示のチェックボックス用
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAdmins = () => {
    return [...admins].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'status') {
        aValue = getStatusLabel(a.status, a.isDeleted);
        bValue = getStatusLabel(b.status, b.isDeleted);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // ステータスラベルを取得する関数
  const getStatusLabel = (status, isDeleted) => {
    if (isDeleted) return '削除済み';
    return '有効';
  };

  // 初期データの読み込み
  useEffect(() => {
    const savedAdmins = localStorage.getItem('adminUsers');
    const savedLogs = localStorage.getItem('adminOperationLogs');
    
    if (savedAdmins) {
      setAdmins(JSON.parse(savedAdmins));
    } else {
      // デフォルトの管理者データ（3人分、isDeleted追加、startDate/endDate削除）
      const defaultAdmins = [
        {
          id: 'admin001',
          name: '山田管理者',
          email: 'yamada@studysphere.com',
          password: 'admin123',
          status: 'active',
          isDeleted: false,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'admin002',
          name: '佐藤管理者',
          email: 'sato@studysphere.com',
          password: 'admin456',
          status: 'active',
          isDeleted: false,
          createdAt: '2024-02-01T00:00:00Z'
        },
        {
          id: 'admin003',
          name: '鈴木管理者',
          email: 'suzuki@studysphere.com',
          password: 'admin789',
          status: 'inactive',
          isDeleted: false,
          createdAt: '2024-03-01T00:00:00Z'
        },
        {
          id: 'admin004',
          name: '田中管理者',
          email: 'tanaka@studysphere.com',
          password: 'admin234',
          status: 'active',
          isDeleted: false,
          createdAt: '2024-04-01T00:00:00Z'
        },
        {
          id: 'admin005',
          name: '高橋管理者',
          email: 'takahashi@studysphere.com',
          password: 'admin567',
          status: 'inactive',
          isDeleted: false,
          createdAt: '2024-05-01T00:00:00Z'
        },
        {
          id: 'admin006',
          name: '渡辺管理者',
          email: 'watanabe@studysphere.com',
          password: 'admin890',
          status: 'active',
          isDeleted: false,
          createdAt: '2024-06-01T00:00:00Z'
        }
      ];
      setAdmins(defaultAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(defaultAdmins));
    }

    if (savedLogs) {
      setOperationLogs(JSON.parse(savedLogs));
    } else {
      // デフォルトの操作ログ
      const defaultLogs = [
        {
          id: 1,
          adminId: 'admin001',
          adminName: '山田管理者',
          action: 'システムログイン',
          details: '管理者ダッシュボードにアクセス',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100'
        }
      ];
      setOperationLogs(defaultLogs);
      localStorage.setItem('adminOperationLogs', JSON.stringify(defaultLogs));
    }
  }, []);

  // 操作ログを記録する関数
  const logOperation = (action, details) => {
    logAdminAccountOperation(action, { id: 'system', name: 'システム' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAdmin) {
      // 編集モード
      const updatedAdmins = admins.map(admin => 
        admin.id === editingAdmin.id 
          ? { ...admin, ...formData, updatedAt: new Date().toISOString() }
          : admin
      );
      setAdmins(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
      logAdminAccountOperation('update', formData);
    } else {
      // 新規追加モード
      const newAdmin = {
        ...formData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedAdmins = [...admins, newAdmin];
      setAdmins(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
      logAdminAccountOperation('create', formData);
    }

    // フォームをリセット
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      status: 'active',
      isDeleted: false
    });
    setShowAddForm(false);
    setEditingAdmin(null);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: admin.password,
      status: admin.status,
      isDeleted: admin.isDeleted
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAdmin(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      status: 'active',
      isDeleted: false
    });
  };

  // 論理削除処理
  const handleDelete = (admin) => {
    if (window.confirm(`${admin.name} を削除しますか？`)) {
      const updatedAdmins = admins.map(a =>
        a.id === admin.id ? { ...a, isDeleted: true } : a
      );
      setAdmins(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
      logAdminAccountOperation('delete', admin);
    }
  };

  const getStatusBadge = (status, isDeleted) => {
    if (isDeleted) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500">削除済み</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">有効</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">管理者管理</h2>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          onClick={() => setShowAddForm(true)}
        >
          ＋ 管理者追加
        </button>
      </div>

      {/* 削除済みも表示チェックボックス */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showDeleted"
          checked={showDeleted}
          onChange={e => setShowDeleted(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="showDeleted" className="text-gray-700">削除済みも表示</label>
      </div>

      {/* 管理者追加・編集フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAdmin ? '管理者情報編集' : '管理者追加'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">管理者ID *</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    placeholder="admin001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">氏名 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="山田管理者"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="yamada@studysphere.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">パスワード *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="パスワード"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  >
                    <option value="active">有効</option>
                    <option value="inactive">無効</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">削除済み（チェックを外すと復活）</label>
                  <input
                    type="checkbox"
                    name="isDeleted"
                    checked={formData.isDeleted}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="flex-1 bg-gray-100 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-200 hover:border-gray-300"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  {editingAdmin ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 管理者一覧 */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800 mb-6">管理者一覧</h3>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => handleSort('name')}
                  >
                    👤 氏名
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => handleSort('id')}
                  >
                    🆔 管理者ID
                    {sortConfig.key === 'id' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => handleSort('email')}
                  >
                    📧 メールアドレス
                    {sortConfig.key === 'email' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => handleSort('status')}
                  >
                    📊 ステータス
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚙️ 操作</th>
                </tr>
              </thead>
              <tbody>
                {getSortedAdmins()
                  .filter(admin => showDeleted || !admin.isDeleted)
                  .map(admin => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <strong className="text-gray-800">{admin.name}</strong>
                    </td>
                    <td className="px-6 py-4">
                      <strong className="text-gray-800">{admin.id}</strong>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      📧 {admin.email}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(admin.status, admin.isDeleted)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                          onClick={() => handleEdit(admin)}
                          title="編集"
                        >
                          ✏️ 編集
                        </button>
                        {!admin.isDeleted && (
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                            onClick={() => handleDelete(admin)}
                            title="削除"
                          >
                            🗑️ 削除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 操作ログ */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">操作ログ</h3>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📅 日時</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">👤 管理者</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚡ 操作</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📝 詳細</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">🌐 IPアドレス</th>
                </tr>
              </thead>
              <tbody>
                {operationLogs.slice(0, 50).map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      📅 {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {log.adminName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{log.action}</td>
                    <td className="px-6 py-4 text-gray-600">{log.details}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      🌐 {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement; 