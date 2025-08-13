import React, { useState, useEffect } from 'react';

/**
 * 複数のYouTube動画を表示するコンポーネント
 * @param {Array} videos - 動画オブジェクトの配列
 * @param {string} lessonTitle - レッスンタイトル
 * @param {boolean} isAdmin - 管理者かどうか
 * @param {Function} onVideoSelect - 動画選択時のコールバック
 */
const MultiVideoPlayer = ({ videos = [], lessonTitle, isAdmin = false, onVideoSelect }) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideos, setEditingVideos] = useState([]);

  // デバッグ用: 受け取ったpropsをログ出力
  useEffect(() => {
    console.log('MultiVideoPlayer - Received props:', {
      videos,
      lessonTitle,
      isAdmin,
      videosCount: videos.length
    });
  }, [videos, lessonTitle, isAdmin]);

  // YouTube動画IDを抽出する関数
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  // 動画選択時の処理
  const handleVideoSelect = (index) => {
    console.log('Video selected:', index, videos[index]);
    setSelectedVideoIndex(index);
    if (onVideoSelect) {
      onVideoSelect(videos[index], index);
    }
  };

  // 編集モード開始
  const handleEditStart = () => {
    setEditingVideos([...videos]);
    setIsEditing(true);
  };

  // 編集モード終了
  const handleEditCancel = () => {
    setEditingVideos([]);
    setIsEditing(false);
  };

  // 動画追加
  const handleAddVideo = () => {
    const newVideo = {
      id: `temp_${Date.now()}`,
      title: '',
      description: '',
      youtube_url: '',
      order_index: editingVideos.length,
      duration: '',
      thumbnail_url: ''
    };
    setEditingVideos([...editingVideos, newVideo]);
  };

  // 動画削除
  const handleRemoveVideo = (index) => {
    const updatedVideos = editingVideos.filter((_, i) => i !== index);
    setEditingVideos(updatedVideos);
  };

  // 動画情報更新
  const handleVideoUpdate = (index, field, value) => {
    const updatedVideos = [...editingVideos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setEditingVideos(updatedVideos);
  };

  // 保存処理
  const handleSave = async () => {
    // TODO: APIを呼び出して動画情報を保存
    console.log('Saving videos:', editingVideos);
    setIsEditing(false);
  };

  // 動画がない場合の表示
  if (videos.length === 0 && !isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎥</span>
          <h3 className="text-xl font-bold text-gray-800">動画学習</h3>
          {isAdmin && (
            <button
              onClick={handleEditStart}
              className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              動画を追加
            </button>
          )}
        </div>
        <div className="text-center py-8 text-gray-600">
          <p>このレッスンには動画がありません。</p>
          <p className="text-sm text-gray-500 mt-2">
            デバッグ情報: videos配列の長さ = {videos.length}
          </p>
        </div>
      </div>
    );
  }

  const currentVideos = isEditing ? editingVideos : videos;
  const selectedVideo = currentVideos[selectedVideoIndex];
  const videoId = getYouTubeVideoId(selectedVideo?.youtube_url);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎥</span>
        <h3 className="text-xl font-bold text-gray-800">動画学習</h3>
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {currentVideos.length}個の動画
        </span>
        {isAdmin && !isEditing && (
          <button
            onClick={handleEditStart}
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            動画を編集
          </button>
        )}
        {isAdmin && isEditing && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleAddVideo}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              動画追加
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>

      {/* 動画リスト */}
      {currentVideos.length > 1 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            動画一覧 ({currentVideos.length}個)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentVideos.map((video, index) => (
              <div
                key={video.id || index}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  index === selectedVideoIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVideoSelect(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800 truncate">
                      {video.title || `動画 ${index + 1}`}
                    </h5>
                    {video.duration && (
                      <p className="text-sm text-gray-600">{video.duration}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate">
                      {video.youtube_url}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVideo(index);
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* メイン動画プレイヤー */}
      {selectedVideo && (
        <div className="mb-4">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-800 mb-1">
              {selectedVideo.title || `動画 ${selectedVideoIndex + 1}`}
            </p>
            {selectedVideo.description && (
              <p className="text-sm text-blue-600 mb-1">{selectedVideo.description}</p>
            )}
            <p className="text-sm text-blue-600">URL: {selectedVideo.youtube_url}</p>
            <p className="text-xs text-blue-500 mt-1">
              動画 {selectedVideoIndex + 1} / {currentVideos.length}
            </p>
          </div>

          {videoId ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={selectedVideo.title || `動画 ${selectedVideoIndex + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">動画URLが正しくありません</p>
            </div>
          )}
        </div>
      )}

      {/* 編集モード時のフォーム */}
      {isEditing && selectedVideo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">動画情報編集</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                動画タイトル
              </label>
              <input
                type="text"
                value={selectedVideo.title || ''}
                onChange={(e) => handleVideoUpdate(selectedVideoIndex, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="動画タイトルを入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                動画の長さ
              </label>
              <input
                type="text"
                value={selectedVideo.duration || ''}
                onChange={(e) => handleVideoUpdate(selectedVideoIndex, 'duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 15分30秒"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={selectedVideo.youtube_url || ''}
                onChange={(e) => handleVideoUpdate(selectedVideoIndex, 'youtube_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                動画説明
              </label>
              <textarea
                value={selectedVideo.description || ''}
                onChange={(e) => handleVideoUpdate(selectedVideoIndex, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="動画の説明を入力"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiVideoPlayer;
