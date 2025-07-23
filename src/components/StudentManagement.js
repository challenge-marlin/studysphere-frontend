import React, { useState, useEffect } from 'react';

const StudentManagement = ({ teacherId }) => {
  // 管理者画面で作成されたコースデータを取得
  const [availableCourses, setAvailableCourses] = useState([]);
  
  // タグ管理用のstate
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [tagsToAdd, setTagsToAdd] = useState([]);
  const [customTags, setCustomTags] = useState([
    '優秀', '要フォロー', '積極的', '消極的', '欠席が多い', '質問が多い', '理解度高い', '理解度低い'
  ]);
  
  // コースデータを取得する関数
  const fetchCourses = () => {
    // ローカルストレージからコースデータを取得
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      setAvailableCourses(JSON.parse(storedCourses));
    } else {
      // デフォルトのコースデータ（管理者画面と同じ）
      const defaultCourses = [
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
          isElective: true,
          prerequisites: [],
          order: 0
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
          prerequisites: ['course002'],
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
          prerequisites: ['course003'],
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
          prerequisites: ['course004'],
          order: 4
        }
      ];
      setAvailableCourses(defaultCourses);
      localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
  };

  // コンポーネントマウント時にコースデータを取得
  useEffect(() => {
    fetchCourses();
  }, []);

  // 新規タグを作成する関数
  const createNewTag = () => {
    if (newTagName.trim() && !customTags.includes(newTagName.trim())) {
      setCustomTags([...customTags, newTagName.trim()]);
      setNewTagName('');
    }
  };

  // 生徒の選択状態を切り替える関数
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 全生徒を選択/選択解除する関数
  const toggleAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  // タグを追加/削除する関数
  const toggleTagToAdd = (tag) => {
    setTagsToAdd(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 一括タグ付与を実行する関数
  const applyTagsToStudents = () => {
    if (selectedStudents.length === 0) {
      alert('生徒を選択してください。');
      return;
    }
    if (tagsToAdd.length === 0) {
      alert('付与するタグを選択してください。');
      return;
    }

    setStudents(students.map(student => {
      if (selectedStudents.includes(student.id)) {
        // 既存のタグに新しいタグを追加（重複は除外）
        const existingTags = student.tags || [];
        const newTags = [...new Set([...existingTags, ...tagsToAdd])];
        
        return {
          ...student,
          tags: newTags
        };
      }
      return student;
    }));

    // モーダルをリセット
    setSelectedStudents([]);
    setTagsToAdd([]);
    setShowTagModal(false);
    
    alert(`${selectedStudents.length}名の生徒に${tagsToAdd.length}個のタグを付与しました。`);
  };

  // 適切なタグを生成する関数
  const generateTags = (courseTitle, instructorName, locationName, progress) => {
    const tags = [instructorName, courseTitle, locationName];
    
    // 進捗に基づくレベルタグ
    if (progress >= 80) {
      tags.push('上級者');
      if (progress >= 95) tags.push('優秀');
    } else if (progress >= 50) {
      tags.push('中級者');
    } else {
      tags.push('初級者');
    }
    
    // コースの難易度に基づくタグ
    const course = availableCourses.find(c => c.title === courseTitle);
    if (course) {
      switch (course.difficulty) {
        case 'beginner':
          tags.push('初級コース');
          break;
        case 'intermediate':
          tags.push('中級コース');
          break;
        case 'advanced':
          tags.push('上級コース');
          break;
        default:
          tags.push('初級コース');
          break;
      }
      
      // コースカテゴリに基づくタグ
      if (course.category === '必修科目') {
        tags.push('必修科目');
      } else {
        tags.push('選択科目');
      }
    }
    
    return tags;
  };

  const [students, setStudents] = useState([
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
      id: 'student002', 
      name: '小渕　正明', 
      email: 'obuchi@example.com', 
      class: 'ITリテラシー・AIの基本',
      instructorId: 'instructor002',
      instructorName: '田中指導員',
      locationId: 'location001',
      locationName: '東京本校',
      progress: 25,
      lastLogin: '2024-01-14',
      status: 'active',
      loginToken: 'uEmA-W5hw-tZNz',
      joinDate: '2024-01-03',
      canStudyAtHome: false,
      tags: ['田中指導員', 'ITリテラシー・AIの基本', '東京本校', '初級者', '必修科目', '初級コース']
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
      id: 'student004', 
      name: '鈴木太郎', 
      email: 'suzuki.t@example.com', 
      class: 'オフィスソフトの操作・文書作成',
      instructorId: 'instructor002',
      instructorName: '田中指導員',
      locationId: 'location001',
      locationName: '東京本校',
      progress: 40,
      lastLogin: '2024-01-13',
      status: 'active',
      loginToken: 'xYz1-Abc4-DeF7',
      joinDate: '2024-01-04',
      canStudyAtHome: false,
      tags: ['田中指導員', 'オフィスソフトの操作・文書作成', '東京本校', '初級者', '選択科目', '初級コース']
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
      id: 'student007', 
      name: '高橋健太', 
      email: 'takahashi.k@example.com', 
      class: 'SNS運用の基礎・画像生成編集',
      instructorId: 'instructor001',
      instructorName: '佐藤指導員',
      locationId: 'location001',
      locationName: '東京本校',
      progress: 15,
      lastLogin: '2024-01-12',
      status: 'inactive',
      loginToken: 'sT4-uVw7-Xyz0',
      joinDate: '2024-01-06',
      canStudyAtHome: false,
      tags: ['佐藤指導員', 'SNS運用の基礎・画像生成編集', '東京本校', '初級者', '必修科目', '中級コース']
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
  ]);

  // 現在ログイン中の指導員情報を取得
  const getCurrentInstructor = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser;
  };

  const currentInstructor = getCurrentInstructor();
  
  // フィルタリングされた生徒リストを取得
  const getFilteredStudents = () => {
    let filteredStudents = students;
    
    // ロールベースのフィルタリング（管理者は全生徒、指導員は拠点内生徒）
    if (currentInstructor.role !== 'admin') {
      filteredStudents = filteredStudents.filter(student => 
        student.instructorId === currentInstructor.id || // 自分の生徒
        student.locationId === currentInstructor.locationId // 同一拠点の生徒
      );
    }
    
    // 検索キーワードでフィルタリング
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // タグでフィルタリング
    if (selectedTags.length > 0) {
      filteredStudents = filteredStudents.filter(student =>
        selectedTags.every(tag => student.tags?.includes(tag))
      );
    }
    
    // ステータスでフィルタリング
    if (statusFilter !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.status === statusFilter
      );
    }
    
    return filteredStudents;
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    locationId: '',
    canStudyAtHome: false
  });
  
  // 一括入力用のstate
  const [bulkInputMode, setBulkInputMode] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkLocationId, setBulkLocationId] = useState('');
  const [bulkCanStudyAtHome, setBulkCanStudyAtHome] = useState(false);
  
  // 検索・フィルター関連のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  
  // 全てのタグを取得
  const getAllTags = () => {
    const allTags = new Set();
    students.forEach(student => {
      student.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const generateLoginToken = () => {
    return 'token' + Math.random().toString(36).substr(2, 9);
  };

  // 拠点データを取得する関数
  const getAvailableLocations = () => {
    // ローカルストレージから拠点データを取得
    const storedFacilities = localStorage.getItem('facilities');
    if (storedFacilities) {
      const facilities = JSON.parse(storedFacilities);
      const allLocations = [];
      facilities.forEach(facility => {
        facility.locations.forEach(location => {
          allLocations.push({
            id: location.id,
            name: location.name,
            facilityName: facility.name
          });
        });
      });
      return allLocations;
    } else {
      // デフォルトの拠点データ
      return [
        { id: 'location001', name: '東京本校', facilityName: 'スタディスフィア東京校' },
        { id: 'location002', name: '大阪支校', facilityName: 'スタディスフィア大阪校' },
        { id: 'location003', name: '新宿サテライト', facilityName: 'スタディスフィア東京校' },
        { id: 'location004', name: '池袋教室', facilityName: 'スタディスフィア東京校' },
        { id: 'location005', name: '難波教室', facilityName: 'スタディスフィア大阪校' },
        { id: 'location006', name: '名古屋本校', facilityName: 'スタディスフィア名古屋校' },
        { id: 'location007', name: '福岡本校', facilityName: 'スタディスフィア福岡校' },
        { id: 'location008', name: '天神教室', facilityName: 'スタディスフィア福岡校' },
        { id: 'location009', name: '札幌本校', facilityName: 'スタディスフィア札幌校' },
        { id: 'location010', name: '仙台本校', facilityName: 'スタディスフィア仙台校' }
      ];
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    
    if (bulkInputMode) {
      handleBulkAddStudents();
      return;
    }
    
    const studentId = `student${String(students.length + 1).padStart(3, '0')}`;
    const selectedLocation = getAvailableLocations().find(location => location.id === newStudent.locationId);
    
    const student = {
      id: studentId,
      name: newStudent.name,
      email: newStudent.email,
      class: 'ITリテラシー・AIの基本', // デフォルトクラス
      instructorId: currentInstructor.id,
      instructorName: currentInstructor.name,
      locationId: newStudent.locationId,
      locationName: selectedLocation ? selectedLocation.name : '',
      progress: 0,
      lastLogin: null,
      status: 'active',
      loginToken: generateLoginToken(),
      joinDate: new Date().toISOString().split('T')[0],
      canStudyAtHome: newStudent.canStudyAtHome,
      tags: generateTags('ITリテラシー・AIの基本', currentInstructor.name, selectedLocation ? selectedLocation.name : '', 0)
    };
    
    setStudents([...students, student]);
    setNewStudent({ name: '', email: '', locationId: '', canStudyAtHome: false });
    setShowAddForm(false);
    
    alert('生徒を追加しました。');
  };

  // 一括入力で生徒を追加する関数
  const handleBulkAddStudents = () => {
    if (!bulkInputText.trim()) {
      alert('生徒情報を入力してください。');
      return;
    }
    
    if (!bulkLocationId) {
      alert('拠点を選択してください。');
      return;
    }
    
    const lines = bulkInputText.trim().split('\n').filter(line => line.trim());
    const selectedLocation = getAvailableLocations().find(location => location.id === bulkLocationId);
    const newStudents = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1];
        
        if (name && email) {
          const studentId = `student${String(students.length + newStudents.length + 1).padStart(3, '0')}`;
          const student = {
            id: studentId,
            name: name,
            email: email,
            class: 'ITリテラシー・AIの基本', // デフォルトクラス
            instructorId: currentInstructor.id,
            instructorName: currentInstructor.name,
            locationId: bulkLocationId,
            locationName: selectedLocation ? selectedLocation.name : '',
            progress: 0,
            lastLogin: null,
            status: 'active',
            loginToken: generateLoginToken(),
            joinDate: new Date().toISOString().split('T')[0],
            canStudyAtHome: bulkCanStudyAtHome,
            tags: generateTags('ITリテラシー・AIの基本', currentInstructor.name, selectedLocation ? selectedLocation.name : '', 0)
          };
          newStudents.push(student);
        }
      }
    });
    
    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setBulkInputText('');
      setBulkLocationId('');
      setBulkCanStudyAtHome(false);
      setBulkInputMode(false);
      setShowAddForm(false);
      
      alert(`${newStudents.length}名の生徒を追加しました。`);
    } else {
      alert('有効な生徒情報が見つかりませんでした。\n形式: 生徒名,メールアドレス');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  const copyLoginUrl = (token) => {
    const loginUrl = `http://localhost:3000/student/login/${token}`;
    navigator.clipboard.writeText(loginUrl);
    alert('ログインURLがクリップボードにコピーされました！');
  };

  // 生徒の進捗を更新する関数（未使用）
  // const updateStudentProgress = (studentId, newProgress) => {
  //   setStudents(students.map(student => {
  //     if (student.id === studentId) {
  //       // 進捗に基づいてタグを再生成
  //       const updatedTags = generateTags(
  //         student.class, 
  //         student.instructorName, 
  //         student.locationName, 
  //         newProgress
  //       );
  //       
  //       return { 
  //         ...student, 
  //         progress: newProgress,
  //         tags: updatedTags
  //       };
  //     }
  //     return student;
  //   }));
  // };

  const toggleStudentStatus = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: student.status === 'active' ? 'inactive' : 'active' }
        : student
    ));
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('この生徒を削除してもよろしいですか？')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleViewStudentDetail = (studentId) => {
    // 生徒詳細画面に遷移
    window.location.href = `/instructor/student/${studentId}`;
  };

  const openRecordModal = (studentId) => {
    alert(`${studentId}の在宅記録画面を開きます（実装予定）`);
  };

  // 本日有効ボタン：アクティブな生徒全員にメール送信
  const sendTodayActiveEmails = () => {
    const activeStudents = getFilteredStudents().filter(student => student.status === 'active');
    
    if (activeStudents.length === 0) {
      alert('送信対象の生徒がいません。');
      return;
    }
    
    const confirmMessage = `${activeStudents.length}名の生徒に本日のログインURLをメール送信しますか？\n\n対象生徒:\n${activeStudents.map(s => s.name).join('\n')}`;
    
    if (window.confirm(confirmMessage)) {
      // 実際の実装では、ここでバックエンドAPIを呼び出してメール送信
      alert(`${activeStudents.length}名の生徒にログインURLを送信しました。\n\n送信済み:\n${activeStudents.map(s => `${s.name} (${s.email})`).join('\n')}`);
    }
  };

  // 個別メール再送信
  const resendEmail = (student) => {
    const loginUrl = `http://localhost:3000/student/login/${student.loginToken}`;
    if (window.confirm(`${student.name}さんにログインURLを再送信しますか？\n\nメール: ${student.email}\nURL: ${loginUrl}`)) {
      alert(`${student.name}さんにログインURLを送信しました。`);
    }
  };

  // タグの選択/選択解除
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 全てのフィルターをクリア
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              👥 生徒管理
            </h2>
            {(currentInstructor.role === 'instructor' || currentInstructor.role === 'teacher') && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">{currentInstructor.locationName} ({currentInstructor.facilityName})</p>
                  <p className="text-sm text-gray-500">※同一拠点の他の指導員の生徒も管理できます</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowTagModal(true)}
            >
              🏷️ タグ一括追加
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={sendTodayActiveEmails}
            >
              📧 本日有効
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowAddForm(true)}
            >
              + 新しい生徒を追加
            </button>
          </div>
        </div>
      </div>

      {/* フィルター部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="space-y-6">
          {/* トップフィルター */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="生徒名、メール、クラス、指導員名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">全てのステータス</option>
                <option value="active">稼働中</option>
                <option value="inactive">停止中</option>
              </select>
              <button 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                onClick={clearFilters}
              >
                クリア
              </button>
            </div>
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
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* フィルターサマリー */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="font-semibold text-gray-700">
                表示中: {getFilteredStudents().length}名 / 全{students.length}名
              </span>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">選択中のタグ:</span>
                <div className="flex gap-1">
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 生徒追加モーダル */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">新しい生徒を追加</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    setShowAddForm(false);
                    setBulkInputMode(false);
                    setBulkInputText('');
                    setBulkLocationId('');
                    setBulkCanStudyAtHome(false);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                <button 
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !bulkInputMode 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setBulkInputMode(false)}
                >
                  個別入力
                </button>
                <button 
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    bulkInputMode 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setBulkInputMode(true)}
                >
                  一括入力
                </button>
              </div>
              
              <form onSubmit={handleAddStudent} className="space-y-6">
                {!bulkInputMode ? (
                  // 個別入力モード
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">生徒名</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newStudent.name}
                          onChange={handleInputChange}
                          required
                          placeholder="生徒の名前を入力"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={newStudent.email}
                          onChange={handleInputChange}
                          required
                          placeholder="メールアドレスを入力"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">拠点</label>
                        <select
                          id="location"
                          name="locationId"
                          value={newStudent.locationId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">拠点を選択</option>
                          {getAvailableLocations().map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.facilityName})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <label htmlFor="canStudyAtHome" className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            id="canStudyAtHome"
                            name="canStudyAtHome"
                            checked={newStudent.canStudyAtHome}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">在宅学習可能</span>
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  // 一括入力モード
                  <>
                    <div>
                      <label htmlFor="bulkInput" className="block text-sm font-semibold text-gray-700 mb-2">生徒情報（1行に1人）</label>
                      <textarea
                        id="bulkInput"
                        value={bulkInputText}
                        onChange={(e) => setBulkInputText(e.target.value)}
                        placeholder="生徒名,メールアドレス&#10;例:&#10;田中太郎,tanaka@example.com&#10;佐藤花子,sato@example.com"
                        rows={8}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="text-sm text-gray-500 mt-2">形式: 生徒名,メールアドレス（カンマ区切り）</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="bulkLocation" className="block text-sm font-semibold text-gray-700 mb-2">拠点</label>
                        <select
                          id="bulkLocation"
                          value={bulkLocationId}
                          onChange={(e) => setBulkLocationId(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">拠点を選択</option>
                          {getAvailableLocations().map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.facilityName})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <label htmlFor="bulkCanStudyAtHome" className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            id="bulkCanStudyAtHome"
                            checked={bulkCanStudyAtHome}
                            onChange={(e) => setBulkCanStudyAtHome(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">在宅学習可能</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                    onClick={() => {
                      setShowAddForm(false);
                      setBulkInputMode(false);
                      setBulkInputText('');
                      setBulkLocationId('');
                      setBulkCanStudyAtHome(false);
                    }}
                  >
                    キャンセル
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {bulkInputMode ? '一括追加' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 生徒テーブル */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === getFilteredStudents().length && getFilteredStudents().length > 0}
                    onChange={toggleAllStudents}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">利用者名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">タグ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">ログインURL</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">状態</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">進行度</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">合格確認</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">成果物確認</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">メール送信</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">一時停止/再開</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">削除</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200">在宅記録</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredStudents().map(student => (
                <tr key={student.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <button 
                        className="text-left font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        onClick={() => handleViewStudentDetail(student.id)}
                        title="生徒詳細を表示"
                      >
                        {student.name}
                      </button>
                      <span className="text-sm text-gray-500">
                        担当: {student.instructorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                        {student.loginToken}
                      </code>
                      <button 
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                        onClick={() => copyLoginUrl(student.loginToken)}
                        title="トークンをコピー"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? '稼働中' : '停止中'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{student.progress}%</span>
                        <span className="text-gray-500">
                          {(() => {
                            const course = availableCourses.find(c => c.title === student.class);
                            if (course) {
                              const currentLesson = Math.ceil((student.progress / 100) * course.totalLessons);
                              return `第${currentLesson}回 / ${course.totalLessons}回`;
                            }
                            return '';
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            student.progress >= 75 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : student.progress >= 50 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                                : 'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.progress >= 75 
                        ? 'bg-green-100 text-green-800' 
                        : student.progress > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.progress >= 75 ? '合格' : student.progress > 0 ? '受講中' : '未開始'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.progress >= 50 
                        ? 'bg-blue-100 text-blue-800' 
                        : student.progress > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.progress >= 50 ? '確認済' : student.progress > 0 ? '確認待ち' : '未開始'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all duration-200"
                      onClick={() => resendEmail(student)}
                    >
                      📧 再送信
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        student.status === 'active' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      onClick={() => toggleStudentStatus(student.id)}
                    >
                      {student.status === 'active' ? '停止' : '再開'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200"
                      onClick={() => deleteStudent(student.id)}
                    >
                      削除
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {student.canStudyAtHome ? (
                      <button 
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all duration-200"
                        onClick={() => openRecordModal(student.id)}
                      >
                        在宅学習
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm">
                        在宅不可
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* タグ一括追加モーダル */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">🏷️ タグ一括追加</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    setShowTagModal(false);
                    setSelectedStudents([]);
                    setTagsToAdd([]);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* 生徒選択セクション */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 生徒選択</h4>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-700">選択中の生徒: <strong className="text-indigo-600">{selectedStudents.length}名</strong></p>
                  <button 
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-all duration-200"
                    onClick={toggleAllStudents}
                  >
                    {selectedStudents.length === getFilteredStudents().length ? '全選択解除' : '全選択'}
                  </button>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {getFilteredStudents().map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{student.name}</span>
                        <span className="text-sm text-gray-500 ml-2">担当: {student.instructorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* タグ選択セクション */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🏷️ 付与するタグ</h4>
                
                {/* 新規タグ作成 */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-3">新規タグ作成</h5>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="新しいタグ名を入力"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                    <button 
                      className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-all duration-200"
                      onClick={createNewTag}
                    >
                      作成
                    </button>
                  </div>
                </div>
                
                {/* 既存タグ選択 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800">既存タグ選択</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {customTags.map(tag => (
                      <button
                        key={tag}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          tagsToAdd.includes(tag)
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                        onClick={() => toggleTagToAdd(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => {
                    setShowTagModal(false);
                    setSelectedStudents([]);
                    setTagsToAdd([]);
                  }}
                >
                  キャンセル
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={applyTagsToStudents}
                >
                  タグを適用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 