import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const AnnouncementList = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // アナウンス一覧を取得
    const fetchAnnouncements = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiGet(`/announcements/user?page=${page}&limit=10`);
            if (response.success) {
                setAnnouncements(response.data.announcements);
                setTotalPages(response.data.pagination.total_pages);
                setUnreadCount(response.data.pagination.unread_count);
            }
        } catch (error) {
            console.error('アナウンス一覧取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // アナウンスを既読にする
    const markAsRead = async (announcementId) => {
        try {
            await apiPut(`/announcements/user/${announcementId}/read`);
            // アナウンス一覧を更新
            fetchAnnouncements(currentPage);
        } catch (error) {
            console.error('既読処理エラー:', error);
        }
    };

    // 全アナウンスを既読にする
    const markAllAsRead = async () => {
        try {
            await apiPut('/announcements/user/read-all');
            // アナウンス一覧を更新
            fetchAnnouncements(currentPage);
        } catch (error) {
            console.error('全既読処理エラー:', error);
        }
    };

    // アナウンス詳細を表示
    const showAnnouncementDetail = (announcement) => {
        setSelectedAnnouncement(announcement);
        // 未読の場合は既読にする
        if (!announcement.is_read) {
            markAsRead(announcement.id);
        }
    };

    // 日時フォーマット
    const formatDateTime = (dateString) => {
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">お知らせ</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        全て既読にする
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-8">読み込み中...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    お知らせはありません
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(announcement => (
                        <div
                            key={announcement.id}
                            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
                                !announcement.is_read ? 'border-l-4 border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => showAnnouncementDetail(announcement)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {announcement.message.length > 100 
                                            ? `${announcement.message.substring(0, 100)}...` 
                                            : announcement.message
                                        }
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                                        <span>送信者: {announcement.created_by_name}</span>
                                        <span>{formatDateTime(announcement.created_at)}</span>
                                        {!announcement.is_read && (
                                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                                                未読
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => {
                            setCurrentPage(prev => Math.max(1, prev - 1));
                            fetchAnnouncements(Math.max(1, currentPage - 1));
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                        前へ
                    </button>
                    <span className="px-3 py-2">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => {
                            setCurrentPage(prev => Math.min(totalPages, prev + 1));
                            fetchAnnouncements(Math.min(totalPages, currentPage + 1));
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                        次へ
                    </button>
                </div>
            )}

            {/* アナウンス詳細モーダル */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold">{selectedAnnouncement.title}</h2>
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{selectedAnnouncement.message}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                                <p>送信者: {selectedAnnouncement.created_by_name}</p>
                                <p>送信日時: {formatDateTime(selectedAnnouncement.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;
