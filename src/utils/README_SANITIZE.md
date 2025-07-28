# サニタイズ機能 ドキュメント

## 概要

このプロジェクトでは、XSS攻撃を防ぐための包括的なサニタイズ機能を提供しています。入力フィールドに事前サニタイズを適用することで、セキュリティを向上させることができます。

## 機能一覧

### 1. サニタイズユーティリティ (`sanitizeUtils.js`)

#### 主要関数

- `sanitizeInput(input)` - 完全なサニタイズ処理（推奨）
- `sanitizeInputLight(input)` - 軽量サニタイズ（HTMLタグ除去のみ）
- `removeHtmlTags(input)` - HTMLタグ除去
- `removeScripts(input)` - スクリプトとイベントハンドラー除去
- `escapeHtml(input)` - HTMLエンティティエスケープ
- `sanitizeNumber(input)` - 数値入力専用サニタイズ
- `sanitizeEmail(input)` - メールアドレス専用サニタイズ
- `sanitizeUrl(input)` - URL専用サニタイズ

#### サニタイズモード

```javascript
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

SANITIZE_OPTIONS.FULL      // 完全サニタイズ（推奨）
SANITIZE_OPTIONS.LIGHT     // 軽量サニタイズ
SANITIZE_OPTIONS.HTML_ONLY // HTMLタグ除去のみ
SANITIZE_OPTIONS.NONE      // サニタイズなし
```

### 2. サニタイズ機能付きコンポーネント

#### SanitizedInput

通常のinput要素にサニタイズ機能を追加したコンポーネントです。

```javascript
import SanitizedInput from '../components/SanitizedInput';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

<SanitizedInput
  type="text"
  value={value}
  onChange={handleChange}
  sanitizeMode={SANITIZE_OPTIONS.FULL}
  debounceMs={300}
  className="your-css-class"
  placeholder="プレースホルダー"
  required
/>
```

#### SanitizedTextarea

通常のtextarea要素にサニタイズ機能を追加したコンポーネントです。

```javascript
import SanitizedTextarea from '../components/SanitizedTextarea';

<SanitizedTextarea
  value={value}
  onChange={handleChange}
  sanitizeMode={SANITIZE_OPTIONS.FULL}
  debounceMs={300}
  rows={4}
  className="your-css-class"
  placeholder="プレースホルダー"
/>
```

## 使用例

### 基本的な使用例

```javascript
import React, { useState } from 'react';
import SanitizedInput from '../components/SanitizedInput';
import SanitizedTextarea from '../components/SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../utils/sanitizeUtils';

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form>
      <SanitizedInput
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="お名前"
        sanitizeMode={SANITIZE_OPTIONS.FULL}
        className="w-full px-3 py-2 border rounded"
      />
      
      <SanitizedTextarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="メッセージ"
        sanitizeMode={SANITIZE_OPTIONS.FULL}
        className="w-full px-3 py-2 border rounded"
        rows={4}
      />
    </form>
  );
};
```

### 既存のinput/textareaを置き換える例

#### 置き換え前
```javascript
<input
  type="text"
  value={credentials.id}
  onChange={handleInputChange}
  required
  placeholder="ユーザーIDを入力"
  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg"
/>
```

#### 置き換え後
```javascript
<SanitizedInput
  type="text"
  value={credentials.id}
  onChange={handleInputChange}
  required
  placeholder="ユーザーIDを入力"
  sanitizeMode={SANITIZE_OPTIONS.FULL}
  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg"
/>
```

## プロパティ

### SanitizedInput / SanitizedTextarea 共通プロパティ

| プロパティ | 型 | デフォルト | 説明 |
|-----------|----|-----------|------|
| `sanitizeMode` | string | `SANITIZE_OPTIONS.FULL` | サニタイズモード |
| `debounceMs` | number | `300` | デバウンス時間（ミリ秒） |
| `value` | string | `''` | 入力値 |
| `onChange` | function | - | 値変更時のコールバック |
| `onBlur` | function | - | フォーカスアウト時のコールバック |
| `className` | string | `''` | CSSクラス名 |
| `placeholder` | string | `''` | プレースホルダーテキスト |
| `required` | boolean | `false` | 必須入力かどうか |
| `disabled` | boolean | `false` | 無効化されているかどうか |
| `id` | string | - | 要素のID |
| `name` | string | - | 要素の名前 |

### SanitizedInput 固有プロパティ

| プロパティ | 型 | デフォルト | 説明 |
|-----------|----|-----------|------|
| `type` | string | `'text'` | input要素のtype属性 |
| `maxLength` | number | - | 最大文字数 |
| `minLength` | number | - | 最小文字数 |
| `pattern` | string | - | 入力パターン |
| `autoComplete` | string | - | 自動補完設定 |
| `autoFocus` | boolean | `false` | 自動フォーカス |

### SanitizedTextarea 固有プロパティ

| プロパティ | 型 | デフォルト | 説明 |
|-----------|----|-----------|------|
| `rows` | number | `3` | 行数 |
| `cols` | number | - | 列数 |
| `resize` | string | `'vertical'` | リサイズ設定 |

## セキュリティ機能

### 1. XSS攻撃対策

- HTMLタグの除去
- スクリプトタグの除去
- イベントハンドラーの除去
- 危険なプロトコルの除去

### 2. 入力値の正規化

- 連続する空白の正規化
- 前後の空白の除去
- 特殊文字のエスケープ

### 3. リアルタイムサニタイズ

- 入力中のリアルタイムサニタイズ
- デバウンス機能によるパフォーマンス最適化
- フォーカスアウト時の最終サニタイズ

## パフォーマンス考慮事項

### 1. デバウンス設定

大量の入力がある場合は、`debounceMs`を調整してください：

```javascript
// 高速入力が必要な場合
<SanitizedInput debounceMs={100} />

// パフォーマンス重視の場合
<SanitizedInput debounceMs={500} />
```

### 2. サニタイズモードの選択

用途に応じて適切なモードを選択してください：

```javascript
// セキュリティ重視（推奨）
sanitizeMode={SANITIZE_OPTIONS.FULL}

// パフォーマンス重視
sanitizeMode={SANITIZE_OPTIONS.LIGHT}

// HTMLタグのみ除去
sanitizeMode={SANITIZE_OPTIONS.HTML_ONLY}
```

## トラブルシューティング

### 1. 入力が遅い場合

- `debounceMs`の値を増やしてください
- `sanitizeMode`を`LIGHT`に変更してください

### 2. サニタイズが効かない場合

- `sanitizeMode`が`NONE`になっていないか確認してください
- コンポーネントが正しくインポートされているか確認してください

### 3. スタイルが適用されない場合

- `className`プロパティが正しく設定されているか確認してください
- Tailwind CSSクラスが正しく記述されているか確認してください

## テスト

サニタイズ機能のテストは `SanitizeExample` コンポーネントを使用してください：

```javascript
import SanitizeExample from '../components/SanitizeExample';

// テストページで使用
<SanitizeExample />
```

このコンポーネントでは、以下の危険なコードをテストできます：

- `<script>alert('XSS')</script>`
- `<img src=x onerror=alert('XSS')>`
- `javascript:alert('危険')`
- `<div onclick="alert('XSS')">クリック</div>` 