import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorHeader from '../components/InstructorHeader';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';

function MonthlyAttendancePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useInstructorGuard();
  
  // 今月の初日をデフォルトに設定
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [selectedUserId, setSelectedUserId] = useState('tanaka');
  
  // 利用者リスト
  const users = [
    { id: 'tanaka', name: '田中 太郎', certificate: '1234567890' },
    { id: 'sato', name: '佐藤 花子', certificate: '2345678901' },
    { id: 'suzuki', name: '鈴木 一郎', certificate: '3456789012' },
    { id: 'takahashi', name: '高橋 美咲', certificate: '4567890123' },
    { id: 'ito', name: '伊藤 健太', certificate: '5678901234' }
  ];

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

  // サンプルデータ生成（実際にはAPIから取得）
  const generateMonthlyData = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const [year, month] = selectedMonth.split('-').map(Number);
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // サンプルデータ（土日を含む全ての日）
      const hasData = dayOfWeek !== 0 && dayOfWeek !== 6 && Math.random() > 0.1; // 平日の90%の確率でデータあり
      data.push({
        day,
        dateDisplay: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        startTime: hasData ? '09:00' : '-',
        endTime: hasData ? ['16:00', '17:00', '15:00'][Math.floor(Math.random() * 3)] : '-',
        breakStart: hasData ? '12:00' : '-',
        breakEnd: hasData ? '13:00' : '-',
        workHours: hasData ? ['5時間', '6時間', '4時間'][Math.floor(Math.random() * 3)] : '-'
      });
    }

    return data;
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <InstructorHeader currentUser={currentUser} onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* ヘッダー */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 月次勤怠管理</h1>
                <p className="text-gray-600">利用者の月次勤怠データを確認できます</p>
              </div>
              <button
                onClick={() => navigate('/instructor/home-support')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 戻る
              </button>
            </div>
          </div>

          {/* 利用者選択と月選択 */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-4">
            {/* 利用者選択 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">利用者:</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
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

          {/* 選択月の表示 */}
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-gray-800">
              📅 {new Date(selectedMonth + '-01').toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long'
              })} - {selectedUser.name}
            </p>
          </div>

          {/* 勤怠一覧テーブル */}
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
                {monthlyData.map((record, index) => (
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
                        {record.startTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.breakStart}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.breakEnd}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.workHours}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyAttendancePage;

