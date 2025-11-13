import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useInstructorGuard } from '../utils/hooks/useAuthGuard';
import { API_BASE_URL } from '../config/apiConfig';
import { getCurrentUserSatelliteId } from '../utils/locationUtils';

/**
 * 評価(週次)作成画面
 * 左側：今週の日次記録一覧（折りたたみ可能）
 * 右側：評価(週次)フォーム
 */
const WeeklyEvaluationPage = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useInstructorGuard();
  
  // 戻る際に拠点情報を保存する関数
  const saveLocationAndNavigate = () => {
    if (currentUser) {
      const savedSatellite = sessionStorage.getItem('selectedSatellite');
      if (savedSatellite) {
        // 既存の拠点情報をそのまま保持
        const satellite = JSON.parse(savedSatellite);
        sessionStorage.setItem('selectedSatellite', JSON.stringify(satellite));
      } else if (currentUser.satellite_id) {
        // ユーザー情報から拠点情報を保存
        const currentLocation = {
          id: currentUser.satellite_id,
          name: currentUser.satellite_name,
          company_id: currentUser.company_id,
          company_name: currentUser.company_name
        };
        sessionStorage.setItem('selectedSatellite', JSON.stringify(currentLocation));
      }
    }
    navigate('/instructor/home-support');
  };
  
  // 期間の状態管理
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [prevEvalDate, setPrevEvalDate] = useState('');
  
  // 生徒情報
  const [student, setStudent] = useState(null);
  
  // 日次記録一覧
  const [dailyRecords, setDailyRecords] = useState([]);
  const [expandedRecords, setExpandedRecords] = useState({});
  
  // 評価(週次)フォーム
  const [evaluationData, setEvaluationData] = useState({
    method: '通所',
    methodOther: '',
    content: '',
    recorder: '',
    confirmer: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 指導員リスト
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // 生徒情報と前回評価日を取得
    if (studentId) {
      fetchStudentInfo();
    }
  }, [studentId]);

  useEffect(() => {
    // URLパラメータから期間を取得、なければ昨日の1週間前～昨日を設定
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    if (start && end) {
      setPeriodStart(start);
      setPeriodEnd(end);
    } else {
      // 昨日の1週間前～昨日の期間を自動設定
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const weekAgo = new Date(yesterday);
      weekAgo.setDate(yesterday.getDate() - 6); // 7日前（1週間前）
      
      setPeriodStart(weekAgo.toISOString().split('T')[0]);
      setPeriodEnd(yesterday.toISOString().split('T')[0]);
    }

    // 生徒情報と前回評価日は別途取得
  }, [studentId, searchParams]);

  useEffect(() => {
    if (periodStart && periodEnd && studentId) {
      fetchDailyRecords();
    }
  }, [periodStart, periodEnd, studentId]);

  // 指導員一覧を取得
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        // まず生徒情報から拠点IDを取得
        let satelliteId = student?.satellite_id;
        
        // 生徒情報にsatellite_idがない場合、satellite_idsから取得を試みる
        if (!satelliteId && student?.satellite_ids) {
          let satelliteIds = student.satellite_ids;
          if (typeof satelliteIds === 'string') {
            try {
              satelliteIds = JSON.parse(satelliteIds);
            } catch (error) {
              console.error('satellite_idsパースエラー:', error);
            }
          }
          if (Array.isArray(satelliteIds) && satelliteIds.length > 0) {
            satelliteId = satelliteIds[0];
          } else if (satelliteIds && !Array.isArray(satelliteIds)) {
            satelliteId = satelliteIds;
          }
        }
        
        // 生徒情報に拠点IDがない場合、現在選択中の拠点IDを取得
        if (!satelliteId && currentUser) {
          satelliteId = getCurrentUserSatelliteId(currentUser);
        }
        
        // セッションストレージからも取得を試みる
        if (!satelliteId) {
          const savedSatellite = sessionStorage.getItem('selectedSatellite');
          if (savedSatellite) {
            try {
              const satellite = JSON.parse(savedSatellite);
              satelliteId = satellite.id;
            } catch (e) {
              console.error('拠点情報のパースエラー:', e);
            }
          }
        }

        if (!satelliteId) {
          console.warn('拠点IDが取得できません。指導員一覧を取得できません。');
          setInstructors([]);
          return;
        }

        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          console.error('認証トークンが見つかりません');
          setInstructors([]);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/satellite/${satelliteId}/weekly-evaluation-instructors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('指導員一覧取得エラー:', response.status, response.statusText);
          setInstructors([]);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('指導員一覧取得エラー: JSONではないレスポンス');
          setInstructors([]);
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          console.log('指導員一覧取得成功:', data.data.length, '件');
          setInstructors(data.data);
        } else {
          console.error('指導員一覧取得エラー:', data.message || 'データ取得に失敗しました');
          setInstructors([]);
        }
      } catch (error) {
        console.error('指導員一覧取得エラー:', error);
        setInstructors([]);
      }
    };

    // 生徒情報または現在ユーザーが利用可能な場合に取得
    if (student || currentUser) {
      fetchInstructors();
    }
  }, [student, currentUser]);

  // 生徒情報と前回評価日を取得
  const fetchStudentInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        console.error('認証トークンが見つかりません');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/users/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('生徒情報取得エラー:', errorData.message || 'エラーが発生しました');
        } else {
          const text = await response.text();
          console.error('生徒情報取得エラー: HTMLレスポンスが返されました', response.status, text.substring(0, 100));
        }
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('生徒情報取得エラー: JSONではないレスポンス', text.substring(0, 100));
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStudent(data.data);
      }

      // 前回評価日を取得
      const prevEvalResponse = await fetch(`${API_BASE_URL}/api/weekly-evaluations/user/${studentId}/last-evaluation-date`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (prevEvalResponse.ok) {
        const prevEvalContentType = prevEvalResponse.headers.get('content-type');
        if (prevEvalContentType && prevEvalContentType.includes('application/json')) {
          const prevEvalData = await prevEvalResponse.json();
          if (prevEvalData.success && prevEvalData.data?.last_evaluation_date) {
            setPrevEvalDate(prevEvalData.data.last_evaluation_date);
          } else {
            setPrevEvalDate(''); // 前回評価日がない場合は空文字列
          }
        }
      } else {
        setPrevEvalDate(''); // エラーの場合も空文字列
      }
    } catch (error) {
      console.error('生徒情報取得エラー:', error);
    }
  };

  // 日次記録を取得
  const fetchDailyRecords = async () => {
    if (!studentId || !periodStart || !periodEnd) {
      console.log('●▶日次記録取得スキップ: 必要なパラメータが不足しています', { studentId, periodStart, periodEnd });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        console.error('●▶日次記録取得エラー: 認証トークンが見つかりません');
        setDailyRecords([]);
        return;
      }

      const url = `${API_BASE_URL}/api/remote-support/daily-records?userId=${studentId}&startDate=${periodStart}&endDate=${periodEnd}`;
      console.log('●▶日次記録取得開始:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('●▶日次記録取得エラー:', errorData.message || 'エラーが発生しました', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            sqlError: errorData.sqlError,
            sqlCode: errorData.sqlCode
          });
          
          // ユーザーに分かりやすいエラーメッセージを表示
          if (response.status === 401 || response.status === 403) {
            alert('認証エラーが発生しました。ログインし直してください。');
          } else if (errorData.sqlError) {
            console.error('SQLエラー詳細:', errorData.sqlError);
          }
        } else {
          const text = await response.text();
          console.error('●▶日次記録取得エラー: HTMLレスポンスが返されました', {
            status: response.status,
            statusText: response.statusText,
            preview: text.substring(0, 100)
          });
        }
        // エラー時は空配列を設定
        setDailyRecords([]);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('●▶日次記録取得エラー: JSONではないレスポンス', {
          contentType,
          preview: text.substring(0, 100)
        });
        setDailyRecords([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('●▶日次記録取得成功:', data.data?.length || 0, '件');
        setDailyRecords(data.data || []);
      } else {
        console.error('●▶日次記録取得エラー:', data.message || 'データ取得に失敗しました', data);
        setDailyRecords([]);
      }
    } catch (error) {
      console.error('●▶日次記録取得エラー:', error.message, error);
      // エラー時は空配列を設定
      setDailyRecords([]);
    }
  };

  // 評価データを更新
  const updateEvaluation = (field, value) => {
    setEvaluationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 記録の展開/折りたたみ
  const toggleRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // 全ての記録を展開/折りたたみ
  const toggleAllRecords = (expand) => {
    const newExpandedRecords = {};
    dailyRecords.forEach(record => {
      newExpandedRecords[record.id] = expand;
    });
    setExpandedRecords(newExpandedRecords);
  };

  // AIで評価案を生成
  const generateEvaluationWithAI = () => {
    setIsGenerating(true);
    
    // AIによる評価案生成のシミュレーション
    setTimeout(() => {
      const suggestion = `・対象期間中の作業の進め方や、設定した目標の達成度を確認しました。
・HTML/CSSの基礎学習は順調に進んでおり、レスポンシブデザインの理解も深まっています。
・毎日の進捗確認を通じて、計画的に学習を進める習慣が身についてきました。
・集中力が途切れることも少なく、適度な休憩を取りながら効率的に作業できています。
・生活面では、規則正しい生活リズムを維持できており、体調も安定しています。
・来週は、より実践的な課題に取り組み、スキルの定着を図っていく方針です。`;
      
      updateEvaluation('content', suggestion);
      setIsGenerating(false);
    }, 1500);
  };

  // 保存
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        alert('認証トークンが見つかりません。ログインし直してください。');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/weekly-evaluations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: student.id,
          date: new Date().toISOString().split('T')[0],
          prev_eval_date: prevEvalDate && prevEvalDate.trim() !== '' ? prevEvalDate : null, // 空文字列の場合はnullに変換
          period_start: periodStart,
          period_end: periodEnd,
          evaluation_method: evaluationData.method, // ENUM値（'通所', '訪問', 'その他'）をそのまま送信
          method_other: evaluationData.method === 'その他' ? evaluationData.methodOther : null, // 「その他」の場合のみ補足情報を送信
          evaluation_content: evaluationData.content,
          recorder_name: evaluationData.recorder,
          confirm_name: evaluationData.confirmer
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('評価(週次)を保存しました。');
          saveLocationAndNavigate();
        } else {
          const errorMsg = data.message || '保存に失敗しました';
          const sqlError = data.sqlError ? `\nSQLエラー: ${data.sqlError}` : '';
          alert(`保存に失敗しました: ${errorMsg}${sqlError}`);
          console.error('保存エラー詳細:', data);
        }
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = '保存に失敗しました。';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            if (errorData.sqlError) {
              errorMessage += `\nSQLエラー: ${errorData.sqlError}`;
            }
            console.error('保存エラー詳細:', errorData);
          } catch (e) {
            console.error('エラーレスポンスの解析に失敗:', e);
          }
        } else {
          const text = await response.text();
          console.error('HTMLレスポンス:', text.substring(0, 200));
        }
        
        alert(`保存に失敗しました: ${errorMessage} (ステータス: ${response.status})`);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました: ' + error.message);
    }
  };

  // 日付フォーマット
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl font-semibold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium"
                onClick={saveLocationAndNavigate}
              >
                ← 在宅支援管理ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-1">📊 評価(週次)作成</h1>
                <p className="text-blue-100 text-sm">在宅における就労支援記録（評価）</p>
              </div>
            </div>
          </div>
          
          {/* 期間設定 */}
          <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4 border border-white border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-blue-200">対象者:</span>
                  <span className="ml-2 font-semibold text-white">{student.name}</span>
                  <span className="ml-3 text-blue-200">受給者証番号:</span>
                  <span className="ml-2 font-semibold text-white">{student.recipientNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="text-blue-200">前回評価日:</span>
                  <span className="ml-2 font-semibold text-white">{prevEvalDate ? formatDate(prevEvalDate) : 'なし'}</span>
                </div>
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-2">📅 対象期間を設定</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => {
                        setPeriodStart(e.target.value);
                        // 開始日を変更したら、自動的に6日後を終了日に設定（1週間）
                        const newStart = new Date(e.target.value);
                        const newEnd = new Date(newStart);
                        newEnd.setDate(newStart.getDate() + 6);
                        setPeriodEnd(newEnd.toISOString().split('T')[0]);
                      }}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：日次記録一覧 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">📝 今週の日次記録</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllRecords(true)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all duration-200"
                >
                  全て展開
                </button>
                <button
                  onClick={() => toggleAllRecords(false)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all duration-200"
                >
                  全て折りたたむ
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {dailyRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  この期間の日次記録がありません
                </div>
              ) : (
                dailyRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleRecord(record.id)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {expandedRecords[record.id] ? '📂' : '📁'}
                        </span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">
                            {formatDate(record.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.startTime} 〜 {record.endTime} ({record.supportMethod})
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-400">
                        {expandedRecords[record.id] ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    {expandedRecords[record.id] && (
                      <div className="p-4 bg-white space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">作業内容:</span>
                          <p className="mt-1 text-gray-600">{record.workContent}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">作業実績:</span>
                          <p className="mt-1 text-gray-600">{record.workResult}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">日報:</span>
                          <p className="mt-1 text-gray-600">{record.dailyReport}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">支援内容:</span>
                          <p className="mt-1 text-gray-600">{record.supportContent}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">心身状況・助言内容:</span>
                          <p className="mt-1 text-gray-600">{record.advice}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">体調:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.condition === '良い' ? 'bg-green-100 text-green-700' :
                            record.condition === '普通' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {record.condition}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右側：評価フォーム */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📋 評価(週次)フォーム</h2>
            
            <div className="space-y-6">
              {/* 評価方法 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  評価方法 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {['通所', '訪問', 'その他'].map(method => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={evaluationData.method === method}
                        onChange={(e) => updateEvaluation('method', e.target.value)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      {method}
                    </label>
                  ))}
                </div>
                {evaluationData.method === 'その他' && (
                  <input
                    type="text"
                    value={evaluationData.methodOther}
                    onChange={(e) => updateEvaluation('methodOther', e.target.value)}
                    placeholder="実施方法の詳細を入力"
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* 評価内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    評価内容 <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={generateEvaluationWithAI}
                    disabled={isGenerating || dailyRecords.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      isGenerating || dailyRecords.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        生成中...
                      </>
                    ) : (
                      <>
                        ✨ 今週の記録から評価案を生成
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  左側の日次記録を確認しながら、1週間の振り返りを記載してください
                </p>
                <textarea
                  value={evaluationData.content}
                  onChange={(e) => updateEvaluation('content', e.target.value)}
                  rows={12}
                  placeholder="例：&#10;・対象期間中の作業の進め方や、設定した個数目標の達成度をお互いに確認。&#10;・目標に届かなかった日がある。意欲はあるが、集中力が途切れたことが原因であり、効果的なリフレッシュ方法を考えていく。&#10;・生活面では、たまにスマホゲームに没頭してしまい、夜更かししてしまうことがあるため、特に夜間の生活リズムを崩さないよう助言する。"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              {/* 記録者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  記録者 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="recorder-list"
                    value={evaluationData.recorder}
                    onChange={(e) => updateEvaluation('recorder', e.target.value)}
                    placeholder="リストから選択または手入力"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <datalist id="recorder-list">
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.name} />
                    ))}
                  </datalist>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">指導員リストから選択、または直接入力できます</p>
              </div>

              {/* 確認者（サービス管理責任者） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  確認者（サービス管理責任者） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="confirmer-list"
                    value={evaluationData.confirmer}
                    onChange={(e) => updateEvaluation('confirmer', e.target.value)}
                    placeholder="リストから選択または手入力"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <datalist id="confirmer-list">
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.name} />
                    ))}
                  </datalist>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">※ 評価内容はサービス管理責任者が必ず確認すること</p>
              </div>
            </div>

            {/* ボタン */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={saveLocationAndNavigate}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                💾 保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEvaluationPage;