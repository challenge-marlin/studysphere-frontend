# Student Management Components

このディレクトリには、利用者管理機能を分割したコンポーネントが含まれています。

## 📁 コンポーネント構成

### 1. TempPasswordManager.js
**一時パスワード管理機能**

#### 機能
- 一時パスワードの発行・再発行
- 指導員データの取得
- 一時パスワード利用者の管理

#### 使用方法
```javascript
import TempPasswordManager from './student-management/TempPasswordManager';

const tempPasswordManager = TempPasswordManager({ 
  students, 
  onStudentsUpdate: setStudents 
});

// 一時パスワード発行
tempPasswordManager.issueTemporaryPassword(userId);
```

#### 戻り値
- `issueTemporaryPassword`: 一時パスワード発行関数
- `tempPasswordUsers`: 一時パスワード利用者リスト
- `instructors`: 指導員リスト
- `selectedInstructor`, `setSelectedInstructor`: 選択された指導員
- `expiryTime`, `setExpiryTime`: 有効期限
- `announcementTitle`, `setAnnouncementTitle`: アナウンスタイトル
- `announcementMessage`, `setAnnouncementMessage`: アナウンスメッセージ
- `tempPasswordLoading`, `setTempPasswordLoading`: ローディング状態

---

### 2. StudentEditor.js
**利用者情報編集機能**

#### 機能
- 利用者情報の編集
- 個別支援計画の管理
- 編集モーダルの制御

#### 使用方法
```javascript
import StudentEditor from './student-management/StudentEditor';

const studentEditor = StudentEditor({ 
  student: editingStudent, 
  onUpdate: fetchStudents, 
  onClose: () => setShowEditModal(false),
  instructors 
});

// 編集モーダルを開く
studentEditor.openEditModal(student);
```

#### 戻り値
- `openEditModal`: 編集モーダルを開く関数
- `handleUpdateStudent`: 利用者情報更新関数
- `editFormData`, `setEditFormData`: 編集フォームデータ
- `supportPlanData`, `setSupportPlanData`: 支援計画データ
- `existingSupportPlan`: 既存の支援計画
- `showEditModal`, `setShowEditModal`: 編集モーダル表示状態
- `editingStudent`: 編集中の利用者
- `handleInputChange`: 入力値変更処理
- `handleTagChange`: タグ変更処理
- `handleSupportPlanChange`: 支援計画変更処理

---

### 3. CourseManager.js
**コース管理機能**

#### 機能
- コースの一括割り当て・削除
- カリキュラムパスの管理
- 利用者コース情報の取得

#### 使用方法
```javascript
import CourseManager from './student-management/CourseManager';

const courseManager = CourseManager({ 
  students, 
  onStudentsUpdate: setStudents 
});

// コース一括割り当て
courseManager.handleBulkAssignCourses();
```

#### 戻り値
- `availableCourses`: 利用可能なコース
- `availableCurriculumPaths`: 利用可能なカリキュラムパス
- `selectedStudents`, `setSelectedStudents`: 選択された利用者
- `selectedCourses`, `setSelectedCourses`: 選択されたコース
- `selectedCurriculumPath`, `setSelectedCurriculumPath`: 選択されたカリキュラムパス
- `handleBulkAssignCourses`: コース一括割り当て関数
- `handleBulkRemoveCourses`: コース一括削除関数
- `handleBulkAssignCurriculumPath`: カリキュラムパス一括割り当て関数
- `fetchUserCourses`: 利用者コース情報取得関数

---

### 4. StudentList.js
**利用者一覧表示機能**

#### 機能
- 利用者一覧の表示
- チェックボックス選択
- 操作ボタン群

#### 使用方法
```javascript
import StudentList from './student-management/StudentList';

<StudentList
  students={students}
  onIssueTemporaryPassword={tempPasswordManager.issueTemporaryPassword}
  onEditStudent={openEditModal}
  onToggleStatus={toggleStudentStatus}
  onDeleteStudent={deleteStudent}
  selectedStudents={selectedStudents}
  onSelectStudent={setSelectedStudents}
/>
```

#### Props
- `students`: 利用者リスト
- `onIssueTemporaryPassword`: 一時パスワード発行コールバック
- `onEditStudent`: 編集コールバック
- `onToggleStatus`: ステータス切り替えコールバック
- `onDeleteStudent`: 削除コールバック
- `selectedStudents`: 選択された利用者IDリスト
- `onSelectStudent`: 選択変更コールバック

---

### 5. StudentAdder.js
**利用者追加機能**

#### 機能
- 個別利用者追加
- 一括利用者追加
- 追加フォームの制御

#### 使用方法
```javascript
import StudentAdder from './student-management/StudentAdder';

const studentAdder = StudentAdder({ 
  onStudentAdded: fetchStudents, 
  instructors 
});

// 追加フォームを表示
studentAdder.setShowAddForm(true);
```

#### 戻り値
- `showAddForm`, `setShowAddForm`: 追加フォーム表示状態
- `bulkInputMode`, `setBulkInputMode`: 一括入力モード
- `newStudent`, `setNewStudent`: 新規利用者データ
- `bulkInputText`, `setBulkInputText`: 一括入力テキスト
- `bulkInstructorId`, `setBulkInstructorId`: 一括指導員ID
- `handleInputChange`: 入力値変更処理
- `handleTagChange`: タグ変更処理
- `handleAddStudent`: 個別追加処理
- `handleBulkAddStudents`: 一括追加処理

---

### 6. TagManager.js
**タグ管理機能**

#### 機能
- タグの一括追加
- タグフィルター
- カスタムタグの管理

#### 使用方法
```javascript
import TagManager from './student-management/TagManager';

const tagManager = TagManager({ 
  students, 
  onStudentsUpdate: fetchStudents 
});

// タグ一括追加
tagManager.handleBulkAddTags();
```

#### 戻り値
- `showTagModal`, `setShowTagModal`: タグモーダル表示状態
- `newTagName`, `setNewTagName`: 新規タグ名
- `tagsToAdd`, `setTagsToAdd`: 追加するタグリスト
- `customTags`, `setCustomTags`: カスタムタグリスト
- `getAllTags`: 全タグ取得関数
- `handleBulkAddTags`: タグ一括追加関数
- `addNewTag`: 新規タグ追加関数
- `toggleTag`: タグ選択/解除関数

---

## 🔧 統合方法

### メインコンポーネントでの使用例

```javascript
import React, { useState, useEffect } from 'react';
import TempPasswordManager from './student-management/TempPasswordManager';
import StudentEditor from './student-management/StudentEditor';
import CourseManager from './student-management/CourseManager';
import StudentList from './student-management/StudentList';
import StudentAdder from './student-management/StudentAdder';
import TagManager from './student-management/TagManager';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // 子コンポーネントのフックを使用
  const tempPasswordManager = TempPasswordManager({ 
    students, 
    onStudentsUpdate: setStudents 
  });

  const studentEditor = StudentEditor({ 
    student: null, 
    onUpdate: fetchStudents, 
    onClose: () => {}, 
    instructors 
  });

  const courseManager = CourseManager({ 
    students, 
    onStudentsUpdate: setStudents 
  });

  const studentAdder = StudentAdder({ 
    onStudentAdded: fetchStudents, 
    instructors 
  });

  const tagManager = TagManager({ 
    students, 
    onStudentsUpdate: fetchStudents 
  });

  return (
    <div>
      {/* 利用者一覧 */}
      <StudentList
        students={students}
        onIssueTemporaryPassword={tempPasswordManager.issueTemporaryPassword}
        onEditStudent={studentEditor.openEditModal}
        onToggleStatus={toggleStudentStatus}
        onDeleteStudent={deleteStudent}
        selectedStudents={selectedStudents}
        onSelectStudent={setSelectedStudents}
      />
      
      {/* 各種モーダル */}
      {/* ... */}
    </div>
  );
};
```

## 📋 注意事項

1. **状態管理**: 各コンポーネントは独自の状態を持ちますが、親コンポーネントとの連携が必要です
2. **API呼び出し**: 各コンポーネントは独立してAPIを呼び出します
3. **エラーハンドリング**: 各コンポーネントでエラーハンドリングを行います
4. **型安全性**: TypeScriptを使用する場合は、適切な型定義を追加してください

## 🚀 今後の拡張

- 各コンポーネントのテスト追加
- パフォーマンス最適化
- アクセシビリティの向上
- 国際化対応
