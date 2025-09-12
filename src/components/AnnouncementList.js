import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';
import { useAuth } from './contexts/AuthContext';
import { formatDatabaseTime } from '../utils/dateUtils';

const AnnouncementList = () => {
    const { currentUser: user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // アナウンス一覧を取得
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/api/announcements/admin');
            if (response.success && response.data) {
                // データが配列でない場合は空配列を設定
                const announcementsData = Array.isArray(response.data.announcements) ? response.data.announcements : [];
                setAnnouncements(announcementsData);
            } else {
                setAnnouncements([]);
            }
        } catch (error) {
            console.error('アナウンス一覧取得エラー:', error);
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    // アナウンス詳細を取得
    const fetchAnnouncementDetail = async (announcementId) => {
        try {
            const response = await apiGet(`/api/announcements/admin/${announcementId}`);
            if (response.success) {
                setSelectedAnnouncement(response.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('アナウンス詳細取得エラー:', error);
        }
    };

    // 日時フォーマット（DBに保存されている時間をそのまま表示）
    const formatDateTime = (dateString) => {
        return formatDatabaseTime(dateString, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">送信済みアナウンス</h4>
                <button
                    onClick={fetchAnnouncements}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                    更新
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 text-sm py-4">読み込み中...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                    送信済みのアナウンスはありません
                </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {announcements.filter(announcement => announcement && announcement.id).map(announcement => (
                        <div
                            key={announcement.id}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold text-gray-800 text-sm">
                                    {announcement.title}
                                </h5>
                                <span className="text-xs text-gray-500">
                                    {formatDateTime(announcement.created_at)}
                                </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                                {announcement.message}
                            </p>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-4 text-xs text-gray-600">
                                    <span>受信者: {announcement.recipient_count}名</span>
                                    <span>既読: {announcement.read_count}名</span>
                                </div>
                                <button
                                    onClick={() => fetchAnnouncementDetail(announcement.id)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                >
                                    詳細を見る
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* アナウンス詳細モーダル */}
            {showDetailModal && selectedAnnouncement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">アナウンス詳細</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">
                                {selectedAnnouncement.announcement.title}
                            </h4>
                            <p className="text-gray-800 mb-2">
                                {selectedAnnouncement.announcement.message}
                            </p>
                            <p className="text-sm text-gray-600">
                                送信日時: {formatDateTime(selectedAnnouncement.announcement.created_at)}
                            </p>
                            <p className="text-sm text-gray-600">
                                作成者: {selectedAnnouncement.announcement.created_by_name}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                受信者一覧 ({selectedAnnouncement.recipients.length}名)
                            </h4>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                {selectedAnnouncement.recipients.filter(recipient => recipient && recipient.id).map(recipient => (
                                    <div
                                        key={recipient.id}
                                        className="p-3 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm text-gray-800">
                                                    {recipient.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {recipient.company_name && `${recipient.company_name} | `}
                                                    {recipient.satellite_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        recipient.is_read
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-orange-100 text-orange-600'
                                                    }`}
                                                >
                                                    {recipient.is_read ? '既読' : '未読'}
                                                </span>
                                                {recipient.read_at && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDateTime(recipient.read_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;