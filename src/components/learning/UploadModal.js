import React, { useState } from 'react';
import SanitizedInput from '../SanitizedInput';
import { SANITIZE_OPTIONS } from '../../utils/sanitizeUtils';

const UploadModal = ({ 
  isOpen, 
  onClose, 
  onFileUpload 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // ZIPファイルのみ許可
      if (file.type.includes('zip') || file.name.toLowerCase().endsWith('.zip')) {
        setSelectedFile(file);
      } else {
        alert('ZIPファイルのみアップロード可能です');
        event.target.value = '';
        setSelectedFile(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('zip') || file.name.toLowerCase().endsWith('.zip')) {
        setSelectedFile(file);
      } else {
        alert('ZIPファイルのみアップロード可能です');
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // ファイル選択イベントをシミュレート
      const event = {
        target: {
          files: [selectedFile]
        }
      };
      onFileUpload(event);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">成果物アップロード</h3>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ファイルを選択してください
            </label>
            <p className="text-xs text-gray-500 mb-3">
              ※ ZIPファイルのみアップロード可能です
            </p>
            
            {/* ドラッグ&ドロップエリア */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-green-600">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400">
                    <span className="text-3xl">📁</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ファイルをドラッグ&ドロップするか、<br />
                    下のボタンから選択してください
                  </p>
                </div>
              )}
            </div>
            
            {/* ファイル選択ボタン */}
            <div className="mt-3">
              <SanitizedInput
                type="file"
                accept=".zip,application/zip"
                onChange={handleFileSelect}
                sanitizeMode={SANITIZE_OPTIONS.NONE}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button 
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              onClick={handleClose}
            >
              キャンセル
            </button>
            <button 
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedFile
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              アップロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
