import React, { useState } from 'react';

const InstructorManagement = () => {
  // LocationManagement.jsと同じ拠点データを使用
  const facilityLocations = [
    {
      id: 'office001',
      name: '東京教育渋谷校',
      organizationName: 'スタディスフィア株式会社',
      type: '就労移行支援事業所',
      address: '東京都渋谷区渋谷1-1-1'
    },
    {
      id: 'office002',
      name: '東京教育新宿校',
      organizationName: 'スタディスフィア株式会社',
      type: '就労継続支援A型事業所',
      address: '東京都新宿区新宿2-2-2'
    },
    {
      id: 'office003',
      name: '東京教育池袋校',
      organizationName: 'スタディスフィア株式会社',
      type: '学習塾',
      address: '東京都豊島区池袋3-3-3'
    },
    {
      id: 'office004',
      name: '関西教育大阪校',
      organizationName: '関西教育グループ',
      type: '就労継続支援A型事業所',
      address: '大阪府大阪市北区梅田3-4-5'
    },
    {
      id: 'office005',
      name: '関西教育難波校',
      organizationName: '関西教育グループ',
      type: '就労継続支援B型事業所',
      address: '大阪府大阪市中央区難波5-6-7'
    },
    {
      id: 'office006',
      name: '中部学習名古屋校',
      organizationName: '中部学習センター',
      type: '就労移行支援事業所',
      address: '愛知県名古屋市中区栄1-1-1'
    },
    {
      id: 'office007',
      name: '中部学習岡崎校',
      organizationName: '中部学習センター',
      type: '学習塾',
      address: '愛知県岡崎市本町2-2-2'
    },
    {
      id: 'office008',
      name: '関西教育新規校',
      organizationName: '関西教育グループ',
      type: '就労移行支援事業所',
      address: '大阪府大阪市天王寺区上本町6-7-8'
    },
    {
      id: 'office009',
      name: 'フリーランス学習塾',
      organizationName: '個人事業主',
      type: '学習塾',
      address: '東京都中野区中野4-4-4'
    },
    {
      id: 'office010',
      name: '個人指導センター',
      organizationName: '個人事業主',
      type: '就労移行支援事業所',
      address: '東京都杉並区阿佐ヶ谷5-5-5'
    },
    {
      id: 'office011',
      name: '独立系教育施設',
      organizationName: '未分類',
      type: 'その他',
      address: '東京都世田谷区三軒茶屋6-6-6'
    }
  ];

  const [instructors, setInstructors] = useState([
    { 
      id: 'instructor001', 
      name: '佐藤指導員', 
      email: 'sato@example.com', 
      department: 'IT基礎・AI学科',
      facilityLocationIds: ['office001', 'office002'],
      facilityLocationNames: ['東京教育渋谷校', '東京教育新宿校'],
      status: 'active',
      lastLogin: '2024-01-15',
      passwordResetRequired: false
    },
    { 
      id: 'instructor002', 
      name: '田中指導員', 
      email: 'tanaka@example.com', 
      department: 'SNS運用・デザイン学科',
      facilityLocationIds: ['office001'],
      facilityLocationNames: ['東京教育渋谷校'],
      status: 'active',
      lastLogin: '2024-01-14',
      passwordResetRequired: false
    },
    { 
      id: 'instructor003', 
      name: '鈴木指導員', 
      email: 'suzuki@example.com', 
      department: 'LP制作・案件対応学科',
      facilityLocationIds: ['office004', 'office005'],
      facilityLocationNames: ['関西教育大阪校', '関西教育難波校'],
      status: 'active',
      lastLogin: '2024-01-13',
      passwordResetRequired: false
    },
    { 
      id: 'instructor004', 
      name: '山田指導員', 
      email: 'yamada@example.com', 
      department: 'オフィスソフト・文書作成学科',
      facilityLocationIds: ['office003'],
      facilityLocationNames: ['東京教育池袋校'],
      status: 'active',
      lastLogin: '2024-01-12',
      passwordResetRequired: true
    },
    { 
      id: 'instructor005', 
      name: '高橋指導員', 
      email: 'takahashi@example.com', 
      department: 'IT基礎・AI学科',
      facilityLocationIds: ['office006'],
      facilityLocationNames: ['中部学習名古屋校'],
      status: 'active',
      lastLogin: '2024-01-11',
      passwordResetRequired: false
    },
    { 
      id: 'instructor006', 
      name: '伊藤指導員', 
      email: 'ito@example.com', 
      department: 'ビジネス学科',
      facilityLocationIds: ['office006', 'office007'],
      facilityLocationNames: ['中部学習名古屋校', '中部学習岡崎校'],
      status: 'active',
      lastLogin: '2024-01-10',
      passwordResetRequired: false
    },
    { 
      id: 'instructor007', 
      name: '渡辺指導員', 
      email: 'watanabe@example.com', 
      department: 'IT学科',
      facilityLocationIds: ['office007'],
      facilityLocationNames: ['中部学習岡崎校'],
      status: 'active',
      lastLogin: '2024-01-09',
      passwordResetRequired: false
    },
    { 
      id: 'instructor008', 
      name: '小林指導員', 
      email: 'kobayashi@example.com', 
      department: '個人指導',
      facilityLocationIds: ['office009'],
      facilityLocationNames: ['フリーランス学習塾'],
      status: 'active',
      lastLogin: '2024-01-08',
      passwordResetRequired: false
    },
    { 
      id: 'instructor009', 
      name: '中村指導員', 
      email: 'nakamura@example.com', 
      department: '総合教育',
      facilityLocationIds: ['office011'],
      facilityLocationNames: ['独立系教育施設'],
      status: 'active',
      lastLogin: '2024-01-07',
      passwordResetRequired: false
    },
    { 
      id: 'instructor010', 
      name: '松本指導員', 
      email: 'matsumoto@example.com', 
      department: 'ビジネス学科',
      facilityLocationIds: [],
      facilityLocationNames: [],
      status: 'active',
      lastLogin: '2024-01-06',
      passwordResetRequired: false
    },
    { 
      id: 'instructor011', 
      name: '佐々木指導員', 
      email: 'sasaki@example.com', 
      department: 'IT学科',
      facilityLocationIds: [],
      facilityLocationNames: [],
      status: 'inactive',
      lastLogin: '2023-12-20',
      passwordResetRequired: false
    },
    { 
      id: 'instructor012', 
      name: '高橋美咲指導員', 
      email: 'takahashi.misaki@example.com', 
      department: 'デザイン学科',
      facilityLocationIds: ['office005'],
      facilityLocationNames: ['関西教育難波校'],
      status: 'active',
      lastLogin: '2024-01-05',
      passwordResetRequired: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showTempPasswordDialog, setShowTempPasswordDialog] = useState(false);
  const [generatedTempPassword, setGeneratedTempPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityLocationFilter, setFacilityLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNoLocationFilter, setShowNoLocationFilter] = useState(false);
  
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    email: '',
    department: '',
    facilityLocationIds: [],
    password: ''
  });

  // フィルタリング機能
  const getFilteredInstructors = () => {
    let filtered = instructors;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(instructor =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.facilityLocationNames.some(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 事業所(拠点)フィルター
    if (facilityLocationFilter !== 'all') {
      filtered = filtered.filter(instructor => 
        instructor.facilityLocationIds.includes(facilityLocationFilter)
      );
    }

    // 拠点なしフィルター
    if (showNoLocationFilter) {
      filtered = filtered.filter(instructor => 
        instructor.facilityLocationIds.length === 0
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(instructor => instructor.status === statusFilter);
    }

    return filtered;
  };



  // パスワードリセット機能
  const handlePasswordReset = (instructor) => {
    setSelectedInstructor(instructor);
    setShowPasswordResetModal(true);
  };

  const executePasswordReset = (resetType) => {
    if (!selectedInstructor) return;
    
    if (resetType === 'temporary') {
      const tempPassword = generateTempPassword();
      setGeneratedTempPassword(tempPassword);
      setShowTempPasswordDialog(true);
      
      // パスワードリセット必須フラグを設定
      setInstructors(instructors.map(inst => 
        inst.id === selectedInstructor.id 
          ? { ...inst, passwordResetRequired: true }
          : inst
      ));
      
      // 一時パスワードダイアログの場合は、selectedInstructorを保持
      setShowPasswordResetModal(false);
      // setSelectedInstructor(null); // 一時パスワードダイアログで使用するため、ここではnullにしない
    } else if (resetType === 'force_change') {
      alert(`パスワード変更を要求しました：\n\n指導員: ${selectedInstructor.name}\n\n次回ログイン時に新しいパスワードの設定が必要になります。`);
      
      // パスワードリセット必須フラグを設定
      setInstructors(instructors.map(inst => 
        inst.id === selectedInstructor.id 
          ? { ...inst, passwordResetRequired: true }
          : inst
      ));
      
      setShowPasswordResetModal(false);
      setSelectedInstructor(null);
    }
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddInstructor = (e) => {
    e.preventDefault();
    
    const newInstructorData = {
      id: `instructor${Date.now()}`,
      ...newInstructor,
      facilityLocationNames: newInstructor.facilityLocationIds.map(id => 
        facilityLocations.find(l => l.id === id)?.name || ''
      ),
      status: 'active',
      lastLogin: '-',
      passwordResetRequired: false
    };
    
    setInstructors([...instructors, newInstructorData]);
    setNewInstructor({
      name: '',
      email: '',
      department: '',
      facilityLocationIds: [],
      password: ''
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleInstructorStatus = (instructorId) => {
    setInstructors(instructors.map(instructor =>
      instructor.id === instructorId
        ? { ...instructor, status: instructor.status === 'active' ? 'inactive' : 'active' }
        : instructor
    ));
  };

  // ソート機能を追加
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedInstructors = () => {
    const filtered = getFilteredInstructors();
    return [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'status') {
        aValue = getStatusLabel(aValue);
        bValue = getStatusLabel(bValue);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'inactive':
        return '非アクティブ';
      case 'password_reset_required':
        return 'パスワード変更要求';
      default:
        return status;
    }
  };

  const handleEditInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setNewInstructor({
      name: instructor.name,
      email: instructor.email,
      department: instructor.department,
      facilityLocationIds: instructor.facilityLocationIds,
      password: '' // 編集時はパスワードを空にする
    });
    setShowAddForm(true); // 編集モードでも追加フォームを表示
  };

  const handleResetPassword = (instructorId) => {
    const instructor = instructors.find(inst => inst.id === instructorId);
    if (instructor) {
      executePasswordReset('force_change');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">指導員管理</h2>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          onClick={() => setShowAddForm(true)}
        >
          + 新しい指導員を追加
        </button>
      </div>

      {/* フィルターセクション */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="指導員名、メール、学科で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-6 items-end mb-4">
          <div className="flex flex-col min-w-[150px]">
            <label className="font-semibold text-gray-700 mb-2 text-sm">事業所(拠点):</label>
            <select 
              value={facilityLocationFilter} 
              onChange={(e) => {
                setFacilityLocationFilter(e.target.value);
              }}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            >
              <option value="all">全ての事業所(拠点)</option>
              {facilityLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>



          <div className="flex flex-col min-w-[150px]">
            <label className="font-semibold text-gray-700 mb-2 text-sm">ステータス:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            >
              <option value="all">全て</option>
              <option value="active">アクティブ</option>
              <option value="inactive">非アクティブ</option>
            </select>
          </div>

          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-700"
            onClick={() => {
              setSearchTerm('');
              setFacilityLocationFilter('all');
              setShowNoLocationFilter(false);
              setStatusFilter('all');
            }}
          >
            フィルタークリア
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showNoLocationFilter"
              checked={showNoLocationFilter}
              onChange={(e) => setShowNoLocationFilter(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showNoLocationFilter" className="font-semibold text-gray-700 text-sm cursor-pointer">
              拠点未設定の指導員のみ表示
            </label>
          </div>
        </div>

        <div className="font-semibold text-gray-700 text-sm">
          表示中: {getFilteredInstructors().length}名 / 全{instructors.length}名
        </div>
      </div>

      {/* 指導員一覧テーブル */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('name')}
                >
                  👤 指導員名
                  {sortConfig.key === 'name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('email')}
                >
                  📧 メールアドレス
                  {sortConfig.key === 'email' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('department')}
                >
                  🎯 専門分野
                  {sortConfig.key === 'department' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('facilityLocationNames')}
                >
                  🏢 事業所(拠点)
                  {sortConfig.key === 'facilityLocationNames' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('status')}
                >
                  📊 ステータス
                  {sortConfig.key === 'status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚙️ 操作</th>
              </tr>
            </thead>
            <tbody>
              {getSortedInstructors().map(instructor => (
                <tr key={instructor.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                  instructor.facilityLocationIds.length === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                }`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <strong className="text-gray-800">{instructor.name}</strong>
                        <div className="text-xs text-gray-500">ID: {instructor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    📧 {instructor.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {instructor.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {instructor.facilityLocationNames.length > 0 ? (
                      <div className="space-y-1">
                        {instructor.facilityLocationNames.map((name, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium block">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⚠️ 拠点未設定
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      instructor.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : instructor.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(instructor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                        onClick={() => handleEditInstructor(instructor)}
                        title="編集"
                      >
                        ✏️ 編集
                      </button>
                      <button 
                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-orange-600"
                        onClick={() => handlePasswordReset(instructor)}
                        title="パスワードリセット"
                      >
                        🔑 リセット
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getSortedInstructors().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">条件に合致する指導員が見つかりません。</p>
          </div>
        )}
      </div>

      {/* パスワードリセットモーダル */}
      {showPasswordResetModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">パスワード管理 - {selectedInstructor.name}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
                onClick={() => setShowPasswordResetModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">一時パスワード発行</h4>
                <p className="text-gray-600 text-sm mb-4">新しい一時パスワードを発行します。指導員は次回ログイン時に新しいパスワードを設定する必要があります。</p>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-blue-600"
                  onClick={() => executePasswordReset('temporary')}
                >
                  一時パスワードを発行
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">パスワード変更要求</h4>
                <p className="text-gray-600 text-sm mb-4">指導員に次回ログイン時のパスワード変更を要求します。現在のパスワードは無効になりません。</p>
                <button 
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-orange-600"
                  onClick={() => executePasswordReset('force_change')}
                >
                  パスワード変更を要求
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">現在の状況</h4>
              <p className="text-blue-700 text-sm">
                パスワードリセット要求: {selectedInstructor.passwordResetRequired ? 'あり' : 'なし'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 一時パスワードダイアログ */}
      {showTempPasswordDialog && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">一時パスワード発行完了</h3>
              <p className="text-gray-600 mb-6">
                指導員 <strong>{selectedInstructor.name}</strong> の一時パスワードを発行しました。
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">一時パスワード:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={generatedTempPassword}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 font-mono text-lg text-center"
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 p-2 rounded transition-colors duration-200"
                    onClick={() => navigator.clipboard.writeText(generatedTempPassword)}
                    title="コピー"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>注意:</strong> このパスワードは一度だけ表示されます。指導員に安全に伝達してください。
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTempPassword);
                    alert('パスワードをクリップボードにコピーしました！');
                  }}
                >
                  コピーして閉じる
                </button>
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-600"
                  onClick={() => {
                    setShowTempPasswordDialog(false);
                    setSelectedInstructor(null);
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 指導員追加フォームモーダル */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">新しい指導員を追加</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指導員名:</label>
                <input
                  type="text"
                  name="name"
                  value={newInstructor.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス:</label>
                <input
                  type="email"
                  name="email"
                  value={newInstructor.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学科:</label>
                <input
                  type="text"
                  name="department"
                  value={newInstructor.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事業所(拠点):</label>
                <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg p-2">
                  {facilityLocations.map(location => (
                    <label key={location.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        name="facilityLocationIds"
                        value={location.id}
                        checked={newInstructor.facilityLocationIds.includes(location.id)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setNewInstructor(prev => ({
                            ...prev,
                            facilityLocationIds: checked
                              ? [...prev.facilityLocationIds, value]
                              : prev.facilityLocationIds.filter(id => id !== value)
                          }));
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.organizationName} - {location.type}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">複数の拠点を選択できます</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">初期パスワード:</label>
                <input
                  type="password"
                  name="password"
                  value={newInstructor.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
                >
                  追加
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-600"
                  onClick={() => setShowAddForm(false)}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement; 