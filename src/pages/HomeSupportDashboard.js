import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import InstructorHeader from '../components/InstructorHeader';
import HomeSupportManagement from '../components/HomeSupportManagement';
import HomeSupportUserAdditionModal from '../components/HomeSupportUserAdditionModal';
import { getCurrentUser } from '../utils/userContext';

const HomeSupportDashboard = () => {
  console.log('=== HomeSupportDashboard Component Mounted ===');
  
  const [activeTab, setActiveTab] = useState(() => {
    // sessionStorageからタブの状態を復元
    const savedTab = sessionStorage.getItem('homeSupportDashboardActiveTab');
    return savedTab && ['overview', 'users', 'attendance', 'evidence', 'evaluations', 'evaluation-history'].includes(savedTab) 
      ? savedTab 
      : 'overview';
  });

  const [showHomeSupportModal, setShowHomeSupportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);

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
              🏠 在宅支援概要
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
              className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'attendance' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
              onClick={() => {
                setActiveTab('attendance');
                sessionStorage.setItem('homeSupportDashboardActiveTab', 'attendance');
              }}
            >
              ⏰ 勤怠管理
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
                  📝 評価予定
                </button>
                <button
                  className={`flex items-center gap-3 px-6 py-4 bg-transparent border-none text-gray-800 cursor-pointer transition-all duration-300 text-center text-sm min-w-[150px] flex-shrink-0 rounded-lg hover:bg-indigo-50 hover:-translate-y-0.5 ${activeTab === 'evaluation-history' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`}
                  onClick={() => {
                    setActiveTab('evaluation-history');
                    sessionStorage.setItem('homeSupportDashboardActiveTab', 'evaluation-history');
                  }}
                >
                  📚 評価履歴
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


                {/* 今週・今月の評価予定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-indigo-600 text-xl">📅</span>
                      <h3 className="font-semibold text-indigo-800">今週の評価予定</h3>
                    </div>
                    <p className="text-indigo-700 text-sm mb-2">2名の週次評価が予定されています</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs">田中さん</span>
                      <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs">佐藤さん</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-purple-600 text-xl">📊</span>
                      <h3 className="font-semibold text-purple-800">今月の評価予定</h3>
                    </div>
                    <p className="text-purple-700 text-sm mb-2">1名の月次評価が予定されています</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">鈴木さん</span>
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
                                受給者証
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
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📷 記録・証拠</h2>
                    <p className="text-lg text-gray-600">デスクトップ画面とカメラで学習状況を記録・管理</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      📷 カメラ撮影
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      🖥️ 画面キャプチャ
                    </button>
                  </div>
                </div>

                {/* 検索・フィルター機能 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="today">今日</option>
                        <option value="week">今週</option>
                        <option value="month">今月</option>
                        <option value="custom">カスタム</option>
                      </select>
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
                            <div className="text-sm text-gray-500">受給者証: 1234567890</div>
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
                            <div className="text-sm text-gray-500">受給者証: 2345678901</div>
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
                            <div className="text-sm text-gray-500">受給者証: 4567890123</div>
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
                            <div className="text-sm text-gray-500">受給者証: 5678901234</div>
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
                            <div className="text-sm text-gray-500">受給者証: 3456789012</div>
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
                              受給者証
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              担当指導員
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状態
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              作業時間
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
                                1234567890
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                作業中
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                10:00 - 16:00
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                -
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                  詳細
                                </button>
                                <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                                  書類
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
                                2345678901
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                休憩中
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                09:00 - 11:00
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                体調不良で早退
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                  詳細
                                </button>
                                <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                                  書類
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
                                3456789012
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                未開始
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                -
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                連絡待ち
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                  詳細
                                </button>
                                <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                                  書類
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
                                4567890123
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                作業中
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                09:00 - 15:00
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                -
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                  詳細
                                </button>
                                <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                                  書類
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
                                5678901234
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                山田 指導員
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                作業中
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                11:00 - 17:00
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                -
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                  詳細
                                </button>
                                <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                                  書類
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
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      月次勤怠管理
                    </button>
                  </div>
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
                          休憩
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
                            1時間
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
                          <div className="text-sm text-gray-900">
                            0時間
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
                            1時間
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
                            1時間
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📝 評価予定</h2>
                    <p className="text-lg text-gray-600">今日やるべき評価と今後の評価予定を管理します</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      新規評価
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      評価カレンダー
                    </button>
                  </div>
                </div>

                {/* 利用者別評価状況 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 利用者別評価状況</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            利用者
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            受給者証
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            日次評価
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            週次評価
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            月次評価
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* 田中さん - 週次・月次は完了済み、今日の日次がない */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">田中 太郎</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">1234567890</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              📝 未完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-white text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200">
                                日次評価
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 佐藤さん - 日次評価完了、週次・月次未完了 */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">佐藤 花子</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">2345678901</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              📝 未完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              📝 未完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                週次評価
                              </button>
                              <button className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
                                月次評価
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 鈴木さん - 日次・週次完了、月次未完了 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">鈴木 一郎</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">3456789012</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              📝 未完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-white text-sm px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
                                月次評価
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 高橋さん - 全て完了 */}
                        <tr className="hover:bg-gray-50 bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">高橋 美咲</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">4567890123</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ 完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                                詳細
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* 伊藤さん - 初回利用者（週次・月次はハイフン） */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">伊藤 健太</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">5678901234</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              📝 未完了
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">-</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">-</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-white text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200">
                                日次評価
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 今後の評価予定 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 今後の評価予定</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-indigo-800">週次評価</h4>
                        <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs">2名</span>
                      </div>
                      <p className="text-sm text-indigo-700">来週の評価予定</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-800">月次評価</h4>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">1名</span>
                      </div>
                      <p className="text-sm text-purple-700">今月末の評価予定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluation-history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 評価履歴</h2>
                    <p className="text-lg text-gray-600">過去の評価記録と書類を管理します</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      検索
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      一括出力
                    </button>
                  </div>
                </div>

                {/* 評価履歴一覧 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          利用者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          評価種別
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          評価期間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          完了日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          担当者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">田中 太郎</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            日次評価
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/15</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/15</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">山田 指導員</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                              詳細
                            </button>
                            <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                              書類出力
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">佐藤 花子</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            週次評価
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/13 - 01/17</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/17</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">山田 指導員</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                              詳細
                            </button>
                            <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                              書類出力
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">鈴木 一郎</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            月次評価
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/01 - 01/31</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">2025/01/31</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">山田 指導員</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                              詳細
                            </button>
                            <button className="text-white text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition-colors duration-200">
                              書類出力
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
                  <p className="text-gray-600">受給者証: {selectedUser.certificate}</p>
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
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    📷 カメラ撮影
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    🖥️ 画面キャプチャ
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    📊 書類作成
                  </button>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    閉じる
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('evidence');
                      setShowUserDetailModal(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    記録・証拠管理
                  </button>
                </div>
              </div>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休憩時間</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="0">0時間</option>
                  <option value="0.5">30分</option>
                  <option value="1" selected>1時間</option>
                  <option value="1.5">1時間30分</option>
                  <option value="2">2時間</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状態</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="working" selected>作業中</option>
                  <option value="break">休憩中</option>
                  <option value="not-started">未開始</option>
                  <option value="completed">完了</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea 
                  placeholder="体調や作業内容の備考を入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
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
    </div>
  );
};

export default HomeSupportDashboard;
