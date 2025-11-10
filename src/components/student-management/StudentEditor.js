import React, { useState } from 'react';
import SanitizedInput from '../SanitizedInput';
import { SANITIZE_OPTIONS } from '../../utils/sanitizeUtils';
import { updateUser } from '../../utils/api';
import { API_BASE_URL } from '../../config/apiConfig';

const StudentEditor = ({ student, onUpdate, onClose, instructors }) => {
  const [editFormData, setEditFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    instructor_id: student?.instructor_id || '',
    tags: student?.tags || []
  });
  const [tagsInput, setTagsInput] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // 利用者情報編集モーダルを開く
  const openEditModal = async (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      email: student.email || '',
      instructor_id: student.instructor_id || '',
      tags: student.tags || []
    });
    setTagsInput(student.tags ? student.tags.join(', ') : '');
    setShowEditModal(true);
  };

  // 利用者情報更新
  const handleUpdateStudent = async () => {
    try {
      console.log('利用者情報更新開始:', editingStudent.id, editFormData);
      
      // タグ文字列を配列に変換
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // 利用者情報を更新
      const payload = {
        name: (editFormData.name || '').trim(),
        tags: tags
      };
      const emailTrimmed = (editFormData.email || '').trim();
      if (emailTrimmed) {
        payload.email = emailTrimmed;
      }
      if (editFormData.instructor_id) {
        const parsed = parseInt(editFormData.instructor_id);
        if (!isNaN(parsed)) payload.instructor_id = parsed;
      }
      const updateResult = await updateUser(editingStudent.id, payload);

      if (updateResult.success) {
        console.log('利用者情報更新成功');
        alert('利用者情報を更新しました');
        setShowEditModal(false);
        onUpdate(); // 親コンポーネントに更新を通知
      } else {
        console.error('利用者情報更新失敗:', updateResult.message);
        alert('利用者情報の更新に失敗しました: ' + updateResult.message);
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました: ' + (error.message || 'エラーが発生しました'));
    }
  };

  // 入力値の変更を処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // タグの変更を処理
  const handleTagChange = (e) => {
    setTagsInput(e.target.value);
  };

  return {
    openEditModal,
    handleUpdateStudent,
    editFormData,
    setEditFormData,
    tagsInput,
    setTagsInput,
    showEditModal,
    setShowEditModal,
    editingStudent,
    handleInputChange,
    handleTagChange
  };
};

export default StudentEditor;
