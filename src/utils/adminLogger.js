// 管理者の操作ログを記録する共通ユーティリティ

export const logAdminOperation = (action, details) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const operationLogs = JSON.parse(localStorage.getItem('adminOperationLogs') || '[]');
    
    const newLog = {
      id: Date.now(),
      adminId: currentUser.id || 'unknown',
      adminName: currentUser.name || 'Unknown',
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100' // モックデータ
    };

    // 新しいログを先頭に追加
    operationLogs.unshift(newLog);
    
    // ログが1000件を超えた場合、古いログを削除
    if (operationLogs.length > 1000) {
      operationLogs.splice(1000);
    }
    
    localStorage.setItem('adminOperationLogs', JSON.stringify(operationLogs));
    
    return newLog;
  } catch (error) {
    console.error('操作ログの記録に失敗しました:', error);
    return null;
  }
};

// 特定の管理者の操作ログを取得
export const getAdminOperationLogs = (adminId = null, limit = 50) => {
  try {
    const operationLogs = JSON.parse(localStorage.getItem('adminOperationLogs') || '[]');
    
    if (adminId) {
      return operationLogs.filter(log => log.adminId === adminId).slice(0, limit);
    }
    
    return operationLogs.slice(0, limit);
  } catch (error) {
    console.error('操作ログの取得に失敗しました:', error);
    return [];
  }
};

// 管理者アカウントの操作ログを記録する関数
export const logAdminAccountOperation = (operation, adminData) => {
  const actionMap = {
    'create': '管理者アカウント作成',
    'update': '管理者アカウント更新',
    'login': '管理者ログイン',
    'logout': '管理者ログアウト',
    'view': '管理者情報閲覧'
  };

  const action = actionMap[operation] || operation;
  const details = `${adminData.name} (${adminData.id}) の${action}`;
  
  return logAdminOperation(action, details);
};

// システム操作のログを記録する関数
export const logSystemOperation = (operation, details) => {
  const actionMap = {
    'dashboard_access': 'ダッシュボードアクセス',
    'report_view': 'レポート閲覧',
    'data_export': 'データエクスポート',
    'settings_change': '設定変更',
    'user_management': 'ユーザー管理操作'
  };

  const action = actionMap[operation] || operation;
  
  return logAdminOperation(action, details);
}; 