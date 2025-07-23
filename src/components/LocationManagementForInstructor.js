import React, { useState } from 'react';

const LocationManagementForInstructor = ({ currentUser }) => {
  const [locationInfo, setLocationInfo] = useState({
    id: currentUser.locationId,
    name: currentUser.locationName,
    facilityName: currentUser.facilityName,
    maxStudents: 30,
    currentStudents: 8,
    address: '東京都渋谷区○○1-2-3',
    phone: '03-1234-5678',
    manager: currentUser.name
  });

  const [instructors, setInstructors] = useState([
    {
      id: 'teacher001',
      name: '佐藤指導員',
      email: 'sato@example.com',
      department: 'プログラミング学科',
      studentsCount: 4,
      status: 'active',
      joinDate: '2023-04-01'
    },
    {
      id: 'teacher002',
      name: '田中指導員',
      email: 'tanaka@example.com',
      department: 'Web開発学科',
      studentsCount: 4,
      status: 'active',
      joinDate: '2023-06-15'
    }
  ]);

  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showEditLocationForm, setShowEditLocationForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    department: '',
    password: ''
  });

  const [editLocation, setEditLocation] = useState({
    name: locationInfo.name,
    maxStudents: locationInfo.maxStudents,
    address: locationInfo.address,
    phone: locationInfo.phone
  });

  // 学習可能状況の判定
  const isOverCapacity = locationInfo.currentStudents > locationInfo.maxStudents;
  const capacityPercentage = (locationInfo.currentStudents / locationInfo.maxStudents) * 100;

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const teacherId = `teacher${String(instructors.length + 1).padStart(3, '0')}`;
    const teacher = {
      id: teacherId,
      ...newTeacher,
      studentsCount: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setInstructors([...instructors, teacher]);
    setNewTeacher({ name: '', email: '', department: '', password: '' });
    setShowAddTeacherForm(false);
    
    alert(`指導員が追加されました！\nログイン情報:\nID: ${teacherId}\nパスワード: ${newTeacher.password}`);
  };

  const handleLocationUpdate = (e) => {
    e.preventDefault();
    setLocationInfo({
      ...locationInfo,
      ...editLocation,
      maxStudents: parseInt(editLocation.maxStudents)
    });
    setShowEditLocationForm(false);
    alert('拠点情報が更新されました。');
  };

  const toggleTeacherStatus = (teacherId) => {
    setInstructors(instructors.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, status: teacher.status === 'active' ? 'inactive' : 'active' }
        : teacher
    ));
  };

  const contactManagement = () => {
    alert(`運営に連絡しました。\n\n内容:\n拠点: ${locationInfo.name}\n現在の生徒数: ${locationInfo.currentStudents}名\n最大受入数: ${locationInfo.maxStudents}名\n\n至急、生徒数の調整をお願いします。`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🏢 拠点管理 - {locationInfo.name}
            </h2>
            <p className="text-lg text-gray-600">{locationInfo.facilityName}</p>
          </div>
        </div>
      </div>

      {/* 容量警告 */}
      {isOverCapacity && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-xl font-bold text-red-800">生徒数超過警告</h3>
          </div>
          <p className="text-red-700 mb-4">
            現在の生徒数（{locationInfo.currentStudents}名）が最大受入数（{locationInfo.maxStudents}名）を超過しています。
          </p>
          <p className="text-red-700 mb-4">学習システムが正常に動作しない可能性があります。</p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={contactManagement}
          >
            🚨 運営に連絡
          </button>
        </div>
      )}

      {/* 容量近接警告 */}
      {!isOverCapacity && capacityPercentage >= 80 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-xl font-bold text-yellow-800">容量警告</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            生徒数が最大受入数の{Math.round(capacityPercentage)}%に達しています。
          </p>
          <p className="text-yellow-700">新規生徒の受入れを調整してください。</p>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">現在の生徒数</h3>
          <p className={`text-3xl font-bold mb-2 ${isOverCapacity ? 'text-red-600' : 'text-indigo-600'}`}>
            {locationInfo.currentStudents}名
          </p>
          <small className="text-gray-500">最大 {locationInfo.maxStudents}名</small>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">指導員数</h3>
          <p className="text-3xl font-bold text-indigo-600 mb-2">
            {instructors.filter(t => t.status === 'active').length}名
          </p>
          <small className="text-gray-500">アクティブ</small>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">容量使用率</h3>
          <p className={`text-3xl font-bold mb-2 ${
            capacityPercentage >= 100 
              ? 'text-red-600' 
              : capacityPercentage >= 80 
                ? 'text-yellow-600' 
                : 'text-indigo-600'
          }`}>
            {Math.round(capacityPercentage)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                capacityPercentage >= 100 
                  ? 'bg-gradient-to-r from-red-400 to-red-600' 
                  : capacityPercentage >= 80 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                    : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">拠点責任者</h3>
          <p className="text-xl font-semibold text-gray-800">{locationInfo.manager}</p>
        </div>
      </div>

      {/* 管理セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 拠点情報 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">拠点情報</h3>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => {
                setEditLocation({
                  name: locationInfo.name,
                  maxStudents: locationInfo.maxStudents,
                  address: locationInfo.address,
                  phone: locationInfo.phone
                });
                setShowEditLocationForm(true);
              }}
            >
              編集
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏢</span>
              <div>
                <p className="font-semibold text-gray-800">拠点名</p>
                <p className="text-gray-600">{locationInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="font-semibold text-gray-800">住所</p>
                <p className="text-gray-600">{locationInfo.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📞</span>
              <div>
                <p className="font-semibold text-gray-800">電話</p>
                <p className="text-gray-600">{locationInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">👥</span>
              <div>
                <p className="font-semibold text-gray-800">最大生徒数</p>
                <p className="text-gray-600">{locationInfo.maxStudents}名</p>
              </div>
            </div>
          </div>
        </div>

        {/* 指導員一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">拠点内指導員一覧</h3>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setShowAddTeacherForm(true)}
            >
              + 指導員を追加
            </button>
          </div>
          <div className="space-y-4">
            {instructors.map(teacher => (
              <div key={teacher.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{teacher.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{teacher.department}</p>
                    <p className="text-sm text-gray-600 mb-1">担当生徒: {teacher.studentsCount}名</p>
                    <p className="text-sm text-gray-600">入職日: {teacher.joinDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      teacher.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.status === 'active' ? 'アクティブ' : '非アクティブ'}
                    </span>
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        teacher.status === 'active' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      onClick={() => toggleTeacherStatus(teacher.id)}
                    >
                      {teacher.status === 'active' ? '無効化' : '有効化'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 拠点編集モーダル */}
      {showEditLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">拠点情報の編集</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowEditLocationForm(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleLocationUpdate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">拠点名</label>
                <input
                  type="text"
                  value={editLocation.name}
                  onChange={(e) => setEditLocation({...editLocation, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">最大生徒数</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editLocation.maxStudents}
                  onChange={(e) => setEditLocation({...editLocation, maxStudents: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <small className="text-gray-500">現在の生徒数: {locationInfo.currentStudents}名</small>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={editLocation.address}
                  onChange={(e) => setEditLocation({...editLocation, address: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  value={editLocation.phone}
                  onChange={(e) => setEditLocation({...editLocation, phone: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowEditLocationForm(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 先生追加モーダル */}
      {showAddTeacherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">新しい指導員を追加</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowAddTeacherForm(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">名前</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">学科</label>
                <select
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">学科を選択</option>
                  <option value="プログラミング学科">プログラミング学科</option>
                  <option value="Web開発学科">Web開発学科</option>
                  <option value="データサイエンス学科">データサイエンス学科</option>
                  <option value="デザイン学科">デザイン学科</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">初期パスワード</label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowAddTeacherForm(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagementForInstructor; 