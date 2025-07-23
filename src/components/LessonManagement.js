import React, { useState } from 'react';

const LessonManagement = () => {
  // カリキュラム全体像に基づいたコースとレッスンデータ
  const [courses, setCourses] = useState([
    {
      id: 'course001',
      title: 'オフィスソフトの操作・文書作成',
      category: '選択科目',
      duration: '3ヶ月',
      totalLessons: 6,
      lessons: [
        {
          id: 'lesson001-1',
          title: 'Microsoft Wordの特徴と文書作成',
          description: '基本操作、文書の作成、保存方法。フォーマット設定、スタイルの適用、図形や画像の挿入',
          duration: '120分',
          order: 1,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson001-2',
          title: 'Microsoft Excelの特徴と表計算',
          description: '基本操作、セルの入力、データの整形、数式の使用、基本的な関数の紹介',
          duration: '120分',
          order: 2,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson001-3',
          title: 'Microsoft Excelを使用したデータ分析',
          description: '基本操作、セルの入力、データの整形、数式の使用、基本的な関数の紹介',
          duration: '120分',
          order: 3,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson001-4',
          title: 'Microsoft PowerPointでのプレゼンテーション作成',
          description: 'スライドの構成、デザインの基本、アニメーションやトランジションの追加',
          duration: '120分',
          order: 4,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson001-5',
          title: 'Wordでのレポート作成',
          description: '文書の構成（見出し、段落、リスト）、実践課題: 簡単なレポートを作成',
          duration: '120分',
          order: 5,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson001-6',
          title: '実務での活用方法と応用技術',
          description: '各ソフトの実務での具体的な活用事例の紹介、効率的な作業方法やショートカットキーの紹介',
          duration: '120分',
          order: 6,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        }
      ]
    },
    {
      id: 'course002',
      title: 'ITリテラシー・AIの基本',
      category: '必修科目',
      duration: '3ヶ月',
      totalLessons: 6,
      lessons: [
        {
          id: 'lesson002-1',
          title: 'Windows11の基本操作',
          description: 'ファイル操作、ショートカットキーの利用、ソフトウェアの使用方法（ブラウザ、Word、Excelの簡単操作）',
          duration: '120分',
          order: 1,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson002-2',
          title: 'インターネットの基礎',
          description: 'インターネットの仕組みと安全な利用（セキュリティ、パスワード管理）、情報検索と信頼性の高い情報の見分け方',
          duration: '120分',
          order: 2,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson002-3',
          title: 'AIの基本概念',
          description: 'AIの基本概念（AIとは何か、利用されている分野）',
          duration: '120分',
          order: 3,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson002-4',
          title: 'AIの活用例',
          description: 'AIの活用例（日常での利用例、Google検索や翻訳ツールの仕組み）、AIツールの体験',
          duration: '120分',
          order: 4,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson002-5',
          title: 'プログラミングの基本',
          description: 'プログラミングの基本、ChatGPTなどのAIアシスタントの活用',
          duration: '120分',
          order: 5,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson002-6',
          title: 'AIを使用した簡単なLP作成',
          description: 'AIを使用した簡単なLP作成、チャットボットの仕組みと作成',
          duration: '120分',
          order: 6,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        }
      ]
    },
    {
      id: 'course003',
      title: 'SNS運用の基礎・画像生成編集',
      category: '必修科目',
      duration: '6ヶ月',
      totalLessons: 12,
      lessons: [
        {
          id: 'lesson003-1',
          title: 'SNSマーケティングの重要性と基本概念',
          description: '各SNSプラットフォームの特徴とユーザー層の理解',
          duration: '120分',
          order: 1,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-2',
          title: 'デザインが持つ影響力とコミュニケーションの重要性',
          description: '基本原則（バランス、コントラスト、近接、整列）',
          duration: '120分',
          order: 2,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-3',
          title: 'グラフィックデザイン、UI/UXデザイン、ブランディングデザイン',
          description: '各デザインの目的と適用シーン',
          duration: '120分',
          order: 3,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-4',
          title: '画像編集ツールの基礎（Canva）',
          description: 'Canvaのインターフェースと基本機能、テンプレートを利用したデザイン作成、実践演習: SNS投稿用の画像作成',
          duration: '120分',
          order: 4,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-5',
          title: '画像編集ツールの基礎（Recraft）',
          description: 'Recraftの基本操作と機能、画像の加工・編集方法、実践演習: 簡単なデザインの作成',
          duration: '120分',
          order: 5,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-6',
          title: 'AI画像生成ツールの活用',
          description: 'AI画像生成の基本概念、MidjourneyやDALL-Eの使用方法、プロンプトエンジニアリングの基礎',
          duration: '120分',
          order: 6,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-7',
          title: 'SNS投稿の作成と運用',
          description: '各プラットフォーム向けの投稿作成、ハッシュタグの活用、投稿スケジュールの管理',
          duration: '120分',
          order: 7,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-8',
          title: 'SNS分析と改善',
          description: 'SNS分析ツールの使用方法、エンゲージメント率の向上、フォロワー増加の戦略',
          duration: '120分',
          order: 8,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-9',
          title: 'ブランドアイデンティティの構築',
          description: 'ブランドカラーの選定、ロゴデザイン、一貫性のあるビジュアルアイデンティティの作成',
          duration: '120分',
          order: 9,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-10',
          title: 'コンテンツカレンダーの作成',
          description: '月間コンテンツ計画の立て方、テーマ設定、効率的なコンテンツ制作のワークフロー',
          duration: '120分',
          order: 10,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-11',
          title: '実践プロジェクト: SNSキャンペーン',
          description: '架空のブランドを使用したSNSキャンペーンの企画・実行、成果測定と改善',
          duration: '120分',
          order: 11,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson003-12',
          title: 'SNS運用の最新トレンド',
          description: '最新のSNS機能、アルゴリズムの変化、効果的なコンテンツ戦略の最新動向',
          duration: '120分',
          order: 12,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        }
      ]
    },
    {
      id: 'course004',
      title: 'LP制作(HTML・CSS)',
      category: '必修科目',
      duration: '3ヶ月',
      totalLessons: 12,
      lessons: [
        {
          id: 'lesson004-1',
          title: 'HTMLの基礎',
          description: 'HTMLの基本構造、タグの種類と使用方法、セマンティックHTMLの重要性',
          duration: '120分',
          order: 1,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-2',
          title: 'CSSの基礎',
          description: 'CSSの基本概念、セレクタ、プロパティ、値の設定方法',
          duration: '120分',
          order: 2,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-3',
          title: 'レイアウトとボックスモデル',
          description: 'CSSボックスモデル、margin、padding、borderの理解、レイアウトの基本',
          duration: '120分',
          order: 3,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-4',
          title: 'Flexboxレイアウト',
          description: 'Flexboxの基本概念、flex-direction、justify-content、align-itemsの使用方法',
          duration: '120分',
          order: 4,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-5',
          title: 'Gridレイアウト',
          description: 'CSS Gridの基本概念、grid-template-columns、grid-template-rowsの設定',
          duration: '120分',
          order: 5,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-6',
          title: 'レスポンシブデザイン',
          description: 'メディアクエリの使用方法、モバイルファーストデザイン、ブレークポイントの設定',
          duration: '120分',
          order: 6,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-7',
          title: 'LPの基本構造',
          description: 'ランディングページの構成要素、ヘッダー、メインコンテンツ、フッターの設計',
          duration: '120分',
          order: 7,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-8',
          title: 'ヒーローセクションの作成',
          description: 'インパクトのあるヒーローセクションのデザイン、CTAボタンの配置、視覚的階層の構築',
          duration: '120分',
          order: 8,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-9',
          title: 'コンテンツセクションの作成',
          description: '商品・サービスの説明セクション、特徴の紹介、信頼性の構築要素',
          duration: '120分',
          order: 9,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-10',
          title: 'フォームとCTAの実装',
          description: 'お問い合わせフォームの作成、CTAボタンのデザイン、コンバージョン率の向上',
          duration: '120分',
          order: 10,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-11',
          title: '実践プロジェクト: シンプルLP',
          description: '実際の商品・サービスを想定したランディングページの制作、HTML・CSSの実装',
          duration: '120分',
          order: 11,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson004-12',
          title: 'LPの最適化と改善',
          description: 'ページ速度の最適化、SEO対策、A/Bテストの実施、コンバージョン率の向上',
          duration: '120分',
          order: 12,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        }
      ]
    },
    {
      id: 'course005',
      title: 'SNS管理代行・LP制作案件対応',
      category: '必修科目',
      duration: '3ヶ月',
      totalLessons: 12,
      lessons: [
        {
          id: 'lesson005-1',
          title: 'クライアント対応の基礎',
          description: 'クライアントとのコミュニケーション方法、要件の聞き取り、提案書の作成',
          duration: '120分',
          order: 1,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-2',
          title: 'プロジェクト管理の基礎',
          description: 'プロジェクトの計画、スケジュール管理、タスクの分割と進捗管理',
          duration: '120分',
          order: 2,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-3',
          title: 'SNS管理代行の実務',
          description: 'SNSアカウントの引き継ぎ、投稿内容の確認、緊急時の対応方法',
          duration: '120分',
          order: 3,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-4',
          title: 'LP制作案件の受注',
          description: 'LP制作の見積もり、スケジュール調整、クライアントとの合意形成',
          duration: '120分',
          order: 4,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-5',
          title: 'デザイン提案と承認',
          description: 'デザイン案の作成、クライアントへの提案、フィードバックの反映',
          duration: '120分',
          order: 5,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-6',
          title: '実装とテスト',
          description: 'HTML・CSSでの実装、クロスブラウザテスト、レスポンシブ対応の確認',
          duration: '120分',
          order: 6,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-7',
          title: '納品と運用サポート',
          description: '納品物の準備、運用マニュアルの作成、アフターサポートの提供',
          duration: '120分',
          order: 7,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-8',
          title: 'トラブル対応',
          description: 'よくある問題と解決方法、クライアントからのクレーム対応、緊急時の対応',
          duration: '120分',
          order: 8,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-9',
          title: '継続的な改善',
          description: 'パフォーマンス分析、改善提案、長期的な関係構築',
          duration: '120分',
          order: 9,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-10',
          title: '実践プロジェクト: 総合案件',
          description: 'SNS管理代行とLP制作を組み合わせた総合案件の実践、全体の流れの体験',
          duration: '120分',
          order: 10,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-11',
          title: '独立・起業の準備',
          description: 'フリーランスとしての独立準備、契約書の作成、税務処理の基礎',
          duration: '120分',
          order: 11,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        },
        {
          id: 'lesson005-12',
          title: 'キャリアプランニング',
          description: '今後のキャリア設計、スキルアップの方向性、業界の最新動向',
          duration: '120分',
          order: 12,
          pdfFile: null,
          videoFile: null,
          videoSegments: []
        }
      ]
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showVideoSegmentModal, setShowVideoSegmentModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // ソート機能を追加
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedLessons = () => {
    const filtered = courses
      .filter(course => !selectedCourse || course.id === selectedCourse.id)
      .flatMap(course => course.lessons)
      .map(lesson => ({
        ...lesson,
        courseName: courses.find(c => c.id === lesson.courseId)?.title || '不明',
        status: 'active', // デフォルトでは公開中とする
        createdAt: '2023-10-27' // ダミーデータ
      }));

    return [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'status') {
        aValue = aValue === '公開中' ? 1 : 0; // 公開中を優先
        bValue = bValue === '公開中' ? 1 : 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // レッスン編集処理
  const handleEditLesson = (courseId, lessonId) => {
    const course = courses.find(c => c.id === courseId);
    const lesson = course?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson({ ...lesson, courseId });
      setShowLessonModal(true);
    }
  };

  // レッスン更新処理
  const handleUpdateLesson = (updatedLesson) => {
    const updatedCourses = courses.map(course => {
      if (course.id === updatedLesson.courseId) {
        return {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === updatedLesson.id ? updatedLesson : lesson
          )
        };
      }
      return course;
    });
    setCourses(updatedCourses);
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  // 動画セグメント管理処理
  const handleManageVideoSegments = (courseId, lessonId) => {
    const course = courses.find(c => c.id === courseId);
    const lesson = course?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson({ ...lesson, courseId });
      setShowVideoSegmentModal(true);
    }
  };

  // 動画セグメント更新処理
  const handleUpdateVideoSegments = (segments) => {
    const updatedCourses = courses.map(course => {
      if (course.id === selectedLesson.courseId) {
        return {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === selectedLesson.id 
              ? { ...lesson, videoSegments: segments }
              : lesson
          )
        };
      }
      return course;
    });
    setCourses(updatedCourses);
    setShowVideoSegmentModal(false);
    setSelectedLesson(null);
  };

  // レッスンの公開/非公開状態を切り替える関数
  const toggleLessonStatus = (lessonId) => {
    const updatedCourses = courses.map(course => ({
      ...course,
      lessons: course.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, status: lesson.status === 'active' ? 'inactive' : 'active' } : lesson
      )
    }));
    setCourses(updatedCourses);
  };

  return (
    <div className="p-6 max-w-full w-full mx-auto">
      <div className="mb-4">
        <label className="font-semibold text-gray-700 mr-4">コースを選択:</label>
        <select 
          onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value) || null)}
          value={selectedCourse?.id || ''}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300 min-w-[300px]"
        >
          <option value="">全てのコース</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title} ({course.totalLessons}レッスン)
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">
          {selectedCourse ? selectedCourse.title : '全てのコース'}
        </h1>
        {selectedCourse && (
          <p className="text-gray-600 mt-2">{selectedCourse.description || ''}</p>
        )}
      </div>

      {/* レッスン一覧テーブル */}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto p-6 mb-8 w-full">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200" onClick={() => handleSort('title')}>
                📖 レッスン名{sortConfig.key === 'title' && (<span className="ml-1">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200" onClick={() => handleSort('order')}>
                🔢 順序{sortConfig.key === 'order' && (<span className="ml-1">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200" onClick={() => handleSort('duration')}>
                ⏱️ 所要時間{sortConfig.key === 'duration' && (<span className="ml-1">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200" onClick={() => handleSort('videoSegments')}>
                🎬 動画セグメント{sortConfig.key === 'videoSegments' && (<span className="ml-1">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800 cursor-pointer hover:bg-red-100 transition-colors duration-200" onClick={() => handleSort('status')}>
                📊 ステータス{sortConfig.key === 'status' && (<span className="ml-1">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>)}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">📅 作成日</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">⚙️ 操作</th>
            </tr>
          </thead>
          <tbody>
            {getSortedLessons().map(lesson => (
              <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <strong className="text-gray-800">{lesson.title}</strong>
                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{lesson.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{lesson.order}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700 font-medium">{lesson.duration.toString().endsWith('分') ? lesson.duration : lesson.duration + '分'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-800">{lesson.videoSegments ? lesson.videoSegments.length : 0}セグメント</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lesson.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{lesson.status === 'active' ? '公開中' : '非公開'}</span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">📅 {lesson.createdAt}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-blue-600" onClick={() => handleEditLesson(lesson.courseId, lesson.id)} title="編集">✏️ 編集</button>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-300 hover:bg-green-600" onClick={() => handleManageVideoSegments(lesson.courseId, lesson.id)} title="動画セグメント管理">🎬 動画管理</button>
                    <button className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 ${lesson.status === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`} onClick={() => toggleLessonStatus(lesson.id)} title={lesson.status === 'active' ? '非公開にする' : '公開する'}>{lesson.status === 'active' ? '🚫 非公開' : '✅ 公開'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {getSortedLessons().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">条件に合致するレッスンが見つかりません。</p>
          </div>
        )}
      </div>

      {showLessonModal && selectedLesson && (
        <LessonEditModal
          lesson={selectedLesson}
          onUpdate={handleUpdateLesson}
          onClose={() => setShowLessonModal(false)}
        />
      )}

      {showVideoSegmentModal && selectedLesson && (
        <VideoSegmentModal
          lesson={selectedLesson}
          onUpdate={handleUpdateVideoSegments}
          onClose={() => setShowVideoSegmentModal(false)}
        />
      )}
    </div>
  );
};

// レッスン編集モーダルコンポーネント
const LessonEditModal = ({ lesson, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    pdfFile: lesson.pdfFile,
    videoFile: lesson.videoFile
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        [fileType]: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...lesson,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">レッスン編集: {lesson.title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">レッスンタイトル</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">所要時間</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              placeholder="例: 120分"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PDFファイル</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'pdfFile')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
              {formData.pdfFile && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>アップロード済み:</strong> {formData.pdfFile.name}
                  </p>
                  <p className="text-green-600 text-xs">
                    サイズ: {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">動画ファイル</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'videoFile')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
              />
              {formData.videoFile && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>アップロード済み:</strong> {formData.videoFile.name}
                  </p>
                  <p className="text-green-600 text-xs">
                    サイズ: {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
            >
              保存
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-600"
              onClick={onClose}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 動画セグメント管理モーダルコンポーネント
const VideoSegmentModal = ({ lesson, onUpdate, onClose }) => {
  const [segments, setSegments] = useState(lesson.videoSegments || []);
  const [newSegment, setNewSegment] = useState({
    id: '',
    title: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const handleAddSegment = () => {
    if (newSegment.title && newSegment.startTime && newSegment.endTime) {
      const segment = {
        ...newSegment,
        id: `segment-${Date.now()}`
      };
      setSegments([...segments, segment]);
      setNewSegment({
        id: '',
        title: '',
        startTime: '',
        endTime: '',
        description: ''
      });
    }
  };

  const handleRemoveSegment = (segmentId) => {
    setSegments(segments.filter(seg => seg.id !== segmentId));
  };

  const handleSave = () => {
    onUpdate(segments);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">動画セグメント管理: {lesson.title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">セグメント情報</h4>
            <p className="text-blue-700 text-sm">
              動画を時間区切りで分割し、各セグメントにタイトルと説明を設定できます。
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-4">新しいセグメントを追加</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={newSegment.title}
                  onChange={(e) => setNewSegment({...newSegment, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始時間 (HH:MM:SS)</label>
                <input
                  type="text"
                  value={newSegment.startTime}
                  onChange={(e) => setNewSegment({...newSegment, startTime: e.target.value})}
                  placeholder="00:00:00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了時間 (HH:MM:SS)</label>
                <input
                  type="text"
                  value={newSegment.endTime}
                  onChange={(e) => setNewSegment({...newSegment, endTime: e.target.value})}
                  placeholder="00:00:00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <input
                  type="text"
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({...newSegment, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-colors duration-300"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddSegment}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300 hover:bg-indigo-600"
            >
              セグメントを追加
            </button>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">セグメント一覧</h4>
            {segments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">セグメントが設定されていません。</p>
                <p className="text-gray-400 text-sm">上記のフォームからセグメントを追加してください。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-800">{segment.title}</h5>
                      <button
                        onClick={() => handleRemoveSegment(segment.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">時間:</span> {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                    </div>
                    {segment.description && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">説明:</span> {segment.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-green-600"
            >
              保存
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-gray-600"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonManagement; 