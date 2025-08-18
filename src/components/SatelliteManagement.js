import React, { useState, useEffect } from 'react';
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete,
  getSatellites,
  getSatelliteById,
  updateSatellite,
  getSatelliteInstructors,
  getSatelliteUsers,
  updateUser
} from '../utils/api';
import SanitizedInput from './SanitizedInput';
import SanitizedTextarea from './SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

const SatelliteManagement = ({ currentUser }) => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 拠点情報編集
  const [showEditForm, setShowEditForm] = useState(false);
  const [editSatellite, setEditSatellite] = useState({
    name: '',
    address: '',
    phone: '',
    max_users: 10,
    contract_type: '30days',
    status: 1
  });

  // 指導員管理
  const [instructors, setInstructors] = useState([]);
  const [showAddInstructorForm, setShowAddInstructorForm] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  // 利用者管理
  const [users, setUsers] = useState([]);
  const [showUserAssignmentForm, setShowUserAssignmentForm] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [unassignedUsers, setUnassignedUsers] = useState([]);

  // 権限チェック
  const hasPermission = currentUser && currentUser.role >= 5;

  useEffect(() => {
    if (hasPermission) {
      fetchSatellites();
    }
  }, [hasPermission]);

  // 拠点一覧を取得
  const fetchSatellites = async () => {
    try {
      setLoading(true);
      const data = await getSatellites();
      setSatellites(data);
    } catch (error) {
      console.error('拠点一覧取得エラー:', error);
      setError('拠点一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 拠点詳細を取得
  const fetchSatelliteDetails = async (satelliteId) => {
    try {
      const data = await getSatelliteById(satelliteId);
      setSelectedSatellite(data);
      setEditSatellite({
        name: data.name,
        address: data.address,
        phone: data.phone || '',
        max_users: data.max_users,
        contract_type: data.contract_type,
        status: data.status
      });
      
      // 指導員一覧を取得
      await fetchInstructors(satelliteId);
      // 利用者一覧を取得
      await fetchUsers(satelliteId);
    } catch (error) {
      console.error('拠点詳細取得エラー:', error);
      setError('拠点詳細の取得に失敗しました');
    }
  };

  // 指導員一覧を取得
  const fetchInstructors = async (satelliteId) => {
    try {
      const data = await getSatelliteInstructors(satelliteId);
      setInstructors(data.data || []);
    } catch (error) {
      console.error('指導員一覧取得エラー:', error);
    }
  };

  // 利用者一覧を取得
  const fetchUsers = async (satelliteId) => {
    try {
      const data = await getSatelliteUsers(satelliteId);
      setUsers(data.data || []);
    } catch (error) {
      console.error('利用者一覧取得エラー:', error);
    }
  };

  // 拠点情報を更新
  const handleUpdateSatellite = async (e) => {
    e.preventDefault();
    
    if (!selectedSatellite) return;

    try {
      const response = await updateSatellite(selectedSatellite.id, editSatellite);
      
      if (response.success) {
        alert('拠点情報が更新されました');
        setShowEditForm(false);
        await fetchSatelliteDetails(selectedSatellite.id);
        await fetchSatellites();
      } else {
        alert(response.message || '拠点情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('拠点更新エラー:', error);
      alert('拠点情報の更新に失敗しました');
    }
  };

  // 指導員を追加
  const handleAddInstructor = async (e) => {
    e.preventDefault();
    
    if (!selectedSatellite) return;

    // バリデーション
    if (!newInstructor.username || !newInstructor.name || !newInstructor.password) {
      alert('必須項目を入力してください');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newInstructor.username)) {
      alert('ログインIDは半角英数字とアンダースコアのみ使用可能です');
      return;
    }

    try {
      const requestData = {
        name: newInstructor.name,
        username: newInstructor.username,
        password: newInstructor.password,
        role: 4, // 指導員ロール
        status: 1,
        login_code: generateLoginCode(),
        company_id: selectedSatellite.company_id,
        satellite_ids: [selectedSatellite.id],
        email: newInstructor.email
      };

      const response = await apiPost('/api/users', requestData);
      
      if (response.success) {
        alert('指導員が追加されました');
        setShowAddInstructorForm(false);
        setNewInstructor({ name: '', username: '', email: '', password: '' });
        await fetchInstructors(selectedSatellite.id);
      } else {
        alert(response.message || '指導員の追加に失敗しました');
      }
    } catch (error) {
      console.error('指導員追加エラー:', error);
      alert('指導員の追加に失敗しました');
    }
  };

  // ログインコード生成
  const generateLoginCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const generatePart = () => {
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    return `${generatePart()}-${generatePart()}-${generatePart()}`;
  };

  // 利用者を指導員に割り当て
  const handleAssignUsers = async (e) => {
    e.preventDefault();
    
    if (!selectedInstructor || !unassignedUsers.length) return;

    try {
      // 選択された利用者を指導員に割り当て
      const assignmentPromises = unassignedUsers.map(userId => 
        updateUser(userId, {
          instructor_id: selectedInstructor.id
        })
      );

      await Promise.all(assignmentPromises);
      
      alert('利用者の割り当てが完了しました');
      setShowUserAssignmentForm(false);
      setSelectedInstructor(null);
      setUnassignedUsers([]);
      await fetchUsers(selectedSatellite.id);
    } catch (error) {
      console.error('利用者割り当てエラー:', error);
      alert('利用者の割り当てに失敗しました');
    }
  };

  // 未割り当て利用者を取得
  const getUnassignedUsers = () => {
    return users.filter(user => user.role === 1 && !user.instructor_id);
  };

  if (!hasPermission) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">アクセス権限がありません</h2>
          <p>拠点管理機能は管理者（ロール5以上）のみ利用できます。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">拠点管理</h2>
        <p className="text-gray-600">拠点情報の管理、指導員の追加、利用者の割り当てを行えます。</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 拠点選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          拠点を選択
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => {
            const satellite = satellites.find(s => s.id === parseInt(e.target.value));
            if (satellite) {
              fetchSatelliteDetails(satellite.id);
            }
          }}
        >
          <option value="">拠点を選択してください</option>
          {satellites.map(satellite => (
            <option key={satellite.id} value={satellite.id}>
              {satellite.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSatellite && (
        <div className="space-y-6">
          {/* 拠点情報 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">拠点情報</h3>
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {showEditForm ? 'キャンセル' : '編集'}
              </button>
            </div>

            {!showEditForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">拠点名:</span>
                  <span className="ml-2">{selectedSatellite.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">住所:</span>
                  <span className="ml-2">{selectedSatellite.address}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">電話番号:</span>
                  <span className="ml-2">{selectedSatellite.phone || '未設定'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">最大利用者数:</span>
                  <span className="ml-2">{selectedSatellite.max_users}名</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">契約タイプ:</span>
                  <span className="ml-2">{selectedSatellite.contract_type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ステータス:</span>
                  <span className="ml-2">{selectedSatellite.status === 1 ? '稼働中' : '停止中'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateSatellite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      拠点名
                    </label>
                    <SanitizedInput
                      type="text"
                      value={editSatellite.name}
                      onChange={(e) => setEditSatellite({...editSatellite, name: e.target.value})}
                      required
                      options={SANITIZE_OPTIONS}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
                    </label>
                    <SanitizedInput
                      type="text"
                      value={editSatellite.phone}
                      onChange={(e) => setEditSatellite({...editSatellite, phone: e.target.value})}
                      options={SANITIZE_OPTIONS}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最大利用者数
                    </label>
                    <input
                      type="number"
                      value={editSatellite.max_users}
                      onChange={(e) => setEditSatellite({...editSatellite, max_users: parseInt(e.target.value)})}
                      min="1"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      契約タイプ
                    </label>
                    <select
                      value={editSatellite.contract_type}
                      onChange={(e) => setEditSatellite({...editSatellite, contract_type: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="30days">30日</option>
                      <option value="90days">90日</option>
                      <option value="1year">1年</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <SanitizedTextarea
                    value={editSatellite.address}
                    onChange={(e) => setEditSatellite({...editSatellite, address: e.target.value})}
                    required
                    options={SANITIZE_OPTIONS}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    更新
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 指導員管理 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">指導員管理</h3>
              <button
                onClick={() => setShowAddInstructorForm(!showAddInstructorForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                指導員を追加
              </button>
            </div>

            {showAddInstructorForm && (
              <form onSubmit={handleAddInstructor} className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="text-lg font-medium text-gray-800 mb-4">新しい指導員を追加</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      名前 *
                    </label>
                    <SanitizedInput
                      type="text"
                      value={newInstructor.name}
                      onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                      required
                      options={SANITIZE_OPTIONS}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ログインID *
                    </label>
                    <SanitizedInput
                      type="text"
                      value={newInstructor.username}
                      onChange={(e) => setNewInstructor({...newInstructor, username: e.target.value})}
                      required
                      options={SANITIZE_OPTIONS}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={newInstructor.email}
                      onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      パスワード *
                    </label>
                    <input
                      type="password"
                      value={newInstructor.password}
                      onChange={(e) => setNewInstructor({...newInstructor, password: e.target.value})}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddInstructorForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">名前</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ログインID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">メールアドレス</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map(instructor => (
                    <tr key={instructor.id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{instructor.name}</td>
                      <td className="px-4 py-2">{instructor.username}</td>
                      <td className="px-4 py-2">{instructor.email || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          instructor.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {instructor.status === 1 ? '稼働中' : '停止中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 利用者割り当て */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">利用者割り当て</h3>
              <button
                onClick={() => setShowUserAssignmentForm(!showUserAssignmentForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                利用者を割り当て
              </button>
            </div>

            {showUserAssignmentForm && (
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="text-lg font-medium text-gray-800 mb-4">利用者を指導員に割り当て</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      指導員を選択
                    </label>
                    <select
                      value={selectedInstructor?.id || ''}
                      onChange={(e) => {
                        const instructor = instructors.find(i => i.id === parseInt(e.target.value));
                        setSelectedInstructor(instructor);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">指導員を選択してください</option>
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      未割り当て利用者数
                    </label>
                    <div className="p-2 bg-gray-100 rounded-md">
                      {getUnassignedUsers().length}名
                    </div>
                  </div>
                </div>
                {selectedInstructor && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      割り当て対象利用者
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {getUnassignedUsers().map(user => (
                        <div key={user.id} className="flex items-center p-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={unassignedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUnassignedUsers([...unassignedUsers, user.id]);
                              } else {
                                setUnassignedUsers(unassignedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="mr-2"
                          />
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAssignUsers}
                    disabled={!selectedInstructor || unassignedUsers.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    割り当て実行
                  </button>
                  <button
                    onClick={() => setShowUserAssignmentForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">名前</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">担当指導員</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(user => user.role === 1).map(user => (
                    <tr key={user.id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">
                        {user.instructor_name || '未割り当て'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 1 ? '稼働中' : '停止中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatelliteManagement;
