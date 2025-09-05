import React from 'react';

const FileUploadSection = ({ 
  uploadedFiles, 
  onFileDelete 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📁</span>
        <h3 className="text-xl font-bold text-gray-800">アップロード済みファイル</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {uploadedFiles.length}件
        </span>
      </div>
      
      <div className="space-y-3">
        {uploadedFiles.map(file => (
          <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600">📦</span>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                {file.originalName && file.originalName !== file.name && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    元ファイル: {file.originalName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>サイズ: {formatFileSize(file.size)}</span>
                <span>アップロード: {formatDate(file.uploadDate)}</span>
                {file.s3Key && (
                  <span className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                    S3保存済み
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => onFileDelete(file.id)}
              className="ml-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors hover:bg-red-100"
              title="ファイルを削除"
            >
              削除
            </button>
          </div>
        ))}
        {uploadedFiles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📁</div>
            <p className="text-gray-500 text-sm">アップロードされたファイルはありません</p>
            <p className="text-gray-400 text-xs mt-1">ZIPファイルをアップロードしてください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
