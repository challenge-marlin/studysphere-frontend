import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const LearningHeader = ({ 
  lessonData, 
  courseData, 
  currentLesson,
  currentSection,
  sectionData,
  onSectionChange,
  onUploadModalOpen,
  onTestNavigate,
  isTestEnabled,
  testDisabledReason,
  hasAssignment,
  assignmentSubmitted
}) => {
  const navigate = useNavigate();
  const [localSectionData, setLocalSectionData] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionError, setSectionError] = useState(null);

  // セクションデータを取得
  useEffect(() => {
    const fetchSectionData = async () => {
      if (!currentLesson) return;
      
      try {
        setIsLoadingSections(true);
        setSectionError(null);
        
        console.log('セクションデータを取得中:', currentLesson);
        
        const response = await fetch(`${API_BASE_URL}/api/lesson-text-video-links/lesson/${currentLesson}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            console.log('セクションデータ取得成功:', data.data);
            setLocalSectionData(data.data);
          } else {
            console.warn('セクションデータの取得に失敗:', data.message);
            setSectionError(data.message || 'セクションデータの取得に失敗しました');
          }
        } else {
          console.error('セクションデータの取得に失敗:', response.status, response.statusText);
          setSectionError(`セクションデータの取得に失敗しました: ${response.status}`);
        }
      } catch (error) {
        console.error('セクションデータ取得エラー:', error);
        setSectionError('セクションデータの取得中にエラーが発生しました');
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSectionData();
  }, [currentLesson]);

  // 表示用のセクションデータを決定（propsから渡されたものがあればそれを使用、なければローカルで取得したもの）
  const displaySectionData = sectionData && sectionData.length > 0 ? sectionData : localSectionData;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => window.history.back()}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 hover:scale-105"
                title="ダッシュボードに戻る"
              >
                ←
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {lessonData?.title || `第${currentLesson}回　学習内容`}
              </h1>
            </div>
            
            {courseData && (
              <p className="text-blue-100 text-sm lg:text-base">
                {courseData.title} - {courseData.description || 'コースの説明'}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">セクション選択: </label>
              <select 
                value={currentSection} 
                onChange={(e) => onSectionChange(parseInt(e.target.value))}
                disabled={isLoadingSections}
                className="px-3 py-1 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingSections ? (
                  <option value={currentSection} className="text-gray-800">
                    読み込み中...
                  </option>
                ) : sectionError ? (
                  <option value={currentSection} className="text-gray-800">
                    エラー: セクション取得失敗
                  </option>
                ) : displaySectionData && displaySectionData.length > 0 ? (
                  displaySectionData.map((section, index) => (
                    <option key={section.id || index} value={index} className="text-gray-800">
                      {section.video_title || section.section_title || `セクション ${index + 1}`}
                    </option>
                  ))
                ) : (
                  <option value={currentSection} className="text-gray-800">
                    セクション{currentSection + 1}
                  </option>
                )}
              </select>
              {sectionError && (
                <span className="text-xs text-red-200" title={sectionError}>
                  ⚠️
                </span>
              )}
            </div>
            
            {/* 成果物アップロードボタン（課題がある場合のみ表示） */}
            {hasAssignment && !assignmentSubmitted && (
              <button 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={onUploadModalOpen}
              >
                📁 成果物アップロード
              </button>
            )}
            
            {/* 課題提出済み表示 */}
            {hasAssignment && assignmentSubmitted && (
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                ✅ 課題提出済み
              </span>
            )}
            
            {/* テストメニュー */}
            <div className="relative group flex flex-col items-start">
              <button 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isTestEnabled}
              >
                📝 学習効果テスト ▼
              </button>
              
              {/* ドロップダウンメニュー */}
              {isTestEnabled && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        // セクションテストのキャッシュをクリア
                        const sectionCacheKey = `test_data_${currentLesson}_${currentSection}`;
                        sessionStorage.removeItem(sectionCacheKey);
                        console.log('セクションテストのキャッシュをクリア:', sectionCacheKey);
                        navigate(`/student/section-test?lesson=${currentLesson}&section=${currentSection}`);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <div className="font-medium">セクションまとめテスト</div>
                      <div className="text-sm text-gray-500">10問</div>
                    </button>
                    <button
                      onClick={() => {
                        // レッスンテストのキャッシュをクリア
                        const lessonCacheKey = `test_data_lesson_${currentLesson}`;
                        sessionStorage.removeItem(lessonCacheKey);
                        console.log('レッスンテストのキャッシュをクリア:', lessonCacheKey);
                        navigate(`/student/lesson-test?lesson=${currentLesson}`);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <div className="font-medium">レッスンまとめテスト</div>
                      <div className="text-sm text-gray-500">30問</div>
                    </button>
                  </div>
                </div>
              )}
              
              {!isTestEnabled && testDisabledReason && (
                <p className="mt-2 text-xs text-yellow-100 max-w-xs leading-snug">
                  {testDisabledReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHeader;
