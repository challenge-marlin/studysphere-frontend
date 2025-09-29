import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
    ? 'https://backend.studysphere.ayatori-inc.co.jp' 
    : 'http://localhost:5050');

const TempPasswordManager = ({ students, onStudentsUpdate }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // 一時パスワード機能用のstate
  const [tempPasswordUsers, setTempPasswordUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [tempPasswordLoading, setTempPasswordLoading] = useState(false);

  // 一時パスワード生成関数
  const generateTemporaryPassword = () => {
    const generatePart = () => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };
    return `${generatePart()}-${generatePart()}-${generatePart()}`;
  };

  // 一時パスワード発行
  const issueTemporaryPassword = async (userId) => {
    try {
      const url = `${API_BASE_URL}/api/users/${userId}/issue-temp-password`;
      console.log('=== 一時パスワード発行リクエスト ===');
      console.log('URL:', url);
      console.log('userId:', userId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('=== レスポンス情報 ===');
      console.log('response.status:', response.status);
      console.log('response.ok:', response.ok);
      console.log('response.headers:', Object.fromEntries(response.headers.entries()));

      // レスポンスのテキストを取得してからJSON解析
      const responseText = await response.text();
      console.log('response.text():', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON解析エラー:', parseError);
        console.error('解析できなかったテキスト:', responseText);
        alert('サーバーからの応答の解析に失敗しました');
        return;
      }
      
      console.log('=== フロントエンド一時パスワード発行デバッグ ===');
      console.log('response.status:', response.status);
      console.log('result:', result);
      console.log('result.success:', result.success);
      console.log('result.data:', result.data);
      
      // エラーレスポンスの場合は早期リターン
      if (!result.success || !result.data) {
        console.error('APIレスポンスエラー:', result);
        alert(`一時パスワード発行に失敗しました: ${result.message || '不明なエラー'}`);
        return;
      }
      
      console.log('result.data.expiresAt:', result.data.expiresAt);
      
      // 即座にローカル状態を更新
      onStudentsUpdate(prevStudents => {
        const updatedStudents = prevStudents.map(student => 
          student.id === userId 
            ? { 
                ...student, 
                temp_password: result.data.tempPassword,
                expires_at: result.data.expires_at || result.data.expiresAt,
                is_used: 0
              }
            : student
        );
        console.log('=== ローカル状態更新完了 ===');
        console.log('更新された学生:', updatedStudents.find(s => s.id === userId));
        return updatedStudents;
      });
      
      if (result.success) {
        // 成功メッセージを表示
        alert(`一時パスワードが発行されました。\n\nパスワード: ${result.data.tempPassword}`);
      } else {
        alert(`一時パスワード発行に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('一時パスワード発行エラー:', error);
      console.error('エラーの詳細:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // より詳細なエラーメッセージを表示
      let errorMessage = '一時パスワード発行に失敗しました';
      if (error.message) {
        errorMessage += `\n詳細: ${error.message}`;
      }
      alert(errorMessage);
    }
  };

  // 指導員データを取得する関数（APIから取得）
  const fetchAvailableInstructors = async () => {
    try {
      console.log('指導員データ取得開始...');
      const response = await fetch(`${API_BASE_URL}/api/users`);
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
        setInstructors(instructors);
      } else {
        console.error('APIレスポンスエラー:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('エラーレスポンス:', errorText);
      }
    } catch (error) {
      console.error('指導員データ取得エラー:', error);
    }
  };

  // 一時パスワード利用者を取得
  const fetchTempPasswordUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const result = await response.json();
        const users = result.data?.users || result;
        const tempPasswordUsers = users.filter(user => user.role === 1);
        setTempPasswordUsers(tempPasswordUsers);
      }
    } catch (error) {
      console.error('一時パスワード利用者取得エラー:', error);
    }
  };

  useEffect(() => {
    fetchAvailableInstructors();
    fetchTempPasswordUsers();
  }, []);

  return {
    issueTemporaryPassword,
    tempPasswordUsers,
    instructors,
    selectedInstructor,
    setSelectedInstructor,
    expiryTime,
    setExpiryTime,
    announcementTitle,
    setAnnouncementTitle,
    announcementMessage,
    setAnnouncementMessage,
    tempPasswordLoading,
    setTempPasswordLoading
  };
};

export default TempPasswordManager;
