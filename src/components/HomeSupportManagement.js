import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/userContext';
import { getSatelliteHomeSupportUsers, removeHomeSupportFlag } from '../utils/api';
import WeeklyEvaluationModal from './WeeklyEvaluationModal';
import MonthlyEvaluationModal from './MonthlyEvaluationModal';
import HomeSupportUserAdditionModal from './HomeSupportUserAdditionModal';

const HomeSupportManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSatellite, setCurrentSatellite] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 現在のユーザー情報と拠点情報を取得
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const selectedSatellite = sessionStorage.getItem('selectedSatellite');
    if (selectedSatellite) {
      setCurrentSatellite(JSON.parse(selectedSatellite));
    } else if (user?.satellite_ids && user.satellite_ids.length > 0) {
      setCurrentSatellite({
        id: user.satellite_ids[0],
        name: '現在の拠点'
      });
    }
  }, []);

  useEffect(() => {
    if (currentSatellite?.id) {
      fetchHomeSupportUsers();
    }
  }, [currentSatellite]);

  // 在宅支援利用者追加イベントをリッスン
  useEffect(() => {
    const handleUserAdded = () => {
      fetchHomeSupportUsers();
    };

    window.addEventListener('homeSupportUserAdded', handleUserAdded);
    
    return () => {
      window.removeEventListener('homeSupportUserAdded', handleUserAdded);
    };
  }, []);

  const fetchHomeSupportUsers = async () => {
    try {
      setLoading(true);
      const instructorIds = [currentUser?.id].filter(Boolean);
      const response = await getSatelliteHomeSupportUsers(currentSatellite.id, instructorIds);
      
      if (response.success) {
        // テーブル表示用のデータ形式に変換
        const formattedUsers = response.data.map(user => ({
          id: user.id,
          name: user.name,
          instructorName: user.instructor_name || '未設定',
          email: user.login_code || '未設定',
          status: 'active', // 在宅支援対象は稼働中として扱う
          progress: Math.floor(Math.random() * 100), // 仮の進捗率（後で実際のデータに置き換え）
          tags: ['在宅支援'], // デフォルトタグ
          canStudyAtHome: true
        }));
        
        setStudents(formattedUsers);
      }
    } catch (error) {
      console.error('在宅支援利用者取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

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
        content: `${selectedStudentForEvaluation?.name}さんの評価(週次)について\n\n期間：${period?.start} ～ ${period?.end}\n\n学習進捗：\n・${selectedStudentForEvaluation?.class}の内容を着実に習得\n・基礎知識の理解が深まっている\n・実践的な作業も順調に進んでいる\n\n体調管理：\n・良好な状態を維持\n・適切な休憩を取っている\n・学習意欲が高い\n\n次回目標：\n・より高度な内容への挑戦\n・実践的なスキルの向上\n・継続的な学習習慣の維持\n\n指導員からのコメント：\n学習態度が非常に良好で、着実にスキルアップしています。今後も継続的なサポートを行い、さらなる成長を支援していきます。`
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
  const handleAddUsersSuccess = (result) => {
    // 在宅支援利用者が追加された後の処理
    console.log('在宅支援利用者が追加されました:', result);
    // 即座にリストを更新
    fetchHomeSupportUsers();
    // 他のコンポーネントにも通知
    window.dispatchEvent(new CustomEvent('homeSupportUserAdded'));
  };

  // 在宅支援解除機能
  const handleRemoveHomeSupport = async (student) => {
    if (!window.confirm(`${student.name}さんの在宅支援を解除しますか？`)) {
      return;
    }

    try {
      const response = await removeHomeSupportFlag(student.id);
      
      if (response.success) {
        // 成功時はリストを再取得
        fetchHomeSupportUsers();
        // 他のコンポーネントにも通知
        window.dispatchEvent(new CustomEvent('homeSupportUserRemoved'));
        alert('在宅支援を解除しました');
      } else {
        alert(`在宅支援解除に失敗しました: ${response.message}`);
      }
    } catch (error) {
      console.error('在宅支援解除エラー:', error);
      alert('在宅支援解除に失敗しました');
    }
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
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">在宅支援利用者を読み込み中...</span>
          </div>
        ) : (
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
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-gray-400 text-6xl mb-4">🏠</div>
                      <p className="text-lg font-medium text-gray-600 mb-2">在宅支援利用者がいません</p>
                      <p className="text-gray-500">在宅支援を利用している利用者が登録されていません。</p>
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map((student, index) => (
                <tr key={student.id} className={`hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}>
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
                        📊 評価(週次)
                      </button>
                      <button
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                        onClick={() => startMonthlyEvaluation(student)}
                      >
                        📈 達成度評価
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
                        onClick={() => handleRemoveHomeSupport(student)}
                      >
                        解除
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
            console.log('評価(週次)を保存:', data);
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
            console.log('達成度評価を保存:', data);
            setShowMonthlyModal(false);
            setSelectedStudentForEvaluation(null);
          }}
          prevEvalDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          defaultInstructor={selectedStudentForEvaluation?.instructorName}
          aiAssist={handleAiAssist}
        />
      )}

      {/* 在宅支援利用者追加モーダル */}
      <HomeSupportUserAdditionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddUsersSuccess}
      />
    </div>
  );
};

export default HomeSupportManagement; 