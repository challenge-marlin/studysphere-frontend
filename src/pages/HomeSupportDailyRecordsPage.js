import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeSupportDailyRecordsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentDailyInputs, setStudentDailyInputs] = useState({});
  const [instructorRecords, setInstructorRecords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [studentPhotos, setStudentPhotos] = useState({});
  const [photoLoading, setPhotoLoading] = useState({});

  // 生徒データを取得
  useEffect(() => {
    const fetchStudents = () => {
      const mockStudents = [
        { 
          id: 'student001', 
          name: '末吉　元気', 
          email: 'sueyoshi@example.com', 
          class: 'ITリテラシー・AIの基本',
          instructorId: 'instructor001',
          instructorName: '佐藤指導員',
          locationId: 'location001',
          locationName: '東京本校',
          progress: 75,
          lastLogin: '2024-01-15',
          status: 'active',
          loginToken: 'f9Ul-7OlL-OPZE',
          joinDate: '2024-01-01',
          canStudyAtHome: true,
          tags: ['佐藤指導員', 'ITリテラシー・AIの基本', '東京本校', '中級者', '必修科目', '初級コース']
        },
        { 
          id: 'student003', 
          name: '田中花子', 
          email: 'tanaka.h@example.com', 
          class: 'SNS運用の基礎・画像生成編集',
          instructorId: 'instructor001',
          instructorName: '佐藤指導員',
          locationId: 'location001',
          locationName: '東京本校',
          progress: 60,
          lastLogin: '2024-01-14',
          status: 'active',
          loginToken: 'aBc3-Def6-GhI9',
          joinDate: '2024-01-02',
          canStudyAtHome: true,
          tags: ['佐藤指導員', 'SNS運用の基礎・画像生成編集', '東京本校', '中級者', '必修科目', '中級コース']
        },
        { 
          id: 'student005', 
          name: '山田一郎', 
          email: 'yamada.i@example.com', 
          class: 'LP制作(HTML・CSS)',
          instructorId: 'instructor004',
          instructorName: '山田指導員',
          locationId: 'location003',
          locationName: '新宿サテライト',
          progress: 90,
          lastLogin: '2024-01-15',
          status: 'active',
          loginToken: 'mNp2-Qrs5-Tuv8',
          joinDate: '2024-01-01',
          canStudyAtHome: true,
          tags: ['山田指導員', 'LP制作(HTML・CSS)', '新宿サテライト', '上級者', '必修科目', '中級コース']
        },
        { 
          id: 'student006', 
          name: '佐藤美咲', 
          email: 'sato.m@example.com', 
          class: 'SNS管理代行・LP制作案件対応',
          instructorId: 'instructor003',
          instructorName: '鈴木指導員',
          locationId: 'location002',
          locationName: '大阪支校',
          progress: 80,
          lastLogin: '2024-01-14',
          status: 'active',
          loginToken: 'jKl3-Mno6-Pqr9',
          joinDate: '2024-01-02',
          canStudyAtHome: true,
          tags: ['鈴木指導員', 'SNS管理代行・LP制作案件対応', '大阪支校', '上級者', '必修科目', '上級コース']
        },
        { 
          id: 'student008', 
          name: '伊藤麻衣', 
          email: 'ito.m@example.com', 
          class: 'SNS管理代行・LP制作案件対応',
          instructorId: 'instructor002',
          instructorName: '田中指導員',
          locationId: 'location001',
          locationName: '東京本校',
          progress: 95,
          lastLogin: '2024-01-15',
          status: 'active',
          loginToken: 'bCd5-Efg8-Hij1',
          joinDate: '2023-12-15',
          canStudyAtHome: true,
          tags: ['田中指導員', 'SNS管理代行・LP制作案件対応', '東京本校', '上級者', '優秀', '必修科目', '上級コース']
        }
      ];

      // 現在の指導員の拠点内の在宅学習可能な生徒のみをフィルタリング
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const filteredStudents = mockStudents.filter(student => 
        student.canStudyAtHome && 
        (currentUser.role === 'admin' || 
         student.instructorId === currentUser.id || 
         student.locationId === currentUser.locationId)
      );

      setStudents(filteredStudents);
      setFilteredStudents(filteredStudents);

      // 利用可能なタグを抽出
      const allTags = new Set();
      filteredStudents.forEach(student => {
        if (student.tags) {
          student.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
    };

    fetchStudents();
  }, []);

  // 選択された日付のデータを初期化
  useEffect(() => {
    const initialDailyInputs = {};
    const initialInstructorRecords = {};

    students.forEach(student => {
      // 生徒の事前入力データ（朝の時点での入力）
      initialDailyInputs[student.id] = {
        date: selectedDate,
        temperature: '36.2',
        healthCondition: 'good', // good, normal, bad
        healthNotes: '体調は良好です。',
        plannedWork: `${student.class}の学習を進めます。`,
        actualWork: '学習を継続し、新しい内容について理解を深めました。',
        thoughts: '学習が順調に進んでいます。',
        nextGoal: '次回はより高度な内容に挑戦したいと思います。'
      };

      // 指導員の記録データ
      initialInstructorRecords[student.id] = {
        date: selectedDate,
        startTime: '10:00',
        endTime: '16:00',
        supportMethod: '電話',
        workContent: '',
        supportContent: '',
        healthStatus: ''
      };
    });

    setStudentDailyInputs(initialDailyInputs);
    setInstructorRecords(initialInstructorRecords);
  }, [students, selectedDate]);

  // AIアシスト機能
  const generateAIAssist = (field, studentId) => {
    const student = students.find(s => s.id === studentId);
    const dailyInput = studentDailyInputs[studentId] || {};
    
    if (!student || !dailyInput.healthCondition) {
      return 'データが準備できていません。';
    }
    
    let suggestion = '';
    
    switch (field) {
      case 'workContent':
        suggestion = `・${dailyInput.actualWork || '作業内容を確認'}\n・${student.class}の学習を継続\n・作業効率の向上を図る`;
        break;
      case 'supportContent':
        suggestion = `・9:00　利用者から作業開始の連絡。体調確認（体温${dailyInput.temperature || '--'}℃）\n・12:00　午前中の作業進捗を確認。${dailyInput.actualWork || '作業内容を確認'}\n・15:00　作業終了の確認。次回目標：${dailyInput.nextGoal || '目標を設定'}`;
        break;
      case 'healthStatus':
        const healthText = dailyInput.healthCondition === 'good' ? '良好' : 
                          dailyInput.healthCondition === 'normal' ? '普通' : '悪い';
        suggestion = `・体温${dailyInput.temperature || '--'}℃、体調は${healthText}\n・${dailyInput.healthNotes || '体調備考なし'}\n・適度な休憩を取るよう助言`;
        break;
      default:
        suggestion = 'AIアシストの提案を生成中...';
    }
    
    return suggestion;
  };

  // 記録を保存
  const saveRecord = (studentId) => {
    const record = instructorRecords[studentId] || {};
    console.log(`${studentId}の記録を保存:`, record);
    alert('記録を保存しました。');
  };

  // 記録を更新
  const updateRecord = (studentId, field, value) => {
    setInstructorRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  // 生徒検索
  const filterStudents = (searchTerm) => {
    setSearchTerm(searchTerm);
    applyFilters(searchTerm, selectedTags);
  };

  // タグフィルター
  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    applyFilters(searchTerm, newTags);
  };

  // フィルター適用
  const applyFilters = (search, tags) => {
    let filtered = students;

    // 検索フィルター
    if (search) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.class.toLowerCase().includes(search.toLowerCase())
      );
    }

    // タグフィルター
    if (tags.length > 0) {
      filtered = filtered.filter(student =>
        tags.some(tag => student.tags.includes(tag))
      );
    }

    setFilteredStudents(filtered);
  };

  // 日付変更
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // 生徒写真取得
  const fetchStudentPhotos = async (studentId, date) => {
    setPhotoLoading(prev => ({ ...prev, [studentId]: true }));
    
    // モック写真データ
    setTimeout(() => {
      setStudentPhotos(prev => ({
        ...prev,
        [studentId]: {
          morning: 'https://via.placeholder.com/150x150/4ade80/ffffff?text=朝',
          afternoon: 'https://via.placeholder.com/150x150/fbbf24/ffffff?text=午後',
          evening: 'https://via.placeholder.com/150x150/8b5cf6/ffffff?text=夕方'
        }
      }));
      setPhotoLoading(prev => ({ ...prev, [studentId]: false }));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={() => navigate('/instructor/dashboard?tab=home-support')}
              >
                ← 在宅支援管理に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">📝 在宅支援日次記録</h1>
                <p className="text-green-100 text-sm">在宅学習者の日次記録と支援内容の管理</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => navigate('/instructor/home-support-evaluations')}
              >
                📊 評価一覧
              </button>
              <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {filteredStudents.length}名の在宅学習者
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左カラム: フィルター・検索 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 日付選択 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📅 日付選択</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* 検索 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 検索</h3>
              <input
                type="text"
                placeholder="生徒名、メール、コースで検索..."
                value={searchTerm}
                onChange={(e) => filterStudents(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* タグフィルター */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏷️ タグフィルター</h3>
              <div className="space-y-2">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    applyFilters(searchTerm, []);
                  }}
                  className="mt-4 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  フィルターをクリア
                </button>
              )}
            </div>

            {/* 統計 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 統計</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">総在宅学習者</span>
                  <span className="text-2xl font-bold text-green-600">{students.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">表示中</span>
                  <span className="text-2xl font-bold text-blue-600">{filteredStudents.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-800 font-medium">記録未完了</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {filteredStudents.filter(s => !instructorRecords[s.id]?.workContent).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 生徒記録一覧 */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredStudents.map(student => {
                const dailyInput = studentDailyInputs[student.id] || {};
                const record = instructorRecords[student.id] || {};
                
                return (
                  <div key={student.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    {/* 生徒情報ヘッダー */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h3>
                          <p className="text-gray-600 mb-2">{student.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📚 {student.class}</span>
                            <span>👨‍🏫 {student.instructorName}</span>
                            <span>📍 {student.locationName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          {student.progress}% 完了
                        </div>
                        <div className="text-sm text-gray-500">学習進捗</div>
                      </div>
                    </div>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {student.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 生徒事前入力情報 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">👤 生徒事前入力</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">体温:</span>
                            <span className="ml-2 text-gray-600">{dailyInput.temperature}℃</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">体調:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                              dailyInput.healthCondition === 'good' ? 'bg-green-100 text-green-800' :
                              dailyInput.healthCondition === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {dailyInput.healthCondition === 'good' ? '良好' :
                               dailyInput.healthCondition === 'normal' ? '普通' : '悪い'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">予定作業:</span>
                            <p className="mt-1 text-gray-600">{dailyInput.plannedWork}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">実際の作業:</span>
                            <p className="mt-1 text-gray-600">{dailyInput.actualWork}</p>
                          </div>
                        </div>
                      </div>

                      {/* 指導員記録フォーム */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">📝 指導員記録</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                            <input
                              type="time"
                              value={record.startTime || ''}
                              onChange={(e) => updateRecord(student.id, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
                            <input
                              type="time"
                              value={record.endTime || ''}
                              onChange={(e) => updateRecord(student.id, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">支援方法</label>
                          <select
                            value={record.supportMethod || ''}
                            onChange={(e) => updateRecord(student.id, 'supportMethod', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">選択してください</option>
                            <option value="電話">電話</option>
                            <option value="オンライン">オンライン</option>
                            <option value="訪問">訪問</option>
                            <option value="メール">メール</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            作業内容
                            <button
                              onClick={() => updateRecord(student.id, 'workContent', generateAIAssist('workContent', student.id))}
                              className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                            >
                              🤖 AI提案
                            </button>
                          </label>
                          <textarea
                            value={record.workContent || ''}
                            onChange={(e) => updateRecord(student.id, 'workContent', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="作業内容を記録してください..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            支援内容
                            <button
                              onClick={() => updateRecord(student.id, 'supportContent', generateAIAssist('supportContent', student.id))}
                              className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                            >
                              🤖 AI提案
                            </button>
                          </label>
                          <textarea
                            value={record.supportContent || ''}
                            onChange={(e) => updateRecord(student.id, 'supportContent', e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="支援内容を記録してください..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            健康状態
                            <button
                              onClick={() => updateRecord(student.id, 'healthStatus', generateAIAssist('healthStatus', student.id))}
                              className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-all duration-200"
                            >
                              🤖 AI提案
                            </button>
                          </label>
                          <textarea
                            value={record.healthStatus || ''}
                            onChange={(e) => updateRecord(student.id, 'healthStatus', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder="健康状態を記録してください..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => saveRecord(student.id)}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                          >
                            💾 保存
                          </button>
                          <button
                            onClick={() => fetchStudentPhotos(student.id, selectedDate)}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                          >
                            📸 写真確認
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 写真表示エリア */}
                    {studentPhotos[student.id] && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">📸 当日の写真</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <img
                              src={studentPhotos[student.id].morning}
                              alt="朝の写真"
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-600">朝</p>
                          </div>
                          <div className="text-center">
                            <img
                              src={studentPhotos[student.id].afternoon}
                              alt="午後の写真"
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-600">午後</p>
                          </div>
                          <div className="text-center">
                            <img
                              src={studentPhotos[student.id].evening}
                              alt="夕方の写真"
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-600">夕方</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {photoLoading[student.id] && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">写真を読み込み中...</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSupportDailyRecordsPage; 