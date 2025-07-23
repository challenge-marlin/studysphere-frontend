import React from 'react';

/**
 * YouTube動画をiframeで表示するコンポーネント
 * @param {string} videoUrl - YouTube動画のURL
 * @param {string} title - 動画タイトル（アクセシビリティ用）
 */
const LessonVideoPlayer = ({ videoUrl, title }) => {
  // YouTube動画IDを抽出
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">動画URLが正しくありません</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default LessonVideoPlayer; 