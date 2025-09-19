import React, { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../utils/api';
import { useAuth } from './contexts/AuthContext';

const TempPasswordManagement = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [hierarchyData, setHierarchyData] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedSatellites, setSelectedSatellites] = useState([]);
    const [selectedInstructors, setSelectedInstructors] = useState([]);
    const [expiryTime, setExpiryTime] = useState('');
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('initial'); // 'initial', 'all', 'no_instructor', 'selected_instructor', 'other_instructor'

    // 階層データを取得
    const fetchHierarchyData = async () => {
        if (!isAuthenticated || !currentUser) {
            setMessage('ログインが必要です。');
            return;
        }
        
        try {
            const response = await apiGet('/api/temp-passwords/hierarchy');
            if (response.success) {
                console.log('階層データ:', response.data);
                setHierarchyData(response.data);
            }
        } catch (error) {
            console.error('階層データ取得エラー:', error);
            setMessage('階層データの取得に失敗しました');
        }
    };

    // 利用者一覧を取得
    const fetchUsers = useCallback(async () => {
        if (!isAuthenticated || !currentUser) {
            setMessage('ログインが必要です。');
            return;
        }
        
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (selectedCompanies.length > 0) {
                selectedCompanies.forEach(companyId => {
                    params.append('selected_companies', companyId);
                });
            }
            
            if (selectedSatellites.length > 0) {
                selectedSatellites.forEach(satelliteId => {
                    params.append('selected_satellites', satelliteId);
                });
            }
            
            if (selectedInstructors.length > 0) {
                selectedInstructors.forEach(instructorId => {
                    if (instructorId !== 'none') {
                        params.append('selected_instructors', instructorId);
                    } else {
                        params.append('selected_instructors', 'none');
                    }
                });
            }
            
            console.log('API呼び出しパラメータ:', params.toString());
            const response = await apiGet(`/api/temp-passwords/users-by-hierarchy?${params}`);
            if (response.success) {
                console.log('利用者データ:', response.data);
                console.log('利用者データの詳細:');
                response.data.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.name} - ${user.company_name}/${user.satellite_name} (instructor_id: ${user.instructor_id}, satellite_ids: ${JSON.stringify(user.satellite_ids)})`);
                });
                setUsers(response.data);
                // 初期状態では担当なしと選択担当者の利用者のみを選択
                const filteredUsers = filterUsersByType(response.data, userTypeFilter);
                const allSelected = filteredUsers.map(user => user.id);
                setSelectedUsers(allSelected);
            }
        } catch (error) {
            console.error('利用者一覧取得エラー:', error);
            setMessage('利用者一覧の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentUser, selectedCompanies, selectedSatellites, selectedInstructors]);

    useEffect(() => {
        fetchHierarchyData();
    }, []);

    useEffect(() => {
        if (hierarchyData.length > 0) {
            // 初期状態で（担当なし＋自担当）且つ有効な一時パスワードを持っていない利用者を表示
            fetchUsers();
        }
    }, [fetchUsers, hierarchyData.length]);

    // 企業選択の切り替え
    const toggleCompanySelection = (companyId) => {
        setSelectedCompanies(prev => {
            const newSelected = prev.includes(companyId) 
                ? prev.filter(id => id !== companyId)
                : [...prev, companyId];
            
            // 企業が選択解除された場合、関連する拠点と担当者も選択解除
            if (prev.includes(companyId)) {
                const company = hierarchyData.find(c => c.id === companyId);
                if (company) {
                    const companySatelliteIds = company.satellites.map(s => s.id);
                    const companyInstructorIds = company.satellites.flatMap(s => s.instructors.map(i => i.id));
                    
                    setSelectedSatellites(prevSatellites => prevSatellites.filter(id => !companySatelliteIds.includes(id)));
                    setSelectedInstructors(prevInstructors => prevInstructors.filter(id => !companyInstructorIds.includes(id)));
                }
            }
            
            return newSelected;
        });
        
        // 企業選択が変更されたら利用者一覧を再取得
        setTimeout(() => {
            if (hierarchyData.length > 0) {
                fetchUsers();
            }
        }, 100);
    };

    // 拠点選択の切り替え
    const toggleSatelliteSelection = (satelliteId) => {
        setSelectedSatellites(prev => {
            const newSelected = prev.includes(satelliteId) 
                ? prev.filter(id => id !== satelliteId)
                : [...prev, satelliteId];
            
            // 拠点が選択解除された場合、関連する担当者も選択解除
            if (prev.includes(satelliteId)) {
                const satellite = hierarchyData.flatMap(c => c.satellites).find(s => s.id === satelliteId);
                if (satellite) {
                    const satelliteInstructorIds = satellite.instructors.map(i => i.id);
                    setSelectedInstructors(prevInstructors => prevInstructors.filter(id => !satelliteInstructorIds.includes(id)));
                }
            }
            
            return newSelected;
        });
        
        // 拠点選択が変更されたら利用者一覧を再取得
        setTimeout(() => {
            if (hierarchyData.length > 0) {
                fetchUsers();
            }
        }, 100);
    };

    // 担当者選択の切り替え
    const toggleInstructorSelection = (instructorId) => {
        setSelectedInstructors(prev => 
            prev.includes(instructorId) 
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId]
        );
        
        // 担当者選択が変更されたら利用者一覧を再取得
        setTimeout(() => {
            if (hierarchyData.length > 0) {
                fetchUsers();
            }
        }, 100);
    };

    // 利用者タイプによるフィルタリング関数
    const filterUsersByType = (users, filterType) => {
        switch (filterType) {
            case 'initial':
                // 初期状態：担当なしと選択担当者の利用者のみ
                return users.filter(user => 
                    user.user_type === 'no_instructor' || 
                    user.user_type === 'selected_instructor'
                );
            case 'all':
                return users;
            case 'no_instructor':
                return users.filter(user => user.user_type === 'no_instructor');
            case 'selected_instructor':
                return users.filter(user => user.user_type === 'selected_instructor');
            case 'other_instructor':
                return users.filter(user => user.user_type === 'other_instructor');
            default:
                return users;
        }
    };

    // フィルタリングされた利用者一覧を取得
    const getFilteredUsers = () => {
        return filterUsersByType(users, userTypeFilter);
    };

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
        const filteredUsers = getFilteredUsers();
        const filteredUserIds = filteredUsers.map(user => user.id);
        const selectedFilteredUsers = selectedUsers.filter(id => filteredUserIds.includes(id));
        
        if (selectedFilteredUsers.length === filteredUserIds.length) {
            // フィルタリングされた利用者が全て選択されている場合は、それらを解除
            setSelectedUsers(selectedUsers.filter(id => !filteredUserIds.includes(id)));
        } else {
            // フィルタリングされた利用者を全て選択
            const newSelectedUsers = [...new Set([...selectedUsers, ...filteredUserIds])];
            setSelectedUsers(newSelectedUsers);
        }
    };

    // 一時パスワード発行
    const issueTempPasswords = async () => {
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
                // 成功後、利用者一覧を再取得して状態を更新
                await fetchUsers();
                // 選択状態をリセット
                setSelectedUsers([]);
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
            case 'no_instructor':
                return '担当なし';
            case 'selected_instructor':
                return '選択担当者の利用者';
            case 'other_instructor':
                return 'その他の担当者の利用者';
            case 'my_user':
                return '自分の担当利用者';
            case 'no_instructor_no_temp':
                return '担当なし・パスワード未発行';
            default:
                return 'その他';
        }
    };

    // 表示用の拠点リストを取得（企業選択に基づく）
    const getVisibleSatellites = () => {
        if (selectedCompanies.length === 0) {
            return []; // 企業が選択されていない場合は拠点を表示しない
        }
        return hierarchyData
            .filter(company => selectedCompanies.includes(company.id))
            .flatMap(company => company.satellites);
    };

    // 表示用の担当者リストを取得（拠点選択に基づく）
    const getVisibleInstructors = () => {
        const visibleSatellites = getVisibleSatellites();
        // 拠点が選択されていない場合でも、選択された企業の担当者を表示
        if (selectedSatellites.length === 0) {
            return hierarchyData
                .filter(company => selectedCompanies.includes(company.id))
                .flatMap(company => company.satellites)
                .flatMap(satellite => satellite.instructors)
                .filter((instructor, index, self) => self.findIndex(i => i.id === instructor.id) === index); // 重複を除去
        }
        return visibleSatellites
            .filter(satellite => selectedSatellites.includes(satellite.id))
            .flatMap(satellite => satellite.instructors)
            .filter((instructor, index, self) => self.findIndex(i => i.id === instructor.id) === index); // 重複を除去
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">一時パスワード管理</h1>
            
            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* 階層選択 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">担当者選択</h2>
                
                {/* 企業選択 */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-3 text-gray-700">企業選択</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {hierarchyData.map(company => (
                            <label key={company.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCompanies.includes(company.id)}
                                    onChange={() => toggleCompanySelection(company.id)}
                                    className="mr-3"
                                />
                                <span className="font-medium">{company.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 拠点選択 */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-3 text-gray-700">拠点選択</h3>
                    {selectedCompanies.length === 0 ? (
                        <p className="text-gray-500 italic">企業を選択してください</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {getVisibleSatellites().map(satellite => (
                                <label key={satellite.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSatellites.includes(satellite.id)}
                                        onChange={() => toggleSatelliteSelection(satellite.id)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <span className="font-medium">{satellite.name}</span>
                                        <div className="text-sm text-gray-500">
                                            {hierarchyData.find(c => c.id === satellite.company_id)?.name}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* 担当者選択 */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-3 text-gray-700">担当者選択（複数選択可能）</h3>
                    {selectedCompanies.length === 0 ? (
                        <p className="text-gray-500 italic">企業を選択してください</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* 「なし」オプション */}
                            <label className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedInstructors.includes('none')}
                                    onChange={() => toggleInstructorSelection('none')}
                                    className="mr-3"
                                />
                                <span className="font-medium text-gray-600">担当なし</span>
                            </label>
                            
                            {/* 担当者オプション */}
                            {getVisibleInstructors().map(instructor => (
                                <label key={instructor.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedInstructors.includes(instructor.id)}
                                        onChange={() => toggleInstructorSelection(instructor.id)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <span className="font-medium">{instructor.name}</span>
                                        <div className="text-sm text-gray-500">
                                            {hierarchyData.find(c => c.id === instructor.company_id)?.name} / 
                                            {hierarchyData.find(c => c.id === instructor.company_id)?.satellites.find(s => s.id === instructor.satellite_id)?.name}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 利用者選択 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">利用者選択</h2>
                    <div className="flex items-center space-x-4">
                        {/* 利用者タイプフィルター */}
                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="initial">初期表示（担当なし＋選択担当者）</option>
                            <option value="all">全ての利用者</option>
                            <option value="no_instructor">担当なしのみ</option>
                            <option value="selected_instructor">選択担当者の利用者のみ</option>
                            <option value="other_instructor">その他の担当者の利用者のみ</option>
                        </select>
                        <button
                            onClick={toggleAllUsers}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            {(() => {
                                const filteredUsers = getFilteredUsers();
                                const filteredUserIds = filteredUsers.map(user => user.id);
                                const selectedFilteredUsers = selectedUsers.filter(id => filteredUserIds.includes(id));
                                return selectedFilteredUsers.length === filteredUserIds.length ? '全解除' : '全選択';
                            })()}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4">読み込み中...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {selectedCompanies.length === 0 ? (
                            <div>
                                <p>担当なしまたは自担当で一時パスワード未発行の利用者がいません</p>
                                <p className="text-sm mt-2">企業・拠点・担当者を選択して詳細な条件で検索してください</p>
                            </div>
                        ) : (
                            <div>
                                <p>選択条件に該当する利用者がいません</p>
                                <p className="text-sm mt-2">担当者を選択するか、条件を変更してください</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {getFilteredUsers().map(user => (
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
                        {getFilteredUsers().length === 0 && users.length > 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>選択したフィルター条件に該当する利用者がいません</p>
                                <p className="text-sm mt-2">フィルター条件を変更してください</p>
                            </div>
                        )}
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
                {selectedUsers.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                        選択中の利用者: {selectedUsers.length}名
                        {getFilteredUsers().length > 0 && (
                            <span className="ml-2">
                                （表示中: {getFilteredUsers().filter(user => selectedUsers.includes(user.id)).length}名）
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TempPasswordManagement;
