import React, { useState } from 'react';
import SanitizedInput from './SanitizedInput';

const AdminPasswordChangeModal = ({ isOpen, onClose, onPasswordChange, user }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('8文字以上で入力してください');
    if (!/[A-Z]/.test(password)) errors.push('大文字を含めてください');
    if (!/[a-z]/.test(password)) errors.push('小文字を含めてください');
    if (!/[0-9]/.test(password)) errors.push('数字を含めてください');
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

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
      return;
    }

    setIsSubmitting(true);
    try {
      await onPasswordChange(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (error) {
      console.error('パスワード変更エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔐 パスワード変更</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {user?.passwordResetRequired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-red-500">⚠️</span>
              <span className="font-medium">パスワードの変更が必要です</span>
            </div>
            <p className="text-red-600 text-sm mt-2">
              管理者からパスワード変更が要求されています。新しいパスワードを設定してください。
            </p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在のパスワード
            </label>
            <SanitizedInput
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="現在のパスワードを入力"
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいパスワード
            </label>
            <SanitizedInput
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="新しいパスワードを入力"
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              8文字以上、大文字・小文字・数字を含めてください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいパスワード（確認）
            </label>
            <SanitizedInput
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="新しいパスワードを再入力"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '変更中...' : 'パスワードを変更'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordChangeModal;
