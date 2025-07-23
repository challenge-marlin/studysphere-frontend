import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyEvaluationModal from '../components/WeeklyEvaluationModal';
import MonthlyEvaluationModal from '../components/MonthlyEvaluationModal';

const HomeSupportEvaluationsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudentsList, setFilteredStudentsList] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [supportPlans, setSupportPlans] = useState([]);
  const [showSupportPlanModal, setShowSupportPlanModal] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  
  // 評価モーダル用の状態
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState(null);

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
      setFilteredStudentsList(filteredStudents);
    };

    fetchStudents();
  }, []);

  // リマインド対象者を動的に判定
  useEffect(() => {
    const mockEvaluations = [
      {
        id: 'eval001',
        studentId: 'student001',
        studentName: '末吉　元気',
        period: 'weekly',
        evaluationDate: '2024-01-19',
        status: 'pending',
        type: '週次評価',
        description: 'ITリテラシー・AIの基本コースの週次達成度評価'
      },
      {
        id: 'eval002',
        studentId: 'student003',
        studentName: '田中花子',
        period: 'weekly',
        evaluationDate: '2024-01-19',
        status: 'pending',
        type: '週次評価',
        description: 'SNS運用の基礎・画像生成編集コースの週次達成度評価'
      },
      {
        id: 'eval003',
        studentId: 'student001',
        studentName: '末吉　元気',
        period: 'monthly',
        evaluationDate: '2024-01-31',
        status: 'pending',
        type: '月次評価',
        description: 'ITリテラシー・AIの基本コースの月次達成度評価'
      },
      {
        id: 'eval004',
        studentId: 'student003',
        studentName: '田中花子',
        period: 'monthly',
        evaluationDate: '2024-01-31',
        status: 'pending',
        type: '月次評価',
        description: 'SNS運用の基礎・画像生成編集コースの月次達成度評価'
      },
      {
        id: 'eval005',
        studentId: 'student005',
        studentName: '山田一郎',
        period: 'weekly',
        evaluationDate: '2024-01-12',
        status: 'completed',
        type: '週次評価',
        description: 'LP制作(HTML・CSS)コースの週次達成度評価',
        completedDate: '2024-01-12',
        score: 85
      }
    ];

    setEvaluations(mockEvaluations);

    // 個別支援計画のモックデータ
    const mockSupportPlans = [
      {
        id: 'plan001',
        studentId: 'student001',
        studentName: '末吉　元気',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        longTermGoal: 'しっかりと就労できるよう、心身の健康を維持する',
        shortTermGoal: '新しい環境や就労のスタイルに慣れる',
        needs: '・いずれはスキルアップしたい\n・天候が悪くなると頭痛などで体調が悪くなることがある',
        supportContent: '・生成AIを使用したHP作成、及びアプリの開発がスムーズに行えるよう、声掛け、助言、アドバイスを行います。また、休憩などを取らずオーバーワーク気味の際には休憩を促し、体調のコントロールを図ります\n・体調不良時には適宜休憩を促し、体調管理に努めます。また、在宅就労システムを導入した際には在宅の作業が出来るよう対応を行います',
        targetDate: '2025-07-31',
        createdAt: '2024-01-01'
      },
      {
        id: 'plan002',
        studentId: 'student003',
        studentName: '田中花子',
        startDate: '2024-01-05',
        endDate: '2024-04-05',
        longTermGoal: 'SNS運用スキルを習得し、デジタルマーケティング分野での就労を目指す',
        shortTermGoal: '画像生成・編集ツールの基本操作をマスターし、実践的なコンテンツ作成ができるようになる',
        needs: '・デジタルツールの操作に不安がある\n・創造的な作業に興味があるが、技術的な面で自信がない\n・在宅での作業に適応したい',
        supportContent: '・SNS運用の基礎知識と画像生成・編集ツールの操作方法を段階的に指導します\n・実際のツールを使用した実践的な演習を行い、操作に慣れるようサポートします\n・在宅での作業環境整備についてアドバイスし、効率的な作業方法を提案します\n・定期的な進捗確認とフィードバックを行い、学習意欲を維持します',
        targetDate: '2024-12-31',
        createdAt: '2024-01-05'
      }
    ];

    setSupportPlans(mockSupportPlans);
  }, []);

  // ナビゲーション関数
  const goToHomeSupportManagement = () => {
    navigate('/instructor/dashboard?tab=home-support');
  };

  const goToDailyRecords = () => {
    navigate('/instructor/daily-records');
  };

  // タグ選択処理
  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1);
  };

  // 利用可能なタグを取得
  const getAvailableTags = () => {
    const allTags = students.flatMap(student => student.tags);
    return [...new Set(allTags)];
  };

  // 評価開始処理
  const startWeeklyEvaluation = (student) => {
    setSelectedStudentForEvaluation(student);
    setShowWeeklyModal(true);
  };

  const startMonthlyEvaluation = (student) => {
    setSelectedStudentForEvaluation(student);
    setShowMonthlyModal(true);
  };

  // AIアシスト機能
  const handleAiAssist = async (params) => {
    const { type, field, period, prevEvalDate, instructor } = params;
    
    // モックAIアシスト機能
    const suggestions = {
      weekly: {
        content: `${selectedStudentForEvaluation?.name}さんの週次評価について

期間：${period?.start} ～ ${period?.end}

学習進捗：
・${selectedStudentForEvaluation?.class}の内容を着実に習得
・基礎知識の理解が深まっている
・実践的な作業も順調に進んでいる

体調管理：
・良好な状態を維持
・適切な休憩を取っている
・学習意欲が高い

次回目標：
・より高度な内容への挑戦
・実践的なスキルの向上
・継続的な学習習慣の維持

指導員からのコメント：
学習態度が非常に良好で、着実にスキルアップしています。今後も継続的なサポートを行い、さらなる成長を支援していきます。`
      },
      monthly: {
        goal: `${selectedStudentForEvaluation?.class}の習得と実践的なスキルアップ`,
        work: `${selectedStudentForEvaluation?.class}の学習と実習、課題への取り組み`,
        achievement: '基礎知識の習得ができ、実践的な作業も可能になった',
        issue: 'より高度な内容への理解を深める必要がある',
        improve: '段階的な学習と実践を組み合わせた指導を継続',
        health: '体調管理を適切に行い、無理のない学習を継続',
        note: '学習意欲が高く、着実にスキルアップしている',
        validity: '在宅就労の継続は妥当。適切なサポート体制を維持'
      }
    };

    // 少し遅延を入れてAI処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return suggestions[type]?.[field] || '';
  };

  const startEvaluation = (evaluationId) => {
    const evaluation = evaluations.find(e => e.id === evaluationId);
    if (evaluation) {
      if (evaluation.period === 'weekly') {
        const student = students.find(s => s.id === evaluation.studentId);
        setSelectedStudentForEvaluation(student);
        setShowWeeklyModal(true);
      } else if (evaluation.period === 'monthly') {
        const student = students.find(s => s.id === evaluation.studentId);
        setSelectedStudentForEvaluation(student);
        setShowMonthlyModal(true);
      }
    }
  };

  // 支援計画関連
  const getStudentSupportPlan = (studentId) => {
    return supportPlans.find(plan => plan.studentId === studentId);
  };

  const getSupportPlanStatus = (plan) => {
    if (!plan) return 'none';
    const today = new Date();
    const endDate = new Date(plan.endDate);
    if (endDate < today) return 'expired';
    if (endDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) return 'expiring';
    return 'active';
  };

  const openSupportPlanModal = (student, plan = null) => {
    setSelectedStudentForPlan(student);
    setEditingPlan(plan);
    setShowSupportPlanModal(true);
  };

  const saveSupportPlan = (planData) => {
    if (editingPlan) {
      // 既存の計画を更新
      setSupportPlans(prev => prev.map(plan => 
        plan.id === editingPlan.id ? { ...plan, ...planData } : plan
      ));
    } else {
      // 新しい計画を追加
      const newPlan = {
        id: `plan${Date.now()}`,
        studentId: selectedStudentForPlan.id,
        studentName: selectedStudentForPlan.name,
        ...planData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSupportPlans(prev => [...prev, newPlan]);
    }
    setShowSupportPlanModal(false);
    setEditingPlan(null);
  };

  // 評価フィルタリング
  const getFilteredEvaluations = () => {
    let filtered = evaluations;
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(evaluation => {
        const student = students.find(s => s.id === evaluation.studentId);
        return student && selectedTags.some(tag => student.tags.includes(tag));
      });
    }
    
    return filtered;
  };

  // 生徒の評価状況を取得
  const getStudentEvaluationStatus = (studentId) => {
    const studentEvaluations = evaluations.filter(e => e.studentId === studentId);
    const pendingWeekly = studentEvaluations.filter(e => e.period === 'weekly' && e.status === 'pending');
    const pendingMonthly = studentEvaluations.filter(e => e.period === 'monthly' && e.status === 'pending');
    const completed = studentEvaluations.filter(e => e.status === 'completed');
    
    return {
      pendingWeekly: pendingWeekly.length,
      pendingMonthly: pendingMonthly.length,
      completed: completed.length,
      total: studentEvaluations.length
    };
  };

  // ページネーション
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredEvaluations = getFilteredEvaluations();
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvaluations = filteredEvaluations.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={goToHomeSupportManagement}
              >
                ← 在宅支援管理に戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold">📊 在宅支援評価一覧</h1>
                <p className="text-green-100 text-sm">週次・月次評価の管理と進捗確認</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={goToDailyRecords}
              >
                📝 日次記録
              </button>
              <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {filteredEvaluations.length}件の評価
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左カラム: フィルター・統計 */}
          <div className="lg:col-span-1 space-y-6">
            {/* フィルター */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 フィルター</h3>
              <div className="space-y-3">
                {getAvailableTags().map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagSelect(tag)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
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
                  <span className="text-green-800 font-medium">総評価数</span>
                  <span className="text-2xl font-bold text-green-600">{evaluations.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-800 font-medium">未完了</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {evaluations.filter(e => e.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">完了済み</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {evaluations.filter(e => e.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 評価一覧 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">生徒一覧</h2>
                <div className="text-sm text-gray-600">
                  表示: {students.length}名の生徒
                </div>
              </div>

              <div className="space-y-4">
                {students.map(student => {
                  const evaluationStatus = getStudentEvaluationStatus(student.id);
                  const supportPlan = getStudentSupportPlan(student.id);
                  const planStatus = getSupportPlanStatus(supportPlan);
                  
                  return (
                    <div key={student.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{student.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{student.class}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>👨‍🏫 {student.instructorName}</span>
                              <span>📍 {student.locationName}</span>
                              <span>📊 進捗: {student.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {student.status === 'active' ? 'アクティブ' : '非アクティブ'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span>週次評価: {evaluationStatus.pendingWeekly}件未完了</span>
                          <span className="mx-2">•</span>
                          <span>月次評価: {evaluationStatus.pendingMonthly}件未完了</span>
                          <span className="mx-2">•</span>
                          <span>完了済み: {evaluationStatus.completed}件</span>
                        </div>
                        <div className="flex gap-2">
                          {/* 週次評価ボタン */}
                          <button
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                            onClick={() => startWeeklyEvaluation(student)}
                            title="週次評価を作成"
                          >
                            📊 週次評価
                          </button>
                          
                          {/* 月次評価ボタン */}
                          <button
                            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                            onClick={() => startMonthlyEvaluation(student)}
                            title="月次評価を作成"
                          >
                            📈 月次評価
                          </button>
                          
                          <button
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200"
                            onClick={() => navigate(`/instructor/student-detail/${student.id}`)}
                          >
                            👤 生徒詳細
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 評価モーダル */}
      {showWeeklyModal && selectedStudentForEvaluation && (
        <WeeklyEvaluationModal
          isOpen={showWeeklyModal}
          onClose={() => {
            setShowWeeklyModal(false);
            setSelectedStudentForEvaluation(null);
          }}
          onSave={(data) => {
            console.log('週次評価を保存:', data);
            setShowWeeklyModal(false);
            setSelectedStudentForEvaluation(null);
          }}
          prevEvalDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          defaultInstructor={selectedStudentForEvaluation?.instructorName}
          aiAssist={handleAiAssist}
        />
      )}

      {showMonthlyModal && selectedStudentForEvaluation && (
        <MonthlyEvaluationModal
          isOpen={showMonthlyModal}
          onClose={() => {
            setShowMonthlyModal(false);
            setSelectedStudentForEvaluation(null);
          }}
          onSave={(data) => {
            console.log('月次評価を保存:', data);
            setShowMonthlyModal(false);
            setSelectedStudentForEvaluation(null);
          }}
          prevEvalDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          defaultInstructor={selectedStudentForEvaluation?.instructorName}
          aiAssist={handleAiAssist}
        />
      )}
    </div>
  );
};

export default HomeSupportEvaluationsPage; 