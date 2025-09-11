import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const MessageSender = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 担当する利用者一覧を取得
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/messages/students');
            if (response.success) {
                setStudents(response.data);
            }
        } catch (error) {
            console.error('利用者一覧取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    // メッセージ送信
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedStudent || !message.trim()) {
            alert('利用者とメッセージを入力してください。');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiPost('/messages/send', {
                receiver_id: selectedStudent.id,
                message: message.trim()
            });

            if (response.success) {
                alert('メッセージを送信しました。');
                setMessage('');
                setSelectedStudent(null);
            } else {
                alert('メッセージの送信に失敗しました。');
            }
        } catch (error) {
            console.error('メッセージ送信エラー:', error);
            alert('メッセージの送信に失敗しました。');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 利用者選択 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        送信先利用者 *
                    </label>
                    <select
                        value={selectedStudent?.id || ''}
                        onChange={(e) => {
                            const studentId = parseInt(e.target.value);
                            const student = students.find(s => s.id === studentId);
                            setSelectedStudent(student || null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">利用者を選択してください</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.name} 
                                {student.satellite_name && ` (${student.satellite_name})`}
                                {student.company_name && ` - ${student.company_name}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 選択された利用者の情報表示 */}
                {selectedStudent && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2 text-sm">送信先情報</h4>
                        <div className="text-sm text-blue-700">
                            <p><strong>名前:</strong> {selectedStudent.name}</p>
                            {selectedStudent.email && (
                                <p><strong>メール:</strong> {selectedStudent.email}</p>
                            )}
                            <p><strong>ログインコード:</strong> {selectedStudent.login_code}</p>
                            {selectedStudent.satellite_name && (
                                <p><strong>拠点:</strong> {selectedStudent.satellite_name}</p>
                            )}
                            {selectedStudent.company_name && (
                                <p><strong>企業:</strong> {selectedStudent.company_name}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* メッセージ入力 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        メッセージ *
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="メッセージを入力してください"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        ※ メッセージは翌日の24:30に自動削除されます
                    </p>
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => {
                            setMessage('');
                            setSelectedStudent(null);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        リセット
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !selectedStudent || !message.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                        {submitting ? '送信中...' : 'メッセージ送信'}
                    </button>
                </div>
            </form>

            {/* 利用者一覧（参考用） */}
            {loading ? (
                <div className="p-3 text-center text-gray-500 text-sm">読み込み中...</div>
            ) : students.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-sm">
                    担当する利用者がいません
                </div>
            ) : (
                <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">担当利用者一覧</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {students.map(student => (
                            <div
                                key={student.id}
                                className={`p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                                    selectedStudent?.id === student.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedStudent(student)}
                            >
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-gray-500">
                                    {student.satellite_name && `${student.satellite_name} | `}
                                    {student.company_name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageSender;
