import React, { useEffect, useRef, useState } from 'react';
import LessonVideoPlayer from '../LessonVideoPlayer';

const useAspectFit = (aspectRatio = 16 / 9) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      let fittedWidth = rect.width;
      let fittedHeight = fittedWidth / aspectRatio;

      if (fittedHeight > rect.height) {
        fittedHeight = rect.height;
        fittedWidth = fittedHeight * aspectRatio;
      }

      setDimensions({
        width: fittedWidth,
        height: fittedHeight
      });
    };

    updateSize();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [aspectRatio]);

  return { containerRef, dimensions };
};

const FittedVideoPlayer = ({ videoUrl, title }) => {
  const { containerRef, dimensions } = useAspectFit(16 / 9);
  const hasSize = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div ref={containerRef} className="flex-1 w-full flex items-center justify-center">
      {hasSize ? (
        <div
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }}
          className="rounded-lg overflow-hidden bg-black shadow-inner"
        >
          <LessonVideoPlayer
            videoUrl={videoUrl}
            title={title}
            containerClassName="w-full h-full bg-black"
          />
        </div>
      ) : (
        <LessonVideoPlayer videoUrl={videoUrl} title={title} />
      )}
    </div>
  );
};

const VideoSection = ({ lessonData }) => {
  const videos = lessonData?.videos || [];
  const hasVideos = videos.length > 0;
  const isSingleVideo = videos.length === 1;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 workspace-widget-handle cursor-move select-none">
        <span className="text-2xl">🎥</span>
        <h3 className="text-xl font-bold text-gray-800">動画学習</h3>
      </div>
      
      {hasVideos ? (
        <div
          className={`flex-1 flex flex-col ${
            isSingleVideo ? '' : 'space-y-6 overflow-y-auto custom-scrollbar pr-1'
          }`}
        >
          {videos.map((video, index) => {
            const videoWrapperClass = isSingleVideo
              ? 'flex-1 flex flex-col overflow-hidden'
              : 'flex flex-col';
            
            return (
              <div key={video.id || index} className={videoWrapperClass}>
                <div className="flex-none mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-800 mb-1">{video.title}</p>
                  <p className="text-sm text-blue-600">{video.description}</p>
                </div>
                <div className={isSingleVideo ? 'flex-1 flex' : 'flex'}>
                  <FittedVideoPlayer videoUrl={video.youtube_url} title={video.title} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <p>このレッスンには動画がありません。</p>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
