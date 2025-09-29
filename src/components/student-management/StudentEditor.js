import React, { useState, useEffect } from 'react';
import SanitizedInput from '../SanitizedInput';
import SanitizedTextarea from '../SanitizedTextarea';
import { SANITIZE_OPTIONS } from '../../utils/sanitizeUtils';
import { updateUser, upsertSupportPlan } from '../../utils/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'studysphere.ayatori-inc.co.jp' 
    ? 'https://backend.studysphere.ayatori-inc.co.jp' 
    : 'http://localhost:5050');

const StudentEditor = ({ student, onUpdate, onClose, instructors }) => {
  const [editFormData, setEditFormData] = useState({
    name: student?.name || '',
    instructor_id: student?.instructor_id || '',
    tags: student?.tags || []
  });

  const [supportPlanData, setSupportPlanData] = useState({
    long_term_goal: '',
    short_term_goal: '',
    needs: '',
    support_content: '',
    goal_date: ''
  });

  const [existingSupportPlan, setExistingSupportPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // 利用者情報編集モーダルを開く
  const openEditModal = async (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      instructor_id: student.instructor_id || '',
      tags: student.tags || []
    });
    setShowEditModal(true);
    
    // 個別支援計画を取得
    try {
      const response = await fetch(`${API_BASE_URL}/api/support-plans/${student.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExistingSupportPlan(result.data);
          setSupportPlanData({
            long_term_goal: result.data.long_term_goal || '',
            short_term_goal: result.data.short_term_goal || '',
            needs: result.data.needs || '',
            support_content: result.data.support_content || '',
            goal_date: result.data.goal_date || ''
          });
        } else {
          setExistingSupportPlan(null);
          setSupportPlanData({
            long_term_goal: '',
            short_term_goal: '',
            needs: '',
            support_content: '',
            goal_date: ''
          });
        }
      }
    } catch (error) {
      console.error('個別支援計画取得エラー:', error);
    }
  };

  // 利用者情報更新
  const handleUpdateStudent = async () => {
    try {
      console.log('利用者情報更新開始:', editingStudent.id, editFormData);
      
      // 利用者情報を更新
      const updateResult = await updateUser(editingStudent.id, {
        name: editFormData.name,
        instructor_id: editFormData.instructor_id || null,
        tags: editFormData.tags || []
      });

      if (updateResult.success) {
        console.log('利用者情報更新成功');
        

        
        // 個別支援計画を保存
        try {
          const supportPlanResult = await upsertSupportPlan({
            user_id: editingStudent.id,
            ...supportPlanData
          });
          
          if (supportPlanResult.success) {
            console.log('個別支援計画更新成功');
            alert('利用者情報と個別支援計画が更新されました');
          } else {
            console.error('個別支援計画更新失敗:', supportPlanResult.message);
            alert('利用者情報は更新されましたが、個別支援計画の更新に失敗しました');
          }
        } catch (supportPlanError) {
          console.error('個別支援計画更新エラー:', supportPlanError);
          alert('利用者情報は更新されましたが、個別支援計画の更新に失敗しました');
        }
        
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
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // 支援計画データの変更を処理
  const handleSupportPlanChange = (e) => {
    const { name, value } = e.target;
    setSupportPlanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    openEditModal,
    handleUpdateStudent,
    editFormData,
    setEditFormData,
    supportPlanData,
    setSupportPlanData,
    existingSupportPlan,
    showEditModal,
    setShowEditModal,
    editingStudent,
    handleInputChange,
    handleTagChange,
    handleSupportPlanChange
  };
};

export default StudentEditor;
