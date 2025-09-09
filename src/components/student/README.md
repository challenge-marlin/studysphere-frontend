# 利用者向けレッスン一覧機能

## 概要

利用者ダッシュボードのレッスン一覧をモックデータからDB連携に変更し、適度にコンポーネントを細分化しました。

## 実装内容

### 1. バックエンド実装

#### APIエンドポイント
- `GET /api/student/courses` - 利用者のコース一覧取得
- `GET /api/student/lessons` - 利用者のレッスン一覧取得
- `GET /api/student/lessons/:lessonId/progress` - レッスン進捗取得
- `PUT /api/student/lessons/:lessonId/progress` - レッスン進捗更新
- `GET /api/student/dashboard` - ダッシュボード情報取得

#### データベース
- `user_lesson_progress`テーブルを新規作成
  - 利用者とレッスンの進捗状況を管理
  - テストスコア、課題提出状況も記録

#### ファイル構成
```
studysphere-backend/
├── routes/studentRoutes.js          # 利用者向けAPIルート
├── scripts/studentController.js     # 利用者向けコントローラー
├── scripts/createUserLessonProgressTable.js  # テーブル作成スクリプト
└── tools/createTestStudentData.js # テストデータ作成スクリプト
```

### 2. フロントエンド実装

#### コンポーネント構成
```
studysphere-frontend/src/
├── components/student/
│   ├── CourseHeader.js      # コースヘッダー
│   ├── CourseSelector.js    # コース選択
│   └── LessonTable.js       # レッスン一覧テーブル
├── utils/studentApi.js      # 利用者向けAPIユーティリティ
└── pages/LessonList.js      # メインのレッスン一覧ページ
```

#### 主な機能
- 利用者が受講しているコースの一覧表示
- コース別のレッスン一覧表示
- レッスンの進捗状況表示（未開始/進行中/完了）
- テストスコア表示
- 課題提出状況表示
- 学習画面への遷移

## セットアップ手順

### 1. データベーステーブル作成

```bash
# バックエンドディレクトリで実行
cd studysphere-backend
create-user-lesson-progress-table.bat
```

### 2. テストデータ作成（オプション）

```bash
# バックエンドディレクトリで実行
cd studysphere-backend/backend
node tools/createTestStudentData.js
```

### 3. バックエンド起動

```bash
cd studysphere-backend
npm start
```

### 4. フロントエンド起動

```bash
cd studysphere-frontend
npm start
```

## 使用方法

1. 利用者としてログイン
2. ダッシュボードで「レッスン一覧」タブをクリック
3. コースを選択してレッスン一覧を表示
4. 各レッスンの学習ボタンをクリックして学習開始

## 技術仕様

### データベーススキーマ

```sql
CREATE TABLE `user_lesson_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `status` ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  `completed_at` DATETIME DEFAULT NULL,
  `test_score` INT DEFAULT NULL,
  `assignment_submitted` BOOLEAN NOT NULL DEFAULT FALSE,
  `assignment_submitted_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_lesson` (`user_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user_accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
);
```

### API仕様

#### レスポンス形式
```json
{
  "success": true,
  "data": [...],
  "message": "操作が成功しました"
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "error": "詳細エラー情報"
}
```

## 今後の拡張予定

- レッスン進捗の自動更新機能
- テスト結果の詳細表示
- 課題提出機能の実装
- 学習履歴の詳細表示
- 進捗レポート機能
