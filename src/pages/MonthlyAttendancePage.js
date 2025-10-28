import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorHeader from '../components/InstructorHeader';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import { getSatelliteHomeSupportUsers, getMonthlyAttendance } from '../utils/api';
import { getCurrentUser } from '../utils/userContext';
import { formatUTCToJSTTimeOnly } from '../utils/dateUtils';

function MonthlyAttendancePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useInstructorGuard();
  const [localUser, setLocalUser] = useState(currentUser);
  
  // 今月の初日をデフォルトに設定
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSatellite, setCurrentSatellite] = useState(null);

  // 拠点情報を復元
  useEffect(() => {
    if (currentUser) {
      const savedSatellite = sessionStorage.getItem('selectedSatellite');
      if (savedSatellite) {
        try {
          const satellite = JSON.parse(savedSatellite);
          setLocalUser({
            ...currentUser,
            satellite_id: satellite.id,
            satellite_name: satellite.name,
            company_id: satellite.company_id,
            company_name: satellite.company_name
          });
        } catch (e) {
          console.error('拠点情報のパースエラー:', e);
          setLocalUser(currentUser);
        }
      } else {
        setLocalUser(currentUser);
      }
    }
  }, [currentUser]);

  // 拠点変更ハンドラー
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
    setCurrentSatellite(newLocation);
    
    // 拠点切り替えイベントを発火
    window.dispatchEvent(new CustomEvent('satelliteChanged', {
      detail: { satellite: newLocation }
    }));
  };

  // 拠点情報を取得
  useEffect(() => {
    const loadSatellite = () => {
      const savedSatellite = sessionStorage.getItem('selectedSatellite');
      if (savedSatellite) {
        try {
          const satellite = JSON.parse(savedSatellite);
          setCurrentSatellite(satellite);
        } catch (e) {
          console.error('拠点情報のパースエラー:', e);
        }
      } else {
        // ユーザー情報から拠点を取得
        getCurrentUser().then(user => {
          if (user && user.satellite_id) {
            setCurrentSatellite({
              id: user.satellite_id,
              name: user.satellite_name
            });
          }
        });
      }
    };

    loadSatellite();

    // 拠点変更イベントを監視
    const handleSatelliteChanged = (e) => {
      if (e.detail && e.detail.satellite) {
        setCurrentSatellite(e.detail.satellite);
      }
    };

    window.addEventListener('satelliteChanged', handleSatelliteChanged);
    return () => {
      window.removeEventListener('satelliteChanged', handleSatelliteChanged);
    };
  }, []);

  // 在宅支援利用者一覧を取得
  useEffect(() => {
    if (currentSatellite && currentSatellite.id) {
      fetchUsers();
    }
  }, [currentSatellite]);

  const fetchUsers = async () => {
    if (!currentSatellite || !currentSatellite.id) return;

    try {
      const response = await getSatelliteHomeSupportUsers(currentSatellite.id);
      
      if (response.success) {
        const usersData = response.data.map(user => ({
          id: user.id,
          name: user.name,
          certificate: user.recipient_number || user.recipient_certificate_id || '-'
        }));
        setUsers(usersData);
        
        // 最初の利用者を選択
        if (usersData.length > 0 && !selectedUserId) {
          setSelectedUserId(usersData[0].id);
        }
      } else {
        setError('利用者の取得に失敗しました');
      }
    } catch (err) {
      console.error('利用者取得エラー:', err);
      setError('利用者の取得に失敗しました');
    }
  };

  // 月次勤怠データを取得
  useEffect(() => {
    if (selectedUserId && selectedMonth) {
      fetchMonthlyData();
    }
  }, [selectedUserId, selectedMonth]);

  const fetchMonthlyData = async () => {
    if (!selectedUserId || !selectedMonth) return;

    try {
      setLoading(true);
      setError(null);
      
      const [year, month] = selectedMonth.split('-');
      const response = await getMonthlyAttendance(selectedUserId, year, month);
      
      if (response.success) {
        // UTC時刻をJST時刻に変換して表示用データを作成
        const convertedData = (response.data || []).map(record => {
          const hours = Math.floor(record.workingMinutes / 60);
          const minutes = record.workingMinutes % 60;
          const workingTimeDisplay = record.workingMinutes > 0 
            ? minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`
            : '-';
          
          return {
            ...record,
            startTime: record.startTimeUTC ? formatUTCToJSTTimeOnly(record.startTimeUTC) : null,
            endTime: record.endTimeUTC ? formatUTCToJSTTimeOnly(record.endTimeUTC) : null,
            breakStartTime: record.breakStartTimeUTC ? formatUTCToJSTTimeOnly(record.breakStartTimeUTC) : null,
            breakEndTime: record.breakEndTimeUTC ? formatUTCToJSTTimeOnly(record.breakEndTimeUTC) : null,
            workingTimeDisplay: workingTimeDisplay
          };
        });
        setMonthlyData(convertedData);
      } else {
        setError(response.message || '月次勤怠データの取得に失敗しました');
      }
    } catch (err) {
      console.error('月次勤怠データ取得エラー:', err);
      setError('月次勤怠データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  // 選択月の日数を取得
  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 前月・翌月の処理
  const changeMonth = (offset) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <InstructorHeader 
        user={localUser || currentUser} 
        onLocationChange={handleLocationChange}
        showBackButton={true}
        backButtonText="在宅支援ダッシュボードに戻る"
        onBackClick={() => {
          // 戻る前に現在の拠点情報を保存
          if (localUser) {
            const currentLocation = {
              id: localUser.satellite_id,
              name: localUser.satellite_name,
              company_id: localUser.company_id,
              company_name: localUser.company_name
            };
            sessionStorage.setItem('selectedSatellite', JSON.stringify(currentLocation));
          }
          navigate('/instructor/home-support');
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* ヘッダー */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 月次勤怠管理</h1>
                <p className="text-gray-600">利用者の月次勤怠データを確認できます</p>
              </div>
            </div>
          </div>

          {/* 利用者選択と月選択 */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
            {/* 利用者選択 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">利用者:</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700"
                disabled={users.length === 0}
              >
                {users.length === 0 ? (
                  <option value="">利用者を読み込み中...</option>
                ) : (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="hidden md:block text-gray-300">|</div>

            {/* 月選択 */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => changeMonth(-1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ← 前月
              </button>
              <div className="flex items-center gap-2">
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700"
                />
                <button
                  onClick={() => setSelectedMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  今月
                </button>
              </div>
              <button 
                onClick={() => changeMonth(1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                翌月 →
              </button>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 選択月の表示 */}
          {selectedUser && (
            <div className="mb-6 text-center">
              <p className="text-2xl font-bold text-gray-800">
                📅 {new Date(selectedMonth + '-01').toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long'
                })} - {selectedUser.name}
              </p>
            </div>
          )}

          {/* 勤怠一覧テーブル */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">データを読み込み中...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      曜日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      通所日
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        データがありません
                      </td>
                    </tr>
                  ) : (
                    monthlyData.map((record, index) => (
                      <tr 
                        key={record.day} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${record.isWeekend ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.dateDisplay}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${record.isWeekend ? 'text-red-600' : 'text-gray-900'}`}>
                            {record.dayOfWeek}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.isOfficeVisit ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                ○ 通所
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.startTime || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.endTime || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.breakStartTime || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.breakEndTime || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.workingTimeDisplay}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonthlyAttendancePage;

