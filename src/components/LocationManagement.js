import React, { useState, useEffect } from 'react';
import SanitizedInput from './SanitizedInput';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';
import { apiGet, apiPut } from '../utils/api';
// import { fetch } from '../utils/httpInterceptor'; // 一時的に無効化

const LocationManagement = () => {
  // 事業所タイプ（DBから取得）
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [facilityTypesData, setFacilityTypesData] = useState([]); // IDとタイプ名の両方を保持
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [alertShown, setAlertShown] = useState(false); // アラート表示済みフラグ

  // 企業一覧（DBから取得）
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // 管理者情報（DBから取得）
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);

  // 拠点に所属する指導者情報（DBから取得）
  const [satelliteInstructors, setSatelliteInstructors] = useState({});
  const [instructorsLoading, setInstructorsLoading] = useState(false);

  // 管理者情報取得
  const fetchManagers = async () => {
    try {
      setManagersLoading(true);
      console.log('管理者情報取得開始');
      
      const response = await fetch('http://localhost:5000/api/users');
      console.log('管理者情報取得レスポンス:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('管理者情報取得エラー詳細:', errorText);
        setManagers([]); // 空配列を設定
        return;
      }
      
      const data = await response.json();
      console.log('管理者情報取得成功:', data);
      setManagers(data);
    } catch (err) {
      console.error('管理者情報取得エラー:', err);
      setManagers([]); // エラー時も空配列を設定
    } finally {
      setManagersLoading(false);
    }
  };

    // 拠点に所属する指導者情報取得
  const fetchSatelliteInstructors = async (satelliteId) => {
    if (!satelliteId) {
      console.error('拠点IDが未定義です');
      return;
    }
    
    try {
      setInstructorsLoading(true);
      console.log(`拠点ID ${satelliteId} の指導者情報取得開始`);
      
      // 常に代替方法を使用（全ユーザーから拠点の指導員をフィルタリング）
      console.log('全ユーザーから拠点の指導員を抽出します');
      const allUsersResponse = await fetch('http://localhost:5000/api/users');
      if (allUsersResponse.ok) {
        const allUsers = await allUsersResponse.json();
        console.log('全ユーザー取得成功:', allUsers.length, '件');
        console.log('全ユーザーの詳細:', allUsers);
        
        // 指導員（ロール4、5）を抽出
        const allInstructors = allUsers.filter(user => user.role >= 4 && user.role <= 5);
        console.log('全指導員:', allInstructors);
        
        // 拠点に所属する指導員を抽出
        const instructorsInSatellite = allInstructors.filter(user => {
          console.log(`ユーザー ${user.name} (ID: ${user.id}) のsatellite_ids:`, user.satellite_ids);
          
          if (!user.satellite_ids) {
            console.log(`ユーザー ${user.name} のsatellite_idsがnull/undefined`);
            return false;
          }
          
          const hasSatellite = Array.isArray(user.satellite_ids) 
            ? user.satellite_ids.includes(satelliteId.toString())
            : user.satellite_ids === satelliteId.toString();
          
          console.log(`ユーザー ${user.name} が拠点${satelliteId}に所属:`, hasSatellite);
          return hasSatellite;
        });
        
        console.log(`拠点${satelliteId}の指導員（全ユーザーから抽出）:`, instructorsInSatellite);
        
        setSatelliteInstructors(prev => {
          const newState = { ...prev, [satelliteId]: instructorsInSatellite };
          console.log('設定後のsatelliteInstructors:', newState);
          return newState;
        });
      } else {
        console.error('全ユーザー取得失敗:', allUsersResponse.status);
        setSatelliteInstructors(prev => ({ ...prev, [satelliteId]: [] }));
      }
    } catch (err) {
      console.error('指導者情報取得エラー:', err);
      console.error('エラースタック:', err.stack);
      setSatelliteInstructors(prev => ({ ...prev, [satelliteId]: [] }));
    } finally {
      setInstructorsLoading(false);
    }
  };

  // 管理者IDから管理者名を取得する関数
  const getManagerNames = (managerIds) => {
    if (!managerIds || managerIds.length === 0) {
      return [];
    }
    
    // managerIdsが文字列の場合は配列に変換
    const ids = Array.isArray(managerIds) ? managerIds : [managerIds];
    
    // まず拠点に所属する指導者から検索
    const allInstructors = Object.values(satelliteInstructors || {}).flat().filter(instructor => instructor && typeof instructor === 'object');
    const instructorNames = ids.map(id => {
      if (!id) return null;
      const instructor = allInstructors.find(i => i && i.id === id);
      return instructor && instructor.name ? instructor.name : null;
    }).filter(name => name !== null);
    
    // 指導者に見つからない場合は管理者から検索
    const remainingIds = ids.filter(id => id && !allInstructors.find(i => i && i.id === id));
    const managerNames = remainingIds.map(id => {
      if (!id) return null;
      const manager = managers.find(m => m && m.id === id);
      return manager && manager.name ? manager.name : `ID: ${id}`;
    }).filter(name => name !== null);
    
    return [...instructorNames, ...managerNames];
  };

  // 拠点に所属する指導者を取得する関数
  const getSatelliteInstructors = (satelliteId) => {
    if (!satelliteId) {
      console.log('拠点IDが未定義です');
      return [];
    }
    console.log(`拠点 ${satelliteId} の指導者取得開始`);
    console.log('現在のsatelliteInstructors:', satelliteInstructors);
    console.log('satelliteInstructorsの型:', typeof satelliteInstructors);
    console.log('satelliteInstructors[satelliteId]:', satelliteInstructors && satelliteInstructors[satelliteId]);
    
    const instructors = (satelliteInstructors && satelliteInstructors[satelliteId]) || [];
    console.log(`拠点 ${satelliteId} の指導者取得結果:`, instructors);
    console.log('instructorsの型:', typeof instructors);
    console.log('instructorsが配列か:', Array.isArray(instructors));
    
    const result = Array.isArray(instructors) ? instructors : [];
    console.log(`拠点 ${satelliteId} の最終結果:`, result);
    return result;
  };

  // 事業所タイプ取得
  const fetchOfficeTypes = async () => {
    try {
      setLoading(true);
      console.log('事業所タイプ取得開始...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:5000/api/office-types', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('レスポンスステータス:', response.status);
      console.log('レスポンスヘッダー:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('レスポンスエラー:', errorText);
        throw new Error(`事業所タイプの取得に失敗しました (${response.status})`);
      }
      
      const data = await response.json();
      console.log('取得したデータ:', data);
      setFacilityTypesData(data); // 完全なデータを保持
      setFacilityTypes(data.map(item => item.type)); // 表示用のタイプ名のみ
      setError(null);
    } catch (err) {
      console.error('事業所タイプ取得エラー:', err);
      if (err.name === 'AbortError') {
        setError('リクエストがタイムアウトしました。バックエンドサーバーが起動しているか確認してください。');
        showNotification('リクエストがタイムアウトしました。バックエンドサーバーが起動しているか確認してください。', 'error');
      } else {
              setError(err.message);
      showNotification('事業所タイプの取得に失敗しました。事業所タイプ管理から追加してください。', 'error');
    }
    // エラー時はデフォルト値を設定
    setFacilityTypes(['就労移行支援事業所', '就労継続支援A型', '就労継続支援B型']);
    setFacilityTypesData([
      { id: 1, type: '就労移行支援事業所' },
      { id: 2, type: '就労継続支援A型' },
      { id: 3, type: '就労継続支援B型' }
    ]);
    } finally {
      setLoading(false);
    }
  };

  // 企業一覧取得
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      console.log('企業一覧取得開始');
      
      const response = await fetch('http://localhost:5000/api/companies');
      console.log('企業一覧取得レスポンス:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('企業一覧取得エラー詳細:', errorText);
        console.warn('企業一覧の取得に失敗しましたが、新規組織作成で対応可能です');
        setCompanies([]); // 空配列を設定
        return;
      }
      
      const data = await response.json();
      console.log('企業一覧取得成功:', data);
      setCompanies(data);
      
      // satellitesデータも取得
      await fetchSatellites();
    } catch (err) {
      console.error('企業一覧取得エラー:', err);
      console.warn('企業一覧の取得に失敗しましたが、新規組織作成で対応可能です');
      setCompanies([]); // エラー時も空配列を設定
    } finally {
      setCompaniesLoading(false);
    }
  };

  // 事業所の有効期限をチェックしてアラートを表示
  const checkExpirationAlerts = (satellites) => {
    // 既にアラートを表示済みの場合はスキップ
    if (alertShown) return;
    
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14); // 2週間後
    
    const expiringSoon = satellites.filter(satellite => {
      if (!satellite.token_expiry) return false;
      
      const expiryDate = new Date(satellite.token_expiry);
      return expiryDate <= twoWeeksFromNow && expiryDate > new Date(); // 2週間以内でまだ有効
    });
    
    if (expiringSoon.length > 0) {
      const facilityNames = expiringSoon.map(s => s.name || s.facility_name || '不明な事業所').join(', ');
      const alertMessage = `以下の事業所の有効期限が2週間以内に切れます：\n${facilityNames}`;
      
      // アラートを表示
      setTimeout(() => {
        alert(alertMessage);
        setAlertShown(true); // アラート表示済みフラグを設定
      }, 1000); // 1秒後に表示（ページ読み込み完了後）
    }
  };

  // satellitesデータ取得
  const fetchSatellites = async () => {
    try {
      console.log('satellites一覧取得開始');
      
      const response = await fetch('http://localhost:5000/api/satellites');
      console.log('satellites一覧取得レスポンス:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('satellites一覧取得エラー詳細:', errorText);
        setFacilities([]); // 空配列を設定
        return;
      }
      
      const data = await response.json();
      console.log('satellites一覧取得成功:', data);
      
      // satellitesデータをfacilitiesとして設定
      if (Array.isArray(data)) {
        setFacilities(data);
        // 有効期限チェックを実行
        checkExpirationAlerts(data);
      } else {
        console.warn('satellitesデータが配列ではありません:', data);
        setFacilities([]);
      }
    } catch (err) {
      console.error('satellites一覧取得エラー:', err);
      setFacilities([]); // エラー時も空配列を設定
    }
  };

  // 事業所タイプ追加
  const addOfficeType = async (typeName) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト
      
      const response = await fetch('http://localhost:5000/api/office-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: typeName }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '事業所タイプの追加に失敗しました');
      }

      // 成功時は一覧を再取得
      await fetchOfficeTypes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('事業所タイプ追加エラー:', err);
      if (err.name === 'AbortError') {
        return { success: false, message: 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。' };
      }
      return { success: false, message: err.message };
    }
  };

  // 事業所タイプ削除
  const deleteOfficeType = async (typeName) => {
    try {
      // タイプ名からIDを取得
      const typeData = facilityTypesData.find(item => item.type === typeName);
      if (!typeData) {
        throw new Error('削除対象の事業所タイプが見つかりません');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

      const response = await fetch(`http://localhost:5000/api/office-types/${typeData.id}`, {
        method: 'DELETE',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('削除レスポンスエラー:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '事業所タイプの削除に失敗しました');
      }

      // 成功時は一覧を再取得
      await fetchOfficeTypes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('事業所タイプ削除エラー:', err);
      if (err.name === 'AbortError') {
        return { success: false, message: 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。' };
      }
      return { success: false, message: err.message };
    }
  };

  // バックエンドサーバーの接続確認
  const checkBackendConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:5000/', { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('バックエンド接続エラー:', error);
      return false;
    }
  };

  // 初期データ取得
  useEffect(() => {
    // アラート表示済みフラグをリセット
    setAlertShown(false);
    
    const initializeData = async () => {
      const isBackendAvailable = await checkBackendConnection();
      if (isBackendAvailable) {
        console.log('バックエンドサーバーに接続できました');
        fetchOfficeTypes();
        fetchCompanies();
        fetchManagers();
      } else {
        console.error('バックエンドサーバーに接続できません');
        showNotification('バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。', 'error');
        setError('バックエンドサーバーに接続できません');
        // バックエンドが利用できない場合は空の配列を設定
        setFacilityTypes([]);
        setFacilityTypesData([]);
        setCompanies([]);
        setManagers([]);
      }
    };
    
    initializeData();
  }, []);

  // 事業所追加モーダル表示制御
  const [showOfficeForm, setShowOfficeForm] = useState(false);

  // 事業所・拠点データ（バックエンドから取得）
  const [facilities, setFacilities] = useState([]);

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

  // 事業所追加用（DB連携版）
  const [newOffice, setNewOffice] = useState({
    company_id: '',
    name: '',
    address: '',
    phone: '',
    office_type_id: '',
    contract_type: '30days',
    max_users: 10
  });

  // 新規組織入力用
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone: ''
  });

  // 責任者選択モーダル表示制御
  const [showManagerSelect, setShowManagerSelect] = useState(false);
  const [selectedOfficeForManager, setSelectedOfficeForManager] = useState(null);
  const [selectedManagers, setSelectedManagers] = useState([]);

  // 編集モーダル表示制御
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOfficeForEdit, setSelectedOfficeForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // 拠点に所属する指導者リスト（責任者選択用）
  const getAvailableInstructors = () => {
    console.log('getAvailableInstructors が呼び出されました');
    console.log('selectedOfficeForManager:', selectedOfficeForManager);
    
    if (!selectedOfficeForManager || !selectedOfficeForManager.id) {
      console.log('選択された拠点が未定義です');
      return [];
    }
    
    console.log(`拠点 ${selectedOfficeForManager.id} の指導者を取得します`);
    const instructors = getSatelliteInstructors(selectedOfficeForManager.id);
    console.log(`拠点 ${selectedOfficeForManager.id} の利用可能な指導者:`, instructors);
    console.log('instructorsの長さ:', instructors.length);
    
    const result = Array.isArray(instructors) ? instructors : [];
    console.log('最終的な利用可能な指導者:', result);
    return result;
  };

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
  const [allCourses, setAllCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseError, setCourseError] = useState(null);

  const [addOfficeLoading, setAddOfficeLoading] = useState(false);
  const [tokenModal, setTokenModal] = useState({ show: false, token: '', expiry: '' });
  const [showOfficeTypeModal, setShowOfficeTypeModal] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showCompanyTokenModal, setShowCompanyTokenModal] = useState({ show: false, company: null });

  // 責任者選択ハンドラー
  const handleSelectManager = async (office) => {
    if (!office || !office.id) {
      console.error('拠点情報が不正です:', office);
      return;
    }
    
    setSelectedOfficeForManager(office);
    
    // 既存の管理者IDを選択状態に設定
    const existingManagerIds = office.manager_ids || [];
    setSelectedManagers(existingManagerIds);
    
    setShowManagerSelect(true);
    
    // 拠点に所属する指導者情報を取得（最新データを取得するためキャッシュをクリア）
    setSatelliteInstructors(prev => ({ ...prev, [office.id]: undefined }));
    await fetchSatelliteInstructors(office.id);
  };

  // 編集ハンドラー
  const handleEditOffice = (office) => {
    setSelectedOfficeForEdit(office);
    setEditFormData({
      name: office.name,
      address: office.address || '',
      phone: office.phone || '',
      office_type_id: office.office_type_name || office.office_type_id || '',
      max_users: office.max_users || 10,
      token_expiry_at: office.token_expiry_at || ''
    });
    setShowEditModal(true);
  };

  // 削除ハンドラー
  const handleDeleteOffice = (office) => {
    if (window.confirm(`「${office.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      alert(`「${office.name}」を削除しました。`);
    }
  };

  // 責任者選択確定ハンドラー
  const handleConfirmManagerSelection = async (selectedUsers) => {
    if (!selectedUsers || !Array.isArray(selectedUsers)) {
      console.error('選択されたユーザーが不正です:', selectedUsers);
      return;
    }
    
    if (!selectedOfficeForManager || !selectedOfficeForManager.id) {
      console.error('選択された拠点が不正です:', selectedOfficeForManager);
      return;
    }
    
    try {
      // 選択されたユーザーのID配列を作成
      const selectedManagerIds = selectedUsers.map(user => user.id);
      
      console.log('管理者更新リクエスト:', {
        satelliteId: selectedOfficeForManager.id,
        managerIds: selectedManagerIds
      });
      
      // バックエンドAPIに管理者更新リクエストを送信
      const response = await fetch(`http://localhost:5000/api/satellites/${selectedOfficeForManager.id}/managers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manager_ids: selectedManagerIds
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '管理者の更新に失敗しました');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '管理者の更新に失敗しました');
      }
      
      const userNames = selectedUsers.map(u => u && u.name ? u.name : '不明').join(', ');
      const officeName = selectedOfficeForManager.name;
      
      showNotification(`「${officeName}」の責任者を更新しました: ${userNames}`, 'success');
      
      // 拠点一覧を再取得
      await fetchSatellites();
      
      setShowManagerSelect(false);
      setSelectedOfficeForManager(null);
      setSelectedManagers([]); // 選択状態をリセット
      
    } catch (error) {
      console.error('管理者更新エラー:', error);
      showNotification(error.message, 'error');
    }
  };

  // 編集確定ハンドラー
  const handleConfirmEdit = async () => {
    try {
      // 有効期限の日時形式を適切に処理
      const updateData = { ...editFormData };
      if (updateData.token_expiry_at) {
        // 日本時間として送信（バックエンドでUTCに変換される）
        updateData.token_expiry_at = new Date(updateData.token_expiry_at).toISOString();
      }

      const response = await fetch(`http://localhost:5000/api/satellites/${selectedOfficeForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '事業所情報の更新に失敗しました');
      }

      showNotification(`「${selectedOfficeForEdit.name}」の情報を更新しました。`, 'success');
      setShowEditModal(false);
      setSelectedOfficeForEdit(null);
      setEditFormData({});
      
      // 拠点一覧を再取得
      await fetchSatellites();
    } catch (error) {
      console.error('事業所情報更新エラー:', error);
      showNotification(error.message, 'error');
    }
  };

  // 事業所追加モーダル（DB連携版）
  const handleAddOffice = async () => {
    console.log('handleAddOffice called'); // デバッグログ追加
    // バリデーション
    if (isNewCompany) {
      if (!newCompany.name.trim()) {
        showNotification('新規組織の必須項目を入力してください', 'error');
        return;
      }
    } else {
      // 企業一覧が空の場合は新規組織作成に切り替え
      if (companies.length === 0) {
        setIsNewCompany(true);
        showNotification('組織が登録されていないため、新規組織作成に切り替えました', 'info');
        return;
      }
      
      if (!newOffice.company_id || !newOffice.name.trim() || !newOffice.office_type_id || !newOffice.contract_type || !newOffice.max_users) {
        showNotification('必須項目を入力してください', 'error');
        return;
      }
    }
    
    // 事業所情報のバリデーション
    if (!newOffice.name.trim() || !newOffice.office_type_id || !newOffice.contract_type || !newOffice.max_users) {
      showNotification('事業所情報の必須項目を入力してください', 'error');
      return;
    }
    
    setAddOfficeLoading(true);
    try {
      let companyId = newOffice.company_id;
      // 新規組織の場合、まず組織を作成
      if (isNewCompany) {
        // 空の値を適切に処理
        const companyData = {
          name: newCompany.name.trim(),
          address: newCompany.address?.trim() || null,
          phone: newCompany.phone?.trim() || null
        };
        
        console.log('新規組織作成データ:', companyData);
        console.log('送信データの詳細:', {
          name: companyData.name,
          address: companyData.address,
          phone: companyData.phone,
          office_type_id: newCompany.office_type_id || null,
          phoneType: typeof companyData.phone,
          officeTypeIdType: typeof newCompany.office_type_id
        });
        const companyResponse = await fetch('http://localhost:5000/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        });
        const companyResult = await companyResponse.json();
        console.log('組織作成レスポンス:', companyResult);
        if (!companyResult.success) {
          // バリデーションエラーの詳細を表示
          if (companyResult.errors && companyResult.errors.length > 0) {
            const errorMessages = companyResult.errors.map(err => err.msg).join(', ');
            throw new Error(`組織の作成に失敗しました: ${errorMessages}`);
          }
          throw new Error(companyResult.message || companyResult.error || '組織の作成に失敗しました');
        }
        companyId = companyResult.data.id;
        showNotification('組織が正常に作成されました', 'success');
        await fetchCompanies();
      }
      
      // 拠点データを作成
      const satelliteData = {
        company_id: companyId,
        name: newOffice.name,
        address: newOffice.address,
        phone: newOffice.phone,
        office_type_id: newOffice.office_type_id,
        contract_type: newOffice.contract_type,
        max_users: newOffice.max_users
      };
      console.log('拠点作成データ:', satelliteData);
      const response = await fetch('http://localhost:5000/api/satellites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(satelliteData)
      });
      const result = await response.json();
      console.log('拠点作成レスポンス:', result);
      if (!result.success) {
        throw new Error(result.message || result.error || '拠点の追加に失敗しました');
      }
      // トークン・有効期限をモーダルで表示
      setTokenModal({
        show: true,
        token: result.data.token,
        expiry: result.data.token_expiry_at
      });
      showNotification('拠点が正常に追加されました', 'success');
      setShowOfficeForm(false);
      // フォームをリセット
      setNewOffice({
        company_id: '',
        name: '',
        address: '',
        phone: '',
        office_type_id: '',
        contract_type: '30days',
        max_users: 10
      });
      setIsNewCompany(false);
      setNewCompany({
        name: '',
        address: '',
        phone: ''
      });
      // 企業・拠点リストを再取得
      await fetchCompanies();
    } catch (err) {
      console.error('拠点追加エラー:', err);
      showNotification(err.message, 'error');
    } finally {
      setAddOfficeLoading(false);
    }
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
    // satellitesデータを直接使用（既にフラットな配列）
    let allOffices = facilities.map(satellite => ({
      ...satellite,
      // 企業名を取得
      organizationName: companies.find(company => company.id === satellite.company_id)?.name || '不明',
      organizationId: satellite.company_id
    }));

    // 事業所レベルでフィルタリング
    let filtered = allOffices.filter(office => {
      const matchesSearch = 
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (office.address && office.address.toLowerCase().includes(searchTerm.toLowerCase()));
     
      const matchesType = filterType === 'all' || office.office_type_name === filterType || office.office_type_id === filterType;
     
      const matchesManager = showOnlyNoManager ? 
        (!office.manager_ids || office.manager_ids.length === 0) : true;
     
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

  // 通知表示関数
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // 事業所タイプ管理
  const handleAddFacilityType = async () => {
    if (newFacilityType.trim()) {
      // 重複チェック
      if (facilityTypes.includes(newFacilityType.trim())) {
        showNotification('同じ名前の事業所タイプが既に存在します', 'error');
        return;
      }

      const result = await addOfficeType(newFacilityType.trim());
      if (result.success) {
        // 成功時のフィードバック
        setNewFacilityType('');
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    }
  };

  const handleRemoveFacilityType = async (typeToRemove) => {
    if (window.confirm(`「${typeToRemove}」を削除しますか？\n\n注意: この事業所タイプを使用している企業が存在する場合は削除できません。`)) {
      const result = await deleteOfficeType(typeToRemove);
      if (result.success) {
        // 成功時のフィードバック
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    }
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



  // 必要な統計情報の計算
  const totalStudents = facilities.reduce((sum, facility) => 
    sum + (facility.current_users || 0), 0);
  const totalMaxStudents = facilities.reduce((sum, facility) => 
    sum + (facility.max_users || 0), 0);
  
  // 使用率の計算
  const usageRate = totalMaxStudents > 0 ? Math.round((totalStudents / totalMaxStudents) * 100) : 0;
  
  // 責任者不在の事業所数
  const facilitiesWithoutManager = facilities.filter(facility => 
    !facility.manager_ids || facility.manager_ids.length === 0
  ).length;
  
  // 30日以内に期限切れになる事業所数
  const expiringSoonFacilities = facilities.filter(facility => {
    if (!facility.token_expiry_at) return false;
    const expiryDate = new Date(facility.token_expiry_at);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;

  const filteredFacilities = getFilteredAndSortedFacilities();

  const handleManageCourses = async (office) => {
    setTargetOffice(office);
    setCourseError(null);
    setCoursesLoading(true);
    try {
      // 全コース取得（管理者は認証必須）
      let coursesResp = await apiGet('/api/courses');
      let courses = [];
      if (coursesResp && coursesResp.success && Array.isArray(coursesResp.data)) {
        courses = coursesResp.data;
      } else if (Array.isArray(coursesResp)) {
        courses = coursesResp;
      }
      setAllCourses(courses);

      // 拠点の無効化コースID一覧を取得
      let disabledResp = await apiGet(`/api/satellites/${office.id}/disabled-courses`);
      let disabledIds = [];
      if (disabledResp && disabledResp.success && Array.isArray(disabledResp.data)) {
        disabledIds = disabledResp.data.map(id => Number(id));
      } else if (Array.isArray(disabledResp)) {
        disabledIds = disabledResp.map(id => Number(id));
      }

      const allIds = courses.map(c => Number(c.id));
      const enabledIds = allIds.filter(id => !disabledIds.includes(id));
      setSelectedCourses(enabledIds);
      setShowCourseModal(true);
    } catch (e) {
      console.error('コース管理データ取得エラー:', e);
      setCourseError(e.message || 'データの取得に失敗しました');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseCheck = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSaveCourses = async () => {
    if (!targetOffice) return;
    try {
      const allIds = allCourses.map(c => Number(c.id));
      const disabledIds = allIds.filter(id => !selectedCourses.includes(id));
      await apiPut(`/api/satellites/${targetOffice.id}/disabled-courses`, {
        disabled_course_ids: disabledIds
      });

      // 画面上の拠点リストを更新（必要に応じて再取得）
      await fetchSatellites();

      setShowCourseModal(false);
      setTargetOffice(null);
      setSelectedCourses([]);
    } catch (e) {
      console.error('コース設定の保存エラー:', e);
      alert(`コース設定の保存に失敗しました: ${e.message}`);
    }
  };

  const handleCancelCourses = () => {
    setShowCourseModal(false);
    setTargetOffice(null);
    setSelectedCourses([]);
  };

  // 企業トークン再生成
  const handleRegenerateCompanyToken = async (companyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/companies/${companyId}/regenerate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'トークンの再生成に失敗しました');
      }
      
      showNotification('企業トークンが正常に再生成されました', 'success');
      
      // 企業一覧を再取得
      await fetchCompanies();
      
      // トークンモーダルを表示
      setShowCompanyTokenModal({
        show: true,
        company: result.data
      });
    } catch (err) {
      console.error('企業トークン再生成エラー:', err);
      showNotification(err.message, 'error');
    }
  };

  // 企業削除ハンドラー
  const handleDeleteCompany = async (company) => {
    if (window.confirm(`「${company.name}」を削除しますか？\n\n注意: この企業に所属するユーザーが存在する場合は削除できません。\nこの操作は取り消せません。`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/companies/${company.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || '企業の削除に失敗しました');
        }
        
        showNotification(`「${company.name}」を削除しました`, 'success');
        
        // 企業一覧を再取得
        await fetchCompanies();
      } catch (err) {
        console.error('企業削除エラー:', err);
        showNotification(err.message, 'error');
      }
    }
  };

  return (
    <div className="p-6">
      {/* 通知コンポーネント */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[10000] p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {notification.type === 'success' ? '✓' : '✗'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-red-800 mb-6">事業所(拠点)管理</h2>
        
        {/* 必要な統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 生徒の総数に対する稼働率 */}
          <div className="bg-white border-2 border-red-200 rounded-xl p-6 text-center transition-all duration-300 hover:border-red-400 hover:shadow-lg">
            <h3 className="text-red-800 font-medium mb-2">生徒稼働率</h3>
            <p className="text-3xl font-bold text-red-600">{totalStudents} / {totalMaxStudents}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usageRate >= 80 ? 'bg-red-500' : 
                    usageRate >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usageRate, 100)}%` }}
                ></div>
              </div>
              <small className={`font-medium ${
                usageRate >= 80 ? 'text-red-600' : 
                usageRate >= 60 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                稼働率: {usageRate}%
              </small>
            </div>
          </div>

          {/* 責任者不在事業所数 */}
          <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 text-center transition-all duration-300 hover:border-yellow-400 hover:shadow-lg">
            <h3 className="text-yellow-800 font-medium mb-2">責任者不在事業所</h3>
            <p className={`text-3xl font-bold ${facilitiesWithoutManager > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {facilitiesWithoutManager}
            </p>
            <small className="text-yellow-600">事業所数</small>
          </div>

          {/* 有効期限間近の事業所数 */}
          <div className="bg-white border-2 border-orange-200 rounded-xl p-6 text-center transition-all duration-300 hover:border-orange-400 hover:shadow-lg">
            <h3 className="text-orange-800 font-medium mb-2">🔒 有効期限間近</h3>
            <p className={`text-3xl font-bold ${expiringSoonFacilities > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {expiringSoonFacilities}
            </p>
            <small className="text-orange-600">14日以内期限切れ</small>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => {
            console.log('事業所を追加ボタンがクリックされました'); // デバッグログ追加
            console.log('facilities:', facilities); // facilitiesの状態を確認
            console.log('showOfficeForm before:', showOfficeForm); // 現在の状態を確認
            setShowOfficeForm(true);
            console.log('setShowOfficeForm(true) called'); // 状態更新を確認
            // 状態更新後の確認（非同期なので少し遅延）
            setTimeout(() => {
              console.log('showOfficeForm after timeout:', showOfficeForm);
            }, 100);
          }}
          disabled={false}
        >
          + 事業所を追加
        </button>
        <button 
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-700"
          onClick={() => setShowTypeManagement(true)}
        >
          📝 事業所タイプ管理
        </button>
        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-blue-700"
          onClick={() => setShowCompanyList(true)}
        >
          🏢 企業一覧
        </button>
        <button 
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-green-700"
          onClick={async () => {
            try {
              console.log('データベーステスト開始');
              const response = await fetch('http://localhost:5000/test-db');
              const data = await response.json();
              console.log('データベーステスト結果:', data);
              alert('データベーステスト完了。コンソールを確認してください。');
            } catch (error) {
              console.error('データベーステストエラー:', error);
              alert('データベーステストでエラーが発生しました。');
            }
          }}
        >
          🔧 DBテスト
        </button>
        <button 
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-orange-700"
          onClick={async () => {
            try {
              console.log('管理者アカウント復元開始');
              const response = await fetch('http://localhost:5000/restore-admin', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              const data = await response.json();
              console.log('管理者アカウント復元結果:', data);
              if (data.success) {
                alert('管理者アカウントが復元されました。\nユーザー名: admin001\nパスワード: admin123');
              } else {
                alert('管理者アカウント復元に失敗しました: ' + data.message);
              }
            } catch (error) {
              console.error('管理者アカウント復元エラー:', error);
              alert('管理者アカウント復元でエラーが発生しました。');
            }
          }}
        >
          🔑 管理者復元
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
            検索結果: <span className="font-semibold">{filteredFacilities.length}</span>件
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">有効期限</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">責任者</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* フィルターされた事業所を直接表示 */}
              {filteredFacilities.map((office) => (
                <tr key={office.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                  !office.manager_ids || office.manager_ids.length === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                }`}>
                  <td className="px-6 py-4">{office.name}</td>
                  <td className="px-6 py-4">{office.office_type_name || office.office_type_id || '-'}</td>
                  <td className="px-6 py-4">
                    <strong className="text-gray-800">{office.organizationName || <span className="text-gray-500 italic">組織名なし</span>}</strong>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{office.address || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{office.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {office.current_users || 0} / {office.max_users || 0}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {office.token_expiry_at ? (
                      <div className={`text-sm ${new Date(office.token_expiry_at) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        <div>{new Date(office.token_expiry_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                        {(() => {
                          const expiryDate = new Date(office.token_expiry_at);
                          const now = new Date();
                          const diffTime = expiryDate - now;
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) {
                            return <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">期限切れ</span>;
                          } else if (diffDays <= 30) {
                            return <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">残り{diffDays}日</span>;
                          } else {
                            return <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">有効</span>;
                          }
                        })()}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {office.manager_ids && office.manager_ids.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-600">
                          {getManagerNames(office.manager_ids).join(', ')}
                        </span>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">事業所タイプ管理</h3>
              <button 
                onClick={() => setShowTypeManagement(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* ローディング状態 */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">事業所タイプを読み込み中...</p>
              </div>
            )}

            {/* エラー状態 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  <strong>エラー:</strong> {error}
                </p>
                <button 
                  onClick={fetchOfficeTypes}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  再試行
                </button>
              </div>
            )}
            
            {!loading && (
              <>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">現在の事業所タイプ</h4>
                  {facilityTypes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">事業所タイプが登録されていません</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {facilityTypes.map(type => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <span className="text-gray-800">{type}</span>
                          <button 
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleRemoveFacilityType(type)}
                            disabled={facilityTypes.length <= 1}
                            title={facilityTypes.length <= 1 ? "最低1つの事業所タイプが必要です" : ""}
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">新しい事業所タイプを追加</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="新しい事業所タイプ名"
                      value={newFacilityType}
                      onChange={(e) => setNewFacilityType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFacilityType()}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                    />
                    <button 
                      onClick={handleAddFacilityType}
                      disabled={!newFacilityType.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold transition-colors duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </>
            )}

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
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">事業所追加</h3>
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleAddOffice(); }}>
              
              {/* 組織選択セクション */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">組織情報</h4>
                
                {/* 新規組織チェックボックス */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={isNewCompany}
                      onChange={(e) => setIsNewCompany(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span>新規組織を作成する</span>
                  </label>
                </div>

                {isNewCompany ? (
                  /* 新規組織作成 */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">組織名 *</label>
                      <SanitizedInput 
                        type="text" 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                        value={newCompany.name} 
                        onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} 
                        required 
                        sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">住所</label>
                      <SanitizedInput 
                        type="text" 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                        value={newCompany.address} 
                        onChange={e => setNewCompany({ ...newCompany, address: e.target.value })} 
                        sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">電話番号</label>
                      <SanitizedInput 
                        type="text" 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                        value={newCompany.phone} 
                        onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })} 
                        sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                      />
                    </div>
                  </div>
                ) : (
                  /* 既存組織選択 */
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">組織 *</label>
                    {companies.length === 0 ? (
                      <div className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                        <p className="text-sm text-yellow-700 mb-2">
                          組織が登録されていません。新規組織を作成してください。
                        </p>
                        <button 
                          type="button"
                          onClick={() => setIsNewCompany(true)}
                          className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors duration-300"
                        >
                          新規組織を作成
                        </button>
                      </div>
                    ) : (
                      <select 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                        value={newOffice.company_id} 
                        onChange={e => setNewOffice({ ...newOffice, company_id: e.target.value })} 
                        required
                      >
                        <option value="">選択してください</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {companiesLoading && (
                      <p className="text-sm text-gray-500 mt-2">組織一覧を読み込み中...</p>
                    )}
                  </div>
                )}
              </div>

              {/* 事業所情報セクション */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">事業所情報</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">事業所名 *</label>
                    <SanitizedInput 
                      type="text" 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.name} 
                      onChange={e => setNewOffice({ ...newOffice, name: e.target.value })} 
                      required 
                      sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">事業所タイプ *</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.office_type_id} 
                      onChange={e => setNewOffice({ ...newOffice, office_type_id: e.target.value })} 
                      required
                      disabled={loading}
                    >
                      <option value="">
                        {loading ? '読み込み中...' : facilityTypes.length === 0 ? '事業所タイプがありません' : '選択してください'}
                      </option>
                      {facilityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    {loading && (
                      <p className="text-sm text-gray-500 mt-2">事業所タイプを読み込み中...</p>
                    )}
                    {!loading && facilityTypes.length === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        事業所タイプが取得できませんでした。
                        <button 
                          type="button"
                          onClick={() => setShowOfficeTypeModal(true)}
                          className="text-blue-600 hover:text-blue-800 underline ml-1"
                        >
                          事業所タイプ管理
                        </button>
                        から追加してください。
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">住所</label>
                    <SanitizedInput 
                      type="text" 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.address} 
                      onChange={e => setNewOffice({ ...newOffice, address: e.target.value })} 
                      sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">電話番号</label>
                    <SanitizedInput 
                      type="text" 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.phone} 
                      onChange={e => setNewOffice({ ...newOffice, phone: e.target.value })} 
                      sanitizeMode={SANITIZE_OPTIONS.LIGHT} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">契約コース *</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.contract_type} 
                      onChange={e => setNewOffice({ ...newOffice, contract_type: e.target.value })} 
                      required
                    >
                      <option value="30days">30日コース</option>
                      <option value="90days">90日コース</option>
                      <option value="1year">1年コース</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">利用者上限数 *</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-colors duration-300" 
                      value={newOffice.max_users} 
                      onChange={e => setNewOffice({ ...newOffice, max_users: parseInt(e.target.value) || 10 })} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowOfficeForm(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button 
                  type="button" 
                  onClick={handleAddOffice}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                >
                  {isNewCompany ? '組織・事業所を追加' : '事業所を追加'}
                </button>
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
                onClick={() => {
                  setShowManagerSelect(false);
                  setSelectedManagers([]); // 選択状態をリセット
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">拠点: <span className="font-semibold text-gray-800">{selectedOfficeForManager.name}</span></p>
              <p className="text-sm text-gray-500 mb-2">
                この拠点に所属する指導者から責任者を選択してください。
                <br />
                <span className="text-blue-600 font-medium">✓ チェックが入っている指導者は現在の責任者です</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    console.log('手動で指導者情報を更新します');
                    await fetchSatelliteInstructors(selectedOfficeForManager.id);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-300"
                >
                  🔄 指導者情報を更新
                </button>
                <button
                  onClick={() => setSelectedManagers([])}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-300"
                >
                  🗑️ 全選択解除
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {instructorsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">指導者情報を読み込み中...</p>
                </div>
              ) : getAvailableInstructors().length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">この拠点に所属する指導者がいません</p>
                  <p className="text-sm text-gray-400 mt-2">指導者を拠点に追加してから責任者を設定してください</p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      デバッグ情報: 拠点ID {selectedOfficeForManager?.id}, 
                      指導者数 {getAvailableInstructors().length}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      キャッシュされた指導者データ: {JSON.stringify(satelliteInstructors[selectedOfficeForManager?.id] || [])}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      全拠点のキャッシュ: {JSON.stringify(Object.keys(satelliteInstructors || {}))}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      ローディング状態: {instructorsLoading ? 'true' : 'false'}
                    </p>
                  </div>
                </div>
              ) : (
                getAvailableInstructors().map(instructor => {
                  const isCurrentManager = selectedManagers.includes(instructor.id);
                  return (
                    <label key={instructor.id} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                      isCurrentManager 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isCurrentManager}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedManagers([...selectedManagers, instructor.id]);
                          } else {
                            setSelectedManagers(selectedManagers.filter(id => id !== instructor.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-800">{instructor.name}</div>
                          {isCurrentManager && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              現在の責任者
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{instructor.email || instructor.login_code}</div>
                        <div className="text-xs text-gray-400">
                          {instructor.specializations && instructor.specializations.length > 0 
                            ? `専門分野: ${instructor.specializations.join(', ')}`
                            : '専門分野: 未設定'
                          }
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowManagerSelect(false);
                  setSelectedManagers([]); // 選択状態をリセット
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  const selectedUsers = getAvailableInstructors().filter(instructor => selectedManagers.includes(instructor.id));
                  handleConfirmManagerSelection(selectedUsers);
                }}
                disabled={selectedManagers.length === 0}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                選択確定 ({selectedManagers.length}人選択中)
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
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事業所タイプ</label>
                <select 
                  value={editFormData.office_type_id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, office_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                >
                  <option value="">選択してください</option>
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">利用者上限数</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={editFormData.max_users || 10}
                  onChange={(e) => setEditFormData({ ...editFormData, max_users: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">有効期限</label>
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={editFormData.token_expiry_at ? editFormData.token_expiry_at.slice(0, 16) : ''}
                    onChange={(e) => setEditFormData({ ...editFormData, token_expiry_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const japanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
                        const thirtyDaysLater = new Date(japanTime.getTime() + (30 * 24 * 60 * 60 * 1000));
                        setEditFormData({ 
                          ...editFormData, 
                          token_expiry_at: thirtyDaysLater.toISOString().slice(0, 16) 
                        });
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-300"
                    >
                      +30日
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const japanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
                        const ninetyDaysLater = new Date(japanTime.getTime() + (90 * 24 * 60 * 60 * 1000));
                        setEditFormData({ 
                          ...editFormData, 
                          token_expiry_at: ninetyDaysLater.toISOString().slice(0, 16) 
                        });
                      }}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-300"
                    >
                      +90日
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const japanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
                        const oneYearLater = new Date(japanTime.getTime() + (365 * 24 * 60 * 60 * 1000));
                        setEditFormData({ 
                          ...editFormData, 
                          token_expiry_at: oneYearLater.toISOString().slice(0, 16) 
                        });
                      }}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors duration-300"
                    >
                      +1年
                    </button>
                  </div>
                  {editFormData.token_expiry_at && (
                    <div className="text-xs text-gray-500">
                      現在の設定: {new Date(editFormData.token_expiry_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOfficeForEdit(null);
                  setEditFormData({});
                }}
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
              {courseError && (
                <div className="p-3 bg-red-100 text-red-700 rounded">{courseError}</div>
              )}
              {coursesLoading && (
                <div className="p-3 bg-gray-50 text-gray-600 rounded">読み込み中...</div>
              )}
              {!coursesLoading && allCourses.map(course => (
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

      {addOfficeLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">処理中...</h3>
            <p className="text-gray-600">事業所の追加処理中です。しばらくお待ちください。</p>
          </div>
        </div>
      )}

      {tokenModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">トークン発行情報</h3>
            <div className="mb-4">
              <div className="mb-2"><span className="font-semibold">トークン:</span> <span className="text-lg tracking-widest font-mono">{tokenModal.token}</span></div>
              <div><span className="font-semibold">有効期限:</span> <span>{tokenModal.expiry ? new Date(tokenModal.expiry).toLocaleString() : '-'}</span></div>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold" onClick={() => setTokenModal({ show: false, token: '', expiry: '' })}>閉じる</button>
          </div>
        </div>
      )}

      {/* 企業一覧モーダル */}
      {showCompanyList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">企業一覧</h3>
              <button 
                onClick={() => setShowCompanyList(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* ローディング状態 */}
            {companiesLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">企業一覧を読み込み中...</p>
              </div>
            )}

            {!companiesLoading && (
              <>
                <div className="mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">企業名</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">住所</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">電話番号</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">管理トークン</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">発行日</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-gray-500">
                              企業が登録されていません
                            </td>
                          </tr>
                        ) : (
                          companies.map(company => (
                            <tr key={company.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-800 font-medium">{company.name}</td>
                              <td className="px-4 py-3 text-gray-600">{company.address || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">{company.phone || '-'}</td>
                              <td className="px-4 py-3 text-gray-600 font-mono">{company.token || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">
                                {company.token_issued_at ? new Date(company.token_issued_at).toLocaleDateString('ja-JP') : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleRegenerateCompanyToken(company.id)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                                    title="管理トークンを再生成"
                                  >
                                    再生成
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCompany(company)}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                                    title="企業を削除"
                                  >
                                    削除
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
              </>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => setShowCompanyList(false)} 
                className="flex-1 bg-gray-100 text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 企業トークンモーダル */}
      {showCompanyTokenModal.show && showCompanyTokenModal.company && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">管理符号</h3>
              <button 
                onClick={() => setShowCompanyTokenModal({ show: false, company: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <strong>{showCompanyTokenModal.company.name}</strong> の新しい管理トークンが生成されました。
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">管理トークン:</p>
                <p className="text-xl font-mono font-bold text-blue-600">
                  {showCompanyTokenModal.company.token}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                発行日: {new Date(showCompanyTokenModal.company.token_issued_at).toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => setShowCompanyTokenModal({ show: false, company: null })} 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 hover:bg-blue-700"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement; 