import React from 'react';

/**
 * PDF教材をiframeで表示するコンポーネント
 * @param {string} pdfUrl - PDFファイルのURL
 * @param {string} title - PDFタイトル（アクセシビリティ用）
 */
const LessonPdfViewer = ({ pdfUrl, title }) => {
  const [loadError, setLoadError] = React.useState(false);

  return (
    <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
      {!loadError ? (
        <iframe
          src={pdfUrl}
          title={title}
          className="w-full h-full border-0"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="text-gray-500 mb-2">PDFを表示できませんでした</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            新しいタブでPDFを開く
          </a>
        </div>
      )}
    </div>
  );
};

export default LessonPdfViewer; 