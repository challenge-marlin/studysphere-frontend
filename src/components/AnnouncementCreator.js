import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const AnnouncementCreator = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        satellite_id: '',
        company_id: ''
    });

    // 利用者一覧を取得
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.satellite_id) queryParams.append('satellite_id', filters.satellite_id);
            if (filters.company_id) queryParams.append('company_id', filters.company_id);

            const response = await apiGet(`/announcements/admin/users?${queryParams.toString()}`);
            if (response.success) {
                setAvailableUsers(response.data);
            }
        } catch (error) {
            console.error('利用者一覧取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    // アナウンス送信
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !message.trim() || selectedUsers.length === 0) {
            alert('タイトル、メッセージ、受信者をすべて入力してください。');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiPost('/announcements/admin/create', {
                title: title.trim(),
                message: message.trim(),
                recipient_ids: selectedUsers.map(user => user.id)
            });

            if (response.success) {
                alert('アナウンスを送信しました。');
                // フォームをリセット
                setTitle('');
                setMessage('');
                setSelectedUsers([]);
            } else {
                alert('アナウンスの送信に失敗しました。');
            }
        } catch (error) {
            console.error('アナウンス送信エラー:', error);
            alert('アナウンスの送信に失敗しました。');
        } finally {
            setSubmitting(false);
        }
    };

    // ユーザー選択/解除
    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(selected => selected.id === user.id);
            if (isSelected) {
                return prev.filter(selected => selected.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    // 全選択/全解除
    const toggleAllUsers = () => {
        if (selectedUsers.length === availableUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers([...availableUsers]);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* タイトル */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        タイトル *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="アナウンスのタイトルを入力"
                        maxLength={255}
                    />
                </div>

                {/* メッセージ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        メッセージ *
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="アナウンスの内容を入力"
                    />
                </div>

                {/* 受信者選択 */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            受信者選択 *
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowUserSelector(!showUserSelector)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                            {showUserSelector ? '閉じる' : '受信者を選択'}
                        </button>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2">
                                選択済み: {selectedUsers.length}名
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                    >
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => toggleUserSelection(user)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {showUserSelector && (
                        <div className="border border-gray-300 rounded-lg p-3">
                            {/* フィルター */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        ロール
                                    </label>
                                    <select
                                        value={filters.role}
                                        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">すべて</option>
                                        <option value="1">利用者</option>
                                        <option value="4">指導員</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        拠点
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.satellite_id}
                                        onChange={(e) => setFilters(prev => ({ ...prev, satellite_id: e.target.value }))}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="拠点ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        企業
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.company_id}
                                        onChange={(e) => setFilters(prev => ({ ...prev, company_id: e.target.value }))}
                                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="企業ID"
                                    />
                                </div>
                            </div>

                            {/* 全選択ボタン */}
                            <div className="mb-3">
                                <button
                                    type="button"
                                    onClick={toggleAllUsers}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                                >
                                    {selectedUsers.length === availableUsers.length ? '全解除' : '全選択'}
                                </button>
                            </div>

                            {/* 利用者一覧 */}
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                {loading ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">読み込み中...</div>
                                ) : availableUsers.length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">
                                        利用者が見つかりません
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {availableUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className={`p-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                                    selectedUsers.some(selected => selected.id === user.id)
                                                        ? 'bg-blue-50'
                                                        : ''
                                                }`}
                                                onClick={() => toggleUserSelection(user)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {user.role === 1 ? '利用者' : '指導員'} | 
                                                            {user.company_name && ` ${user.company_name}`}
                                                            {user.satellite_name && ` | ${user.satellite_name}`}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.some(selected => selected.id === user.id)}
                                                        onChange={() => toggleUserSelection(user)}
                                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => {
                            setTitle('');
                            setMessage('');
                            setSelectedUsers([]);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        リセット
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !title.trim() || !message.trim() || selectedUsers.length === 0}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                        {submitting ? '送信中...' : 'アナウンス送信'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnnouncementCreator;
