import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiCall, apiDownloadBinary } from '../utils/api';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '120分',
    order_index: 0,
    has_assignment: false,
    course_id: '',
    youtube_url: ''
  });
  const [file, setFile] = useState(null);
  const [showFileListModal, setShowFileListModal] = useState(false);
  const [selectedLessonFiles, setSelectedLessonFiles] = useState(null);
  const [fileListLoading, setFileListLoading] = useState(false);

  // コース一覧取得
  const fetchCourses = async () => {
    try {
      console.log('LessonManagement: コース一覧取得開始');
      
      // 認証トークンの確認
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('LessonManagement: 認証トークン確認:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length
      });
      
      let response;
      
      if (!accessToken) {
        console.log('LessonManagement: アクセストークンが存在しないため、テストエンドポイントを使用');
        // 認証なしのテストエンドポイントを使用
        response = await fetch('http://localhost:5000/api/test/courses');
        const data = await response.json();
        response = data;
      } else {
        response = await apiGet('/api/courses');
      }
      
      console.log('LessonManagement: コース取得レスポンス:', response);
      
      if (response.success) {
        console.log('LessonManagement: コース取得成功、データ数:', response.data.length);
        setCourses(response.data);
      } else {
        console.error('LessonManagement: コース取得失敗:', response.message);
        setError('コースの取得に失敗しました: ' + response.message);
      }
    } catch (err) {
      console.error('LessonManagement: コース取得エラー:', err);
      
      // 認証エラーの場合はテストエンドポイントを試行
      if (err.message === 'Authentication failed' || err.message.includes('401') || err.message.includes('403')) {
        console.log('LessonManagement: 認証エラーのため、テストエンドポイントを試行');
        try {
          const testResponse = await fetch('http://localhost:5000/api/test/courses');
          const testData = await testResponse.json();
          
          if (testData.success) {
            console.log('LessonManagement: テストエンドポイントでコース取得成功');
            setCourses(testData.data);
            return;
          }
        } catch (testErr) {
          console.error('LessonManagement: テストエンドポイントでもエラー:', testErr);
        }
      }
      
      setError('コースの取得中にエラーが発生しました: ' + err.message);
    }
  };

  // レッスン一覧取得
  const fetchLessons = async () => {
    try {
      setLoading(true);
      const queryString = selectedCourseId ? `?courseId=${selectedCourseId}` : '';
      const response = await apiGet(`/api/lessons${queryString}`);
      
      console.log('LessonManagement: レッスン取得レスポンス:', response);
      
      if (response.success) {
        setLessons(response.data);
        setError(null); // エラーをクリア
      } else {
        setError('レッスンの取得に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      setError('レッスンの取得中にエラーが発生しました: ' + err.message);
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // コースデータの状態を監視
  useEffect(() => {
    console.log('LessonManagement: コースデータ状態更新:', {
      coursesCount: courses.length,
      courses: courses.map(c => ({ id: c.id, title: c.title }))
    });
  }, [courses]);

  useEffect(() => {
    fetchLessons();
  }, [selectedCourseId]);

  // フォームデータの更新
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? null : value)
    }));
  };

  // ファイル選択
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // レッスン作成
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        // undefined値をnullに変換
        formDataToSend.append(key, value === undefined ? null : value);
      });
      if (file) {
        formDataToSend.append('file', file);
        // ファイル名を別途送信（文字化け対策）
        formDataToSend.append('fileName', file.name);
      }

      console.log('LessonManagement: レッスン作成開始');
      const response = await apiCall('/api/lessons', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('LessonManagement: レッスン作成レスポンス:', response);

      if (response.success) {
        console.log('LessonManagement: レッスン作成成功');
        closeModals(); // closeModals関数を使用
        setError(null); // エラーをクリア
        await fetchLessons(); // レッスンリストを再取得
      } else {
        console.error('LessonManagement: レッスン作成失敗:', response.message);
        setError('レッスンの作成に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      console.error('LessonManagement: レッスン作成エラー:', err);
      setError('レッスンの作成中にエラーが発生しました: ' + err.message);
    }
  };

  // レッスン更新
  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      // 認証トークンの確認
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('LessonManagement: レッスン更新 - 認証トークン確認:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        selectedLessonId: selectedLesson?.id
      });

      const formDataToSend = new FormData();
      
      // 変更されたフィールドのみを送信
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        const originalValue = selectedLesson[key];
        
        // 値が変更されている場合のみ送信
        if (value !== originalValue) {
          // undefined値をnullに変換
          formDataToSend.append(key, value === undefined ? null : value);
        }
      });
      
      // ファイルが選択されている場合のみ送信
      if (file) {
        formDataToSend.append('file', file);
        // ファイル名を別途送信（文字化け対策）
        formDataToSend.append('fileName', file.name);
      }

      // FormDataの内容をログ出力
      console.log('LessonManagement: 送信するFormDataの内容:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('LessonManagement: レッスン更新開始');
      const response = await apiCall(`/api/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      console.log('LessonManagement: レッスン更新レスポンス:', response);

      if (response.success) {
        console.log('LessonManagement: レッスン更新成功');
        closeModals(); // closeModals関数を使用
        setError(null); // エラーをクリア
        await fetchLessons(); // レッスンリストを再取得
      } else {
        console.error('LessonManagement: レッスン更新失敗:', response.message);
        setError('レッスンの更新に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      console.error('LessonManagement: レッスン更新エラー:', err);
      let errorMessage = 'レッスンの更新中にエラーが発生しました';
      
      if (err.message.includes('Authentication failed')) {
        errorMessage = '認証に失敗しました。再度ログインしてください。';
      } else if (err.message.includes('401')) {
        errorMessage = '認証が必要です。再度ログインしてください。';
      } else if (err.message.includes('403')) {
        errorMessage = '管理者権限が必要です。';
      } else if (err.message.includes('404')) {
        errorMessage = 'レッスンが見つかりません。';
      } else if (err.message.includes('500')) {
        errorMessage = 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';
      } else {
        errorMessage += ': ' + err.message;
      }
      
      setError(errorMessage);
    }
  };

  // レッスン削除
  const handleDeleteLesson = async (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const confirmMessage = lesson.s3_key 
      ? `このレッスン「${lesson.title}」を削除しますか？\n\n削除される内容：\n• レッスンデータ\n• S3上のファイル・フォルダ\n\nこの操作は取り消せません。`
      : `このレッスン「${lesson.title}」を削除しますか？\n\nこの操作は取り消せません。`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('LessonManagement: レッスン削除開始', { lessonId, lessonTitle: lesson.title });
      const response = await apiDelete(`/api/lessons/${lessonId}`);
      
      console.log('LessonManagement: レッスン削除レスポンス:', response);
      
      if (response.success) {
        console.log('LessonManagement: レッスン削除成功');
        setError(null); // エラーをクリア
        await fetchLessons(); // レッスンリストを再取得
        
        // 成功メッセージを表示
        const successMessage = lesson.s3_key 
          ? `レッスン「${lesson.title}」が正常に削除されました。\nS3上のファイル・フォルダも削除されました。`
          : `レッスン「${lesson.title}」が正常に削除されました。`;
        
        alert(successMessage);
      } else {
        console.error('LessonManagement: レッスン削除失敗:', response.message);
        setError('レッスンの削除に失敗しました: ' + (response.message || ''));
      }
    } catch (err) {
      console.error('LessonManagement: レッスン削除エラー:', err);
      setError('レッスンの削除中にエラーが発生しました: ' + err.message);
    }
  };

  // フォルダダウンロード（ZIP形式）
  const handleDownloadFolder = async (lessonId) => {
    try {
      const blob = await apiDownloadBinary(`/api/lessons/${lessonId}/download-folder`, {
        method: 'GET'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lesson-folder-${lessonId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('フォルダのダウンロードに失敗しました');
      console.error('Error downloading folder:', err);
    }
  };

  // ファイル一覧表示
  const handleShowFileList = async (lessonId) => {
    try {
      setFileListLoading(true);
      const response = await apiGet(`/api/lessons/${lessonId}/files`);
      
      if (response.success) {
        setSelectedLessonFiles(response.data);
        setShowFileListModal(true);
      } else {
        setError('ファイル一覧の取得に失敗しました: ' + response.message);
      }
    } catch (err) {
      setError('ファイル一覧の取得に失敗しました: ' + err.message);
      console.error('Error fetching file list:', err);
    } finally {
      setFileListLoading(false);
    }
  };

  // 個別ファイルダウンロード
  const handleDownloadIndividualFile = async (fileKey, fileName) => {
    try {
      const blob = await apiDownloadBinary(`/api/lessons/download-file`, {
        method: 'POST',
        body: JSON.stringify({ fileKey }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('ファイルのダウンロードに失敗しました');
      console.error('Error downloading individual file:', err);
    }
  };

  // 編集モーダルを開く
  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || '120分',
      order_index: lesson.order_index || 0,
      has_assignment: lesson.has_assignment || false,
      course_id: lesson.course_id,
      youtube_url: lesson.youtube_url || ''
    });
    setFile(null);
    setShowEditModal(true);
  };

  // モーダルを閉じる
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowFileListModal(false);
    setSelectedLesson(null);
    setSelectedLessonFiles(null);
    setFormData({
      title: '',
      description: '',
      duration: '120分',
      order_index: 0,
      has_assignment: false,
      course_id: '',
      youtube_url: ''
    });
    setFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-blue-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            レッスン管理
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            ＋ 新規レッスン作成
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* コースフィルター */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コースで絞り込み
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべてのコース</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* レッスン一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-blue-800">レッスン名</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-800">コース</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-800">説明</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-800">所要時間</th>
                                     <th className="px-4 py-3 text-left font-semibold text-blue-800">課題</th>
                   <th className="px-4 py-3 text-left font-semibold text-blue-800">ファイル</th>
                   <th className="px-4 py-3 text-left font-semibold text-blue-800">動画</th>
                   <th className="px-4 py-3 text-left font-semibold text-blue-800">操作</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-4 py-3 font-semibold text-gray-800">{lesson.title}</td>
                    <td className="px-4 py-3 text-gray-600">{lesson.course_title}</td>
                    <td className="px-4 py-3 text-gray-600">{lesson.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{lesson.duration}</td>
                                         <td className="px-4 py-3">
                       {lesson.has_assignment ? (
                         <span className="text-green-600 font-medium">あり</span>
                       ) : (
                         <span className="text-gray-400">なし</span>
                       )}
                     </td>
                                           <td className="px-4 py-3">
                        {lesson.s3_key ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShowFileList(lesson.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              📋 ファイル一覧
                            </button>
                            <button
                              onClick={() => handleDownloadFolder(lesson.id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              📁 フォルダ
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">なし</span>
                        )}
                      </td>
                     <td className="px-4 py-3">
                       {lesson.youtube_url ? (
                         <a
                           href={lesson.youtube_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-red-600 hover:text-red-800 font-medium"
                         >
                           🎥 視聴
                         </a>
                       ) : (
                         <span className="text-gray-400">なし</span>
                       )}
                     </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                          ✏️ 編集
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                          🗑️ 削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 新規作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">新規レッスン作成</h2>
            <form onSubmit={handleCreateLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コース *
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">コースを選択</option>
                  {courses.length > 0 ? (
                    courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      コースが読み込まれていません
                    </option>
                  )}
                </select>
                {courses.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    コースデータの読み込みに失敗しました。ページを再読み込みしてください。
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  利用可能なコース数: {courses.length}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  レッスン名 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所要時間
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示順序
                </label>
                <input
                  type="number"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                             <div className="mb-4">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     name="has_assignment"
                     checked={formData.has_assignment}
                     onChange={handleInputChange}
                     className="mr-2"
                   />
                   <span className="text-sm font-medium text-gray-700">課題あり</span>
                 </label>
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   YouTube動画URL
                 </label>
                 <input
                   type="url"
                   name="youtube_url"
                   value={formData.youtube_url}
                   onChange={handleInputChange}
                   placeholder="https://www.youtube.com/watch?v=..."
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   YouTubeの動画URLを入力してください
                 </p>
               </div>
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   ファイル（PDF、MD、DOCX、PPTX）
                 </label>
                 <input
                   type="file"
                   onChange={handleFileChange}
                   accept=".pdf,.md,.docx,.pptx"
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">レッスン編集</h2>
            <form onSubmit={handleUpdateLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コース *
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  レッスン名 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所要時間
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示順序
                </label>
                <input
                  type="number"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                             <div className="mb-4">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     name="has_assignment"
                     checked={formData.has_assignment}
                     onChange={handleInputChange}
                     className="mr-2"
                   />
                   <span className="text-sm font-medium text-gray-700">課題あり</span>
                 </label>
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   YouTube動画URL
                 </label>
                 <input
                   type="url"
                   name="youtube_url"
                   value={formData.youtube_url}
                   onChange={handleInputChange}
                   placeholder="https://www.youtube.com/watch?v=..."
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   YouTubeの動画URLを入力してください
                 </p>
               </div>
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   ファイル（PDF、MD、DOCX、PPTX）
                 </label>
                 <input
                   type="file"
                   onChange={handleFileChange}
                   accept=".pdf,.md,.docx,.pptx"
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 {selectedLesson.s3_key && (
                   <p className="text-sm text-gray-500 mt-1">
                     現在のファイル: {selectedLesson.s3_key.split('/').pop()}
                   </p>
                 )}
               </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  更新
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ファイル一覧モーダル */}
      {showFileListModal && selectedLessonFiles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ファイル一覧 - {selectedLessonFiles.lesson.title}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>コース:</strong> {selectedLessonFiles.lesson.courseTitle}
              </p>
              <p className="text-sm text-blue-800">
                <strong>ファイル数:</strong> {selectedLessonFiles.files.length}個
              </p>
            </div>

            {fileListLoading ? (
              <div className="text-center py-8">
                <div className="text-blue-600 text-lg">ファイル一覧を読み込み中...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">ファイル名</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">サイズ</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">更新日時</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLessonFiles.files.map((file, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {file.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {file.sizeFormatted}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(file.lastModified).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDownloadIndividualFile(file.key, file.name)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                          >
                            📥 ダウンロード
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement; 