# 事業所タイプ管理 API 仕様書

## 概要

事業所タイプの管理を行う API エンドポイントです。事業所の種類（就労移行支援事務所、就労継続支援 A 型事務所など）の CRUD 操作を提供します。

## ベース URL

```
http://localhost:5000
```

## エンドポイント一覧

### 1. 事業所タイプ一覧取得

**GET** `/office-types`

事業所タイプの一覧を取得します。

#### レスポンス

```json
[
  {
    "id": 1,
    "type": "就労移行支援事務所",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "type": "就労継続支援A型事務所",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. 事業所タイプ詳細取得

**GET** `/office-types/:id`

指定された ID の事業所タイプ情報を取得します。

#### パラメータ

- `id` (number): 事業所タイプ ID

#### レスポンス

```json
{
  "id": 1,
  "type": "就労移行支援事務所",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### エラーレスポンス

```json
{
  "message": "事業所タイプが見つかりません"
}
```

### 3. 事業所タイプ作成

**POST** `/office-types`

新しい事業所タイプを作成します。

#### リクエストボディ

```json
{
  "type": "新規事業所タイプ"
}
```

#### バリデーションルール

- `type`: 必須、1-100 文字

#### レスポンス

```json
{
  "success": true,
  "message": "事業所タイプが正常に作成されました",
  "data": {
    "id": 10,
    "type": "新規事業所タイプ",
    "created_at": "2024-12-01T00:00:00.000Z"
  }
}
```

### 4. 事業所タイプ更新

**PUT** `/office-types/:id`

指定された ID の事業所タイプ情報を更新します。

#### パラメータ

- `id` (number): 事業所タイプ ID

#### リクエストボディ

```json
{
  "type": "更新された事業所タイプ"
}
```

#### バリデーションルール

- `type`: 必須、1-100 文字

#### レスポンス

```json
{
  "success": true,
  "message": "事業所タイプが正常に更新されました",
  "data": {
    "id": 1,
    "type": "更新された事業所タイプ",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. 事業所タイプ削除

**DELETE** `/office-types/:id`

指定された ID の事業所タイプを削除します。

#### パラメータ

- `id` (number): 事業所タイプ ID

#### レスポンス

```json
{
  "success": true,
  "message": "事業所タイプが正常に削除されました"
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "message": "この事業所タイプを使用している企業が存在するため削除できません"
}
```

## エラーレスポンス

### バリデーションエラー

```json
{
  "success": false,
  "message": "入力データにエラーがあります",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "事業所タイプ名は1文字以上100文字以下で入力してください",
      "path": "type",
      "location": "body"
    }
  ]
}
```

### サーバーエラー

```json
{
  "success": false,
  "message": "事業所タイプの取得に失敗しました",
  "error": "データベース接続エラー"
}
```

## データベーススキーマ

### office_types テーブル

```sql
CREATE TABLE `office_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '事業所タイプID',
    `type` VARCHAR(100) NOT NULL COMMENT '事業所タイプ名',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    UNIQUE KEY `unique_type` (`type`)
) COMMENT = '事業所タイプテーブル';
```

## サンプルデータ

```sql
INSERT INTO `office_types` (`id`, `type`) VALUES
(1, '就労移行支援事務所'),
(2, '就労継続支援A型事務所'),
(3, '就労継続支援B型事務所'),
(4, '生活介護事務所'),
(5, '自立訓練事務所'),
(6, '就労定着支援事務所'),
(7, '地域活動支援センター'),
(8, '福祉ホーム'),
(9, 'その他');
```

## フロントエンド実装

### React コンポーネント

```javascript
// 事業所タイプ取得
const fetchOfficeTypes = async () => {
  try {
    const response = await fetch('http://localhost:5000/office-types');
    if (!response.ok) {
      throw new Error('事業所タイプの取得に失敗しました');
    }
    const data = await response.json();
    setFacilityTypesData(data);
    setFacilityTypes(data.map(item => item.type));
  } catch (err) {
    console.error('事業所タイプ取得エラー:', err);
    setError(err.message);
  }
};

// 事業所タイプ追加
const addOfficeType = async (typeName) => {
  try {
    const response = await fetch('http://localhost:5000/office-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: typeName })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '事業所タイプの追加に失敗しました');
    }

    // 成功時は一覧を再取得
    await fetchOfficeTypes();
    return { success: true, message: result.message };
  } catch (err) {
    console.error('事業所タイプ追加エラー:', err);
    return { success: false, message: err.message };
  }
};

// 事業所タイプ削除
const deleteOfficeType = async (typeName) => {
  try {
    const typeData = facilityTypesData.find(item => item.type === typeName);
    if (!typeData) {
      throw new Error('削除対象の事業所タイプが見つかりません');
    }

    const response = await fetch(`http://localhost:5000/office-types/${typeData.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '事業所タイプの削除に失敗しました');
    }

    // 成功時は一覧を再取得
    await fetchOfficeTypes();
    return { success: true, message: result.message };
  } catch (err) {
    console.error('事業所タイプ削除エラー:', err);
    return { success: false, message: err.message };
  }
};
```

## 注意事項

1. **一意性制約**: 事業所タイプ名は重複できません
2. **削除制限**: 事業所タイプを使用している企業が存在する場合は削除できません
3. **外部キー制約**: 企業情報テーブル（companies）から参照されています
4. **デフォルトデータ**: システム初期化時に 9 種類の事業所タイプが自動的に作成されます
5. **即座のリフレッシュ**: 追加・削除操作後は自動的に一覧が更新されます

## ステータスコード

- `200`: 成功
- `201`: 作成成功
- `400`: バリデーションエラー
- `404`: リソースが見つかりません
- `500`: サーバーエラー

## セキュリティ

- CORS設定により、指定されたオリジンのみアクセス可能
- 入力値のサニタイゼーション
- SQLインジェクション対策（プリペアドステートメント使用）

## 更新履歴

- 2024-12-01: 初版作成
- 2024-12-01: フロントエンド実装例を追加
- 2024-12-01: 即座のリフレッシュ機能を追加 