import React, { useState, useEffect } from 'react';
import { 
  getSatelliteUserInstructorRelations, 
  getSatelliteAvailableInstructors, 
  updateUserInstructor,
  bulkUpdateUserInstructors 
} from '../utils/api';

const UserInstructorAssignment = ({ satelliteId, onUpdate }) => {
  const [userInstructorRelations, setUserInstructorRelations] = useState([]);
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [bulkAssignments, setBulkAssignments] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');

  // 利用者と担当指導員の関係を取得
  const fetchUserInstructorRelations = async () => {
    try {
      setLoading(true);
      const response = await getSatelliteUserInstructorRelations(satelliteId);
      if (response.success) {
        setUserInstructorRelations(response.data);
      } else {
        console.error('利用者担当指導員関係取得エラー:', response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error('利用者担当指導員関係取得エラー:', error);
      setError('利用者担当指導員関係の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 利用可能な指導員一覧を取得
  const fetchAvailableInstructors = async () => {
    try {
      const response = await getSatelliteAvailableInstructors(satelliteId);
      if (response.success) {
        setAvailableInstructors(response.data);
      } else {
        console.error('利用可能指導員取得エラー:', response.message);
      }
    } catch (error) {
      console.error('利用可能指導員取得エラー:', error);
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (satelliteId) {
      Promise.all([
        fetchUserInstructorRelations(),
        fetchAvailableInstructors()
      ]);
    }
  }, [satelliteId]);

  // フィルタリングされた利用者一覧
  const filteredUsers = userInstructorRelations.filter(relation =>
    relation.user_name.toLowerCase().includes(filterText.toLowerCase()) ||
    (relation.instructor_name && relation.instructor_name.toLowerCase().includes(filterText.toLowerCase()))
  );

  // 個別利用者の担当指導員を変更
  const handleUpdateUserInstructor = async (userId, instructorId) => {
    try {
      setUpdating(true);
      const response = await updateUserInstructor(userId, instructorId);
      if (response.success) {
        alert('担当指導員を更新しました');
        await fetchUserInstructorRelations();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        alert(response.message || '担当指導員の更新に失敗しました');
      }
    } catch (error) {
      console.error('担当指導員更新エラー:', error);
      alert('担当指導員の更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // 一括担当指導員変更
  const handleBulkUpdateInstructors = async () => {
    if (selectedUsers.length === 0) {
      alert('利用者を選択してください');
      return;
    }

    try {
      setUpdating(true);
      
      // 選択された利用者に対して指定された指導員を割り当て
      const assignments = selectedUsers.map(userId => ({
        userId: parseInt(userId),
        instructorId: selectedInstructor === '' ? null : parseInt(selectedInstructor)
      }));

      const response = await bulkUpdateUserInstructors(satelliteId, assignments);
      if (response.success) {
        alert(`一括更新が完了しました（成功: ${response.data.successCount}件、失敗: ${response.data.errorCount}件）`);
        if (response.data.errors && response.data.errors.length > 0) {
          console.error('一括更新エラー詳細:', response.data.errors);
        }
        await fetchUserInstructorRelations();
        setSelectedUsers([]);
        setSelectedInstructor('');
        setShowBulkAssignment(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        alert(response.message || '一括更新に失敗しました');
      }
    } catch (error) {
      console.error('一括担当指導員更新エラー:', error);
      alert('一括更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // 一括割り当ての初期化
  const initializeBulkAssignments = () => {
    setSelectedUsers([]);
    setSelectedInstructor('');
    setFilterText('');
    setShowBulkAssignment(true);
  };

  // 利用者の選択状態を切り替え
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // 全選択/全解除
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.user_id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUserInstructorRelations}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">利用者担当指導員管理</h3>
        <div className="space-x-2">
          <button
            onClick={initializeBulkAssignments}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            disabled={updating}
          >
            一括変更
          </button>
          <button
            onClick={fetchUserInstructorRelations}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            disabled={updating}
          >
            更新
          </button>
        </div>
      </div>

      {showBulkAssignment ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-700">一括担当指導員変更</h4>
            <div className="space-x-2">
              <button
                onClick={handleBulkUpdateInstructors}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={updating || selectedUsers.length === 0}
              >
                {updating ? '更新中...' : '確定'}
              </button>
              <button
                onClick={() => {
                  setShowBulkAssignment(false);
                  setSelectedUsers([]);
                  setSelectedInstructor('');
                  setFilterText('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={updating}
              >
                キャンセル
              </button>
            </div>
          </div>

          {/* フィルタリング */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="利用者名または担当指導員名で検索..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 担当指導員選択 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              担当指導員を選択（未選択で全解除）
            </label>
            <select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={updating}
            >
              <option value="">未設定（担当指導員を解除）</option>
              {availableInstructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          {/* 選択状況表示 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              選択済み: {selectedUsers.length}件 / 表示中: {filteredUsers.length}件
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={updating}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    利用者名
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    現在の担当指導員
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((relation) => (
                  <tr key={relation.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(relation.user_id)}
                        onChange={() => toggleUserSelection(relation.user_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={updating}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {relation.user_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {relation.instructor_name || '未設定'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              該当する利用者が見つかりません
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  利用者名
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  担当指導員
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userInstructorRelations.map((relation) => (
                <tr key={relation.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {relation.user_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {relation.instructor_name || '未設定'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelectedUser(relation)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      disabled={updating}
                    >
                      変更
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 個別変更モーダル */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedUser.user_name}の担当指導員を変更
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しい担当指導員
              </label>
              <select
                id="instructorSelect"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={selectedUser.instructor_id || ''}
              >
                <option value="">未設定</option>
                {availableInstructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={updating}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  const instructorId = document.getElementById('instructorSelect').value;
                  const newInstructorId = instructorId === '' ? null : parseInt(instructorId);
                  handleUpdateUserInstructor(selectedUser.user_id, newInstructorId);
                  setSelectedUser(null);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={updating}
              >
                {updating ? '更新中...' : '確定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInstructorAssignment;
