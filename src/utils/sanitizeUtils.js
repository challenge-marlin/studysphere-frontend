/**
 * 入力値のサニタイズ機能を提供するユーティリティ
 * XSS攻撃を防ぐための安全な入力処理
 */

/**
 * HTMLタグを除去し、テキストのみを抽出
 * @param {string} input - サニタイズ対象の文字列
 * @returns {string} サニタイズされた文字列
 */
export const removeHtmlTags = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // HTMLタグを除去
  return input.replace(/<[^>]*>/g, '');
};

/**
 * 危険なスクリプトやイベントハンドラーを除去
 * @param {string} input - サニタイズ対象の文字列
 * @returns {string} サニタイズされた文字列
 */
export const removeScripts = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // scriptタグを除去
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // イベントハンドラー属性を除去
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // javascript:プロトコルを除去
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

/**
 * 特殊文字をHTMLエンティティにエスケープ
 * @param {string} input - エスケープ対象の文字列
 * @returns {string} エスケープされた文字列
 */
export const escapeHtml = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
};

/**
 * 完全なサニタイズ処理（推奨）
 * HTMLタグ除去 + スクリプト除去 + エスケープ
 * @param {string} input - サニタイズ対象の文字列
 * @returns {string} 完全にサニタイズされた文字列
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  let sanitized = input;
  
  // 1. スクリプトとイベントハンドラーを除去
  sanitized = removeScripts(sanitized);
  
  // 2. HTMLタグを除去
  sanitized = removeHtmlTags(sanitized);
  
  // 3. 特殊文字をエスケープ
  sanitized = escapeHtml(sanitized);
  
  // 4. 連続する空白を単一の空白に正規化
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // 5. 前後の空白を除去
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * 軽量サニタイズ（HTMLタグのみ除去）
 * パフォーマンス重視の場合に使用
 * @param {string} input - サニタイズ対象の文字列
 * @returns {string} 軽量サニタイズされた文字列
 */
export const sanitizeInputLight = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return removeHtmlTags(input).trim();
};

/**
 * 数値入力のサニタイズ
 * @param {string} input - 数値入力文字列
 * @returns {string} 数値のみの文字列
 */
export const sanitizeNumber = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // 数値と小数点、マイナス記号のみを許可
  return input.replace(/[^0-9.-]/g, '');
};

/**
 * メールアドレスのサニタイズ
 * @param {string} input - メールアドレス文字列
 * @returns {string} サニタイズされたメールアドレス
 */
export const sanitizeEmail = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // 基本的なメール形式のみを許可
  return input.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
};

/**
 * URLのサニタイズ
 * @param {string} input - URL文字列
 * @returns {string} サニタイズされたURL
 */
export const sanitizeUrl = (input) => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // 危険なプロトコルを除去
  let sanitized = input.replace(/^(javascript|data|vbscript):/gi, '');
  
  // 基本的なURL文字のみを許可
  sanitized = sanitized.replace(/[^a-zA-Z0-9:/?#[\]@!$&'()*+,;=._~-]/g, '');
  
  return sanitized;
};

/**
 * リアルタイムサニタイズ用のデバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * サニタイズ設定オプション
 */
export const SANITIZE_OPTIONS = {
  FULL: 'full',           // 完全サニタイズ
  LIGHT: 'light',         // 軽量サニタイズ
  HTML_ONLY: 'html_only', // HTMLタグ除去のみ
  NONE: 'none'            // サニタイズなし
}; 