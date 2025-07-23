import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeSupportManagement = ({ instructorId }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [supportPlans, setSupportPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [planForm, setPlanForm] = useState({
    longTermGoal: '',
    shortTermGoal: '',
    needs: '',
    supportContent: '',
    targetDate: ''
  });

  // 生徒データを取得（生徒管理と同じデータを使用）
  useEffect(() => {
    const fetchStudents = () => {
      // 生徒管理と同じモックデータを使用
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
    };

    fetchStudents();
  }, []);

  // 個別支援計画のモックデータ
  useEffect(() => {
    setSupportPlans([
      {
        id: 'plan001',
        userId: 'student001',
        userName: '末吉　元気',
        longTermGoal: 'しっかりと就労できるよう、心身の健康を維持する',
        shortTermGoal: '新しい環境や就労のスタイルに慣れる',
        needs: '・いずれはスキルアップしたい\n・天候が悪くなると頭痛などで体調が悪くなることがある',
        supportContent: '・生成AIを使用したHP作成、及びアプリの開発がスムーズに行えるよう、声掛け、助言、アドバイスを行います。また、休憩などを取らずオーバーワーク気味の際には休憩を促し、体調のコントロールを図ります\n・体調不良時には適宜休憩を促し、体調管理に努めます。また、在宅就労システムを導入した際には在宅の作業が出来るよう対応を行います',
        targetDate: '2025-07-31',
        createdAt: '2024-01-01'
      },
      {
        id: 'plan002',
        userId: 'student003',
        userName: '田中花子',
        longTermGoal: 'SNS運用スキルを習得し、デジタルマーケティング分野での就労を目指す',
        shortTermGoal: '画像生成・編集ツールの基本操作をマスターし、実践的なコンテンツ作成ができるようになる',
        needs: '・デジタルツールの操作に不安がある\n・創造的な作業に興味があるが、技術的な面で自信がない\n・在宅での作業に適応したい',
        supportContent: '・SNS運用の基礎知識と画像生成・編集ツールの操作方法を段階的に指導します\n・実際のツールを使用した実践的な演習を行い、操作に慣れるようサポートします\n・在宅での作業環境整備についてアドバイスし、効率的な作業方法を提案します\n・定期的な進捗確認とフィードバックを行い、学習意欲を維持します',
        targetDate: '2024-12-31',
        createdAt: '2024-01-05'
      }
    ]);
  }, []);

  // ログインURLをコピー
  const copyLoginUrl = (token) => {
    const loginUrl = `${window.location.origin}/student/login/${token}`;
    navigator.clipboard.writeText(loginUrl).then(() => {
      alert('ログインURLをクリップボードにコピーしました。');
    }).catch(() => {
      alert('コピーに失敗しました。手動でコピーしてください。');
    });
  };

  // 個別支援計画を開く
  const openPlanModal = (student) => {
    setSelectedStudent(student);
    const existingPlan = supportPlans.find(plan => plan.userId === student.id);
    if (existingPlan) {
      setPlanForm({
        longTermGoal: existingPlan.longTermGoal,
        shortTermGoal: existingPlan.shortTermGoal,
        needs: existingPlan.needs,
        supportContent: existingPlan.supportContent,
        targetDate: existingPlan.targetDate
      });
    } else {
      setPlanForm({
        longTermGoal: '',
        shortTermGoal: '',
        needs: '',
        supportContent: '',
        targetDate: ''
      });
    }
    setShowPlanModal(true);
  };

  // 個別支援計画を保存
  const savePlan = (e) => {
    e.preventDefault();
    
    const planData = {
      id: supportPlans.find(plan => plan.userId === selectedStudent.id)?.id || `plan${Date.now()}`,
      userId: selectedStudent.id,
      userName: selectedStudent.name,
      ...planForm,
      createdAt: supportPlans.find(plan => plan.userId === selectedStudent.id)?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (supportPlans.find(plan => plan.userId === selectedStudent.id)) {
      // 既存の計画を更新
      setSupportPlans(prev => prev.map(plan => 
        plan.userId === selectedStudent.id ? planData : plan
      ));
    } else {
      // 新しい計画を追加
      setSupportPlans(prev => [...prev, planData]);
    }

    setShowPlanModal(false);
    alert('個別支援計画を保存しました。');
  };

  // 計画があるかどうかをチェック
  const hasPlan = (studentId) => {
    return supportPlans.some(plan => plan.userId === studentId);
  };

  // 進捗に応じた色を取得
  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 進捗に応じたアイコンを取得
  const getProgressIcon = (progress) => {
    if (progress >= 90) return '🏆';
    if (progress >= 70) return '🚀';
    if (progress >= 50) return '📈';
    return '📊';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">🏠 在宅支援管理</h1>
              <p className="text-green-100 text-sm">在宅学習可能な生徒の管理と個別支援計画</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {students.length}名の在宅学習者
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 生徒一覧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">在宅学習者一覧</h2>
                <div className="text-sm text-gray-600">
                  最終更新: {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{student.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{student.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📚 {student.class}</span>
                            <span>👨‍🏫 {student.instructorName}</span>
                            <span>📍 {student.locationName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getProgressColor(student.progress)}`}>
                          {getProgressIcon(student.progress)} {student.progress}%
                        </div>
                        <div className="text-sm text-gray-500">進捗</div>
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
                        <span>最終ログイン: {student.lastLogin}</span>
                        <span className="mx-2">•</span>
                        <span>ログイントークン: {student.loginToken}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                          onClick={() => copyLoginUrl(student.loginToken)}
                        >
                          🔗 URLコピー
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                            hasPlan(student.id)
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                          onClick={() => openPlanModal(student)}
                        >
                          {hasPlan(student.id) ? '📋 計画編集' : '📝 計画作成'}
                        </button>
                        <button
                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                          onClick={() => navigate(`/instructor/student-detail/${student.id}`)}
                        >
                          👁️ 詳細
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム: 統計・サマリー */}
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 統計サマリー</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">総在宅学習者</span>
                  <span className="text-2xl font-bold text-green-600">{students.length}名</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">計画作成済み</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {students.filter(s => hasPlan(s.id)).length}名
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-800 font-medium">計画未作成</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {students.filter(s => !hasPlan(s.id)).length}名
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-800 font-medium">平均進捗</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
                  </span>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ クイックアクション</h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => navigate('/instructor/home-support-evaluations')}
                >
                  📋 評価一覧を表示
                </button>
                <button
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => navigate('/instructor/daily-records')}
                >
                  📝 日次記録を表示
                </button>
                <button
                  className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => alert('一括メール送信機能は開発中です')}
                >
                  📧 一括メール送信
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 個別支援計画モーダル */}
      {showPlanModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  📋 {selectedStudent.name}さんの個別支援計画
                </h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setShowPlanModal(false)}
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={savePlan} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    長期目標
                  </label>
                  <textarea
                    value={planForm.longTermGoal}
                    onChange={(e) => setPlanForm({...planForm, longTermGoal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    短期目標
                  </label>
                  <textarea
                    value={planForm.shortTermGoal}
                    onChange={(e) => setPlanForm({...planForm, shortTermGoal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ニーズ・課題
                  </label>
                  <textarea
                    value={planForm.needs}
                    onChange={(e) => setPlanForm({...planForm, needs: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    支援内容
                  </label>
                  <textarea
                    value={planForm.supportContent}
                    onChange={(e) => setPlanForm({...planForm, supportContent: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    目標達成予定日
                  </label>
                  <input
                    type="date"
                    value={planForm.targetDate}
                    onChange={(e) => setPlanForm({...planForm, targetDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setShowPlanModal(false)}
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSupportManagement; 