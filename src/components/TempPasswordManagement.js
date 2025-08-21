import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const TempPasswordManagement = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [expiryTime, setExpiryTime] = useState('');
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // 利用者一覧を取得
    const fetchUsers = async () => {
        // 認証状態を確認
        if (!isAuthenticated || !currentUser) {
            setMessage('ログインが必要です。');
            return;
        }
        
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedInstructor) {
                params.append('selected_instructor_id', selectedInstructor);
            }
            
            const response = await apiGet(`/api/temp-passwords/users?${params}`);
            if (response.success) {
                setUsers(response.data);
                // 全選択状態でスタート
                const allSelected = response.data.map(user => user.id);
                setSelectedUsers(allSelected);
            }
        } catch (error) {
            console.error('利用者一覧取得エラー:', error);
            setMessage('利用者一覧の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // 指導員一覧を取得
    const fetchInstructors = async () => {
        // 認証状態を確認
        if (!isAuthenticated || !currentUser) {
            setMessage('ログインが必要です。');
            return;
        }
        
        try {
            const response = await apiGet('/api/temp-passwords/instructors');
            if (response.success) {
                setInstructors(response.data);
            }
        } catch (error) {
            console.error('指導員一覧取得エラー:', error);
        }
    };

    useEffect(() => {
        fetchInstructors();
        fetchUsers();
    }, [selectedInstructor]);

    // 利用者選択の切り替え
    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // 全選択/全解除
    const toggleAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user.id));
        }
    };

    // 一時パスワード発行
    const issueTempPasswords = async () => {
        // 認証状態を確認
        if (!isAuthenticated || !currentUser) {
            setMessage('ログインが必要です。');
            return;
        }
        
        if (selectedUsers.length === 0) {
            setMessage('利用者を選択してください');
            return;
        }

        try {
            setLoading(true);
            const requestData = {
                user_ids: selectedUsers,
                expiry_time: expiryTime || null,
                announcement_title: announcementTitle || null,
                announcement_message: announcementMessage || null
            };

            const response = await apiPost('/api/temp-passwords/issue', requestData);
            if (response.success) {
                setMessage(`${response.message}`);
                // 成功後、利用者一覧を再取得
                fetchUsers();
                // フォームをリセット
                setExpiryTime('');
                setAnnouncementTitle('');
                setAnnouncementMessage('');
            }
        } catch (error) {
            console.error('一時パスワード発行エラー:', error);
            setMessage(error.message || '一時パスワードの発行に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // ユーザータイプに応じた表示名を取得
    const getUserTypeLabel = (userType) => {
        switch (userType) {
            case 'my_user':
                return '自分の担当利用者';
            case 'no_instructor_no_temp':
                return '担当なし・パスワード未発行';
            case 'selected_instructor':
                return '選択指導員の担当利用者';
            default:
                return 'その他';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">一時パスワード管理</h1>
            
            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* 別担当者選択 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">別担当者選択（オプション）</h2>
                <select
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">選択してください</option>
                    {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                    選択すると、その指導員のパスワード未発行担当利用者もリストに追加されます
                </p>
            </div>

            {/* 利用者選択 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">利用者選択</h2>
                    <button
                        onClick={toggleAllUsers}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        {selectedUsers.length === users.length ? '全解除' : '全選択'}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">読み込み中...</div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUserSelection(user.id)}
                                    className="mr-3"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {user.company_name} / {user.satellite_name}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        {getUserTypeLabel(user.user_type)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 有効期限設定 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">有効期限設定（オプション）</h2>
                <div className="flex items-center space-x-4">
                                            <input
                            type="text"
                            value={expiryTime}
                            onChange={(e) => setExpiryTime(e.target.value)}
                            placeholder="HH:DD（例：23:59）"
                            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-600">まで有効</span>
                </div>
                                    <p className="text-sm text-gray-600 mt-2">
                        指定なしの場合は日本時間23:59まで有効です（HH:DD形式で入力してください）
                    </p>
            </div>

            {/* アナウンスメッセージ */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">アナウンスメッセージ（オプション）</h2>
                <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="アナウンスタイトル"
                    className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="アナウンスメッセージ"
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-2">
                    選択された利用者のダッシュボードで閲覧できるアナウンスメッセージを一括送信します
                </p>
            </div>

            {/* 発行ボタン */}
            <div className="text-center">
                <button
                    onClick={issueTempPasswords}
                    disabled={loading || selectedUsers.length === 0}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? '発行中...' : `${selectedUsers.length}名に一時パスワードを発行`}
                </button>
            </div>
        </div>
    );
};

export default TempPasswordManagement;
