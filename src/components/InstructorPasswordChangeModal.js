import React, { useState } from 'react';
import SanitizedInput from './SanitizedInput';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

const InstructorPasswordChangeModal = ({ isOpen, onClose, onPasswordChange, user }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('8文字以上で入力してください');
    if (!/[A-Z]/.test(password)) errors.push('大文字を含めてください');
    if (!/[a-z]/.test(password)) errors.push('小文字を含めてください');
    if (!/[0-9]/.test(password)) errors.push('数字を含めてください');
    return errors;
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setIsLoading(true);

    // バリデーション
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = '現在のパスワードを入力してください';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = '新しいパスワードを入力してください';
    } else {
      const passwordValidation = validatePassword(passwordForm.newPassword);
      if (passwordValidation.length > 0) {
        errors.newPassword = passwordValidation.join(', ');
      }
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'パスワードの確認を入力してください';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      await onPasswordChange(passwordForm.currentPassword, passwordForm.newPassword);
      // 成功時はフォームをリセット
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      // パスワード変更成功時にモーダルを閉じる
      onClose();
    } catch (error) {
      console.error('パスワード変更に失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔐 パスワード変更</h2>
        </div>

        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">🚨</span>
            <span className="text-red-800 font-medium">パスワードの変更が必須です</span>
          </div>
          <p className="text-red-700 text-sm mt-2">
            セキュリティのため、パスワードを変更するまでダッシュボードにアクセスできません。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="currentPassword" className="text-gray-700 font-medium mb-1">
              現在のパスワード <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFormChange}
              sanitizeMode={SANITIZE_OPTIONS.NONE}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="newPassword" className="text-gray-700 font-medium mb-1">
              新しいパスワード <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              sanitizeMode={SANITIZE_OPTIONS.NONE}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
            <div className="text-gray-500 text-sm mt-1">
              パスワード要件: 8文字以上、大文字・小文字・数字を含む
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="text-gray-700 font-medium mb-1">
              新しいパスワード（確認） <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange}
              sanitizeMode={SANITIZE_OPTIONS.NONE}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '変更中...' : 'パスワードを変更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorPasswordChangeModal;
