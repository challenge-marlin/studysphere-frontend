import React, { useState, useEffect } from 'react';
import SanitizedInput from './SanitizedInput';
import SanitizedTextarea from './SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';
import { useAuth } from './contexts/AuthContext';
import { formatJapanTime, isExpired } from '../utils/dateUtils';
import { 
  getSatelliteUserCourses,
  getSatelliteAvailableCourses,
  getSatelliteAvailableCurriculumPaths,
  bulkAssignCoursesToUsers,
  bulkRemoveCoursesFromUsers,
  bulkAssignCurriculumPathsToUsers,
  getSupportPlanByUserId,
  upsertSupportPlan,
  apiPost,
  apiGet
} from '../utils/api';

const StudentManagement = ({ teacherId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // 管理者画面で作成されたコースデータを取得
  const [availableCourses, setAvailableCourses] = useState([]);
  
  // タグ管理用のstate
  const [showTagModal, setShowTagModal] = useState(false);
  const [showTodayActiveModal, setShowTodayActiveModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [tagsToAdd, setTagsToAdd] = useState([]);
  const [todayActiveMessage, setTodayActiveMessage] = useState('');
  
  // 一時パスワード機能用のstate
  const [tempPasswordUsers, setTempPasswordUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [tempPasswordLoading, setTempPasswordLoading] = useState(false);
  const [customTags, setCustomTags] = useState([
    '優秀', '要フォロー', '積極的', '消極的', '欠席が多い', '質問が多い', '理解度高い', '理解度低い'
  ]);
  
  // 利用者情報編集関連のstate
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    instructor_id: '',
    tags: []
  });
  
  // 個別支援計画関連のstate
  const [supportPlanData, setSupportPlanData] = useState({
    long_term_goal: '',
    short_term_goal: '',
    needs: '',
    support_content: '',
    goal_date: ''
  });
  const [existingSupportPlan, setExistingSupportPlan] = useState(null);
  
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

  // 在宅支援利用者追加・解除イベントをリッスン
  useEffect(() => {
    const handleUserAdded = () => {
      fetchStudents();
    };

    const handleUserRemoved = () => {
      fetchStudents();
    };

    window.addEventListener('homeSupportUserAdded', handleUserAdded);
    window.addEventListener('homeSupportUserRemoved', handleUserRemoved);
    
    return () => {
      window.removeEventListener('homeSupportUserAdded', handleUserAdded);
      window.removeEventListener('homeSupportUserRemoved', handleUserRemoved);
    };
  }, []);

  // コンポーネントマウント時に利用者データを取得
  useEffect(() => {
    fetchStudents();
    fetchAvailableInstructors();
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
    const filteredStudents = getFilteredStudents().filter(student => student.status === 1);
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

  const [students, setStudents] = useState([]);

  // 現在ログイン中の指導員情報を取得
  const getCurrentInstructor = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser;
  };

  const currentInstructor = getCurrentInstructor();
  
  // フィルタリングされた生徒リストを取得
  const getFilteredStudents = () => {
    let filteredStudents = students;
    // ロールベースのフィルタを削除
    // if (currentInstructor.role !== 'admin') {
    //   filteredStudents = filteredStudents.filter(student => 
    //     student.instructorId === currentInstructor.id || // 自分の生徒
    //     student.locationId === currentInstructor.locationId // 同一拠点の生徒
    //   );
    // }
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTags.length > 0) {
      filteredStudents = filteredStudents.filter(student =>
        selectedTags.every(tag => student.tags?.includes(tag))
      );
    }
    if (statusFilter !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.status === parseInt(statusFilter)
      );
    }
    return filteredStudents;
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    recipientNumber: '',
    instructorId: ''
  });
  
  // 一括入力用のstate
  const [bulkInputMode, setBulkInputMode] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkInstructorId, setBulkInstructorId] = useState('');
  
  // 検索・フィルター関連のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // all, 1, 0

  // 学習コース管理用の状態変数
  const [userCourses, setUserCourses] = useState([]);
  const [satelliteAvailableCourses, setSatelliteAvailableCourses] = useState([]);
  const [availableCurriculumPaths, setAvailableCurriculumPaths] = useState([]);
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCurriculumPath, setSelectedCurriculumPath] = useState('');
  const [courseAssignmentNotes, setCourseAssignmentNotes] = useState('');
  const [courseModalActiveTab, setCourseModalActiveTab] = useState('courses'); // 'courses' or 'curriculum'
  const [courseModalFilterText, setCourseModalFilterText] = useState('');
  const [courseModalFilterInstructor, setCourseModalFilterInstructor] = useState('');
  const [courseModalFilterStatus, setCourseModalFilterStatus] = useState('all');
  
  // 全てのタグを取得
  const getAllTags = () => {
    const allTags = new Set();
    students.forEach(student => {
      student.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const generateLoginToken = () => {
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
  };

  // 一時パスワード発行
  const issueTemporaryPassword = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/issue-temp-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      console.log('=== フロントエンド一時パスワード発行デバッグ ===');
      console.log('result:', result);
      console.log('result.data.expiresAt:', result.data.expiresAt);
      
      // 即座にローカル状態を更新
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === userId 
            ? { 
                ...student, 
                temp_password: result.data.tempPassword,
                expires_at: result.data.expires_at || result.data.expiresAt
              }
            : student
        )
      );
      
      // 更新後の学生データを確認
      const updatedStudent = students.find(s => s.id === userId);
      console.log('更新後の学生データ:', updatedStudent);
      console.log('更新後のexpires_at:', updatedStudent?.expires_at);
      
      if (result.success) {
        // 即座にローカル状態を更新
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === userId 
              ? { 
                  ...student, 
                  temp_password: result.data.tempPassword,
                  expires_at: result.data.expiresAt
                }
              : student
          )
        );
        
        // 利用者リストを更新して最新の一時パスワード情報を取得
        await fetchStudents();
        
        // 成功メッセージを表示
        alert(`一時パスワードが発行されました。\n\nパスワード: ${result.data.tempPassword}\n有効期限: ${result.data.expires_at || result.data.expiresAt}`);
      } else {
        alert(`一時パスワード発行に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('一時パスワード発行エラー:', error);
      alert('一時パスワード発行に失敗しました');
    }
  };

  // 指導員データを取得する関数（APIから取得）
  const [availableInstructors, setAvailableInstructors] = useState([]);
  
  const fetchAvailableInstructors = async () => {
    try {
      console.log('指導員データ取得開始...');
      const response = await fetch('http://localhost:5000/api/users');
      console.log('APIレスポンス:', response);
      
      if (response.ok) {
        const result = await response.json();
        console.log('APIから取得した全データ:', result);
        console.log('データの型:', typeof result);
        
        // バックエンドのレスポンス形式に合わせてデータを取得
        const data = result.data?.users || result;
        const usersArray = Array.isArray(data) ? data : [];
        console.log('ユーザー配列:', usersArray);
        console.log('ユーザー配列の長さ:', usersArray.length);
        
        // 全ユーザーのロールを確認
        usersArray.forEach((user, index) => {
          console.log(`ユーザー${index + 1}:`, {
            id: user.id,
            name: user.name,
            role: user.role,
            roleType: typeof user.role
          });
        });
        
        // ロール4（指導員）のユーザーのみをフィルタリング
        const instructors = usersArray.filter(user => {
          const isInstructor = user.role === 4;
          console.log(`ユーザー ${user.name} (ID: ${user.id}): ロール=${user.role}, 指導員判定=${isInstructor}`);
          return isInstructor;
        });
        
        console.log('フィルタリング後の指導員データ:', instructors);
        console.log('指導員数:', instructors.length);
        setAvailableInstructors(instructors);
      } else {
        console.error('APIレスポンスエラー:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('エラーレスポンス:', errorText);
      }
    } catch (error) {
      console.error('指導員データ取得エラー:', error);
    }
  };

  // 利用者データを取得する関数
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (response.ok) {
        const result = await response.json();
        // バックエンドのレスポンス形式に合わせてデータを取得
        const data = result.data?.users || result;
        // ロール1（利用者）のユーザーのみをフィルタリング
        const studentsData = data.filter(user => user.role === 1);
        
        // 在宅支援利用者に「在宅支援」タグを自動的に付与
        const processedStudentsData = studentsData.map(user => {
          // タグの安全な解析
          let existingTags = [];
          if (user.tags) {
            if (typeof user.tags === 'string') {
              try {
                existingTags = JSON.parse(user.tags);
              } catch (error) {
                console.error('タグのJSON解析エラー:', error);
                existingTags = [];
              }
            } else if (Array.isArray(user.tags)) {
              existingTags = user.tags;
            }
          }
          
          let updatedTags = [...existingTags];
          
          // is_remote_userがtrueの場合、「在宅支援」タグを追加（重複を避ける）
          if (user.is_remote_user && !updatedTags.includes('在宅支援')) {
            updatedTags.push('在宅支援');
          }
          
          return {
            ...user,
            tags: updatedTags
          };
        });
        
        setStudents(processedStudentsData);
      }
    } catch (error) {
      console.error('利用者データ取得エラー:', error);
    }
  };

  // 利用者情報編集モーダルを開く
  const openEditModal = async (student) => {
    setEditingStudent(student);
    
    // タグの安全な解析
    let tags = [];
    if (student.tags) {
      if (typeof student.tags === 'string') {
        try {
          tags = JSON.parse(student.tags);
        } catch (error) {
          console.error('タグのJSON解析エラー:', error);
          tags = [];
        }
      } else if (Array.isArray(student.tags)) {
        tags = student.tags;
      }
    }
    
    setEditFormData({
      name: student.name || '',
      instructor_id: student.instructor_id || '',
      tags: tags
    });
    
    // 個別支援計画を取得
    try {
      const response = await getSupportPlanByUserId(student.id);
      if (response.success && response.data) {
        setExistingSupportPlan(response.data);
        setSupportPlanData({
          long_term_goal: response.data.long_term_goal || '',
          short_term_goal: response.data.short_term_goal || '',
          needs: response.data.needs || '',
          support_content: response.data.support_content || '',
          goal_date: response.data.goal_date || ''
        });
      } else {
        setExistingSupportPlan(null);
        setSupportPlanData({
          long_term_goal: '',
          short_term_goal: '',
          needs: '',
          support_content: '',
          goal_date: ''
        });
      }
    } catch (error) {
      console.error('個別支援計画取得エラー:', error);
      setExistingSupportPlan(null);
      setSupportPlanData({
        long_term_goal: '',
        short_term_goal: '',
        needs: '',
        support_content: '',
        goal_date: ''
      });
    }
    
    setShowEditModal(true);
  };

  // 利用者情報更新
  const handleUpdateStudent = async () => {
    try {
      // 基本情報を更新
      const response = await fetch(`http://localhost:5000/api/users/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          instructor_id: editFormData.instructor_id,
          tags: JSON.stringify(editFormData.tags)
        })
      });

      if (response.ok) {
        // 個別支援計画を保存
        try {
          await upsertSupportPlan({
            user_id: editingStudent.id,
            ...supportPlanData
          });
        } catch (error) {
          console.error('個別支援計画保存エラー:', error);
        }

        alert('利用者情報が正常に更新されました');
        setShowEditModal(false);
        fetchStudents(); // データを再取得
      } else {
        const errorData = await response.json();
        alert(`更新に失敗しました: ${errorData.message || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('利用者情報更新エラー:', error);
      alert('更新中にエラーが発生しました');
    }
  };

  // 学習コース管理機能のAPI関数
  const fetchUserCourses = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteUserCourses(satelliteId);
      if (response.success) {
        setUserCourses(response.data || []);
      }
    } catch (error) {
      console.error('利用者のコース関連付け取得エラー:', error);
    }
  };

  const fetchSatelliteAvailableCourses = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteAvailableCourses(satelliteId);
      if (response.success) {
        setSatelliteAvailableCourses(response.data || []);
      }
    } catch (error) {
      console.error('利用可能なコース取得エラー:', error);
    }
  };

  const fetchAvailableCurriculumPaths = async () => {
    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await getSatelliteAvailableCurriculumPaths(satelliteId);
      if (response.success) {
        setAvailableCurriculumPaths(response.data || []);
      }
    } catch (error) {
      console.error('利用可能なカリキュラムパス取得エラー:', error);
    }
  };

  const handleBulkAssignCourses = async () => {
    if (selectedStudents.length === 0) {
      alert('一括操作する利用者を選択してください');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('割り当てるコースを選択してください');
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkAssignCoursesToUsers(satelliteId, {
        userIds: selectedStudents,
        courseIds: selectedCourses,
        notes: courseAssignmentNotes
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCourses([]);
        setCourseAssignmentNotes('');
        setShowCourseAssignmentModal(false);
        alert(response.message);
      } else {
        throw new Error(response.message || 'コースの一括割り当てに失敗しました');
      }
    } catch (error) {
      console.error('コース一括割り当てエラー:', error);
      alert(`コースの一括割り当てに失敗しました: ${error.message}`);
    }
  };

  const handleBulkRemoveCourses = async () => {
    if (selectedStudents.length === 0) {
      alert('削除対象の利用者を選択してください');
      return;
    }
    if (selectedCourses.length === 0) {
      alert('削除するコースを選択してください');
      return;
    }

    if (!window.confirm(`選択された${selectedStudents.length}名の利用者から${selectedCourses.length}個のコースを削除しますか？`)) {
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkRemoveCoursesFromUsers(satelliteId, {
        userIds: selectedStudents,
        courseIds: selectedCourses
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCourses([]);
        setShowCourseAssignmentModal(false);
        alert(response.message);
      } else {
        throw new Error(response.message || 'コースの一括削除に失敗しました');
      }
    } catch (error) {
      console.error('コース一括削除エラー:', error);
      alert(`コースの一括削除に失敗しました: ${error.message}`);
    }
  };

  const handleBulkAssignCurriculumPath = async () => {
    if (selectedStudents.length === 0) {
      alert('一括操作する利用者を選択してください');
      return;
    }
    if (!selectedCurriculumPath) {
      alert('割り当てるカリキュラムパスを選択してください');
      return;
    }

    try {
      const satelliteId = getCurrentSatelliteId();
      if (!satelliteId) return;

      const response = await bulkAssignCurriculumPathsToUsers(satelliteId, {
        userIds: selectedStudents,
        curriculumPathId: selectedCurriculumPath,
        notes: courseAssignmentNotes
      });

      if (response.success) {
        await fetchUserCourses();
        setSelectedStudents([]);
        setSelectedCurriculumPath('');
        setCourseAssignmentNotes('');
        setShowCourseAssignmentModal(false);
        alert(response.message);
      } else {
        throw new Error(response.message || 'カリキュラムパスの一括割り当てに失敗しました');
      }
    } catch (error) {
      console.error('カリキュラムパス一括割り当てエラー:', error);
      alert(`カリキュラムパスの一括割り当てに失敗しました: ${error.message}`);
    }
  };

  // カリキュラムパス選択時のコース自動チェック
  const handleCurriculumPathSelect = (pathId) => {
    setSelectedCurriculumPath(pathId);
    
    if (pathId) {
      const selectedPath = availableCurriculumPaths.find(path => path.id === parseInt(pathId));
      if (selectedPath && selectedPath.courses) {
        const courseIds = selectedPath.courses.map(course => course.course_id);
        setSelectedCourses(courseIds);
      }
    } else {
      setSelectedCourses([]);
    }
  };

  // モーダル内の利用者フィルタリング
  const getFilteredStudentsForModal = () => {
    let filteredStudents = students;
    
    if (courseModalFilterText) {
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(courseModalFilterText.toLowerCase()) ||
        student.email?.toLowerCase().includes(courseModalFilterText.toLowerCase()) ||
        student.instructor_name?.toLowerCase().includes(courseModalFilterText.toLowerCase())
      );
    }
    
    if (courseModalFilterInstructor) {
      filteredStudents = filteredStudents.filter(student =>
        student.instructor_id === parseInt(courseModalFilterInstructor)
      );
    }
    
    if (courseModalFilterStatus !== 'all') {
      filteredStudents = filteredStudents.filter(student =>
        student.status === parseInt(courseModalFilterStatus)
      );
    }
    
    return filteredStudents;
  };

  // 初期データ取得
  useEffect(() => {
    fetchAvailableInstructors();
    fetchStudents();
    fetchUserCourses();
    fetchSatelliteAvailableCourses();
    fetchAvailableCurriculumPaths();
  }, []);

  // selectedInstructorが変更された時に一時パスワード対象利用者を再取得
  useEffect(() => {
    if (showTodayActiveModal) {
      fetchTempPasswordUsers();
    }
  }, [selectedInstructor, showTodayActiveModal]);

  // 現在選択されている拠点IDを取得
  const getCurrentSatelliteId = () => {
    const selectedSatellite = JSON.parse(localStorage.getItem('selectedSatellite') || '{}');
    return selectedSatellite.id || currentInstructor.satellite_ids?.[0] || 1; // デフォルト値
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (bulkInputMode) {
      handleBulkAddStudents();
      return;
    }
    
         try {
       // APIでユーザーを作成
      const userData = {
        name: newStudent.name,
        role: 1, // 利用者
        status: 1,
        login_code: generateLoginToken(),
        company_id: currentInstructor.company_id || 4, // 既存の企業ID
        satellite_ids: [getCurrentSatelliteId()], // 現在選択されている拠点IDを使用
        is_remote_user: false,
        recipient_number: newStudent.recipientNumber || null,
        instructor_id: newStudent.instructorId ? parseInt(newStudent.instructorId) : null
      };

                   const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || '利用者の追加に失敗しました');
      }

             // 成功時の処理
       setNewStudent({ name: '', email: '', recipientNumber: '', instructorId: '' });
       setShowAddForm(false);
       
       // 利用者リストを更新
       fetchStudents();
       
       alert('利用者を追加しました。');
    } catch (error) {
      console.error('利用者追加エラー:', error);
      alert(`利用者の追加に失敗しました: ${error.message}`);
    }
  };

  // 一括入力で生徒を追加する関数
  const handleBulkAddStudents = async () => {
    if (!bulkInputText.trim()) {
      alert('生徒情報を入力してください。');
      return;
    }
    
    const lines = bulkInputText.trim().split('\n').filter(line => line.trim());
    const newStudents = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 1) {
        const name = parts[0];
        const email = parts[1] || ''; // メールアドレスが空の場合は空文字列
        
        if (name) {
          try {
            // APIでユーザーを作成
            const userData = {
              name: name,
              email: email || null, // メールアドレスが空の場合はnull
              role: 1, // 利用者
              status: 1,
              login_code: generateLoginToken(),
              company_id: currentInstructor.company_id || 4,
              satellite_ids: [getCurrentSatelliteId()],
              is_remote_user: false,
              recipient_number: null,
              instructor_id: bulkInstructorId ? parseInt(bulkInstructorId) : null
            };

            const response = await fetch('http://localhost:5000/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData)
            });

            const result = await response.json();
            
            if (result.success) {
              newStudents.push({ name, email, success: true });
            } else {
              newStudents.push({ name, email, success: false, error: result.message });
            }
          } catch (error) {
            newStudents.push({ name, email, success: false, error: error.message });
          }
        }
      }
    }
    
    if (newStudents.length > 0) {
      const successCount = newStudents.filter(s => s.success).length;
      const failCount = newStudents.filter(s => !s.success).length;
      
      setBulkInputText('');
      setBulkInstructorId('');
             setBulkInputMode(false);
       setShowAddForm(false);
       
       // 利用者リストを更新
       fetchStudents();
       
       if (failCount === 0) {
         alert(`${successCount}名の利用者を追加しました。`);
       } else {
         alert(`${successCount}名の利用者を追加しました。\n${failCount}名の追加に失敗しました。`);
       }
    } else {
      alert('有効な利用者情報が見つかりませんでした。\n形式: 利用者名,メールアドレス（メールアドレスは任意）');
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
        ? { ...student, status: student.status === 1 ? 0 : 1 }
        : student
    ));
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm('この利用者を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();
        
        if (result.success) {
          // 成功時はローカルのstateも更新
          setStudents(students.filter(student => student.id !== studentId));
          alert('利用者を削除しました。');
        } else {
          alert(`削除に失敗しました: ${result.message}`);
        }
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました。');
      }
    }
  };

  const handleViewStudentDetail = (studentId) => {
    // 利用者詳細画面に遷移
    window.location.href = `/instructor/student/${studentId}`;
  };

  const openRecordModal = (studentId) => {
    alert(`${studentId}の在宅記録画面を開きます（実装予定）`);
  };

    // 本日有効ボタン：選択した利用者に一時パスワード発行
  const openTodayActiveModal = async () => {
    // 認証状態を確認
    if (!isAuthenticated || !currentUser) {
      alert('ログインが必要です。');
      return;
    }
    
    try {
      setTempPasswordLoading(true);
      
      // 指導員一覧を取得
      const instructorResponse = await apiGet('/api/temp-passwords/instructors');
      if (instructorResponse.success) {
        setInstructors(instructorResponse.data);
      }
      
      // 一時パスワード対象利用者を取得
      await fetchTempPasswordUsers();
      
      setShowTodayActiveModal(true);
    } catch (error) {
      console.error('一時パスワード機能初期化エラー:', error);
      alert('一時パスワード機能の初期化に失敗しました。');
    } finally {
      setTempPasswordLoading(false);
    }
  };

  // 一時パスワード対象利用者を取得
  const fetchTempPasswordUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedInstructor) {
        params.append('selected_instructor_id', selectedInstructor);
      }
      
      const response = await apiGet(`/api/temp-passwords/users?${params}`);
      if (response.success) {
        setTempPasswordUsers(response.data);
        // 全選択状態でスタート
        const allSelected = response.data.map(user => user.id);
        setSelectedStudents(allSelected);
      }
    } catch (error) {
      console.error('一時パスワード対象利用者取得エラー:', error);
    }
  };

  // ユーザータイプに応じた表示名を取得
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'my_user':
        return '自分の担当利用者';
      case 'no_instructor_no_temp':
        return '担当なし・パスワード未発行';
      case 'selected_instructor':
        return '選択指導員の担当利用者';
      default:
        return 'その他';
    }
  };

  // 一時パスワード発行実行
  const sendTodayActiveEmails = async () => {
    if (selectedStudents.length === 0) {
      alert('一時パスワード発行対象の利用者を選択してください。');
      return;
    }
    
    try {
      setTempPasswordLoading(true);
      const requestData = {
        user_ids: selectedStudents,
        expiry_time: expiryTime || null,
        announcement_title: announcementTitle || null,
        announcement_message: announcementMessage || null
      };

      const response = await apiPost('/api/temp-passwords/issue', requestData);
      
      if (response.success) {
        alert(`${selectedStudents.length}名の利用者に一時パスワードを発行しました。\n\n${response.message}`);
        
        // モーダルを閉じて状態をリセット
        setShowTodayActiveModal(false);
        setSelectedStudents([]);
        setExpiryTime('');
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setSelectedInstructor('');
      } else {
        alert('一時パスワードの発行に失敗しました。');
      }
    } catch (error) {
      console.error('一時パスワード発行エラー:', error);
      alert('一時パスワードの発行に失敗しました。');
    } finally {
      setTempPasswordLoading(false);
    }
  };

  // メール再送信機能は削除（不要なため）

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
              👥 利用者一覧
            </h2>
            {(currentInstructor.role === 'instructor' || currentInstructor.role === 'teacher') && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">{currentInstructor.locationName} ({currentInstructor.facilityName})</p>
                  <p className="text-sm text-gray-500">※同一拠点の他の指導員の利用者も管理できます</p>
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
              onClick={openTodayActiveModal}
            >
              🔑 本日有効
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowCourseAssignmentModal(true)}
            >
              📚 学習コース追加
            </button>

            <button 
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowAddForm(true)}
            >
              + 新しい利用者を追加
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
                  placeholder="利用者名、メール、クラス、指導員名で検索..."
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
                <option value="1">稼働中</option>
                <option value="0">停止中</option>
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
                    setBulkInstructorId('');
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
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">利用者名</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newStudent.name}
                          onChange={handleInputChange}
                          required
                          placeholder="利用者の名前を入力"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス（オプション）</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={newStudent.email}
                          onChange={handleInputChange}
                          placeholder="メールアドレスを入力（任意）"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                                         <div>
                       <label htmlFor="instructor" className="block text-sm font-semibold text-gray-700 mb-2">担当指導員（オプション）</label>
                       <select
                         id="instructor"
                         name="instructorId"
                         value={newStudent.instructorId}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                       >
                         <option value="">担当指導員を選択</option>
                         {availableInstructors.map(instructor => (
                           <option key={instructor.id} value={instructor.id}>
                             {instructor.name}
                           </option>
                         ))}
                       </select>
                     </div>
                  </>
                ) : (
                  // 一括入力モード
                  <>
                    <div>
                      <label htmlFor="bulkInput" className="block text-sm font-semibold text-gray-700 mb-2">利用者情報（1行に1人）</label>
                      <textarea
                        id="bulkInput"
                        value={bulkInputText}
                        onChange={(e) => setBulkInputText(e.target.value)}
                        placeholder="利用者名,メールアドレス（オプション）&#10;例:&#10;田中太郎,tanaka@example.com&#10;佐藤花子,&#10;山田次郎,yamada@example.com"
                        rows={8}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="text-sm text-gray-500 mt-2">形式: 利用者名,メールアドレス（カンマ区切り、メールアドレスは任意）</p>
                    </div>
                    
                                         <div>
                       <label htmlFor="bulkInstructor" className="block text-sm font-semibold text-gray-700 mb-2">担当指導員（オプション）</label>
                       <select
                         id="bulkInstructor"
                         value={bulkInstructorId}
                         onChange={(e) => setBulkInstructorId(e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                       >
                         <option value="">担当指導員を選択</option>
                         {availableInstructors.map(instructor => (
                           <option key={instructor.id} value={instructor.id}>
                             {instructor.name}
                           </option>
                         ))}
                       </select>
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
                      setBulkInstructorId('');
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
        <div className="overflow-x-auto" style={{ minWidth: '1200px' }}>
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === getFilteredStudents().length && getFilteredStudents().length > 0}
                    onChange={toggleAllStudents}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '150px' }}>利用者名</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>担当指導員</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '250px' }}>コース・タグ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '180px' }}>進捗状況</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>パスワード</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredStudents().map(student => (
                <tr key={student.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <button 
                        className="text-left font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        onClick={() => handleViewStudentDetail(student.id)}
                        title="利用者詳細を表示"
                      >
                        {student.name}
                      </button>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {student.login_code}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {student.instructor_name || '未設定'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      {/* コース情報 */}
                      <div className="flex flex-wrap gap-1">
                        {userCourses
                          .filter(uc => uc.user_id === student.id)
                          .slice(0, 4) // 最大4つまで表示に増加
                          .map(uc => (
                            <span key={uc.id} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              {uc.course_title.length > 12 ? uc.course_title.substring(0, 12) + '...' : uc.course_title}
                            </span>
                          ))}
                        {userCourses.filter(uc => uc.user_id === student.id).length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{userCourses.filter(uc => uc.user_id === student.id).length - 4}
                          </span>
                        )}
                        {userCourses.filter(uc => uc.user_id === student.id).length === 0 && (
                          <span className="text-gray-400 text-xs">未割り当て</span>
                        )}
                      </div>
                      {/* タグ情報 */}
                      <div className="flex flex-wrap gap-1">
                        {student.tags?.slice(0, 5).map(tag => ( // 最大5つまで表示に増加
                          <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                            {tag.length > 10 ? tag.substring(0, 10) + '...' : tag} {/* 文字数制限を10文字に増加 */}
                          </span>
                        ))}
                        {student.tags?.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{student.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      {/* 進捗バー */}
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
                      {/* 進捗情報 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{student.progress}%</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.progress >= 75 
                            ? 'bg-green-100 text-green-800' 
                            : student.progress > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.progress >= 75 ? '合格' : student.progress > 0 ? '受講中' : '未開始'}
                        </span>
                      </div>
                      {/* 状態 */}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status === 1 ? '稼働中' : '停止中'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {student.temp_password ? (
                        <div className="text-xs">
                          <div className="font-semibold text-blue-600 font-mono">
                            {student.temp_password}
                          </div>
                          <div className="text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className={student.expires_at && !isExpired(student.expires_at) ? 'text-green-600' : 'text-red-600'}>
                                {student.expires_at && !isExpired(student.expires_at) ? '有効' : '期限切れ'}
                              </span>
                              {student.expires_at && (
                                <span className="text-gray-400">
                                  ({student.expires_at})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <div className="text-gray-400 mb-1">未発行</div>
                          <button 
                            className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                            onClick={() => issueTemporaryPassword(student.id)}
                            title="一時パスワードを発行"
                          >
                            発行
                          </button>
                        </div>
                      )}
                      {student.temp_password && (
                        <button 
                          className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                          onClick={() => issueTemporaryPassword(student.id)}
                          title="一時パスワードを再発行"
                        >
                          再発行
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button 
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-all duration-200"
                        onClick={() => openEditModal(student)}
                        title="利用者情報と個別支援計画を編集"
                      >
                        ✏️ 編集
                      </button>
                      <button 
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-all duration-200"
                        onClick={() => {/* TODO: テスト合否確認機能を実装 */}}
                        title="テストの合否確認"
                      >
                        📝 合否確認
                      </button>
                      <button 
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-all duration-200"
                        onClick={() => {/* TODO: 提出物確認機能を実装 */}}
                        title="提出物の確認"
                      >
                        📄 提出物確認
                      </button>
                      <button 
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                          student.status === 1 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        onClick={() => toggleStudentStatus(student.id)}
                      >
                        {student.status === 1 ? '停止' : '再開'}
                      </button>
                      <button 
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-all duration-200"
                        onClick={() => deleteStudent(student.id)}
                      >
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
              {/* 利用者選択セクション */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 利用者選択</h4>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-700">選択中の利用者: <strong className="text-indigo-600">{selectedStudents.length}名</strong></p>
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

      {/* 本日有効モーダル */}
      {showTodayActiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">🔑 本日有効 - 一時パスワード発行</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    setShowTodayActiveModal(false);
                    setSelectedStudents([]);
                    setTodayActiveMessage('');
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* 別担当者選択 */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h4 className="text-lg font-semibold mb-4">別担当者選択（オプション）</h4>
                <select
                  value={selectedInstructor}
                  onChange={(e) => {
                    setSelectedInstructor(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  選択すると、その指導員のパスワード未発行担当利用者もリストに追加されます
                </p>
              </div>

              {/* 利用者選択 */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">利用者選択</h4>
                  <button
                    onClick={() => {
                      if (selectedStudents.length === tempPasswordUsers.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(tempPasswordUsers.map(user => user.id));
                      }
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    {selectedStudents.length === tempPasswordUsers.length ? '全解除' : '全選択'}
                  </button>
                </div>

                {tempPasswordLoading ? (
                  <div className="text-center py-4">読み込み中...</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tempPasswordUsers.map(user => (
                      <div key={user.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(user.id)}
                          onChange={() => {
                            setSelectedStudents(prev => 
                              prev.includes(user.id) 
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">
                            {user.company_name} / {user.satellite_name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {getUserTypeLabel(user.user_type)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 有効期限設定 */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h4 className="text-lg font-semibold mb-4">有効期限設定（オプション）</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    placeholder="HH:DD（例：23:59）"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-600">まで有効</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  指定なしの場合は日本時間23:59まで有効です（HH:DD形式で入力してください）
                </p>
              </div>

              {/* アナウンスメッセージ */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h4 className="text-lg font-semibold mb-4">アナウンスメッセージ（オプション）</h4>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="アナウンスタイトル"
                  className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="アナウンスメッセージ"
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-2">
                  選択された利用者のダッシュボードで閲覧できるアナウンスメッセージを一括送信します
                </p>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => {
                    setShowTodayActiveModal(false);
                    setSelectedStudents([]);
                    setExpiryTime('');
                    setAnnouncementTitle('');
                    setAnnouncementMessage('');
                    setSelectedInstructor('');
                  }}
                >
                  キャンセル
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={sendTodayActiveEmails}
                  disabled={tempPasswordLoading || selectedStudents.length === 0}
                >
                  {tempPasswordLoading ? '発行中...' : `${selectedStudents.length}名に一時パスワードを発行`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 学習コース追加モーダル */}
      {showCourseAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">📚 学習コース・カリキュラムパス管理</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    setShowCourseAssignmentModal(false);
                    setSelectedStudents([]);
                    setSelectedCourses([]);
                    setSelectedCurriculumPath('');
                    setCourseAssignmentNotes('');
                    setCourseModalActiveTab('courses');
                    setCourseModalFilterText('');
                    setCourseModalFilterInstructor('');
                    setCourseModalFilterStatus('all');
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* 利用者選択セクション */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">👥 対象利用者選択</h4>
                
                {/* 利用者フィルター */}
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="利用者名、メール、指導員名で検索..."
                        value={courseModalFilterText}
                        onChange={(e) => setCourseModalFilterText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <select 
                        value={courseModalFilterInstructor} 
                        onChange={(e) => setCourseModalFilterInstructor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">全ての指導員</option>
                        {availableInstructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        value={courseModalFilterStatus} 
                        onChange={(e) => setCourseModalFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="all">全てのステータス</option>
                        <option value="1">稼働中</option>
                        <option value="0">停止中</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700">
                      表示中: <strong className="text-orange-600">{getFilteredStudentsForModal().length}名</strong> / 
                      選択中: <strong className="text-orange-600">{selectedStudents.length}名</strong>
                    </p>
                    <button 
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-all duration-200"
                      onClick={() => {
                        const filteredStudents = getFilteredStudentsForModal();
                        if (selectedStudents.length === filteredStudents.length) {
                          setSelectedStudents([]);
                        } else {
                          setSelectedStudents(filteredStudents.map(s => s.id));
                        }
                      }}
                    >
                      {selectedStudents.length === getFilteredStudentsForModal().length ? '全選択解除' : '全選択'}
                    </button>
                  </div>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {getFilteredStudentsForModal().map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{student.name}</span>
                        <span className="text-sm text-gray-500 ml-2">担当: {student.instructor_name || '未設定'}</span>
                        <span className="text-sm text-gray-500 ml-2">メール: {student.email || '未設定'}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          student.status === 1 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {student.status === 1 ? '稼働中' : '停止中'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* タブ切り替え */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      courseModalActiveTab === 'courses' 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setCourseModalActiveTab('courses')}
                  >
                    📖 個別コース選択
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      courseModalActiveTab === 'curriculum' 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setCourseModalActiveTab('curriculum')}
                  >
                    🛤️ カリキュラムパス選択
                  </button>
                </div>

                {courseModalActiveTab === 'courses' ? (
                  /* コース選択セクション */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700">選択中のコース: <strong className="text-blue-600">{selectedCourses.length}個</strong></p>
                      <button 
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-200"
                        onClick={() => setSelectedCourses([])}
                      >
                        全選択解除
                      </button>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {satelliteAvailableCourses.map(course => (
                        <div key={course.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => {
                              setSelectedCourses(prev => 
                                prev.includes(course.id) 
                                  ? prev.filter(id => id !== course.id)
                                  : [...prev, course.id]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">{course.title}</span>
                            <span className="text-sm text-gray-500 ml-2">カテゴリ: {course.category}</span>
                            <span className="text-sm text-gray-500 ml-2">レッスン数: {course.lesson_count}回</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* カリキュラムパス選択セクション */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700">
                        選択中のパス: <strong className="text-purple-600">
                          {selectedCurriculumPath ? availableCurriculumPaths.find(p => p.id === parseInt(selectedCurriculumPath))?.name : 'なし'}
                        </strong>
                      </p>
                      <button 
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-all duration-200"
                        onClick={() => {
                          setSelectedCurriculumPath('');
                          setSelectedCourses([]);
                        }}
                      >
                        選択解除
                      </button>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {availableCurriculumPaths.map(path => (
                        <div key={path.id} className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="curriculumPath"
                              value={path.id}
                              checked={selectedCurriculumPath === path.id.toString()}
                              onChange={(e) => handleCurriculumPathSelect(e.target.value)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-800">{path.name}</span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  {path.total_courses}コース
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                              
                              {/* 含まれるコース一覧 */}
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-700 mb-2">含まれるコース:</p>
                                <div className="space-y-1">
                                  {path.courses?.map((course, index) => (
                                    <div key={course.course_id} className="flex items-center gap-2 text-xs">
                                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-medium">
                                        {index + 1}
                                      </span>
                                      <span className="text-gray-700">{course.course_title}</span>
                                      <span className="text-gray-500">({course.course_category})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 備考入力セクション */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📝 備考（オプション）</h4>
                <textarea
                  value={courseAssignmentNotes}
                  onChange={(e) => setCourseAssignmentNotes(e.target.value)}
                  placeholder="コース割り当てに関する備考を入力してください..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* アクションボタン */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => {
                    setShowCourseAssignmentModal(false);
                    setSelectedStudents([]);
                    setSelectedCourses([]);
                    setSelectedCurriculumPath('');
                    setCourseAssignmentNotes('');
                    setCourseModalActiveTab('courses');
                    setCourseModalFilterText('');
                    setCourseModalFilterInstructor('');
                    setCourseModalFilterStatus('all');
                  }}
                >
                  キャンセル
                </button>
                {courseModalActiveTab === 'courses' ? (
                  <>
                    <button 
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      onClick={handleBulkRemoveCourses}
                      disabled={selectedStudents.length === 0 || selectedCourses.length === 0}
                    >
                      🗑️ 一括削除
                    </button>
                    <button 
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      onClick={handleBulkAssignCourses}
                      disabled={selectedStudents.length === 0 || selectedCourses.length === 0}
                    >
                      ➕ 一括追加
                    </button>
                  </>
                ) : (
                  <button 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    onClick={handleBulkAssignCurriculumPath}
                    disabled={selectedStudents.length === 0 || !selectedCurriculumPath}
                  >
                    ➕ カリキュラムパス追加
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 利用者情報編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  ✏️ 利用者情報編集: {editingStudent?.name}
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-8">
                {/* 基本情報編集セクション */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    📋 基本情報
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">氏名 *</label>
                      <SanitizedInput
                        type="text"
                        value={editFormData.name}
                        onChange={(value) => setEditFormData({...editFormData, name: value})}
                        placeholder="利用者名を入力"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        sanitizeOptions={SANITIZE_OPTIONS}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">担当指導員</label>
                      <select
                        value={editFormData.instructor_id}
                        onChange={(e) => setEditFormData({...editFormData, instructor_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">指導員を選択してください</option>
                        {availableInstructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">学習コース</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {userCourses
                            .filter(uc => uc.user_id === editingStudent.id)
                            .map(uc => (
                              <span key={uc.id} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                {uc.course_title}
                                {uc.curriculum_path_name && (
                                  <span className="ml-1 text-orange-500">({uc.curriculum_path_name})</span>
                                )}
                              </span>
                            ))}
                          {userCourses.filter(uc => uc.user_id === editingStudent.id).length === 0 && (
                            <span className="text-gray-400 text-xs">未割り当て</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          ※ 学習コースの変更は「コース割り当て」機能をご利用ください
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                      <div className="space-y-3">
                        {/* 新規タグ作成 */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="新しいタグ名を入力"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const newTag = e.target.value.trim();
                                if (newTag && !editFormData.tags.includes(newTag)) {
                                  setEditFormData({
                                    ...editFormData,
                                    tags: [...editFormData.tags, newTag]
                                  });
                                  e.target.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all duration-200"
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              const newTag = input.value.trim();
                              if (newTag && !editFormData.tags.includes(newTag)) {
                                setEditFormData({
                                  ...editFormData,
                                  tags: [...editFormData.tags, newTag]
                                });
                                input.value = '';
                              }
                            }}
                          >
                            追加
                          </button>
                        </div>
                        
                        {/* 既存タグ選択 */}
                        <div className="flex flex-wrap gap-2">
                          {customTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                                editFormData.tags.includes(tag)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                const newTags = editFormData.tags.includes(tag)
                                  ? editFormData.tags.filter(t => t !== tag)
                                  : [...editFormData.tags, tag];
                                setEditFormData({...editFormData, tags: newTags});
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        
                        {/* 選択されたタグ表示 */}
                        {editFormData.tags.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800 mb-2">選択されたタグ:</p>
                            <div className="flex flex-wrap gap-1">
                              {editFormData.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {tag}
                                  <button
                                    type="button"
                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                    onClick={() => {
                                      setEditFormData({
                                        ...editFormData,
                                        tags: editFormData.tags.filter(t => t !== tag)
                                      });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 個別支援計画セクション */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    📝 個別支援計画
                    {existingSupportPlan && (
                      <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        既存データあり
                      </span>
                    )}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">長期目標</label>
                      <SanitizedTextarea
                        value={supportPlanData.long_term_goal}
                        onChange={(value) => setSupportPlanData({...supportPlanData, long_term_goal: value})}
                        placeholder="長期目標を入力してください"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        sanitizeOptions={SANITIZE_OPTIONS}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">短期目標</label>
                      <SanitizedTextarea
                        value={supportPlanData.short_term_goal}
                        onChange={(value) => setSupportPlanData({...supportPlanData, short_term_goal: value})}
                        placeholder="短期目標を入力してください"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        sanitizeOptions={SANITIZE_OPTIONS}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ニーズ</label>
                      <SanitizedTextarea
                        value={supportPlanData.needs}
                        onChange={(value) => setSupportPlanData({...supportPlanData, needs: value})}
                        placeholder="利用者のニーズを入力してください"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        sanitizeOptions={SANITIZE_OPTIONS}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">支援内容</label>
                      <SanitizedTextarea
                        value={supportPlanData.support_content}
                        onChange={(value) => setSupportPlanData({...supportPlanData, support_content: value})}
                        placeholder="具体的な支援内容を入力してください"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        sanitizeOptions={SANITIZE_OPTIONS}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">目標達成予定日</label>
                      <input
                        type="date"
                        value={supportPlanData.goal_date}
                        onChange={(e) => setSupportPlanData({...supportPlanData, goal_date: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  キャンセル
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleUpdateStudent}
                >
                  💾 保存
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