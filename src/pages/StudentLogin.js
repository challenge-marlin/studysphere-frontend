import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // モック学生データ
    const studentTokens = {
      'token123': { 
        id: 'student001', 
        name: '鈴木太郎', 
        instructorId: 'instructor001',
        instructorName: '佐藤指導員'
      },
      'token456': { 
        id: 'student002', 
        name: '田中花子', 
        instructorId: 'instructor001',
        instructorName: '佐藤指導員'
      },
      'token789': { 
        id: 'student003', 
        name: '山田次郎', 
        instructorId: 'instructor002',
        instructorName: '田中指導員'
      },
      'token101': { 
        id: 'student004', 
        name: '佐藤美咲', 
        instructorId: 'instructor003',
        instructorName: '鈴木指導員'
      }
    };

    // トークンの検証（モック）
    setTimeout(() => {
      const studentData = studentTokens[token];
      
      if (studentData) {
        // 学生情報をlocalStorageに保存
        const studentUser = {
          ...studentData,
          role: 'student',
          loginToken: token
        };
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
        
        // 学生ダッシュボードにリダイレクト
        navigate('/student/dashboard');
      } else {
        setError('無効なログインURLです。指導員に正しいURLを確認してください。');
        setIsValidating(false);
      }
    }, 1500); // ローディング体験のため
  }, [token, navigate]);

  const sampleStudentLinks = [
    { url: `${process.env.PUBLIC_URL}/student/login/token123`, label: '生徒1: token123' },
    { url: `${process.env.PUBLIC_URL}/student/login/token456`, label: '生徒2: token456' },
    { url: `${process.env.PUBLIC_URL}/student/login/token789`, label: '生徒3: token789' },
    { url: `${process.env.PUBLIC_URL}/student/login/token101`, label: '生徒4: token101' },
  ];

  const SampleStudentLinks = () => (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">サンプル生徒ログインURL</h3>
      <ul className="space-y-1">
        {sampleStudentLinks.map(link => (
          <li key={link.url}>
            <a 
              href={link.url}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {link.label} ({link.url})
            </a>
          </li>
        ))}
      </ul>
      <div className="text-sm text-gray-600 mt-2">
        ※上記URLをクリックすると該当生徒としてログインできます（モック動作）
      </div>
    </div>
  );

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">ログイン中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ログインエラー</h2>
            <p className="text-gray-700 text-lg mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-0.5"
            >
              ログイン画面に戻る
            </button>
          </div>
          <SampleStudentLinks />
        </div>
      </div>
    );
  }

  // ログイン成功時は即リダイレクトされるため何も表示しない
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center p-5">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <SampleStudentLinks />
      </div>
    </div>
  );
};

export default StudentLogin; 