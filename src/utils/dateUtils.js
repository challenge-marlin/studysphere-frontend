/**
 * フロントエンド用の日本時間での時刻処理を統一するためのユーティリティ関数
 */

/**
 * 現在の日本時間を取得
 * @returns {Date} 日本時間のDateオブジェクト
 */
export const getCurrentJapanTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
};

/**
 * 日本時間での日付文字列を取得
 * @param {Date|string} date - 日付
 * @param {Object} options - オプション
 * @returns {string} 日本時間での日付文字列
 */
export const formatJapanTime = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Tokyo'
  };
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString('ja-JP', { ...defaultOptions, ...options });
};

/**
 * 日本時間での日付のみ文字列を取得
 * @param {Date|string} date - 日付
 * @returns {string} 日本時間での日付文字列（YYYY-MM-DD）
 */
export const formatJapanDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).replace(/\//g, '-');
};

/**
 * 日本時間での時刻のみ文字列を取得
 * @param {Date|string} date - 日付
 * @returns {string} 日本時間での時刻文字列（HH:MM:SS）
 */
export const formatJapanTimeOnly = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Tokyo'
  });
};

/**
 * 有効期限チェック（日本時間基準）
 * @param {Date|string} expiryTime - 有効期限（バックエンドから日本時間形式で返される）
 * @returns {boolean} 有効かどうか
 */
export const isExpired = (expiryTime) => {
  if (!expiryTime) return true;
  const now = getCurrentJapanTime();
  const expiryDate = new Date(expiryTime);
  return expiryDate <= now;
};

/**
 * 日本時間での今日の日付文字列を取得（YYYY-MM-DD）
 * @returns {string} 今日の日付文字列
 */
export const getTodayJapanDate = () => {
  return formatJapanDate(new Date());
};

/**
 * 日本時間での現在時刻文字列を取得
 * @returns {string} 現在時刻文字列
 */
export const getCurrentJapanTimeString = () => {
  return formatJapanTime(new Date());
};

/**
 * UTC時刻を日本時間の表示用文字列に変換
 * @param {Date|string} utcDate - UTC時刻
 * @returns {string} 日本時間の表示用文字列
 */
export const formatUTCToJapanTimeString = (utcDate) => {
  if (!utcDate) return '';
  const date = new Date(utcDate);
  const japanOffset = 9 * 60; // 日本時間はUTC+9
  const japanTime = new Date(date.getTime() + (japanOffset * 60 * 1000));
  return formatJapanTime(japanTime);
};

/**
 * UTC時刻を日本時間に変換
 * @param {Date|string} utcDate - UTC時刻
 * @returns {Date} 日本時間のDateオブジェクト
 */
export const convertUTCToJapanTime = (utcDate) => {
  const date = new Date(utcDate);
  const japanOffset = 9 * 60; // 日本時間はUTC+9
  return new Date(date.getTime() + (japanOffset * 60 * 1000));
};

/**
 * 日本時間をUTCに変換
 * @param {Date|string} japanDate - 日本時間
 * @returns {Date} UTCのDateオブジェクト
 */
export const convertJapanTimeToUTC = (japanDate) => {
  const date = new Date(japanDate);
  const japanOffset = 9 * 60; // 日本時間はUTC+9
  return new Date(date.getTime() - (japanOffset * 60 * 1000));
};

/**
 * 日付と時刻を組み合わせてMySQL形式の日時文字列に変換
 * @param {string} dateStr - 日付文字列（YYYY-MM-DD）
 * @param {string} timeStr - 時刻文字列（HH:MM）
 * @returns {string} MySQL形式の日時文字列（YYYY-MM-DD HH:MM:SS）
 */
export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  
  try {
    // 日付と時刻を組み合わせてDateオブジェクトを作成
    const combinedDateTime = new Date(`${dateStr}T${timeStr}:00`);
    
    // 有効な日時かチェック
    if (isNaN(combinedDateTime.getTime())) {
      return null;
    }
    
    // MySQL形式（YYYY-MM-DD HH:MM:SS）に変換
    const year = combinedDateTime.getFullYear();
    const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(combinedDateTime.getDate()).padStart(2, '0');
    const hours = String(combinedDateTime.getHours()).padStart(2, '0');
    const minutes = String(combinedDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(combinedDateTime.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日時変換エラー:', error);
    return null;
  }
};

/**
 * 時刻文字列をMySQL形式の日時文字列に変換（今日の日付を使用）
 * @param {string} timeStr - 時刻文字列（HH:MM）
 * @returns {string} MySQL形式の日時文字列（YYYY-MM-DD HH:MM:SS）
 */
export const convertTimeToMySQLDateTime = (timeStr) => {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const today = getTodayJapanDate();
  return combineDateAndTime(today, timeStr);
};
