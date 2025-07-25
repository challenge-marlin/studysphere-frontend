import React, { useState, useEffect } from 'react';

const mockAllUsers = [
  { id: 'student001', name: '末吉　元気', email: 'sueyoshi@example.com', class: 'ITリテラシー・AIの基本', instructorId: 'instructor001', instructorName: '佐藤指導員', locationId: 'location001', locationName: '東京本校', progress: 75, lastLogin: '2024-01-15', status: 'active', loginToken: 'f9Ul-7OlL-OPZE', joinDate: '2024-01-01', canStudyAtHome: true, tags: ['佐藤指導員', 'ITリテラシー・AIの基本', '東京本校', '中級者', '必修科目', '初級コース'] },
  { id: 'student002', name: '小渕　正明', email: 'obuchi@example.com', class: 'ITリテラシー・AIの基本', instructorId: 'instructor002', instructorName: '田中指導員', locationId: 'location001', locationName: '東京本校', progress: 25, lastLogin: '2024-01-14', status: 'active', loginToken: 'uEmA-W5hw-tZNz', joinDate: '2024-01-03', canStudyAtHome: false, tags: ['田中指導員', 'ITリテラシー・AIの基本', '東京本校', '初級者', '必修科目', '初級コース'] },
  { id: 'student003', name: '田中花子', email: 'tanaka.h@example.com', class: 'SNS運用の基礎・画像生成編集', instructorId: 'instructor001', instructorName: '佐藤指導員', locationId: 'location001', locationName: '東京本校', progress: 60, lastLogin: '2024-01-14', status: 'active', loginToken: 'aBc3-Def6-GhI9', joinDate: '2024-01-02', canStudyAtHome: true, tags: ['佐藤指導員', 'SNS運用の基礎・画像生成編集', '東京本校', '中級者', '必修科目', '中級コース'] },
  { id: 'student004', name: '鈴木太郎', email: 'suzuki.t@example.com', class: 'オフィスソフトの操作・文書作成', instructorId: 'instructor002', instructorName: '田中指導員', locationId: 'location001', locationName: '東京本校', progress: 40, lastLogin: '2024-01-13', status: 'active', loginToken: 'xYz1-Abc4-DeF7', joinDate: '2024-01-04', canStudyAtHome: false, tags: ['田中指導員', 'オフィスソフトの操作・文書作成', '東京本校', '初級者', '選択科目', '初級コース'] },
  { id: 'student005', name: '山田一郎', email: 'yamada.i@example.com', class: 'LP制作(HTML・CSS)', instructorId: 'instructor004', instructorName: '山田指導員', locationId: 'location003', locationName: '新宿サテライト', progress: 90, lastLogin: '2024-01-15', status: 'active', loginToken: 'mNp2-Qrs5-Tuv8', joinDate: '2024-01-01', canStudyAtHome: true, tags: ['山田指導員', 'LP制作(HTML・CSS)', '新宿サテライト', '上級者', '必修科目', '中級コース'] },
];

const AddHomeSupportUserModal = ({ isOpen, onClose, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    setAvailableUsers(mockAllUsers);
    setSelectedUsers(mockAllUsers.filter(u => u.canStudyAtHome).map(u => u.id));
  }, [isOpen]);

  // 全てのタグを取得
  const getAllTags = () => {
    const allTags = new Set();
    availableUsers.forEach(user => {
      user.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // タグの選択/選択解除
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // ユーザーの選択/選択解除
  const toggleUser = (user) => {
    setSelectedUsers(prev => 
      prev.includes(user.id) 
        ? prev.filter(id => id !== user.id)
        : [...prev, user.id]
    );
  };

  // フィルタリングされたユーザーリストを取得
  const getFilteredUsers = () => {
    let filtered = availableUsers;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(user =>
        selectedTags.every(tag => user.tags?.includes(tag))
      );
    }
    
    return filtered;
  };

  // 選択したユーザーを追加
  const handleAdd = () => {
    const usersToAdd = availableUsers.filter(user => selectedUsers.includes(user.id));
    onAdd(usersToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">在宅支援利用者を追加</h3>
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 検索フィルター */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="利用者名、メール、クラス、指導員名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {/* タグフィルター */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">タグフィルター:</label>
              <div className="flex flex-wrap gap-2">
                {getAllTags().map(tag => (
                  <button
                    key={tag}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedTags.includes(tag) 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ユーザーリスト */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>選択中: {selectedUsers.length}名</span>
              <span>表示: {getFilteredUsers().length}名</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getFilteredUsers().map(user => (
                <div 
                  key={user.id} 
                  className={`p-4 border rounded-xl transition-all duration-200 ${
                    selectedUsers.includes(user.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{user.name}</h4>
                        <span className="text-sm text-gray-500">{user.locationName}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.class}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={handleAdd}
              disabled={selectedUsers.length === 0}
            >
              {selectedUsers.length}名の利用者を追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHomeSupportUserModal; 