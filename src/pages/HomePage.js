import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-indigo-600">Study Sphere</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/admin-instructor-login"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                管理者・指導員ログイン
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {/* ヒーローセクション */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold mb-6">
              次世代の学習管理システム
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              StudySphereは、企業の教育・研修を効率化し、<br />
              学習者の成長をサポートする包括的な学習管理プラットフォームです。
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/student-login"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
              >
                今すぐ始める
              </Link>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                主な特徴
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                StudySphereが提供する革新的な機能をご紹介します
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* 特徴1 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">📚</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                  包括的なカリキュラム管理
                </h4>
                <p className="text-gray-600">
                  企業のニーズに合わせたカスタマイズ可能なカリキュラムを提供。
                  学習進捗の追跡と効果測定により、確実なスキル向上を実現します。
                </p>
              </div>

              {/* 特徴2 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">👥</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                  多様なユーザー管理
                </h4>
                <p className="text-gray-600">
                  管理者、指導員、学習者それぞれの役割に応じた
                  適切な権限管理とダッシュボードを提供。
                  企業規模に応じた柔軟な運用が可能です。
                </p>
              </div>

              {/* 特徴3 */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                  詳細な分析・レポート
                </h4>
                <p className="text-gray-600">
                  学習効果の測定から個人・組織レベルの分析まで。
                  データに基づく意思決定をサポートし、
                  継続的な改善を促進します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能詳細セクション */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                主要機能
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                学習管理に必要な機能を網羅的に提供
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* 機能1 */}
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    学習進捗管理
                  </h4>
                  <p className="text-gray-600">
                    個別の学習進捗をリアルタイムで追跡。
                    達成度評価とフィードバックにより、
                    効果的な学習をサポートします。
                  </p>
                </div>
              </div>

              {/* 機能2 */}
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🏢</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    企業・拠点管理
                  </h4>
                  <p className="text-gray-600">
                    複数企業・拠点での運用に対応。
                    各拠点の特性に合わせた
                    柔軟な学習環境を構築できます。
                  </p>
                </div>
              </div>

              {/* 機能3 */}
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📈</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    効果測定・評価
                  </h4>
                  <p className="text-gray-600">
                    定期的な効果テストと評価により、
                    学習成果を客観的に測定。
                    継続的な改善を実現します。
                  </p>
                </div>
              </div>

              {/* 機能4 */}
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    セキュアな認証
                  </h4>
                  <p className="text-gray-600">
                    多段階認証と権限管理により、
                    企業データの安全性を確保。
                    安心して学習管理を行えます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl font-bold mb-6">
              今すぐStudySphereを始めましょう
            </h3>
            <p className="text-xl mb-8">
              企業の教育・研修を次のレベルへ引き上げる
              StudySphereの導入をお待ちしています。
            </p>
            <Link
              to="/admin-instructor-login"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-block"
            >
              管理者・指導員ログイン
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">Study Sphere</h4>
            <p className="text-gray-400 mb-6">
              次世代の学習管理システム
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © 2024 Study Sphere. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
