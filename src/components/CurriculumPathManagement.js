import React, { useState } from 'react';

const CurriculumPathManagement = () => {
  // カリキュラムパスのサンプルデータ
  const [curriculumPaths, setCurriculumPaths] = useState([
    {
      id: 'path001',
      name: 'デジタルマーケティングコース',
      description: 'SNS運用からLP制作まで、デジタルマーケティングの実践スキルを習得',
      targetAudience: 'マーケティング職志望者',
      duration: '12ヶ月',
      totalCourses: 4,
      courses: [
        {
          courseId: 'course002', // ITリテラシー・AIの基本
          order: 1,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        },
        {
          courseId: 'course003', // SNS運用の基礎・画像生成編集
          order: 2,
          isRequired: true,
          estimatedDuration: '6ヶ月'
        },
        {
          courseId: 'course004', // LP制作(HTML・CSS)
          order: 3,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        },
        {
          courseId: 'course005', // SNS管理代行・LP制作案件対応
          order: 4,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        }
      ],
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: 'path002',
      name: 'オフィススキルアップコース',
      description: '基本的なオフィスソフトの操作から実務活用まで',
      targetAudience: '事務職志望者・社会人',
      duration: '3ヶ月',
      totalCourses: 1,
      courses: [
        {
          courseId: 'course001', // オフィスソフトの操作・文書作成
          order: 1,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        }
      ],
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10'
    },
    {
      id: 'path003',
      name: 'Web制作フルコース',
      description: 'Web制作の基礎から実践まで、包括的なスキルを習得',
      targetAudience: 'Web制作職志望者',
      duration: '9ヶ月',
      totalCourses: 3,
      courses: [
        {
          courseId: 'course002', // ITリテラシー・AIの基本
          order: 1,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        },
        {
          courseId: 'course004', // LP制作(HTML・CSS)
          order: 2,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        },
        {
          courseId: 'course005', // SNS管理代行・LP制作案件対応
          order: 3,
          isRequired: true,
          estimatedDuration: '3ヶ月'
        }
      ],
      status: 'draft',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12'
    }
  ]);

  // 利用可能なコースデータ（実際はpropsで渡される）
  const availableCourses = [
    { id: 'course001', title: 'オフィスソフトの操作・文書作成', category: '選択科目' },
    { id: 'course002', title: 'ITリテラシー・AIの基本', category: '必修科目' },
    { id: 'course003', title: 'SNS運用の基礎・画像生成編集', category: '必修科目' },
    { id: 'course004', title: 'LP制作(HTML・CSS)', category: '必修科目' },
    { id: 'course005', title: 'SNS管理代行・LP制作案件対応', category: '必修科目' }
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // コース名を取得
  const getCourseName = (courseId) => {
    const course = availableCourses.find(c => c.id === courseId);
    return course ? course.title : courseId;
  };

  // フィルタリング機能
  const getFilteredPaths = () => {
    let filtered = curriculumPaths;

    if (searchTerm) {
      filtered = filtered.filter(path =>
        path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(path => path.status === statusFilter);
    }

    return filtered;
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

  const getSortedPaths = () => {
    const filtered = getFilteredPaths();
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

  // パス編集処理
  const handleEditPath = (path) => {
    setSelectedPath(path);
    setShowEditModal(true);
  };

  // パス削除処理
  const handleDeletePath = (pathId) => {
    if (window.confirm('このカリキュラムパスを削除してもよろしいですか？\n※削除すると元に戻せません。')) {
      setCurriculumPaths(curriculumPaths.filter(path => path.id !== pathId));
      alert('カリキュラムパスが削除されました。');
    }
  };

  // ステータス表示用の関数
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '公開中';
      case 'inactive': return '非公開';
      case 'draft': return '下書き';
      default: return status;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">🎯 カリキュラムパス管理</h2>
        <p className="text-gray-600 text-lg">複数のカリキュラムパスを作成・管理し、受講者の学習経路を最適化できます。</p>
      </div>

      {/* フィルターセクション */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="パス名、説明、対象者で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-6 items-end mb-4">
          <div className="flex flex-col min-w-[150px]">
            <label className="font-semibold text-gray-700 mb-2 text-sm">ステータス:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            >
              <option value="all">全てのステータス</option>
              <option value="active">公開中</option>
              <option value="inactive">非公開</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-700"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            フィルタークリア
          </button>
        </div>

        <div className="font-semibold text-gray-700 text-sm">
          表示中: {getSortedPaths().length}パス / 全{curriculumPaths.length}パス
        </div>
      </div>

      {/* パス一覧テーブル */}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto p-6 mb-8 w-full">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                onClick={() => handleSort('name')}
              >
                🎯 パス名
                {sortConfig.key === 'name' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                onClick={() => handleSort('targetAudience')}
              >
                👥 対象者
                {sortConfig.key === 'targetAudience' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                onClick={() => handleSort('duration')}
              >
                ⏱️ 期間
                {sortConfig.key === 'duration' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                onClick={() => handleSort('totalCourses')}
              >
                📚 コース数
                {sortConfig.key === 'totalCourses' && (
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📖 コース構成</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📅 最終更新</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚙️ 操作</th>
            </tr>
          </thead>
          <tbody>
            {getSortedPaths().map(path => (
              <tr key={path.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div>
                    <strong className="text-gray-800">{path.name}</strong>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{path.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{path.targetAudience}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700 font-medium">{path.duration}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-800">{path.totalCourses}コース</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    path.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : path.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(path.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {path.courses.map((course, index) => (
                      <div key={course.courseId} className="flex items-center gap-1">
                        <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {course.order}
                        </span>
                        <span className="text-gray-700 text-sm">{getCourseName(course.courseId)}</span>
                        {index < path.courses.length - 1 && (
                          <span className="text-gray-400 text-sm">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  📅 {path.updatedAt}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                      onClick={() => handleEditPath(path)}
                      title="編集"
                    >
                      ✏️ 編集
                    </button>
                    <button 
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                      onClick={() => handleDeletePath(path.id)}
                      title="削除"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {getSortedPaths().length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">条件に合致するカリキュラムパスが見つかりません。</p>
        </div>
      )}

      <div className="text-center mb-8">
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          onClick={() => setShowAddModal(true)}
        >
          + 新しいカリキュラムパスを作成
        </button>
      </div>

      {/* パス統計サマリー（下部に移動） */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">総パス数</h3>
          <p className="text-3xl font-bold text-indigo-600 mb-2">{curriculumPaths.length}</p>
          <small className="text-gray-500">全カテゴリ</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">公開中パス</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">{curriculumPaths.filter(p => p.status === 'active').length}</p>
          <small className="text-gray-500">アクティブ</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">平均コース数</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(curriculumPaths.reduce((sum, p) => sum + p.totalCourses, 0) / curriculumPaths.length)}
          </p>
          <small className="text-gray-500">パスあたり</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">最長期間</h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {Math.max(...curriculumPaths.map(p => parseInt(p.duration)))}
          </p>
          <small className="text-gray-500">ヶ月</small>
        </div>
      </div>

      {/* パス編集モーダル */}
      {showEditModal && selectedPath && (
        <PathEditModal
          path={selectedPath}
          availableCourses={availableCourses}
          onUpdate={(updatedPath) => {
            setCurriculumPaths(curriculumPaths.map(path => 
              path.id === updatedPath.id ? updatedPath : path
            ));
            setShowEditModal(false);
            setSelectedPath(null);
          }}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPath(null);
          }}
        />
      )}
    </div>
  );
};

// パス編集モーダルコンポーネント
const PathEditModal = ({ path, availableCourses, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: path.name,
    description: path.description,
    targetAudience: path.targetAudience,
    duration: path.duration,
    status: path.status,
    courses: [...path.courses]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseOrderChange = (index, newOrder) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index].order = parseInt(newOrder);
    updatedCourses.sort((a, b) => a.order - b.order);
    
    setFormData(prev => ({
      ...prev,
      courses: updatedCourses
    }));
  };

  const handleAddCourse = () => {
    const newCourse = {
      courseId: '',
      order: formData.courses.length + 1,
      isRequired: true,
      estimatedDuration: '3ヶ月'
    };
    
    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = formData.courses.filter((_, i) => i !== index);
    // 順序を再調整
    updatedCourses.forEach((course, i) => {
      course.order = i + 1;
    });
    
    setFormData(prev => ({
      ...prev,
      courses: updatedCourses
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedPath = {
      ...path,
      ...formData,
      totalCourses: formData.courses.length,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    onUpdate(updatedPath);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">カリキュラムパス編集: {path.name}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">パス名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">対象者</label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                placeholder="例: 12ヶ月"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              >
                <option value="active">公開中</option>
                <option value="inactive">非公開</option>
                <option value="draft">下書き</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">コース構成</h4>
              <button
                type="button"
                onClick={handleAddCourse}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
              >
                + コースを追加
              </button>
            </div>

            <div className="space-y-4">
              {formData.courses.map((course, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">順序</label>
                      <input
                        type="number"
                        value={course.order}
                        onChange={(e) => handleCourseOrderChange(index, e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">コース</label>
                      <select
                        value={course.courseId}
                        onChange={(e) => {
                          const updatedCourses = [...formData.courses];
                          updatedCourses[index].courseId = e.target.value;
                          setFormData(prev => ({ ...prev, courses: updatedCourses }));
                        }}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                      >
                        <option value="">コースを選択</option>
                        {availableCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
            >
              保存
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-600"
              onClick={onClose}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurriculumPathManagement; 