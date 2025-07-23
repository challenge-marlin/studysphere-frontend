import React, { useState } from 'react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    {
      id: 'course001',
      title: 'オフィスソフトの操作・文書作成',
      category: '選択科目',
      description: 'Word、Excel、PowerPointの基本操作を学び、実務で使える文書作成スキルを習得',
      duration: '3ヶ月',
      difficulty: 'beginner',
      totalLessons: 6,
      enrolledStudents: 12,
      completionRate: 85,
      status: 'active',
      createdDate: '2023-06-01',
      lastUpdated: '2024-01-10',
      tags: ['Word', 'Excel', 'PowerPoint', '文書作成', '選択科目'],
      isElective: true, // 選択科目フラグ
      prerequisites: [], // 前提コースなし
      order: 0 // 受講順序（選択科目は0）
    },
    {
      id: 'course002',
      title: 'ITリテラシー・AIの基本',
      category: '必修科目',
      description: 'ITの基礎知識とAIの基本概念を学び、デジタル社会で活躍するための土台を構築',
      duration: '3ヶ月',
      difficulty: 'beginner',
      totalLessons: 6,
      enrolledStudents: 15,
      completionRate: 78,
      status: 'active',
      createdDate: '2023-08-01',
      lastUpdated: '2024-01-12',
      tags: ['IT基礎', 'AI', 'Windows11', 'インターネット', '必修科目'],
      isElective: false,
      prerequisites: [],
      order: 1
    },
    {
      id: 'course003',
      title: 'SNS運用の基礎・画像生成編集',
      category: '必修科目',
      description: 'SNSマーケティングの基礎と画像編集技術を学び、効果的なコンテンツ作成スキルを習得',
      duration: '6ヶ月',
      difficulty: 'intermediate',
      totalLessons: 12,
      enrolledStudents: 8,
      completionRate: 65,
      status: 'active',
      createdDate: '2023-09-01',
      lastUpdated: '2024-01-08',
      tags: ['SNS', 'マーケティング', 'Canva', 'Recraft', 'AI画像生成'],
      isElective: false,
      prerequisites: ['course002'], // ITリテラシーが前提
      order: 2
    },
    {
      id: 'course004',
      title: 'LP制作(HTML・CSS)',
      category: '必修科目',
      description: 'HTML・CSSを使ったランディングページ制作技術を学び、Web制作の実践スキルを習得',
      duration: '3ヶ月',
      difficulty: 'intermediate',
      totalLessons: 12,
      enrolledStudents: 6,
      completionRate: 72,
      status: 'active',
      createdDate: '2023-10-01',
      lastUpdated: '2024-01-05',
      tags: ['HTML', 'CSS', 'LP制作', 'レスポンシブ', 'Web制作'],
      isElective: false,
      prerequisites: ['course003'], // SNS運用が前提
      order: 3
    },
    {
      id: 'course005',
      title: 'SNS管理代行・LP制作案件対応',
      category: '必修科目',
      description: '実際の案件を想定したSNS管理代行とLP制作の実践的なスキルを習得',
      duration: '3ヶ月',
      difficulty: 'advanced',
      totalLessons: 12,
      enrolledStudents: 4,
      completionRate: 45,
      status: 'active',
      createdDate: '2023-11-01',
      lastUpdated: '2024-01-03',
      tags: ['案件対応', 'プロジェクト管理', 'クライアント対応', '実践'],
      isElective: false,
      prerequisites: ['course004'], // LP制作が前提
      order: 4
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: '',
    description: '',
    duration: '',
    difficulty: 'beginner',
    totalLessons: '',
    tags: '',
    isElective: false,
    prerequisites: [],
    order: 1
  });

  // カテゴリ選択肢
  const categories = [
    '選択科目',
    '必修科目'
  ];

  // 前提コースの選択肢を取得
  const getPrerequisiteOptions = (currentCourseId) => {
    return courses
      .filter(course => course.id !== currentCourseId && !course.isElective)
      .sort((a, b) => a.order - b.order);
  };

  // コース名を取得
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : courseId;
  };

  // フィルタリング機能
  const getFilteredCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    return filtered;
  };

  // ソート機能を追加
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCourses = () => {
    const filtered = getFilteredCourses();
    return [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'status') {
        aValue = aValue === 'active' ? '公開中' : '非公開';
        bValue = bValue === 'active' ? '公開中' : '非公開';
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // コース追加処理
  const handleAddCourse = (e) => {
    e.preventDefault();
    
    const courseData = {
      id: `course${String(courses.length + 1).padStart(3, '0')}`,
      ...newCourse,
      enrolledStudents: 0,
      completionRate: 0,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: newCourse.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const updatedCourses = [...courses, courseData];
    setCourses(updatedCourses);
    
    // ローカルストレージにコースデータを保存
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    setNewCourse({
      title: '',
      category: '',
      description: '',
      duration: '',
      difficulty: 'beginner',
      totalLessons: '',
      tags: '',
      isElective: false,
      prerequisites: [],
      order: 1
    });
    setShowAddForm(false);
  };

  // コース編集処理
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  // レッスン管理処理
  const handleManageLessons = (courseId) => {
    // TODO: レッスン管理ページへの遷移
    console.log('レッスン管理:', courseId);
  };

  // コース削除処理
  const handleDeleteCourse = (courseId) => {
    if (window.confirm('このコースを削除しますか？この操作は取り消せません。')) {
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
    }
  };

  // コースステータス切り替え
  const toggleCourseStatus = (courseId) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        let newStatus;
        switch (course.status) {
          case 'active':
            newStatus = 'inactive';
            break;
          case 'inactive':
            newStatus = 'active';
            break;
          case 'draft':
            newStatus = 'active';
            break;
          default:
            newStatus = 'active';
        }
        return { ...course, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return course;
    });
    
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  };

  // 難易度ラベル取得
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return difficulty;
    }
  };

  // ステータスラベル取得
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return '公開中';
      case 'inactive': return '非公開';
      case 'draft': return '下書き';
      default: return status;
    }
  };

  // 入力値変更処理
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">コース管理</h2>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          onClick={() => setShowAddForm(true)}
        >
          + 新しいコースを作成
        </button>
      </div>

      {/* フィルターセクション */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="コース名、説明、タグで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-6 items-end mb-4">
          <div className="flex flex-col min-w-[150px]">
            <label className="font-semibold text-gray-700 mb-2 text-sm">カテゴリ:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            >
              <option value="all">全てのカテゴリ</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col min-w-[150px]">
            <label className="font-semibold text-gray-700 mb-2 text-sm">難易度:</label>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            >
              <option value="all">全ての難易度</option>
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
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
              <option value="active">公開中</option>
              <option value="inactive">非公開</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-700"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setDifficultyFilter('all');
              setStatusFilter('all');
            }}
          >
            フィルタークリア
          </button>
        </div>

        <div className="font-semibold text-gray-700 text-sm">
          表示中: {getFilteredCourses().length}コース / 全{courses.length}コース
        </div>
      </div>

      {/* コース統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">総コース数</h3>
          <p className="text-3xl font-bold text-indigo-600 mb-2">{courses.length}</p>
          <small className="text-gray-500">全カテゴリ</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">公開中コース</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">{courses.filter(c => c.status === 'active').length}</p>
          <small className="text-gray-500">アクティブ</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">必修科目</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">{courses.filter(c => !c.isElective).length}</p>
          <small className="text-gray-500">必須コース</small>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-gray-700 font-semibold mb-4">選択科目</h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">{courses.filter(c => c.isElective).length}</p>
          <small className="text-gray-500">選択コース</small>
        </div>
      </div>

      {/* コース一覧テーブル */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('title')}
                >
                  📚 コース名
                  {sortConfig.key === 'title' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('category')}
                >
                  🏷️ カテゴリ
                  {sortConfig.key === 'category' && (
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
                  onClick={() => handleSort('lessonCount')}
                >
                  📖 レッスン数
                  {sortConfig.key === 'lessonCount' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                  onClick={() => handleSort('enrollmentCount')}
                >
                  👥 受講者数
                  {sortConfig.key === 'enrollmentCount' && (
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📅 作成日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚙️ 操作</th>
              </tr>
            </thead>
            <tbody>
              {getSortedCourses().map(course => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 font-bold text-sm">
                          {course.title.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-800">{course.title}</strong>
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {course.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {course.duration}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-gray-700 font-medium">{course.totalLessons}レッスン</span>
                      <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${Math.min((course.totalLessons / 20) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className={`font-medium ${course.enrolledStudents > course.maxEnrollment ? 'text-red-600' : 'text-gray-800'}`}>
                        {course.enrolledStudents}/{course.maxEnrollment}
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${Math.min((course.enrolledStudents / course.maxEnrollment) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.status === 'active' ? '公開中' : '非公開'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    📅 {course.createdDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600"
                        onClick={() => handleEditCourse(course)}
                        title="編集"
                      >
                        ✏️ 編集
                      </button>
                      <button 
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 ${
                          course.status === 'active'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        onClick={() => toggleCourseStatus(course.id)}
                        title={course.status === 'active' ? '非公開にする' : '公開する'}
                      >
                        {course.status === 'active' ? '🚫 非公開' : '✅ 公開'}
                      </button>
                      <button 
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-red-600"
                        onClick={() => handleDeleteCourse(course.id)}
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

        {getSortedCourses().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">条件に合致するコースが見つかりません。</p>
          </div>
        )}
      </div>

      {/* コース追加フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">新しいコースを作成</h3>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleAddCourse}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コース名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={newCourse.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  >
                    <option value="">カテゴリを選択</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
                <small className="text-gray-500">コースの概要を簡潔に説明してください</small>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    期間 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="例: 3ヶ月"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    難易度 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={newCourse.difficulty}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  >
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    レッスン数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalLessons"
                    value={newCourse.totalLessons}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <input
                  type="text"
                  name="tags"
                  value={newCourse.tags}
                  onChange={handleInputChange}
                  placeholder="カンマ区切りで入力（例: HTML, CSS, Web制作）"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
                <small className="text-gray-500">関連キーワードをカンマ区切りで入力してください</small>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isElective"
                  checked={newCourse.isElective}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  選択科目として設定する
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
                >
                  コースを作成
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

      {/* コース編集モーダル */}
      {showEditModal && selectedCourse && (
        <CourseEditModal
          course={selectedCourse}
          courses={courses}
          onUpdate={(updatedCourse) => {
            const updatedCourses = courses.map(c => 
              c.id === updatedCourse.id ? updatedCourse : c
            );
            setCourses(updatedCourses);
            localStorage.setItem('courses', JSON.stringify(updatedCourses));
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onManageLessons={handleManageLessons}
        />
      )}
    </div>
  );
};

// コース編集モーダルコンポーネント
const CourseEditModal = ({ course, courses, onUpdate, onClose, onManageLessons }) => {
  const [editData, setEditData] = useState({
    ...course,
    tags: course.tags.join(', ')
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedCourse = {
      ...editData,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdate(updatedCourse);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">コース編集 - {course.title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コース名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={editData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              >
                <option value="選択科目">選択科目</option>
                <option value="必修科目">必修科目</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={editData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                value={editData.duration}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                難易度 <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty"
                value={editData.difficulty}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              >
                <option value="beginner">初級</option>
                <option value="intermediate">中級</option>
                <option value="advanced">上級</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レッスン数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalLessons"
                value={editData.totalLessons}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <input
              type="text"
              name="tags"
              value={editData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isElective"
              checked={editData.isElective}
              onChange={handleInputChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              選択科目として設定する
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
            >
              更新
            </button>
            <button
              type="button"
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-green-600"
              onClick={() => onManageLessons(course.id)}
            >
              レッスン管理
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

export default CourseManagement; 