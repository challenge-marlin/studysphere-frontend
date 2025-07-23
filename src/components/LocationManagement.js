import React, { useState } from 'react';

const LocationManagement = () => {
  // デフォルトの事業所タイプ
  const [facilityTypes, setFacilityTypes] = useState([
    '就労移行支援事業所',
    '就労継続支援A型事業所',
    '就労継続支援B型事業所',
    '学習塾'
  ]);

  // モック事業所・拠点データ
  const [facilities, setFacilities] = useState([
    {
      id: 'org001',
      name: 'スタディスフィア株式会社',
      type: '株式会社',
      address: '東京都渋谷区神南1-2-3',
      phone: '03-1234-5678',
      offices: [
        {
          id: 'office001',
          name: '東京教育渋谷校',
          type: '就労移行支援事業所',
          address: '東京都渋谷区渋谷1-1-1',
          phone: '03-1234-5678',
          students: 15,
          maxStudents: 20,
          managers: [
            { name: '田中太郎', email: 'tanaka@tokyo-edu.com', department: 'IT学科' },
            { name: '佐々木美咲', email: 'sasaki@tokyo-edu.com', department: 'IT学科' }
          ],
          availableCourses: []
        },
        {
          id: 'office002',
          name: '東京教育新宿校',
          type: '就労継続支援A型事業所',
          address: '東京都新宿区新宿2-2-2',
          phone: '03-2345-6789',
          students: 12,
          maxStudents: 15,
          managers: [
            { name: '佐藤花子', email: 'sato@tokyo-edu.com', department: 'デザイン学科' }
          ],
          availableCourses: []
        },
        {
          id: 'office003',
          name: '東京教育池袋校',
          type: '学習塾',
          address: '東京都豊島区池袋3-3-3',
          phone: '03-3456-7890',
          students: 8,
          maxStudents: 10,
          managers: [
            { name: '鈴木一郎', email: 'suzuki@tokyo-edu.com', department: 'ビジネス学科' }
          ],
          availableCourses: []
        }
      ]
    },
    {
      id: 'org002',
      name: '関西教育グループ',
      type: '学校法人',
      address: '大阪府大阪市北区梅田3-4-5',
      phone: '06-5678-9012',
      offices: [
        {
          id: 'office004',
          name: '関西教育大阪校',
          type: '就労継続支援A型事業所',
          address: '大阪府大阪市北区梅田3-4-5',
          phone: '06-5678-9012',
          students: 18,
          maxStudents: 25,
          managers: [
            { name: '山田次郎', email: 'yamada@kansai-edu.com', department: 'IT学科' },
            { name: '高橋一郎', email: 'takahashi@kansai-edu.com', department: 'IT学科' },
            { name: '中村花子', email: 'nakamura@kansai-edu.com', department: 'デザイン学科' }
          ],
          availableCourses: []
        },
        {
          id: 'office005',
          name: '関西教育難波校',
          type: '就労継続支援B型事業所',
          address: '大阪府大阪市中央区難波5-6-7',
          phone: '06-9012-3456',
          students: 10,
          maxStudents: 12,
          managers: [
            { name: '高橋美咲', email: 'takahashi@kansai-edu.com', department: 'デザイン学科' }
          ],
          availableCourses: []
        },
        {
          id: 'office008',
          name: '関西教育新規校',
          type: '就労移行支援事業所',
          address: '大阪府大阪市天王寺区上本町6-7-8',
          phone: '06-3456-7890',
          students: 0,
          maxStudents: 0,
          managers: [],
          availableCourses: []
        }
      ]
    },
    {
      id: 'org003',
      name: '中部学習センター',
      type: 'NPO法人',
      address: '愛知県名古屋市中区栄1-1-1',
      phone: '052-1234-5678',
      offices: [
        {
          id: 'office006',
          name: '中部学習名古屋校',
          type: '就労移行支援事業所',
          address: '愛知県名古屋市中区栄1-1-1',
          phone: '052-1234-5678',
          students: 20,
          maxStudents: 30,
          managers: [
            { name: '伊藤健太', email: 'ito@chubu-learning.com', department: 'ビジネス学科' },
            { name: '松本恵子', email: 'matsumoto@chubu-learning.com', department: 'ビジネス学科' }
          ],
          availableCourses: []
        },
        {
          id: 'office007',
          name: '中部学習岡崎校',
          type: '学習塾',
          address: '愛知県岡崎市本町2-2-2',
          phone: '0564-1234-5678',
          students: 6,
          maxStudents: 8,
          managers: [
            { name: '渡辺真理', email: 'watanabe@chubu-learning.com', department: 'IT学科' }
          ],
          availableCourses: []
        }
      ]
    },
    {
      id: 'org004',
      name: '',
      type: '個人事業主',
      address: '',
      phone: '',
      offices: [
        {
          id: 'office009',
          name: 'フリーランス学習塾',
          type: '学習塾',
          address: '東京都中野区中野4-4-4',
          phone: '03-4567-8901',
          students: 5,
          maxStudents: 8,
          managers: [
            { name: '小林直子', email: 'kobayashi@freelance.com', department: '個人指導' }
          ],
          availableCourses: []
        },
        {
          id: 'office010',
          name: '個人指導センター',
          type: '就労移行支援事業所',
          address: '東京都杉並区阿佐ヶ谷5-5-5',
          phone: '03-5678-9012',
          students: 0,
          maxStudents: 0,
          managers: [],
          availableCourses: []
        }
      ]
    },
    {
      id: 'org005',
      name: '',
      type: '未分類',
      address: '',
      phone: '',
      offices: [
        {
          id: 'office011',
          name: '独立系教育施設',
          type: 'その他',
          address: '東京都世田谷区三軒茶屋6-6-6',
          phone: '03-6789-0123',
          students: 3,
          maxStudents: 5,
          managers: [
            { name: '中村誠', email: 'nakamura@independent.com', department: '総合教育' }
          ],
          availableCourses: []
        }
      ]
    }
  ]);

  // ソート・フィルタ状態
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showOnlyNoManager, setShowOnlyNoManager] = useState(false);

  const [newFacility, setNewFacility] = useState({
    name: '',
    type: '就労移行支援事業所',
    address: '',
    phone: '',
    contacts: [{ name: '', email: '' }]
  });

  const [newLocation, setNewLocation] = useState({
    facilityId: '',
    name: '',
    address: ''
  });

  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showTypeManagement, setShowTypeManagement] = useState(false);
  const [newFacilityType, setNewFacilityType] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editingFacilityData, setEditingFacilityData] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // 事業所追加用
  const [newOffice, setNewOffice] = useState({
    orgId: '',
    name: '',
    type: facilityTypes[0] || '',
    address: '',
    phone: ''
  });

  // 事業所追加モーダル表示制御
  const [showOfficeForm, setShowOfficeForm] = useState(false);

  // 責任者選択モーダル表示制御
  const [showManagerSelect, setShowManagerSelect] = useState(false);
  const [selectedOfficeForManager, setSelectedOfficeForManager] = useState(null);

  // 編集モーダル表示制御
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOfficeForEdit, setSelectedOfficeForEdit] = useState(null);

  // サンプルユーザーリスト
  const sampleUsers = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', department: 'IT学科' },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', department: 'デザイン学科' },
    { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', department: 'ビジネス学科' },
    { id: 4, name: '高橋美咲', email: 'takahashi@example.com', department: 'IT学科' },
    { id: 5, name: '伊藤健太', email: 'ito@example.com', department: 'ビジネス学科' },
    { id: 6, name: '渡辺真理', email: 'watanabe@example.com', department: 'IT学科' },
    { id: 7, name: '小林直子', email: 'kobayashi@example.com', department: '個人指導' },
    { id: 8, name: '中村誠', email: 'nakamura@example.com', department: '総合教育' }
  ];

  // コースモックデータ（本来は共通管理が望ましいが、ここではローカル定義）
  const mockCourses = [
    { id: 'course001', title: 'オフィスソフトの操作・文書作成' },
    { id: 'course002', title: 'ITリテラシー・AIの基本' },
    { id: 'course003', title: 'SNS運用の基礎・画像生成編集' },
    { id: 'course004', title: 'LP制作(HTML・CSS)' },
    { id: 'course005', title: 'SNS管理代行・LP制作案件対応' },
  ];

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [targetOffice, setTargetOffice] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // 責任者選択ハンドラー
  const handleSelectManager = (office) => {
    setSelectedOfficeForManager(office);
    setShowManagerSelect(true);
  };

  // 編集ハンドラー
  const handleEditOffice = (office) => {
    setSelectedOfficeForEdit(office);
    setShowEditModal(true);
  };

  // 削除ハンドラー
  const handleDeleteOffice = (office) => {
    if (window.confirm(`「${office.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      alert(`「${office.name}」を削除しました。`);
    }
  };

  // 責任者選択確定ハンドラー
  const handleConfirmManagerSelection = (selectedUsers) => {
    alert(`選択された責任者: ${selectedUsers.map(u => u.name).join(', ')}\n「${selectedOfficeForManager.name}」に設定しました。`);
    setShowManagerSelect(false);
    setSelectedOfficeForManager(null);
  };

  // 編集確定ハンドラー
  const handleConfirmEdit = (updatedData) => {
    alert(`「${selectedOfficeForEdit.name}」の情報を更新しました。`);
    setShowEditModal(false);
    setSelectedOfficeForEdit(null);
  };

  // 事業所追加モーダル
  const handleAddOffice = () => {
    if (!newOffice.orgId || !newOffice.name || !newOffice.type) return;
    setFacilities(prev => prev.map(org =>
      org.id === newOffice.orgId
        ? { ...org, offices: [...(org.offices || []), { ...newOffice, id: `office${Date.now()}` }] }
        : org
    ));
    setShowOfficeForm(false);
    setNewOffice({ orgId: '', name: '', type: facilityTypes[0] || '', address: '', phone: '' });
  };

  // ソート機能
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // フィルタリングとソート
  const getFilteredAndSortedFacilities = () => {
    // 事業所をフラットな配列に変換
    let allOffices = [];
    facilities.forEach(org => {
      if (org.offices && org.offices.length > 0) {
        org.offices.forEach(office => {
          allOffices.push({
            ...office,
            organizationName: org.name,
            organizationId: org.id
          });
        });
      }
    });

    // 事業所レベルでフィルタリング
    let filtered = allOffices.filter(office => {
      const matchesSearch = 
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.address.toLowerCase().includes(searchTerm.toLowerCase());
     
      const matchesType = filterType === 'all' || office.type === filterType;
     
      const matchesManager = showOnlyNoManager ? 
        (!office.managers || office.managers.length === 0) : true;
     
      return matchesSearch && matchesType && matchesManager;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'organization':
          aValue = a.organizationName || '';
          bValue = b.organizationName || '';
          break;
        case 'students':
          aValue = a.students || 0;
          bValue = b.students || 0;
          break;
        case 'address':
          aValue = a.address || '';
          bValue = b.address || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // 拠点詳細表示
  const handleViewLocationDetail = (location) => {
    // TODO: 拠点詳細モーダルを実装
    console.log('拠点詳細:', location);
  };

  // 拠点の生徒データを取得（モック）
  const getStudentsByLocation = (locationId) => {
    // モックデータ
    return [
      { id: 1, name: '田中花子', email: 'tanaka@example.com', course: 'ITリテラシー・AIの基本', instructor: '佐藤指導員', progress: 75, status: 'active' },
      { id: 2, name: '山田太郎', email: 'yamada@example.com', course: 'SNS運用の基礎・画像生成編集', instructor: '田中指導員', progress: 45, status: 'active' },
      { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', course: 'LP制作(HTML・CSS)', instructor: '山田指導員', progress: 90, status: 'inactive' }
    ];
  };

  // 事業所タイプ管理
  const handleAddFacilityType = () => {
    if (newFacilityType.trim() && !facilityTypes.includes(newFacilityType.trim())) {
      setFacilityTypes([...facilityTypes, newFacilityType.trim()]);
      setNewFacilityType('');
    }
  };

  const handleRemoveFacilityType = (typeToRemove) => {
    setFacilityTypes(facilityTypes.filter(type => type !== typeToRemove));
  };

  // 連絡先フィールド管理
  const addContactField = () => {
    setNewFacility({
      ...newFacility,
      contacts: [...newFacility.contacts, { name: '', email: '' }]
    });
  };

  const removeContactField = (index) => {
    if (newFacility.contacts.length > 1) {
      const updatedContacts = newFacility.contacts.filter((_, i) => i !== index);
      setNewFacility({
        ...newFacility,
        contacts: updatedContacts
      });
    }
  };

  const updateContact = (index, field, value) => {
    const updatedContacts = [...newFacility.contacts];
    updatedContacts[index][field] = value;
    setNewFacility({
      ...newFacility,
      contacts: updatedContacts
    });
  };

  // 事業所追加
  const handleAddFacility = () => {
    const newFacilityData = {
      id: `facility${Date.now()}`,
      ...newFacility,
      offices: [] // 新しいデータ構造に合わせて初期化
    };
    setFacilities([...facilities, newFacilityData]);
    setNewFacility({
      name: '',
      type: '就労移行支援事業所',
      address: '',
      phone: '',
      contacts: [{ name: '', email: '' }]
    });
    setShowFacilityForm(false);
  };

  // 拠点追加
  const handleAddLocation = () => {
    const facility = facilities.find(f => f.id === newLocation.facilityId);
    if (facility) {
      const newLocationData = {
        id: `location${Date.now()}`,
        name: newLocation.name,
        address: newLocation.address,
        teacherCount: 0,
        studentCount: 0,
        maxStudents: 20
      };
      
      const updatedFacilities = facilities.map(f => 
        f.id === newLocation.facilityId 
          ? { ...f, offices: [...f.offices, newLocationData] }
          : f
      );
      
      setFacilities(updatedFacilities);
      setNewLocation({ facilityId: '', name: '', address: '' });
      setShowLocationForm(false);
    }
  };

  // 拠点編集
  const handleEditLocation = (facilityId, locationId) => {
    const facility = facilities.find(f => f.id === facilityId);
    const location = facility?.offices.find(l => l.id === locationId);
    if (location) {
      setEditingLocation({ facilityId, locationId });
      setEditValues({
        name: location.name,
        address: location.address,
        teacherCount: location.teacherCount,
        studentCount: location.studentCount,
        maxStudents: location.maxStudents
      });
    }
  };

  const handleSaveLocation = (facilityId, locationId) => {
    const updatedFacilities = facilities.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          offices: facility.offices.map(location => 
            location.id === locationId 
              ? { ...location, ...editValues }
              : location
          )
        };
      }
      return facility;
    });
    
    setFacilities(updatedFacilities);
    setEditingLocation(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setEditValues({});
  };

  // 事業所詳細表示
  const handleViewFacilityDetail = (facility) => {
    setSelectedFacility(facility);
  };

  // 事業所編集
  const handleEditFacility = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    if (facility) {
      setEditingFacilityData({ ...facility });
      setSelectedFacility(facility);
    }
  };

  const handleSaveFacility = () => {
    if (editingFacilityData) {
      setFacilities(prev => prev.map(f => 
        f.id === editingFacilityData.id ? editingFacilityData : f
      ));
      setEditingFacilityData(null);
      setSelectedFacility(null);
    }
  };

  const handleCancelFacilityEdit = () => {
    setEditingFacilityData(null);
    setSelectedFacility(null);
  };

  const addContactFieldToEdit = () => {
    if (editingFacilityData) {
      setEditingFacilityData({
        ...editingFacilityData,
        contacts: [...editingFacilityData.contacts, { name: '', email: '' }]
      });
    }
  };

  const removeContactFieldFromEdit = (index) => {
    if (editingFacilityData && editingFacilityData.contacts.length > 1) {
      const newContacts = editingFacilityData.contacts.filter((_, i) => i !== index);
      setEditingFacilityData({
        ...editingFacilityData,
        contacts: newContacts
      });
    }
  };

  const updateContactInEdit = (index, field, value) => {
    if (editingFacilityData) {
      const newContacts = [...editingFacilityData.contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      setEditingFacilityData({
        ...editingFacilityData,
        contacts: newContacts
      });
    }
  };

  // 拠点削除
  const handleDeleteLocation = (locationId) => {
    if (window.confirm('この拠点を削除しますか？')) {
      setFacilities(prev => prev.map(facility => ({
        ...facility,
        offices: facility.offices.filter(office => office.id !== locationId)
      })));
    }
  };

  const totalLocations = facilities.reduce((sum, facility) => sum + (facility.offices ? facility.offices.length : 0), 0);
  const totalTeachers = facilities.reduce((sum, facility) => 
    sum + (facility.offices ? facility.offices.reduce((officeSum, office) => officeSum + (office.managers ? office.managers.length : 0), 0) : 0), 0);
  const totalStudents = facilities.reduce((sum, facility) => 
    sum + (facility.offices ? facility.offices.reduce((officeSum, office) => officeSum + (office.students || 0), 0) : 0), 0);
  const totalMaxStudents = facilities.reduce((sum, facility) => 
    sum + (facility.offices ? facility.offices.reduce((officeSum, office) => officeSum + (office.maxStudents || 0), 0) : 0), 0);

  const filteredFacilities = getFilteredAndSortedFacilities();

  const handleManageCourses = (office) => {
    setTargetOffice(office);
    setSelectedCourses(office.availableCourses || []);
    setShowCourseModal(true);
  };

  const handleCourseCheck = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSaveCourses = () => {
    if (!targetOffice) return;
    setFacilities(prevFacilities =>
      prevFacilities.map(org => ({
        ...org,
        offices: org.offices.map(office =>
          office.id === targetOffice.id
            ? { ...office, availableCourses: selectedCourses }
            : office
        )
      }))
    );
    setShowCourseModal(false);
    setTargetOffice(null);
    setSelectedCourses([]);
  };

  const handleCancelCourses = () => {
    setShowCourseModal(false);
    setTargetOffice(null);
    setSelectedCourses([]);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-red-800 mb-6">事業所(拠点)管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="bg-white border-2 border-red-200 rounded-xl p-6 text-center transition-all duration-300 hover:border-red-400 hover:shadow-lg">
            <h3 className="text-red-800 font-medium mb-2">総生徒数</h3>
            <p className="text-3xl font-bold text-red-600">{totalStudents} / {totalMaxStudents}</p>
            <small className="text-red-600">使用率: {Math.round((totalStudents/totalMaxStudents)*100)}%</small>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-red-700"
          onClick={() => setShowOfficeForm(true)}
          disabled={facilities.length === 0}
        >
          + 事業所を追加
        </button>
        <button 
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-700"
          onClick={() => setShowTypeManagement(true)}
        >
          📝 事業所タイプ管理
        </button>
      </div>

      {/* 検索・フィルタセクション */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="事業所名、組織名、または住所で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors duration-300"
            />
          </div>
          <div className="md:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 transition-colors duration-300"
            >
              <option value="all">すべての事業所タイプ</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showOnlyNoManager}
              onChange={(e) => setShowOnlyNoManager(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span>責任者不在の事業所のみ表示</span>
          </label>
          {(searchTerm || filterType !== 'all' || showOnlyNoManager) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setShowOnlyNoManager(false);
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              フィルターをクリア
            </button>
          )}
        </div>
      </div>

      {/* 検索結果件数表示 */}
      {(searchTerm || filterType !== 'all' || showOnlyNoManager) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            検索結果: <span className="font-semibold">{filteredFacilities.reduce((sum, org) => sum + (org.offices ? org.offices.length : 0), 0)}</span>件
            {searchTerm && <span> (検索語: "{searchTerm}")</span>}
            {filterType !== 'all' && <span> (タイプ: "{filterType}")</span>}
            {showOnlyNoManager && <span> (責任者不在: "はい")</span>}
          </p>
        </div>
      )}

      {/* 事業所リスト（テーブル形式） */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">事業所名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">事業所タイプ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">組織名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">住所</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">電話番号</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">生徒数</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">責任者</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* フィルターされた事業所を直接表示 */}
              {filteredFacilities.map((office) => (
                <tr key={office.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                  !office.managers || office.managers.length === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                }`}>
                  <td className="px-6 py-4">{office.name}</td>
                  <td className="px-6 py-4">{office.type}</td>
                  <td className="px-6 py-4">
                    <strong className="text-gray-800">{office.organizationName || <span className="text-gray-500 italic">組織名なし</span>}</strong>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{office.address}</td>
                  <td className="px-6 py-4 text-gray-600">{office.phone}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {office.students || 0} / {office.maxStudents || 0}
                  </td>
                  <td className="px-6 py-4">
                    {office.managers && office.managers.length > 0 ? (
                      <div className="space-y-1">
                        {office.managers.map((manager, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-gray-800">{manager.name}</span>
                            <span className="text-gray-500">（{manager.email}）</span>
                            {manager.department && (
                              <span className="text-xs text-gray-400 ml-1">- {manager.department}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-red-600 font-medium flex items-center gap-1">
                        ⚠️ 責任者未設定
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSelectManager(office)}
                        className="bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:shadow-md flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        責任者選択
                      </button>
                      <button 
                        onClick={() => handleManageCourses(office)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-md flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" />
                        </svg>
                        コース管理
                      </button>
                      <button 
                        onClick={() => handleEditOffice(office)}
                        className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-emerald-600 hover:shadow-md flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                      </button>
                      <button 
                        onClick={() => handleDeleteOffice(office)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-md flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">検索条件に一致する事業所が見つかりませんでした。</p>
        </div>
      )}

      {/* 事業所タイプ管理モーダル */}
      {showTypeManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">事業所タイプ管理</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">現在の事業所タイプ</h4>
              <div className="space-y-2">
                {facilityTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{type}</span>
                    <button 
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                      onClick={() => handleRemoveFacilityType(type)}
                      disabled={facilityTypes.length <= 1}
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">新しい事業所タイプを追加</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="新しい事業所タイプ名"
                  value={newFacilityType}
                  onChange={(e) => setNewFacilityType(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
                <button 
                  onClick={handleAddFacilityType}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold transition-colors duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  追加
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => setShowTypeManagement(false)} 
                className="flex-1 bg-gray-100 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {showFacilityForm && (
        <div className="form-modal">
          <div className="form-content facility-form">
            <h3>新しい事業所を追加</h3>
            
            <input
              type="text"
              placeholder="事業所名"
              value={newFacility.name}
              onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
            />
            
            <select
              value={newFacility.type}
              onChange={(e) => setNewFacility({...newFacility, type: e.target.value})}
            >
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="住所"
              value={newFacility.address}
              onChange={(e) => setNewFacility({...newFacility, address: e.target.value})}
            />
            
            <input
              type="text"
              placeholder="電話番号"
              value={newFacility.phone}
              onChange={(e) => setNewFacility({...newFacility, phone: e.target.value})}
            />

            {/* 担当者情報 */}
            <div className="contacts-section">
              <div className="contacts-header">
                <h4>担当者情報</h4>
                <button 
                  type="button"
                  className="add-contact-btn"
                  onClick={addContactField}
                >
                  + 担当者を追加
                </button>
              </div>
              
              {newFacility.contacts.map((contact, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-inputs">
                    <input
                      type="text"
                      placeholder="担当者名"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                    />
                    {newFacility.contacts.length > 1 && (
                      <button 
                        type="button"
                        className="remove-contact-btn"
                        onClick={() => removeContactField(index)}
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button onClick={handleAddFacility}>追加</button>
              <button onClick={() => setShowFacilityForm(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {showLocationForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>新しい拠点を追加</h3>
            <select
              value={newLocation.facilityId}
              onChange={(e) => setNewLocation({...newLocation, facilityId: e.target.value})}
            >
              <option value="">事業所を選択</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="拠点名"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="住所"
              value={newLocation.address}
              onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
            />
            <div className="form-actions">
              <button onClick={handleAddLocation}>追加</button>
              <button onClick={() => setShowLocationForm(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 事業所詳細・編集モーダル */}
      {editingLocation && (
        <div className="modal-overlay">
          <div className="facility-detail-modal">
            <div className="modal-header">
              <h3>{editingLocation.facilityId === editingLocation.locationId ? '事業所編集' : '拠点編集'} - {editingLocation.facilityName}</h3>
              <button 
                className="close-button"
                onClick={handleCancelEdit}
              >
                ×
              </button>
            </div>
            
            <div className="detail-content">
              {editingLocation.facilityId === editingLocation.locationId ? (
                // 事業所編集フォーム
                <div className="edit-form">
                  <div className="form-section">
                    <h4>基本情報</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>事業所名 *</label>
                        <input
                          type="text"
                          value={editingFacilityData.name || ''}
                          onChange={(e) => setEditingFacilityData({
                            ...editingFacilityData,
                            name: e.target.value
                          })}
                          placeholder="事業所名"
                        />
                      </div>
                      <div className="form-group">
                        <label>事業所タイプ *</label>
                        <select
                          value={editingFacilityData.type || ''}
                          onChange={(e) => setEditingFacilityData({
                            ...editingFacilityData,
                            type: e.target.value
                          })}
                        >
                          {facilityTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>住所 *</label>
                        <input
                          type="text"
                          value={editingFacilityData.address || ''}
                          onChange={(e) => setEditingFacilityData({
                            ...editingFacilityData,
                            address: e.target.value
                          })}
                          placeholder="住所"
                        />
                      </div>
                      <div className="form-group">
                        <label>電話番号</label>
                        <input
                          type="text"
                          value={editingFacilityData.phone || ''}
                          onChange={(e) => setEditingFacilityData({
                            ...editingFacilityData,
                            phone: e.target.value
                          })}
                          placeholder="電話番号"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="section-header">
                      <h4>担当者情報</h4>
                      <button 
                        type="button"
                        className="add-contact-btn"
                        onClick={addContactFieldToEdit}
                      >
                        + 担当者を追加
                      </button>
                    </div>
                    
                    {editingFacilityData.contacts && editingFacilityData.contacts.map((contact, index) => (
                      <div key={index} className="contact-edit-item">
                        <div className="contact-inputs">
                          <input
                            type="text"
                            placeholder="担当者名"
                            value={contact.name || ''}
                            onChange={(e) => updateContactInEdit(index, 'name', e.target.value)}
                          />
                          <input
                            type="email"
                            placeholder="メールアドレス"
                            value={contact.email || ''}
                            onChange={(e) => updateContactInEdit(index, 'email', e.target.value)}
                          />
                          {editingFacilityData.contacts.length > 1 && (
                            <button 
                              type="button"
                              className="remove-contact-btn"
                              onClick={() => removeContactFieldFromEdit(index)}
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-section">
                    <h4>拠点情報</h4>
                    <div className="locations-summary">
                      <p>拠点数: {selectedFacility.offices.length}拠点</p>
                      <div className="locations-list">
                        {selectedFacility.offices.map(location => (
                          <div key={location.id} className="location-summary-item">
                            <span className="location-name">{location.name}</span>
                            <span className="location-stats">
                              👨‍🏫 {location.teacherCount}人 / 👥 {location.studentCount}/{location.maxStudents}人
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="save-btn"
                      onClick={handleSaveFacility}
                    >
                      保存
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelFacilityEdit}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 拠点編集フォーム
                <div className="edit-form">
                  <div className="form-section">
                    <h4>拠点基本情報</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>拠点名 *</label>
                        <input
                          type="text"
                          value={editValues.name || ''}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="拠点名"
                        />
                      </div>
                      <div className="form-group">
                        <label>住所 *</label>
                        <input
                          type="text"
                          value={editValues.address || ''}
                          onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                          placeholder="住所"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>最大生徒数 *</label>
                        <input
                          type="number"
                          value={editValues.maxStudents || ''}
                          onChange={(e) => setEditValues({ ...editValues, maxStudents: parseInt(e.target.value) || 0 })}
                          placeholder="最大生徒数"
                        />
                      </div>
                      <div className="form-group">
                        <label>現在の生徒数 *</label>
                        <input
                          type="number"
                          value={editValues.studentCount || ''}
                          onChange={(e) => setEditValues({ ...editValues, studentCount: parseInt(e.target.value) || 0 })}
                          placeholder="現在の生徒数"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>現在の指導員数 *</label>
                        <input
                          type="number"
                          value={editValues.teacherCount || ''}
                          onChange={(e) => setEditValues({ ...editValues, teacherCount: parseInt(e.target.value) || 0 })}
                          placeholder="現在の指導員数"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveLocation(editingLocation.facilityId, editingLocation.locationId)}
                    >
                      保存
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 拠点詳細モーダル */}
      {editingLocation && (
        <div className="modal-overlay">
          <div className="location-detail-modal">
            <div className="modal-header">
              <h3>{editingLocation.facilityName} - 詳細情報</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setEditingLocation(null);
                  setEditValues({});
                }}
              >
                ×
              </button>
            </div>
            
            <div className="detail-content">
              {/* 拠点基本情報 */}
              <div className="detail-section">
                <h4>📍 基本情報</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>拠点名:</label>
                    <span>{editingLocation.name}</span>
                  </div>
                  <div className="info-item">
                    <label>事業所:</label>
                    <span>{editingLocation.facilityName}</span>
                  </div>
                  <div className="info-item">
                    <label>住所:</label>
                    <span>{editingLocation.address}</span>
                  </div>
                  <div className="info-item">
                    <label>電話番号:</label>
                    <span>{editingLocation.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>最大生徒数:</label>
                    <span>{editingLocation.maxStudents}名</span>
                  </div>
                  <div className="info-item">
                    <label>現在の生徒数:</label>
                    <span>{getStudentsByLocation(editingLocation.locationId).length}名</span>
                  </div>
                </div>
              </div>

              {/* 生徒一覧 */}
              <div className="detail-section">
                <h4>👥 生徒一覧 ({getStudentsByLocation(editingLocation.locationId).length}名)</h4>
                {getStudentsByLocation(editingLocation.locationId).length > 0 ? (
                  <div className="students-table-container">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>生徒名</th>
                          <th>メールアドレス</th>
                          <th>コース</th>
                          <th>担当指導員</th>
                          <th>進捗</th>
                          <th>ステータス</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getStudentsByLocation(editingLocation.locationId).map(student => (
                          <tr key={student.id} className={`student-row ${student.status}`}>
                            <td className="student-name">{student.name}</td>
                            <td className="student-email">{student.email}</td>
                            <td className="student-course">{student.course}</td>
                            <td className="student-instructor">{student.instructor}</td>
                            <td className="student-progress">
                              <div className="progress-info">
                                <span>{student.progress}%</span>
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill"
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="student-status">
                              <span className={`status-badge ${student.status}`}>
                                {student.status === 'active' ? 'アクティブ' : '非アクティブ'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-students">
                    <p>この拠点には現在生徒が登録されていません。</p>
                  </div>
                )}
              </div>

              {/* 統計情報 */}
              <div className="detail-section">
                <h4>📊 統計情報</h4>
                <div className="stats-row">
                  <div className="stat-item">
                    <span className="stat-label">稼働率:</span>
                    <span className="stat-value">
                      {Math.round((getStudentsByLocation(editingLocation.locationId).length / editingLocation.maxStudents) * 100)}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">アクティブ生徒:</span>
                    <span className="stat-value">
                      {getStudentsByLocation(editingLocation.locationId).filter(s => s.status === 'active').length}名
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">平均進捗:</span>
                    <span className="stat-value">
                      {getStudentsByLocation(editingLocation.locationId).length > 0 
                        ? Math.round(getStudentsByLocation(editingLocation.locationId).reduce((sum, s) => sum + s.progress, 0) / getStudentsByLocation(editingLocation.locationId).length)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOfficeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">事業所追加</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddOffice(); }}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">組織 *</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" value={newOffice.orgId} onChange={e => setNewOffice({ ...newOffice, orgId: e.target.value })} required>
                  <option value="">選択してください</option>
                  {facilities.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">事業所名 *</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" value={newOffice.name} onChange={e => setNewOffice({ ...newOffice, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">事業所タイプ *</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" value={newOffice.type} onChange={e => setNewOffice({ ...newOffice, type: e.target.value })} required>
                  {facilityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">住所</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" value={newOffice.address} onChange={e => setNewOffice({ ...newOffice, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">電話番号</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" value={newOffice.phone} onChange={e => setNewOffice({ ...newOffice, phone: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowOfficeForm(false)} className="flex-1 bg-gray-100 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg font-semibold">キャンセル</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold">追加</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 責任者選択モーダル */}
      {showManagerSelect && selectedOfficeForManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">責任者選択</h3>
              <button 
                onClick={() => setShowManagerSelect(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">事業所: <span className="font-semibold text-gray-800">{selectedOfficeForManager.name}</span></p>
              <p className="text-sm text-gray-500">複数の責任者を選択できます</p>
            </div>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {sampleUsers.map(user => (
                <label key={user.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.department}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowManagerSelect(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleConfirmManagerSelection([sampleUsers[0], sampleUsers[1]])}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-300"
              >
                選択確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && selectedOfficeForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">事業所編集</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事業所名</label>
                <input
                  type="text"
                  defaultValue={selectedOfficeForEdit.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事業所タイプ</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400">
                  {facilityTypes.map(type => (
                    <option key={type} value={type} selected={type === selectedOfficeForEdit.type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  defaultValue={selectedOfficeForEdit.address}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  defaultValue={selectedOfficeForEdit.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大生徒数</label>
                <input
                  type="number"
                  defaultValue={selectedOfficeForEdit.maxStudents}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleConfirmEdit({})}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* コース管理モーダル */}
      {showCourseModal && targetOffice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">コース管理 - {targetOffice.name}</h3>
            <div className="mb-6 space-y-2">
              {mockCourses.map(course => (
                <label key={course.id} className="flex items-center gap-3 p-2 border-b border-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleCourseCheck(course.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-800">{course.title}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={handleCancelCourses} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold">キャンセル</button>
              <button onClick={handleSaveCourses} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement; 