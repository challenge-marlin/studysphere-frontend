import React from 'react';
import LessonVideoPlayer from '../LessonVideoPlayer';

const VideoSection = ({ lessonData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎥</span>
        <h3 className="text-xl font-bold text-gray-800">動画学習</h3>
      </div>
      
      {lessonData && lessonData.videos && lessonData.videos.length > 0 ? (
        <>
          {lessonData.videos.map((video, index) => (
            <div key={video.id || index} className="mb-4">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800 mb-1">{video.title}</p>
                <p className="text-sm text-blue-600">{video.description}</p>
              </div>
              <LessonVideoPlayer videoUrl={video.youtube_url} title={video.title} />
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>このレッスンには動画がありません。</p>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
