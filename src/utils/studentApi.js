import { apiGet, apiPut } from './api';

/**
 * 利用者のコース一覧を取得
 */
export const fetchStudentCourses = async () => {
  try {
    // JWTトークン認証を使用（httpInterceptorで自動的にヘッダーに追加される）
    const response = await apiGet('/api/student/courses');
    return response;
  } catch (error) {
    console.error('利用者コース取得エラー:', error);
    throw error;
  }
};

/**
 * 利用者のレッスン一覧を取得
 */
export const fetchStudentLessons = async (courseId = null) => {
  try {
    // JWTトークン認証を使用（httpInterceptorで自動的にヘッダーに追加される）
    const queryString = courseId ? `?courseId=${courseId}` : '';
    const response = await apiGet(`/api/student/lessons${queryString}`);
    return response;
  } catch (error) {
    console.error('利用者レッスン取得エラー:', error);
    throw error;
  }
};

/**
 * 利用者のレッスン進捗を取得
 */
export const fetchStudentLessonProgress = async (lessonId) => {
  try {
    // JWTトークン認証を使用（httpInterceptorで自動的にヘッダーに追加される）
    const response = await apiGet(`/api/student/lessons/${lessonId}/progress`);
    return response;
  } catch (error) {
    console.error('利用者レッスン進捗取得エラー:', error);
    throw error;
  }
};

/**
 * 利用者のレッスン進捗を更新
 */
export const updateStudentLessonProgress = async (lessonId, progressData) => {
  try {
    // JWTトークン認証を使用（httpInterceptorで自動的にヘッダーに追加される）
    const response = await apiPut(`/api/student/lessons/${lessonId}/progress`, progressData);
    return response;
  } catch (error) {
    console.error('利用者レッスン進捗更新エラー:', error);
    throw error;
  }
};

/**
 * 利用者のダッシュボード情報を取得
 */
export const fetchStudentDashboard = async () => {
  try {
    // JWTトークン認証を使用（httpInterceptorで自動的にヘッダーに追加される）
    const response = await apiGet('/api/student/dashboard');
    return response;
  } catch (error) {
    console.error('利用者ダッシュボード取得エラー:', error);
    throw error;
  }
};
