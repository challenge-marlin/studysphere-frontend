import React, { useState } from 'react';
import SanitizedInput from '../SanitizedInput';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StudentAdder = ({ onStudentAdded, instructors }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkInputMode, setBulkInputMode] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    login_code: '',
    instructor_id: '',
    tags: []
  });
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkInstructorId, setBulkInstructorId] = useState('');

  // 個別入力の処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // タグの変更を処理
  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewStudent(prev => ({
      ...prev,
      tags
    }));
  };

  // 個別利用者追加
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    const studentData = {
      name: newStudent.name,
      login_code: newStudent.login_code,
      instructor_id: newStudent.instructor_id || null,
      tags: newStudent.tags
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        alert('利用者が追加されました');
        setShowAddForm(false);
        setNewStudent({
          name: '',
          login_code: '',
          instructor_id: '',
          tags: []
        });
        onStudentAdded(); // 親コンポーネントに更新を通知
      } else {
        const errorData = await response.json();
        alert(`利用者追加に失敗しました: ${errorData.message}`);
      }
    } catch (error) {
      console.error('利用者追加エラー:', error);
      alert('利用者追加に失敗しました');
    }
  };

  // 一括利用者追加
  const handleBulkAddStudents = async () => {
    if (!bulkInputText.trim()) {
      alert('利用者情報を入力してください');
      return;
    }

    const lines = bulkInputText.trim().split('\n').filter(line => line.trim());
    const students = [];

    for (const line of lines) {
      const [name, loginCode] = line.split(',').map(item => item.trim());
      if (name && loginCode) {
        students.push({
          name,
          login_code: loginCode,
          instructor_id: bulkInstructorId || null,
          tags: []
        });
      }
    }

    if (students.length === 0) {
      alert('有効な利用者情報が見つかりませんでした');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: students })
      });

      if (response.ok) {
        alert(`${students.length}名の利用者が追加されました`);
        setShowAddForm(false);
        setBulkInputText('');
        setBulkInstructorId('');
        onStudentAdded(); // 親コンポーネントに更新を通知
      } else {
        const errorData = await response.json();
        alert(`一括追加に失敗しました: ${errorData.message}`);
      }
    } catch (error) {
      console.error('一括追加エラー:', error);
      alert('一括追加に失敗しました');
    }
  };

  return {
    showAddForm,
    setShowAddForm,
    bulkInputMode,
    setBulkInputMode,
    newStudent,
    setNewStudent,
    bulkInputText,
    setBulkInputText,
    bulkInstructorId,
    setBulkInstructorId,
    handleInputChange,
    handleTagChange,
    handleAddStudent,
    handleBulkAddStudents
  };
};

export default StudentAdder;
