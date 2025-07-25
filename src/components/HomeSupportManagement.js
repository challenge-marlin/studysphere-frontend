import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyEvaluationModal from './WeeklyEvaluationModal';
import MonthlyEvaluationModal from './MonthlyEvaluationModal';
import AddHomeSupportUserModal from './AddHomeSupportUserModal';

const HomeSupportManagement = () => {
  const navigate = useNavigate();
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
    // 他のユーザーはcanStudyAtHome: falseで追加してもOK
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);

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
        // 他のユーザーはcanStudyAtHome: falseで追加してもOK
      ];
      setStudents(mockStudents);
    };
    fetchStudents();
  }, []);

  const getFilteredStudents = () => {
    let filteredStudents = students.filter(s => s.canStudyAtHome);
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
        student.status === statusFilter
      );
    }
    return filteredStudents;
  };

  const getAllTags = () => {
    const allTags = new Set();
    students.forEach(student => {
      student.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setStatusFilter('all');
  };

  const startWeeklyEvaluation = (student) => {
    setSelectedStudentForEvaluation(student);
    setShowWeeklyModal(true);
  };
  const startMonthlyEvaluation = (student) => {
    setSelectedStudentForEvaluation(student);
    setShowMonthlyModal(true);
  };
  const handleAiAssist = async (params) => {
    const { type, field, period } = params;
    const suggestions = {
      weekly: {
        content: `${selectedStudentForEvaluation?.name}さんの週次評価について\n\n期間：${period?.start} ～ ${period?.end}\n\n学習進捗：\n・${selectedStudentForEvaluation?.class}の内容を着実に習得\n・基礎知識の理解が深まっている\n・実践的な作業も順調に進んでいる\n\n体調管理：\n・良好な状態を維持\n・適切な休憩を取っている\n・学習意欲が高い\n\n次回目標：\n・より高度な内容への挑戦\n・実践的なスキルの向上\n・継続的な学習習慣の維持\n\n指導員からのコメント：\n学習態度が非常に良好で、着実にスキルアップしています。今後も継続的なサポートを行い、さらなる成長を支援していきます。`
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
    await new Promise(resolve => setTimeout(resolve, 500));
    return suggestions[type]?.[field] || '';
  };
  const handleAddUsers = (users) => {
    const updatedUsers = users.map(user => ({
      ...user,
      canStudyAtHome: true
    }));
    setStudents(prev => [...prev, ...updatedUsers]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              👥 在宅支援利用者一覧
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">📍</span>
              <div>
                <p className="font-medium">在宅支援管理</p>
                <p className="text-sm text-gray-500">※同一拠点の他の指導員の利用者も管理できます</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => navigate(`/instructor/daily-records`)}
            >
              📝 日次記録一括
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              + 在宅支援利用者を追加
            </button>
          </div>
        </div>
      </div>

      {/* フィルター部分 */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="space-y-6">
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
        </div>
      </div>

      {/* 利用者リスト部分 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">利用者名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">タグ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">状態</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">進行度</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 border-b border-green-200">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredStudents().map(student => (
                <tr key={student.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-600">{student.name}</span>
                      <span className="text-sm text-gray-500">担当: {student.instructorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
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
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                        onClick={() => startWeeklyEvaluation(student)}
                      >
                        📊 週次評価
                      </button>
                      <button
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                        onClick={() => startMonthlyEvaluation(student)}
                      >
                        📈 月次評価
                      </button>
                      <button
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => navigate(`/instructor/student-detail/${student.id}`)}
                      >
                        👤 利用者詳細
                      </button>
                      <button
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200"
                        onClick={() => navigate(`/instructor/student/${student.id}/daily-records`)}
                      >
                        📝 日次記録
                      </button>
                      <button
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200"
                        onClick={() => {
                          setStudents(prev => prev.map(u => u.id === student.id ? { ...u, canStudyAtHome: false } : u));
                        }}
                      >
                        解除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* 在宅支援利用者追加モーダル */}
      <AddHomeSupportUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddUsers}
      />
    </div>
  );
};

export default HomeSupportManagement; 