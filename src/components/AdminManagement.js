import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { getCurrentUser } from '../utils/userContext';
import { 
  addOperationLog, 
  getOperationLogs, 
  getLogStats, 
  searchOperationLogs, 
  clearOperationLogs, 
  exportLogsToCSV
} from '../utils/operationLogManager';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [operationLogs, setOperationLogs] = useState([]);
  const [logStats, setLogStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 9,
    status: 'active',
    company_id: null
  });
  // 削除済みも表示のチェックボックス用
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // 削除済み表示の切り替え
  const handleShowDeletedChange = (checked) => {
    setShowDeleted(checked);
  };
  
  // ログ検索・フィルター用の状態
  const [logFilters, setLogFilters] = useState({
    adminName: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [showLogFilters, setShowLogFilters] = useState(false);

  // 管理者一覧を取得
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet(`/api/admins?includeDeleted=${showDeleted}`);
      setAdmins(response.admins || []);
    } catch (err) {
      console.error('管理者一覧取得エラー:', err);
      setError('管理者一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初期データの読み込み
  useEffect(() => {
    const initializeData = async () => {
      await fetchAdmins();
      await loadOperationLogs();
    };
    
    initializeData();
  }, [showDeleted]);

  // 操作ログを読み込む
  const loadOperationLogs = async () => {
    try {
      const logs = await getOperationLogs();
      const stats = await getLogStats();
      console.log('取得した操作ログ:', logs);
      console.log('取得した統計情報:', stats);
      setOperationLogs(logs);
      setLogStats(stats);
    } catch (error) {
      console.error('操作ログの読み込みに失敗しました:', error);
    }
  };

  // details（文字列）を安全にJSONパース
  const parseDetails = (details) => {
    if (!details || typeof details !== 'string') return null;
    try {
      return JSON.parse(details);
    } catch (_) {
      return null;
    }
  };

  // 操作キーを表示用に整形
  const formatLogAction = (action) => {
    const map = {
      create_lesson: 'レッスン作成',
      update_lesson: 'レッスン更新',
      delete_lesson: 'レッスン削除',
      // コース関連
      create_course: 'コース作成',
      update_course: 'コース更新',
      delete_course: 'コース削除',
      // 管理者関連
      create_admin: '管理者作成',
      update_admin: '管理者更新',
      delete_admin: '管理者削除',
      restore_admin: '管理者復元',
      permanently_delete_admin: '管理者物理削除',
      unknown_action: '不明な操作'
    };
    return map[action] || action || '不明な操作';
  };

  // 詳細を人間可読に整形
  const formatLogDetail = (log) => {
    const obj = parseDetails(log.details);
    // JSONでなければそのまま表示
    if (!obj) return log.details || '-';

    switch (log.action) {
      case 'create_lesson': {
        const hasFile = obj.hasFile ? 'あり' : 'なし';
        const courseLabel = obj.courseTitle ? `, コース: ${obj.courseTitle}` : (obj.courseId != null ? `, コースID: ${obj.courseId}` : '');
        return `レッスン「${obj.title || '-'}」を作成（ファイル: ${hasFile}${courseLabel}）`;
      }
      case 'update_lesson': {
        const hasFile = obj.hasFile ? 'あり' : 'なし';
        const courseLabel = obj.courseTitle ? `, コース: ${obj.courseTitle}` : '';
        return `レッスン「${obj.title || '-'}」を更新（ファイル: ${hasFile}${courseLabel}）`;
      }
      case 'delete_lesson': {
        const hasS3 = obj.hasS3File ? 'あり' : 'なし';
        return `レッスン「${obj.title || '-'}」を削除（S3ファイル: ${hasS3}）`;
      }
      case 'create_course': {
        return `コース「${obj.title || '-'}」を作成（カテゴリ: ${obj.category || '-'}）`;
      }
      case 'update_course': {
        return `コース「${obj.title || '-'}」を更新（カテゴリ: ${obj.category || '-'}）`;
      }
      case 'delete_course': {
        return `コース「${obj.title || '-'}」を削除`;
      }
      case 'create_admin': {
        return `管理者「${obj.name || '-'}」を作成`;
      }
      case 'update_admin': {
        return `管理者「${obj.name || '-'}」を更新`;
      }
      case 'delete_admin': {
        return `管理者「${obj.name || '-'}」を削除`;
      }
      case 'restore_admin': {
        return `管理者「${obj.name || '-'}」を復元`;
      }
      case 'permanently_delete_admin': {
        return `管理者「${obj.name || '-'}」を完全削除`;
      }
      default:
        // 未定義アクションはキーとJSONを簡潔整形
        return log.details;
    }
  };

  // 管理者名からID部分を削除する関数
  const cleanAdminName = (adminName) => {
    if (!adminName) return adminName;
    // 括弧内のID部分を削除（例: "admin001（2）" → "admin001"）
    return adminName.replace(/（\d+）$/, '').replace(/\(\d+\)$/, '');
  };

  // ログを記録する関数
  const recordOperation = async (action, details, adminData = null) => {
    const logData = {
      action: action,
      details: details
    };
    
    // 管理者情報が明示的に指定されている場合は使用
    if (adminData && adminData.adminId) {
      logData.adminId = adminData.adminId;
    }
    if (adminData && adminData.adminName) {
      logData.adminName = adminData.adminName;
    }
    
    await addOperationLog(logData);
    loadOperationLogs(); // ログを再読み込み
  };

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
        aValue = getStatusLabel(a.status);
        bValue = getStatusLabel(b.status);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // ステータスラベルを取得する関数
  const getStatusLabel = (status) => {
    return status === 'active' ? '有効' : '無効';
  };



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        // 編集モード
        const result = await apiPut(`/api/admins/${editingAdmin.id}`, formData);
                      if (result.success) {
          await fetchAdmins(); // 一覧を再取得
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('管理者更新', `管理者「${cleanAdminName(formData.name)}」の情報を更新しました`, {
            adminId: adminId,
            adminName: adminName
          });
        } else {
          setError(result.message || '管理者の更新に失敗しました');
          return;
        }
      } else {
        // 新規追加モード
        const result = await apiPost('/api/admins', formData);
        if (result.success) {
          await fetchAdmins(); // 一覧を再取得
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('管理者作成', `管理者「${cleanAdminName(formData.name)}」を新規作成しました`, {
            adminId: adminId,
            adminName: adminName
          });
        } else {
          setError(result.message || '管理者の作成に失敗しました');
          return;
        }
      }

      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 9,
        status: 'active',
        company_id: null
      });
      setShowAddForm(false);
      setEditingAdmin(null);
      setError(null);
    } catch (err) {
      console.error('管理者操作エラー:', err);
      setError('操作に失敗しました');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email || '',
      username: admin.username || '',
      password: '',
      role: admin.role,
      status: admin.status,
      company_id: admin.company_id
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 5,
      status: 'active',
      company_id: null
    });
    setError(null);
  };

  // 論理削除処理
  const handleDelete = async (admin) => {
    if (window.confirm(`${admin.name} を削除しますか？`)) {
      try {
        const result = await apiDelete(`/api/admins/${admin.id}`);
        if (result.success) {
          await fetchAdmins(); // 一覧を再取得
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('管理者削除', `管理者「${cleanAdminName(admin.name)}」を削除しました`, {
            adminId: adminId,
            adminName: adminName
          });
        } else {
          setError(result.message || '管理者の削除に失敗しました');
        }
      } catch (err) {
        console.error('管理者削除エラー:', err);
        setError('削除に失敗しました');
      }
    }
  };

  // 管理者復元処理
  const handleRestore = async (admin) => {
    if (!window.confirm(`管理者「${admin.name}」を復元しますか？`)) {
      return;
    }

    try {
      const result = await apiPost(`/api/admins/${admin.id}/restore`);
              if (result.success) {
          await fetchAdmins(); // 一覧を再取得
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('管理者復元', `管理者「${cleanAdminName(admin.name)}」を復元しました`, {
            adminId: adminId,
            adminName: adminName
          });
        } else {
        setError(result.message || '管理者の復元に失敗しました');
      }
    } catch (err) {
      console.error('管理者復元エラー:', err);
      setError('復元に失敗しました');
    }
  };

  // 管理者物理削除
  const handlePermanentDelete = async (admin) => {
    if (!window.confirm(`管理者「${admin.name}」を完全に削除しますか？\n\nこの操作は取り消すことができません。`)) {
      return;
    }

    try {
      const result = await apiDelete(`/api/admins/${admin.id}/permanent`);
              if (result.success) {
          await fetchAdmins(); // 一覧を再取得
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('管理者物理削除', `管理者「${cleanAdminName(admin.name)}」を完全に削除しました`, {
            adminId: adminId,
            adminName: adminName
          });
        } else {
        setError(result.message || '管理者の完全削除に失敗しました');
      }
    } catch (err) {
      console.error('管理者物理削除エラー:', err);
      setError('管理者の完全削除に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">有効</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500">無効</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  // ログ検索・フィルター機能
  const handleLogFilterChange = (e) => {
    const { name, value } = e.target;
    setLogFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyLogFilters = async () => {
    try {
      const filteredLogs = await searchOperationLogs(logFilters);
      setOperationLogs(filteredLogs);
    } catch (error) {
      console.error('ログフィルター適用エラー:', error);
    }
  };

  const clearLogFilters = async () => {
    setLogFilters({
      adminName: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    await loadOperationLogs(); // 全ログを再読み込み
  };

  // ログエクスポート機能
  const handleExportLogs = async () => {
    try {
      const csvData = await exportLogsToCSV();
      
      // BOM（Byte Order Mark）を追加して文字化けを防ぐ
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvData;
      
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_operation_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 現在の管理者情報を取得してエクスポート操作をログに記録
      const currentUser = getCurrentUser();
      const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
      const adminId = currentUser ? currentUser.id : 'unknown';
      
      await recordOperation('ログエクスポート', '操作ログをCSVファイルとしてエクスポートしました', {
        adminId: adminId,
        adminName: adminName
      });
      
    } catch (error) {
      console.error('CSVエクスポートエラー:', error);
      setError('CSVエクスポートに失敗しました');
    }
  };

  // ログクリア機能
  const handleClearLogs = async () => {
    if (window.confirm('すべての操作ログを削除しますか？この操作は取り消せません。')) {
      try {
        const success = await clearOperationLogs();
        if (success) {
          // ログクリア後に統計情報をリセット
          setOperationLogs([]);
          setLogStats({
            totalLogs: 0,
            todayLogs: 0,
            thisWeekLogs: 0,
            thisMonthLogs: 0,
            actionCounts: {}
          });
          setError(null);
          
          // バックエンドから最新の統計情報を再取得（0件であることを確認）
          try {
            const updatedStats = await getLogStats();
            setLogStats(updatedStats);
          } catch (statsError) {
            console.log('統計情報の再取得に失敗しました（正常な動作です）:', statsError);
          }
          
          // ログクリア操作も記録（ただし、クリア後の記録なので即座に表示されない）
          const currentUser = getCurrentUser();
          const adminName = currentUser ? currentUser.name || currentUser.username : '不明な管理者';
          const adminId = currentUser ? currentUser.id : 'unknown';
          await recordOperation('ログクリア', 'すべての操作ログを削除しました', {
            adminId: adminId,
            adminName: adminName
          });
          
          // 成功メッセージを表示
          alert('すべての操作ログを削除しました');
        } else {
          setError('ログの削除に失敗しました');
        }
      } catch (error) {
        console.error('ログクリアエラー:', error);
        setError('ログの削除に失敗しました');
      }
    }
  };



  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">エラー:</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            閉じる
          </button>
        </div>
      )}

      {/* 削除済みも表示チェックボックス */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showDeleted"
          checked={showDeleted}
          onChange={e => handleShowDeletedChange(e.target.checked)}
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ユーザー名 *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="yamada_admin"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yamada@studysphere.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingAdmin ? 'パスワード（変更する場合のみ）' : 'パスワード *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingAdmin}
                    placeholder="パスワード"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">権限レベル</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  >
                    <option value={9}>アドミンユーザー</option>
                  </select>
                </div>
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
                    onClick={() => handleSort('username')}
                  >
                    🆔 ユーザー名
                    {sortConfig.key === 'username' && (
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
                     onClick={() => handleSort('role')}
                   >
                     🔑 権限
                     {sortConfig.key === 'role' && (
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
                  .filter(admin => showDeleted || admin.status === 'active')
                  .map(admin => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <strong className="text-gray-800">{admin.name}</strong>
                    </td>
                    <td className="px-6 py-4">
                      <strong className="text-gray-800">{admin.username}</strong>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      📧 {admin.email || '-'}
                    </td>
                                         <td className="px-6 py-4">
                       <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                         {admin.role === 10 ? 'マスターユーザー' : 'アドミンユーザー'}
                       </span>
                     </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(admin.status)}
                        {admin.isDeleted && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                            削除済み
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!admin.isDeleted && (
                          <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                            onClick={() => handleEdit(admin)}
                            title="編集"
                          >
                            ✏️ 編集
                          </button>
                        )}
                        {admin.status === 'active' && !admin.isDeleted ? (
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                            onClick={() => handleDelete(admin)}
                            title="削除"
                          >
                            🗑️ 削除
                          </button>
                        ) : admin.isDeleted ? (
                          <div className="flex gap-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-green-600"
                              onClick={() => handleRestore(admin)}
                              title="復元"
                            >
                              🔄 復元
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-red-700"
                              onClick={() => handlePermanentDelete(admin)}
                              title="完全削除"
                            >
                              ⚠️ 完全削除
                            </button>
                          </div>
                        ) : (
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-green-600"
                            onClick={() => handleRestore(admin)}
                            title="復元"
                          >
                            🔄 復元
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">操作ログ</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogFilters(!showLogFilters)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
            >
              🔍 検索・フィルター
            </button>
            <button
              onClick={handleExportLogs}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-green-600"
            >
              📥 エクスポート
            </button>
            <button
              onClick={handleClearLogs}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-red-600"
            >
              🗑️ ログクリア
            </button>
          </div>
        </div>

        {/* ログ統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-800 font-semibold">総ログ数</div>
            <div className="text-2xl font-bold text-blue-600">{logStats.totalLogs || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-800 font-semibold">今日のログ</div>
            <div className="text-2xl font-bold text-green-600">{logStats.todayLogs || 0}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-800 font-semibold">今週のログ</div>
            <div className="text-2xl font-bold text-yellow-600">{logStats.thisWeekLogs || 0}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-800 font-semibold">今月のログ</div>
            <div className="text-2xl font-bold text-purple-600">{logStats.thisMonthLogs || 0}</div>
          </div>
        </div>

        {/* ログ検索・フィルター */}
        {showLogFilters && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">検索・フィルター条件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">管理者名</label>
                <input
                  type="text"
                  name="adminName"
                  value={logFilters.adminName}
                  onChange={handleLogFilterChange}
                  placeholder="管理者名で検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">操作内容</label>
                <input
                  type="text"
                  name="action"
                  value={logFilters.action}
                  onChange={handleLogFilterChange}
                  placeholder="操作内容で検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                <input
                  type="date"
                  name="startDate"
                  value={logFilters.startDate}
                  onChange={handleLogFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                <input
                  type="date"
                  name="endDate"
                  value={logFilters.endDate}
                  onChange={handleLogFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={applyLogFilters}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
              >
                検索実行
              </button>
              <button
                onClick={clearLogFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 hover:bg-gray-600"
              >
                条件クリア
              </button>
            </div>
          </div>
        )}

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
                {operationLogs.length > 0 ? (
                  operationLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        📅 {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {cleanAdminName(log.adminName)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatLogAction(log.action)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatLogDetail(log)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        🌐 {log.ipAddress}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      操作ログがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {operationLogs.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              表示中: {operationLogs.length}件のログ（最大100件、30日間保持）
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement; 