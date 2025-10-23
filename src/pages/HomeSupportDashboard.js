import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';
import HomeSupportManagement from '../components/HomeSupportManagement';
import HomeSupportUserAdditionModal from '../components/HomeSupportUserAdditionModal';
import DailySupportRecordModal from '../components/DailySupportRecordModal';
import { getCurrentUser } from '../utils/userContext';

const HomeSupportDashboard = () => {
  console.log('=== HomeSupportDashboard Component Mounted ===');
  
  const [activeTab, setActiveTab] = useState(() => {
    // sessionStorageからタブの状態を復元
    const savedTab = sessionStorage.getItem('homeSupportDashboardActiveTab');
    return savedTab && ['overview', 'users', 'evidence', 'evaluations', 'attendance'].includes(savedTab) 
      ? savedTab 
      : 'overview';
  });

  const [showHomeSupportModal, setShowHomeSupportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showSupportPlanModal, setShowSupportPlanModal] = useState(false);
  const [showDailySupportRecordModal, setShowDailySupportRecordModal] = useState(false);
  const [showUserInputModal, setShowUserInputModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const navigate = useNavigate();
  const { currentUser: authUser, logout } = useInstructorGuard();

  useEffect(() => {
    if (!authUser) return;

    // 初期の拠点情報を設定
    const initialLocation = {
      id: 'office001',
      name: '東京教育渋谷校',
      type: '就労移行支援事業所',
      organization: 'スタディスフィア株式会社'
    };
    
    // ローカルユーザー状態を設定
    if (!localUser || localUser.id !== authUser.id) {
      setLocalUser({
        ...authUser,
        location: authUser.location || initialLocation
      });
    }

    // 現在のユーザー情報を設定
    setCurrentUser(authUser);
  }, [authUser?.id]);

  const handleLocationChange = (newLocation) => {
    console.log('拠点情報が変更されました:', newLocation);
    
    // 拠点情報をsessionStorageに保存
    sessionStorage.setItem('selectedSatellite', JSON.stringify(newLocation));
    
    // ユーザー情報を更新
    const updatedUser = {
      ...localUser,
      satellite_id: newLocation.id,
      satellite_name: newLocation.name,
      company_id: newLocation.company_id,
      company_name: newLocation.company_name
    };
    
    setLocalUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // 拠点切り替えイベントを発火
    window.dispatchEvent(new CustomEvent('satelliteChanged', {
      detail: { newLocation }
    }));
  };

  const handleHomeSupportSuccess = (result) => {
    console.log('在宅支援利用者が追加されました:', result);
    // 在宅利用者リストを更新するためのイベントを発火
    window.dispatchEvent(new CustomEvent('homeSupportUserAdded'));
  };

  const handleUserDetailClick = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleSupportPlanClick = (user) => {
    setSelectedUser(user);
    setShowSupportPlanModal(true);
  };


  // 日次支援記録モーダルを開く
  const handleDailySupportRecordClick = (user) => {
    setSelectedUser(user);
    setShowDailySupportRecordModal(true);
  };

  // 利用者入力確認モーダルを開く
  const handleUserInputClick = (user) => {
    setSelectedUser(user);
    setShowUserInputModal(true);
  };

  // 日次支援記録を保存
  const handleSaveDailySupportRecord = (data) => {
    console.log('日次支援記録を保存:', data);
    // TODO: APIに保存処理を実装
    alert('日次支援記録を保存しました。');
    setShowDailySupportRecordModal(false);
    setSelectedUser(null);
  };

  // AI提案機能（日次支援記録用）
  const handleDailyRecordAIAssist = (field, context) => {
    const { student, record, date } = context;
    
    // フィールドごとのAI提案ロジック
    let suggestion = '';
    
    switch (field) {
      case 'workContent':
        suggestion = `・ITリテラシー・AIの基本の学習を実施\n・HTML/CSS基礎学習とレスポンシブデザイン実習を行い、基本概念を理解\n・Webページ作成の基礎を習得`;
        break;
      case 'supportContent':
        suggestion = `・9:00　利用者から作業開始の連絡。本日の学習内容と目標を確認（${student?.name || '対象者'}さん）\n・12:00　午前中の学習進捗を電話で確認。HTML基礎の理解が進んでいることを確認\n・15:00　午後の学習内容について助言。CSS実習の注意点を説明\n・16:00　本日の学習成果を確認。次回の目標設定と、生活リズムを保つよう助言`;
        break;
      case 'healthStatus':
        suggestion = `・9:00　体温36.2℃、睡眠時間7時間と確認。体調は良好な様子\n・16:00　長時間の学習でやや疲労感があるとのこと。適度な休憩を取りながら、メリハリをつけて学習することを助言\n・生活リズムを保つために、就寝・起床時間を守ることを助言`;
        break;
      default:
        suggestion = 'AI提案を生成中...';
    }
    
    return suggestion;
  };

  // 評価データ（モック）
  const evaluationUsers = [
    {
      id: 'tanaka',
      name: '田中 太郎',
      recipientNumber: '1234567890',
      dailyStatus: '未完了',
      weeklyStatus: '完了',
      monthlyStatus: '完了',
      dailyPriority: 1, // 未完了は優先度高
      weeklyPriority: 0,
      monthlyPriority: 0
    },
    {
      id: 'sato',
      name: '佐藤 花子',
      recipientNumber: '2345678901',
      dailyStatus: '完了',
      weeklyStatus: '未完了',
      monthlyStatus: '未完了',
      dailyPriority: 0,
      weeklyPriority: 1,
      monthlyPriority: 1
    },
    {
      id: 'suzuki',
      name: '鈴木 一郎',
      recipientNumber: '3456789012',
      dailyStatus: '完了',
      weeklyStatus: '完了',
      monthlyStatus: '未完了',
      dailyPriority: 0,
      weeklyPriority: 0,
      monthlyPriority: 1
    },
    {
      id: 'takahashi',
      name: '高橋 美咲',
      recipientNumber: '4567890123',
      dailyStatus: '完了',
      weeklyStatus: '完了',
      monthlyStatus: '完了',
      dailyPriority: 0,
      weeklyPriority: 0,
      monthlyPriority: 0
    },
    {
      id: 'ito',
      name: '伊藤 健太',
      recipientNumber: '5678901234',
      dailyStatus: '未完了',
      weeklyStatus: '-',
      monthlyStatus: '-',
      dailyPriority: 1,
      weeklyPriority: -1,
      monthlyPriority: -1
    }
  ];

  // ソート機能
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // フィルタリングとソート
  const getFilteredAndSortedUsers = () => {
    let filteredUsers = [...evaluationUsers];

    // 検索フィルタリング
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.recipientNumber.includes(searchTerm)
      );
    }

    // ソート
    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'name') {
          aValue = a.name;
          bValue = b.name;
        } else if (sortConfig.key === 'recipientNumber') {
          aValue = a.recipientNumber;
          bValue = b.recipientNumber;
        } else if (sortConfig.key === 'daily') {
          aValue = a.dailyPriority;
          bValue = b.dailyPriority;
        } else if (sortConfig.key === 'weekly') {
          aValue = a.weeklyPriority;
          bValue = b.weeklyPriority;
        } else if (sortConfig.key === 'monthly') {
          aValue = a.monthlyPriority;
          bValue = b.monthlyPriority;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  };

  // ソートアイコンの表示
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '⇅';
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  // 在宅利用者追加モーダルを開く関数をグローバルに公開
  useEffect(() => {
    window.openHomeSupportModal = () => {
      setShowHomeSupportModal(true);
    };
    
    return () => {
      delete window.openHomeSupportModal;
    };
  }, []);

  if (!authUser || !localUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <InstructorHeader 
        user={localUser} 
        onLocationChange={handleLocationChange}
        showBackButton={true}
        backButtonText="指導員ダッシュボードに戻る"
        onBackClick={() => navigate('/instructor/dashboard')}
      />
      
      <div className="flex flex-col flex-1 h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-full bg-white text-gray-800 flex-shrink-0 overflow-y-auto border-b border-gray-200">
          <nav className="p-4 flex flex-row gap-2 overflow-x-auto">
                <button
                  className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'overview' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
                  onClick={() => {
                    setActiveTab('overview');
                    sessionStorage.setItem('homeSupportDashboardActiveTab', 'overview');
                  }}
                >
                  🏠 在宅支援メイン
                </button>
            <button 
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'users' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => {
                setActiveTab('users');
                sessionStorage.setItem('homeSupportDashboardActiveTab', 'users');
              }}
            >
              👥 利用者管理
            </button>
            <button
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'evidence' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => {
                setActiveTab('evidence');
                sessionStorage.setItem('homeSupportDashboardActiveTab', 'evidence');
              }}
            >
              📷 記録・証拠
            </button>
                <button
                  className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'evaluations' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
                  onClick={() => {
                    setActiveTab('evaluations');
                    sessionStorage.setItem('homeSupportDashboardActiveTab', 'evaluations');
                  }}
                >
                  📋 評価記録
                </button>
                <button
                  className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'attendance' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
                  onClick={() => {
                    setActiveTab('attendance');
                    sessionStorage.setItem('homeSupportDashboardActiveTab', 'attendance');
                  }}
                >
                  ⏰ 勤怠管理
                </button>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 今日の状況サマリー */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 今日の在宅支援状況</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">アクティブ利用者</p>
                        <p className="text-2xl font-bold text-blue-800">5名</p>
                      </div>
                      <span className="text-blue-600 text-2xl">👥</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">作業中</p>
                        <p className="text-2xl font-bold text-green-800">3名</p>
                      </div>
                      <span className="text-green-600 text-2xl">✅</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">休憩中</p>
                        <p className="text-2xl font-bold text-yellow-800">1名</p>
                      </div>
                      <span className="text-yellow-600 text-2xl">⏸️</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">未開始</p>
                        <p className="text-2xl font-bold text-red-800">1名</p>
                      </div>
                      <span className="text-red-600 text-2xl">❌</span>
                    </div>
                  </div>
                </div>

                    {/* 今日の利用者状況 */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 今日の利用者状況</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                名前
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                開始時間
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                状態
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                最新記録
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                備考
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                確認
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* 田中さん */}
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  田中 太郎
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-green-800">
                                  10:00
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  作業中
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">🖥️</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <p>10:30 デスクトップ</p>
                                    <p>14:15 デスクトップ</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  今日の目標を達成しました
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleUserInputClick({
                                    id: 'tanaka',
                                    name: '田中 太郎',
                                    recipientNumber: '1234567890',
                                    status: '作業中',
                                    startTime: '10:00'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                >
                                  📋 本人記録
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: 'tanaka',
                                      name: '田中 太郎',
                                      recipientNumber: '1234567890',
                                      status: '作業中',
                                      startTime: '10:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  <button 
                                    onClick={() => handleUserDetailClick({
                                      id: 'tanaka',
                                      name: '田中 太郎',
                                      certificate: '1234567890',
                                      status: '作業中',
                                      startTime: '10:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    詳細
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* 佐藤さん */}
                            <tr className="hover:bg-gray-50 bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  佐藤 花子
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-yellow-800">
                                  09:00
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  休憩中
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">📷</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <p>09:15 カメラ</p>
                                    <p>11:00 デスクトップ</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  軽い頭痛のため早退
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleUserInputClick({
                                    id: 'sato',
                                    name: '佐藤 花子',
                                    recipientNumber: '2345678901',
                                    status: '休憩中',
                                    startTime: '09:00'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                >
                                  📋 本人記録
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: 'sato',
                                      name: '佐藤 花子',
                                      recipientNumber: '2345678901',
                                      status: '休憩中',
                                      startTime: '09:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  <button 
                                    onClick={() => handleUserDetailClick({
                                      id: 'sato',
                                      name: '佐藤 花子',
                                      certificate: '2345678901',
                                      status: '休憩中',
                                      startTime: '09:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    詳細
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* 鈴木さん */}
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  鈴木 一郎
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-500">
                                  -
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  未開始
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-400">-</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <p>記録なし</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  まだ作業開始の連絡なし
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleUserInputClick({
                                    id: 'suzuki',
                                    name: '鈴木 一郎',
                                    recipientNumber: '3456789012',
                                    status: '未開始',
                                    startTime: '-'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-gray-400 hover:bg-gray-500 transition-colors duration-200"
                                  disabled
                                >
                                  📋 本人記録
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: 'suzuki',
                                      name: '鈴木 一郎',
                                      recipientNumber: '3456789012',
                                      status: '未開始',
                                      startTime: '-'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  <button 
                                    onClick={() => handleUserDetailClick({
                                      id: 'suzuki',
                                      name: '鈴木 一郎',
                                      certificate: '3456789012',
                                      status: '未開始',
                                      startTime: '-'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    詳細
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* 高橋さん */}
                            <tr className="hover:bg-gray-50 bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  高橋 美咲
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-800">
                                  09:00
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  作業中
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">🖥️</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <p>09:00 デスクトップ</p>
                                    <p>14:20 デスクトップ</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  -
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleUserInputClick({
                                    id: 'takahashi',
                                    name: '高橋 美咲',
                                    recipientNumber: '4567890123',
                                    status: '作業中',
                                    startTime: '09:00'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                >
                                  📋 本人記録
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: 'takahashi',
                                      name: '高橋 美咲',
                                      recipientNumber: '4567890123',
                                      status: '作業中',
                                      startTime: '09:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  <button 
                                    onClick={() => handleUserDetailClick({
                                      id: 'takahashi',
                                      name: '高橋 美咲',
                                      certificate: '4567890123',
                                      status: '作業中',
                                      startTime: '09:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    詳細
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* 伊藤さん */}
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  伊藤 健太
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-purple-800">
                                  11:00
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  作業中
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">📷</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <p>11:30 カメラ</p>
                                    <p>15:00 カメラ</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  -
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleUserInputClick({
                                    id: 'ito',
                                    name: '伊藤 健太',
                                    recipientNumber: '5678901234',
                                    status: '作業中',
                                    startTime: '11:00'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                >
                                  📋 本人記録
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: 'ito',
                                      name: '伊藤 健太',
                                      recipientNumber: '5678901234',
                                      status: '作業中',
                                      startTime: '11:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  <button 
                                    onClick={() => handleUserDetailClick({
                                      id: 'ito',
                                      name: '伊藤 健太',
                                      certificate: '5678901234',
                                      status: '作業中',
                                      startTime: '11:00'
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    詳細
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
              </div>

            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">📷 記録・証拠</h2>
                  <p className="text-lg text-gray-600">デスクトップ画面とカメラで学習状況を記録・管理</p>
                </div>

                {/* 検索・フィルター機能 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">利用者</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">すべて</option>
                        <option value="tanaka">田中 太郎</option>
                        <option value="sato">佐藤 花子</option>
                        <option value="suzuki">鈴木 一郎</option>
                        <option value="takahashi">高橋 美咲</option>
                        <option value="ito">伊藤 健太</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="終了日（空欄可）"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        検索
                      </button>
                    </div>
                  </div>
                </div>

                {/* 記録一覧 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">記録一覧</h3>
                  
                  {/* 記録リストテーブル */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            日時
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            利用者
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            サムネイル
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状況
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* 田中さんの記録 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">2025/01/15</div>
                            <div className="text-sm text-gray-500">10:30</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">田中 太郎</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                              <span className="text-xs text-gray-500">🖥️</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">作業中の画面</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUserInputClick({
                                  id: 'tanaka',
                                  name: '田中 太郎',
                                  recipientNumber: '1234567890',
                                  status: '作業中',
                                  startTime: '10:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                              >
                                📋 本人記録
                              </button>
                              <button 
                                onClick={() => handleUserDetailClick({
                                  id: 'tanaka',
                                  name: '田中 太郎',
                                  certificate: '1234567890',
                                  status: '作業中',
                                  startTime: '10:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 佐藤さんの記録 */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">2025/01/15</div>
                            <div className="text-sm text-gray-500">09:15</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">佐藤 花子</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                              <span className="text-xs text-gray-500">📷</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">学習状況</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUserInputClick({
                                  id: 'sato',
                                  name: '佐藤 花子',
                                  recipientNumber: '2345678901',
                                  status: '休憩中',
                                  startTime: '09:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                              >
                                📋 本人記録
                              </button>
                              <button 
                                onClick={() => handleUserDetailClick({
                                  id: 'sato',
                                  name: '佐藤 花子',
                                  certificate: '2345678901',
                                  status: '休憩中',
                                  startTime: '09:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 高橋さんの記録 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">2025/01/15</div>
                            <div className="text-sm text-gray-500">14:20</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">高橋 美咲</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                              <span className="text-xs text-gray-500">🖥️</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">作業完了画面</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUserInputClick({
                                  id: 'takahashi',
                                  name: '高橋 美咲',
                                  recipientNumber: '4567890123',
                                  status: '作業中',
                                  startTime: '09:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                              >
                                📋 本人記録
                              </button>
                              <button 
                                onClick={() => handleUserDetailClick({
                                  id: 'takahashi',
                                  name: '高橋 美咲',
                                  certificate: '4567890123',
                                  status: '作業中',
                                  startTime: '09:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 伊藤さんの記録 */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">2025/01/15</div>
                            <div className="text-sm text-gray-500">11:30</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">伊藤 健太</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                              <span className="text-xs text-gray-500">📷</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">学習状況確認</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUserInputClick({
                                  id: 'ito',
                                  name: '伊藤 健太',
                                  recipientNumber: '5678901234',
                                  status: '作業中',
                                  startTime: '11:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                              >
                                📋 本人記録
                              </button>
                              <button 
                                onClick={() => handleUserDetailClick({
                                  id: 'ito',
                                  name: '伊藤 健太',
                                  certificate: '5678901234',
                                  status: '作業中',
                                  startTime: '11:00'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 鈴木さんの記録 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">2025/01/14</div>
                            <div className="text-sm text-gray-500">15:45</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">鈴木 一郎</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80">
                              <span className="text-xs text-gray-500">🖥️</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">作業中の画面</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUserInputClick({
                                  id: 'suzuki',
                                  name: '鈴木 一郎',
                                  recipientNumber: '3456789012',
                                  status: '未開始',
                                  startTime: '-'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-gray-400 hover:bg-gray-500 transition-colors duration-200"
                                disabled
                              >
                                📋 本人記録
                              </button>
                              <button 
                                onClick={() => handleUserDetailClick({
                                  id: 'suzuki',
                                  name: '鈴木 一郎',
                                  certificate: '3456789012',
                                  status: '未開始',
                                  startTime: '-'
                                })}
                                className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">👥 在宅支援利用者管理</h2>
                    <p className="text-lg text-gray-600">在宅支援対象の利用者を管理できます</p>
                  </div>
                  <button
                    onClick={() => setShowHomeSupportModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    + 利用者追加
                  </button>
                </div>

                    {/* 利用者一覧テーブル */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              名前
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              担当指導員
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              備考
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* 田中さん */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                田中 太郎
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                在宅支援開始
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSupportPlanClick({
                                    id: 'tanaka',
                                    name: '田中 太郎',
                                    certificate: '1234567890'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                >
                                  支援計画
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 佐藤さん */}
                          <tr className="hover:bg-gray-50 bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                佐藤 花子
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                体調管理が必要
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSupportPlanClick({
                                    id: 'sato',
                                    name: '佐藤 花子',
                                    certificate: '2345678901'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                >
                                  支援計画
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 鈴木さん */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                鈴木 一郎
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                初回利用者
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSupportPlanClick({
                                    id: 'suzuki',
                                    name: '鈴木 一郎',
                                    certificate: '3456789012'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                >
                                  支援計画
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 高橋さん */}
                          <tr className="hover:bg-gray-50 bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                高橋 美咲
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                順調に作業中
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSupportPlanClick({
                                    id: 'takahashi',
                                    name: '高橋 美咲',
                                    certificate: '4567890123'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                >
                                  支援計画
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* 伊藤さん */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                伊藤 健太
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                コミュニケーション向上中
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSupportPlanClick({
                                    id: 'ito',
                                    name: '伊藤 健太',
                                    certificate: '5678901234'
                                  })}
                                  className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                >
                                  支援計画
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">⏰ 在宅勤怠管理(日時)</h2>
                    <p className="text-lg text-gray-600">在宅支援利用者の勤怠状況を管理できます</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/instructor/home-support/monthly-attendance')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      月次勤怠管理
                    </button>
                  </div>
                </div>

                {/* 日付選択 */}
                <div className="mb-6 flex items-center justify-center gap-3">
                  <button 
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() - 1);
                      setSelectedDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    ← 前日
                  </button>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700"
                    />
                    <button
                      onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      今日
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() + 1);
                      setSelectedDate(date.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    翌日 →
                  </button>
                </div>

                {/* 選択日付の表示 */}
                <div className="mb-4 text-center">
                  <p className="text-lg font-semibold text-gray-700">
                    📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </p>
                </div>

                {/* 勤怠一覧テーブル */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          受給者証
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          開始時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          終了時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          休憩開始
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          休憩終了
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          勤務時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* 田中さん */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            田中 太郎
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            1234567890
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-800">
                            10:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-800">
                            16:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            12:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            13:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-800">
                            5時間
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            作業中
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            修正
                          </button>
                        </td>
                      </tr>

                      {/* 佐藤さん */}
                      <tr className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            佐藤 花子
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            2345678901
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-yellow-800">
                            09:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-yellow-800">
                            11:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-yellow-800">
                            2時間
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            休憩中
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            修正
                          </button>
                        </td>
                      </tr>

                      {/* 鈴木さん */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            鈴木 一郎
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            3456789012
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-500">
                            0時間
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            未開始
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            修正
                          </button>
                        </td>
                      </tr>

                      {/* 高橋さん */}
                      <tr className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            高橋 美咲
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            4567890123
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-800">
                            09:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-800">
                            15:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            12:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            13:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-800">
                            5時間
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            作業中
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            修正
                          </button>
                        </td>
                      </tr>

                      {/* 伊藤さん */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            伊藤 健太
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            5678901234
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-800">
                            11:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-800">
                            17:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            13:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            14:00
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-purple-800">
                            5時間
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            作業中
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            修正
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 評価記録</h2>
                    <p className="text-lg text-gray-600">利用者別の評価状況を管理します</p>
                  </div>
                </div>

                {/* 検索バー */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="利用者名または受給者証番号で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* 利用者別評価状況 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 利用者別評価状況</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-2">
                              利用者
                              <span className="text-xs">{getSortIcon('name')}</span>
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('recipientNumber')}
                          >
                            <div className="flex items-center gap-2">
                              受給者証
                              <span className="text-xs">{getSortIcon('recipientNumber')}</span>
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('daily')}
                          >
                            <div className="flex items-center gap-2">
                              日次評価
                              <span className="text-xs">{getSortIcon('daily')}</span>
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('weekly')}
                          >
                            <div className="flex items-center gap-2">
                              週次評価
                              <span className="text-xs">{getSortIcon('weekly')}</span>
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort('monthly')}
                          >
                            <div className="flex items-center gap-2">
                              月次評価
                              <span className="text-xs">{getSortIcon('monthly')}</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            確認
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredAndSortedUsers().length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                              {searchTerm ? '検索結果がありません' : '評価対象の利用者がいません'}
                            </td>
                          </tr>
                        ) : (
                          getFilteredAndSortedUsers().map((user, index) => (
                            <tr key={user.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.recipientNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.dailyStatus === '未完了' ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    📝 未完了
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    ✅ 完了
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.weeklyStatus === '-' ? (
                                  <div className="text-sm text-gray-500">-</div>
                                ) : user.weeklyStatus === '未完了' ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    📝 未完了
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    ✅ 完了
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.monthlyStatus === '-' ? (
                                  <div className="text-sm text-gray-500">-</div>
                                ) : user.monthlyStatus === '未完了' ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    📝 未完了
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    ✅ 完了
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => handleDailySupportRecordClick({
                                      id: user.id,
                                      name: user.name,
                                      recipientNumber: user.recipientNumber
                                    })}
                                    className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                  >
                                    📝 支援記録
                                  </button>
                                  {user.weeklyStatus === '未完了' && (
                                    <button 
                                      onClick={() => navigate(`/instructor/home-support/weekly-evaluation/${user.id}`)}
                                      className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                    >
                                      📊 評価(週次)
                                    </button>
                                  )}
                                  {user.monthlyStatus === '未完了' && (
                                    <button 
                                      onClick={() => navigate(`/instructor/home-support/monthly-evaluation/${user.id}`)}
                                      className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                    >
                                      📈 達成度評価
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => navigate(`/instructor/home-support/records/${user.id}`)}
                                    className="text-white text-sm px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                  >
                                    🔍 記録確認
                                  </button>
                                  <button 
                                    onClick={() => navigate(`/instructor/home-support/monthly-evaluation-history/${user.id}`)}
                                    className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                  >
                                    📊 達成度確認
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 在宅支援利用者追加モーダル */}
      <HomeSupportUserAdditionModal
        isOpen={showHomeSupportModal}
        onClose={() => setShowHomeSupportModal(false)}
        onSuccess={handleHomeSupportSuccess}
      />


      {/* 利用者詳細モーダル */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedUser.name} 詳細</h3>
                </div>
                <button 
                  onClick={() => setShowUserDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* 今日の状況サマリー */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 text-2xl">⏰</span>
                    <div>
                      <p className="text-blue-600 text-sm font-medium">開始時間</p>
                      <p className="text-lg font-bold text-blue-800">{selectedUser.startTime}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-2xl">📊</span>
                    <div>
                      <p className="text-green-600 text-sm font-medium">記録数</p>
                      <p className="text-lg font-bold text-green-800">16件</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600 text-2xl">🖥️</span>
                    <div>
                      <p className="text-purple-600 text-sm font-medium">デスクトップ</p>
                      <p className="text-lg font-bold text-purple-800">8件</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-600 text-2xl">📷</span>
                    <div>
                      <p className="text-orange-600 text-sm font-medium">カメラ</p>
                      <p className="text-lg font-bold text-orange-800">8件</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 30分間隔の記録一覧 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📸 今日の記録（30分間隔）</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* 09:00 - 作業開始 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">09:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業開始画面</p>
                  </div>

                  {/* 09:00 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">09:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">学習開始状況</p>
                  </div>

                  {/* 09:30 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">09:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業進行中</p>
                  </div>

                  {/* 09:30 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">09:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">集中して作業中</p>
                  </div>

                  {/* 10:00 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">10:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業継続中</p>
                  </div>

                  {/* 10:00 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">10:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">順調に作業中</p>
                  </div>

                  {/* 10:30 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">10:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業中</p>
                  </div>

                  {/* 10:30 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">10:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">作業状況確認</p>
                  </div>

                  {/* 11:00 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">11:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業継続</p>
                  </div>

                  {/* 11:00 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">11:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">集中して作業中</p>
                  </div>

                  {/* 11:30 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">11:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">作業中</p>
                  </div>

                  {/* 11:30 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">11:30</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">学習状況確認</p>
                  </div>

                  {/* 12:00 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">12:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">昼休み前</p>
                  </div>

                  {/* 12:00 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">12:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">休憩準備</p>
                  </div>

                  {/* 13:00 - デスクトップ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🖥️</span>
                        <span className="text-sm font-medium text-gray-800">デスクトップ</span>
                      </div>
                      <span className="text-xs text-gray-500">13:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">画面キャプチャ</span>
                    </div>
                    <p className="text-xs text-gray-600">午後作業開始</p>
                  </div>

                  {/* 13:00 - カメラ */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📷</span>
                        <span className="text-sm font-medium text-gray-800">カメラ</span>
                      </div>
                      <span className="text-xs text-gray-500">13:00</span>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">カメラ画像</span>
                    </div>
                    <p className="text-xs text-gray-600">午後作業開始</p>
                  </div>
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowUserDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 個別支援計画モーダル */}
      {showSupportPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedUser.name} 個別支援計画</h3>
                </div>
                <button 
                  onClick={() => setShowSupportPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 長期目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">長期目標</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="就労移行支援の長期目標を入力してください"
                  defaultValue="就労継続支援A型事業所への就職を目指す"
                />
              </div>

              {/* 短期目標 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">短期目標</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="3ヶ月以内の短期目標を入力してください"
                  defaultValue="パソコン操作スキルの向上とコミュニケーション能力の向上"
                />
              </div>

              {/* 本人のニーズ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">本人のニーズ</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="利用者のニーズや希望を入力してください"
                  defaultValue="在宅での作業を通じて社会参加したい。パソコンを使った仕事に興味がある。"
                />
              </div>

              {/* 個別支援内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">個別支援内容</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="具体的な支援内容を入力してください"
                  defaultValue="1. パソコン基本操作の指導\n2. 在宅での作業環境整備\n3. コミュニケーションスキルの向上\n4. 就労に向けた準備支援"
                />
              </div>

              {/* 目標達成時期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目標達成時期</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="2025-12-31"
                />
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="利用者に関する特記事項や注意点を入力してください"
                  defaultValue="在宅での作業環境が整っており、パソコン操作に積極的に取り組んでいる。コミュニケーション能力の向上が課題。"
                />
              </div>

              {/* 支援計画の状況 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3">支援計画の状況</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">個別支援計画書作成日</div>
                    <input 
                      type="date" 
                      className="w-full text-sm font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      defaultValue="2025-01-15"
                      onChange={(e) => {
                        // 作成日が変更されたら、3ヶ月後の日付を次回更新日に設定
                        const createDate = new Date(e.target.value);
                        const updateDate = new Date(createDate);
                        updateDate.setMonth(updateDate.getMonth() + 3);
                        const updateDateInput = document.querySelector('input[data-field="next-update"]');
                        if (updateDateInput) {
                          updateDateInput.value = updateDate.toISOString().split('T')[0];
                        }
                      }}
                    />
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">次回更新日</div>
                    <input 
                      type="date" 
                      className="w-full text-sm font-medium border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      defaultValue="2025-04-15"
                      data-field="next-update"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowSupportPlanModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // 保存処理
                  setShowSupportPlanModal(false);
                  alert('個別支援計画を保存しました');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 勤怠修正モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">勤怠修正</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">利用者</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-800">田中 太郎</p>
                  <p className="text-xs text-gray-600">受給者証: 1234567890</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始時間</label>
                  <input 
                    type="time" 
                    defaultValue="10:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">終了時間</label>
                  <input 
                    type="time" 
                    defaultValue="16:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">休憩開始</label>
                  <input 
                    type="time" 
                    defaultValue="12:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">休憩終了</label>
                  <input 
                    type="time" 
                    defaultValue="13:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // 保存処理
                  setShowEditModal(false);
                  alert('勤怠情報を更新しました');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日次支援記録モーダル */}
      {showDailySupportRecordModal && selectedUser && (
        <DailySupportRecordModal
          isOpen={showDailySupportRecordModal}
          onClose={() => {
            setShowDailySupportRecordModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveDailySupportRecord}
          student={selectedUser}
          date={new Date().toISOString().split('T')[0]}
          aiAssist={handleDailyRecordAIAssist}
        />
      )}

      {/* 利用者入力確認モーダル */}
      {showUserInputModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">📋 ご本人の記録確認</h2>
              <div className="text-indigo-100 text-sm space-y-1">
                <p>対象者名: <span className="font-semibold text-white">{selectedUser?.name || '未設定'}</span></p>
                <p>受給者証番号: <span className="font-semibold text-white">{selectedUser?.recipientNumber || '未設定'}</span></p>
                <p>記録日: <span className="font-semibold text-white">{new Date().toLocaleDateString('ja-JP')}</span></p>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 体調管理セクション */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span>🏥</span>
                    <span>体調管理</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">体温</label>
                      <div className="text-2xl font-bold text-blue-600">36.2°C</div>
                      <p className="text-xs text-gray-500 mt-1">記録時刻: 09:00</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">睡眠時間</label>
                      <div className="text-2xl font-bold text-blue-600">7時間</div>
                      <p className="text-xs text-gray-500 mt-1">就寝: 23:00 / 起床: 06:00</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">体調</label>
                      <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        😊 良好
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">体調の詳細</label>
                    <p className="text-gray-800">
                      昨夜はよく眠れました。朝から体調も良く、集中して作業に取り組めそうです。
                      ストレッチも行い、準備万端です。
                    </p>
                  </div>
                </div>

                {/* 作業予定セクション */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span>💼</span>
                    <span>作業内容</span>
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">今日の予定作業</label>
                    <p className="text-gray-800">
                      ・ITリテラシー・AIの基本の学習（第3回）<br/>
                      ・HTML/CSS基礎学習の復習<br/>
                      ・簡単なWebページ作成の練習
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUserInputModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    alert('コメント機能は今後実装予定です');
                  }}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-all duration-200"
                >
                  💬 コメントを追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSupportDashboard;
