import React, { useState, useEffect } from 'react';
import SanitizedInput from './SanitizedInput';
import SanitizedTextarea from './SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';
import { apiGet, apiPost, apiPut } from '../utils/api';

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilityLocations, setFacilityLocations] = useState([]);

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

  // 拠点一覧を取得
  const fetchFacilityLocations = async () => {
    try {
      console.log('拠点一覧を取得中...');
      const data = await apiGet('/api/satellites');
      console.log('拠点データ:', data);

      // データが配列かどうかチェック
      if (!Array.isArray(data)) {
        console.warn('拠点データが配列ではありません:', data);
        setFacilityLocations([]);
        return;
      }

      // 拠点データを変換
      const locations = data.map(satellite => ({
        id: satellite.id.toString(),
        name: satellite.name,
        organizationName: satellite.company_name || '',
        type: satellite.office_type_name || '未分類',
        address: satellite.address || ''
      }));

      setFacilityLocations(locations);
    } catch (error) {
      console.error('拠点一覧取得エラー:', error);
      // エラー時は空配列を設定（エラーを投げない）
      setFacilityLocations([]);
    }
  };

  // 指導者一覧を取得
  const fetchInstructors = async () => {
    try {
      console.log('指導者一覧を取得中...');
      console.log('apiGet を呼び出します: /api/users');
      console.log('apiGet の前');
      const data = await apiGet('/api/users');
      console.log('apiGet の後');
      console.log('取得したデータ:', data);
      console.log('取得したデータの詳細:', JSON.stringify(data, null, 2));

      // データが配列かどうかチェック
      if (!Array.isArray(data)) {
        console.warn('APIから配列が返されませんでした:', data);
        setInstructors([]);
        return;
      }

      // ロール4、5のユーザーのみをフィルタリング
      const instructorUsers = data.filter(user => user.role >= 4 && user.role <= 5);
      console.log('指導者ユーザー:', instructorUsers);
      
      // 指導者ユーザーが空の場合は空配列を設定
      if (instructorUsers.length === 0) {
        console.log('指導者ユーザーが見つかりません。新規登録で追加してください。');
        setInstructors([]);
        return;
      }
      
      // 各指導者の専門分野を取得
      const instructorsWithSpecializations = await Promise.all(
        instructorUsers.map(async (user) => {
          try {
            const specData = await apiGet(`/api/instructors/${user.id}/specializations`);
            
            // バックエンドから返された拠点情報を使用
            const facilityLocationNames = (user.satellite_details || []).map(satellite => satellite.name).filter(name => name);
            
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email || '',
              department: specData.success && specData.data.length > 0 ? specData.data[0].specialization : '',
              facilityLocationIds: user.satellite_ids || [],
              facilityLocationNames: facilityLocationNames,
              status: user.status === 1 ? 'active' : 'inactive',
              lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('ja-JP') : '-',
              passwordResetRequired: false,
              specializations: specData.success ? specData.data : []
            };
          } catch (error) {
            console.error(`指導者${user.id}の専門分野取得エラー:`, error);
            
            // バックエンドから返された拠点情報を使用
            const facilityLocationNames = (user.satellite_details || []).map(satellite => satellite.name).filter(name => name);
            
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email || '',
              department: '',
              facilityLocationIds: user.satellite_ids || [],
              facilityLocationNames: facilityLocationNames,
              status: user.status === 1 ? 'active' : 'inactive',
              lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('ja-JP') : '-',
              passwordResetRequired: false,
              specializations: []
            };
          }
        })
      );

      setInstructors(instructorsWithSpecializations);
    } catch (error) {
      console.error('指導者一覧取得エラー:', error);
      // エラー時は空配列を設定（エラーを投げない）
      setInstructors([]);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    console.log('InstructorManagement useEffect が実行されました');
    const loadData = async () => {
      console.log('loadData 関数が開始されました');
      setLoading(true);
      setError(null);
      
      try {
        console.log('fetchFacilityLocations を呼び出します');
        await fetchFacilityLocations();
        console.log('fetchInstructors を呼び出します');
        await fetchInstructors();
      } catch (error) {
        console.error('データ読み込みエラー:', error);
        // エラーが発生してもローディング状態を解除
        console.log('データ読み込みでエラーが発生しましたが、処理を続行します。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // フィルタリング機能
  const getFilteredInstructors = () => {
    return instructors.filter(instructor => {
      const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           instructor.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = facilityLocationFilter === 'all' || 
                             instructor.facilityLocationIds.includes(facilityLocationFilter);
      
      const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
      
      const matchesNoLocation = !showNoLocationFilter || instructor.facilityLocationIds.length === 0;
      
      return matchesSearch && matchesLocation && matchesStatus && matchesNoLocation;
    });
  };

  const handlePasswordReset = (instructor) => {
    setSelectedInstructor(instructor);
    setShowPasswordResetModal(true);
  };

  const executePasswordReset = async (resetType) => {
    if (!selectedInstructor) return;

    try {
      const tempPassword = generateTempPassword();
      setGeneratedTempPassword(tempPassword);
      setShowTempPasswordDialog(true);
      setShowPasswordResetModal(false);
      
      // 実際のパスワードリセットAPIを呼び出す
      await apiPost(`/api/users/${selectedInstructor.id}/reset-password`, {
        resetType,
        tempPassword
      });

      // 指導者一覧を再取得
      await fetchInstructors();
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      alert(`パスワードリセットに失敗しました: ${error.message}`);
    }
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    
    try {
      // 新しい指導者を追加するAPI呼び出し
      const data = await apiPost('/api/users', {
        name: newInstructor.name,
        role: 4, // 指導員ロール
        status: 1,
        login_code: (() => {
          // XXXX-XXXX-XXXX形式（英数大文字小文字交じり）
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const generatePart = () => {
            let result = '';
            for (let i = 0; i < 4; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          return `${generatePart()}-${generatePart()}-${generatePart()}`;
        })(),
        company_id: 4, // 既存の企業ID
        satellite_ids: newInstructor.facilityLocationIds,
        email: newInstructor.email
      });

      // 専門分野を設定
      if (newInstructor.department) {
        await apiPost(`/api/instructors/${data.data.id}/specializations`, {
          specializations: [newInstructor.department]
        });
      }

      // 指導者一覧を再取得
      await fetchInstructors();
      
      setNewInstructor({
        name: '',
        email: '',
        department: '',
        facilityLocationIds: [],
        password: ''
      });
      setShowAddForm(false);
      
      alert('指導員が正常に追加されました。');
    } catch (error) {
      console.error('指導員追加エラー:', error);
      alert(`指導員の追加に失敗しました: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleInstructorStatus = async (instructorId) => {
    try {
      const instructor = instructors.find(i => i.id === instructorId);
      const newStatus = instructor.status === 'active' ? 0 : 1;
      
      await apiPut(`/api/users/${instructorId}`, {
        status: newStatus
      });

      // 指導者一覧を再取得
      await fetchInstructors();
    } catch (error) {
      console.error('指導員ステータス更新エラー:', error);
      alert(`指導員ステータスの更新に失敗しました: ${error.message}`);
    }
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
    return status === 'active' ? 'アクティブ' : '非アクティブ';
  };

  const handleEditInstructor = (instructor) => {
    // 編集機能の実装（必要に応じて）
    console.log('編集対象:', instructor);
  };

  const handleResetPassword = async (instructorId) => {
    try {
      const tempPassword = generateTempPassword();
      
      await apiPost(`/api/users/${instructorId}/reset-password`, {
        resetType: 'temp',
        tempPassword
      });

      setGeneratedTempPassword(tempPassword);
      setShowTempPasswordDialog(true);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      alert(`パスワードリセットに失敗しました: ${error.message}`);
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

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
            placeholder="指導員名、メール、専門分野で検索..."
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
                        : 'bg-red-100 text-red-800'
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
             <p className="text-gray-500 text-lg">
               {instructors.length === 0 
                 ? '指導員が登録されていません。「+ 新しい指導員を追加」ボタンから指導員を追加してください。'
                 : '条件に合致する指導員が見つかりません。'
               }
             </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">専門分野:</label>
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