// API_BASE_URLを直接定義（api.jsと同じ定義を使用）
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
    ? 'https://backend.studysphere.ayatori-inc.co.jp' 
    : 'http://localhost:5050');

/**
 * 利用者の日報データを取得
 * @param {string} userId - 利用者ID
 * @param {string} date - 日付 (YYYY-MM-DD)
 * @returns {Promise<Object>} 日報データ
 */
export const getUserDailyReport = async (userId, date) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    
    if (data.success) {
      // 指定されたユーザーと日付の日報を検索
      const userReport = data.data.find(report => 
        report.user_id === userId && 
        report.report_date === date
      );
      
      return {
        success: true,
        data: userReport || null
      };
    } else {
      return {
        success: false,
        message: data.message || '日報データの取得に失敗しました'
      };
    }
  } catch (error) {
    console.error('日報データ取得エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: '日報データの取得中にエラーが発生しました'
    };
  }
};

/**
 * 利用者の体調管理データを取得
 * @param {string} userId - 利用者ID
 * @param {string} date - 日付 (YYYY-MM-DD)
 * @returns {Promise<Object>} 体調管理データ
 */
export const getUserHealthData = async (userId, date) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    console.log('getUserHealthData: 認証トークン確認:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'なし',
      userId,
      date
    });
    
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('体調管理データAPIレスポンス:', {
      success: data.success,
      hasReports: !!data.reports,
      hasData: !!data.data,
      hasDataDataReports: !!(data.data && data.data.reports),
      reportsType: typeof data.reports,
      dataType: typeof data.data,
      dataDataReportsType: data.data && data.data.reports ? typeof data.data.reports : 'undefined',
      reportsIsArray: Array.isArray(data.reports),
      dataIsArray: Array.isArray(data.data),
      dataDataReportsIsArray: data.data && data.data.reports ? Array.isArray(data.data.reports) : false,
      reportsLength: Array.isArray(data.reports) ? data.reports.length : 'N/A',
      dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
      dataDataReportsLength: data.data && data.data.reports && Array.isArray(data.data.reports) ? data.data.reports.length : 'N/A',
      dataPreview: data
    });
    
    if (data.success) {
      // バックエンドの実装に基づく正しい構造: data.data.reports
      if (!data.data || !data.data.reports || !Array.isArray(data.data.reports)) {
        console.error('体調管理データ: 期待される構造ではありません:', { 
          hasData: !!data.data,
          hasReports: !!(data.data && data.data.reports),
          reportsIsArray: data.data && data.data.reports ? Array.isArray(data.data.reports) : false,
          dataStructure: data
        });
        return {
          success: false,
          message: '体調管理データの形式が正しくありません'
        };
      }
      
      const reports = data.data.reports;
      console.log('体調管理データ: data.data.reportsを使用 (配列長:', reports.length, ')');
      
      // 指定されたユーザーと日付の日報を検索
      console.log('体調管理データ検索条件:', {
        userId,
        date,
        reportsCount: reports.length,
        reportsPreview: reports.map(r => ({
          user_id: r.user_id,
          date: r.date,
          report_date: r.report_date,
          id: r.id
        }))
      });
      
      const userReport = reports.find(report => {
        // 日付の正規化（ISO形式からYYYY-MM-DD形式に変換）
        const reportDate = new Date(report.date).toISOString().split('T')[0];
        const isUserMatch = report.user_id == userId;
        const isDateMatch = reportDate === date;
        
        console.log('体調管理データ検索詳細:', {
          reportUserId: report.user_id,
          targetUserId: userId,
          userMatch: isUserMatch,
          reportDate: report.date,
          reportDateNormalized: reportDate,
          targetDate: date,
          dateMatch: isDateMatch,
          overallMatch: isUserMatch && isDateMatch
        });
        
        return isUserMatch && isDateMatch;
      });
      
      if (userReport) {
        console.log('体調管理データ: マッチするレポートが見つかりました:', userReport);
        console.log('体調管理データ: conditionフィールドの値:', {
          condition: userReport.condition,
          conditionType: typeof userReport.condition,
          conditionNote: userReport.condition_note
        });
        
        // データベースのconditionフィールドを直接使用
        const condition = userReport.condition || null;
        
        return {
          success: true,
          data: {
            id: userReport.id || null,
            temperature: userReport.temperature || null,
            condition: condition,
            condition_note: userReport.condition_note || null,
            sleep_hours: userReport.sleep_hours || null,
            bedtime: userReport.bedtime || null,
            wakeup_time: userReport.wakeup_time || null,
            mark_start: userReport.mark_start || null,
            mark_end: userReport.mark_end || null,
            mark_lunch_start: userReport.mark_lunch_start || null,
            mark_lunch_end: userReport.mark_lunch_end || null
          }
        };
      } else {
        console.log('体調管理データ: マッチするレポートが見つかりませんでした');
        return {
          success: true,
          data: null
        };
      }
    } else {
      return {
        success: false,
        message: data.message || '体調管理データの取得に失敗しました'
      };
    }
  } catch (error) {
    console.error('体調管理データ取得エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: '体調管理データの取得中にエラーが発生しました'
    };
  }
};

/**
 * 利用者の作業予定データを取得
 * @param {string} userId - 利用者ID
 * @param {string} date - 日付 (YYYY-MM-DD)
 * @returns {Promise<Object>} 作業予定データ
 */
export const getUserWorkPlan = async (userId, date) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    console.log('getUserWorkPlan: 認証トークン確認:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'なし',
      userId,
      date
    });
    
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('作業予定データAPIレスポンス:', {
      success: data.success,
      hasReports: !!data.reports,
      hasData: !!data.data,
      hasDataDataReports: !!(data.data && data.data.reports),
      reportsType: typeof data.reports,
      dataType: typeof data.data,
      dataDataReportsType: data.data && data.data.reports ? typeof data.data.reports : 'undefined',
      reportsIsArray: Array.isArray(data.reports),
      dataIsArray: Array.isArray(data.data),
      dataDataReportsIsArray: data.data && data.data.reports ? Array.isArray(data.data.reports) : false,
      reportsLength: Array.isArray(data.reports) ? data.reports.length : 'N/A',
      dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
      dataDataReportsLength: data.data && data.data.reports && Array.isArray(data.data.reports) ? data.data.reports.length : 'N/A',
      dataPreview: data
    });
    
    if (data.success) {
      // バックエンドの実装に基づく正しい構造: data.data.reports
      if (!data.data || !data.data.reports || !Array.isArray(data.data.reports)) {
        console.error('作業予定データ: 期待される構造ではありません:', { 
          hasData: !!data.data,
          hasReports: !!(data.data && data.data.reports),
          reportsIsArray: data.data && data.data.reports ? Array.isArray(data.data.reports) : false,
          dataStructure: data
        });
        return {
          success: false,
          message: '作業予定データの形式が正しくありません'
        };
      }
      
      const reports = data.data.reports;
      console.log('作業予定データ: data.data.reportsを使用 (配列長:', reports.length, ')');
      
      // 指定されたユーザーと日付の日報を検索
      console.log('作業予定データ検索条件:', {
        userId,
        date,
        reportsCount: reports.length,
        reportsPreview: reports.map(r => ({
          user_id: r.user_id,
          date: r.date,
          report_date: r.report_date,
          id: r.id
        }))
      });
      
      const userReport = reports.find(report => {
        // 日付の正規化（ISO形式からYYYY-MM-DD形式に変換）
        const reportDate = new Date(report.date).toISOString().split('T')[0];
        const isUserMatch = report.user_id == userId;
        const isDateMatch = reportDate === date;
        
        console.log('作業予定データ検索詳細:', {
          reportUserId: report.user_id,
          targetUserId: userId,
          userMatch: isUserMatch,
          reportDate: report.date,
          reportDateNormalized: reportDate,
          targetDate: date,
          dateMatch: isDateMatch,
          overallMatch: isUserMatch && isDateMatch
        });
        
        return isUserMatch && isDateMatch;
      });
      
      if (userReport) {
        console.log('作業予定データ: マッチするレポートが見つかりました:', userReport);
        return {
          success: true,
          data: {
            id: userReport.id || null,
            task_content: userReport.task_content || userReport.work_note || null, // task_contentが空の場合はwork_noteを使用
            work_note: userReport.work_note || null,
            work_result: userReport.work_result || null,
            support_content: userReport.support_content || null,
            support_method: userReport.support_method || null,
            support_method_note: userReport.support_method_note || null,
            advice: userReport.advice || null,
            daily_report: userReport.daily_report || null,
            recorder_name: userReport.recorder_name || null,
            mark_start: userReport.mark_start || null,
            mark_end: userReport.mark_end || null,
            mark_lunch_start: userReport.mark_lunch_start || null,
            mark_lunch_end: userReport.mark_lunch_end || null
          }
        };
      } else {
        console.log('作業予定データ: マッチするレポートが見つかりませんでした');
        return {
          success: true,
          data: null
        };
      }
    } else {
      return {
        success: false,
        message: data.message || '作業予定データの取得に失敗しました'
      };
    }
  } catch (error) {
    console.error('作業予定データ取得エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: '作業予定データの取得中にエラーが発生しました'
    };
  }
};

/**
 * 指導員コメントを追加
 * @param {string} reportId - 日報ID
 * @param {string} comment - 指導員コメント
 * @returns {Promise<Object>} 更新結果
 */
export const addInstructorComment = async (reportId, comment) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    console.log('指導員コメント追加:', {
      reportId,
      comment,
      hasToken: !!token
    });

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        instructor_comment: comment
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('指導員コメント追加レスポンス:', data);
    
    if (data.success) {
      return {
        success: true,
        message: '指導員コメントを追加しました'
      };
    } else {
      return {
        success: false,
        message: data.message || '指導員コメントの追加に失敗しました'
      };
    }
  } catch (error) {
    console.error('指導員コメント追加エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: '指導員コメントの追加中にエラーが発生しました'
    };
  }
};

/**
 * 利用者の日報データを更新
 * @param {string} reportId - 日報ID
 * @param {Object} updateData - 更新データ
 * @returns {Promise<Object>} 更新結果
 */
export const updateUserDailyReport = async (reportId, updateData) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('日報データ更新エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: '日報データの更新中にエラーが発生しました'
    };
  }
};

/**
 * 利用者の日報にコメントを追加
 * @param {string} reportId - 日報ID
 * @param {string} comment - コメント内容
 * @returns {Promise<Object>} 追加結果
 */
export const addDailyReportComment = async (reportId, comment) => {
  try {
    // トークンの存在確認
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        success: false,
        message: '認証トークンが見つかりません。ログインし直してください。'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/remote-support/daily-reports/${reportId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment })
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          message: '認証が無効です。ログインし直してください。'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: 'この操作を実行する権限がありません。'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          message: 'サーバーエラーが発生しました。しばらく時間をおいてから再試行してください。'
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('コメント追加エラー:', error);
    
    // ネットワークエラーの場合
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }
    
    return {
      success: false,
      message: 'コメントの追加中にエラーが発生しました'
    };
  }
};
