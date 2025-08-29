import React, { useState } from 'react';
import { isTeacherManager } from '../utils/locationUtils';
import EditInstructorModal from './EditInstructorModal';

const InstructorList = ({ 
  instructors, 
  locationInfo, 
  onAddInstructor, 
  onToggleManager, 
  onDeleteInstructor, 
  onEditInstructor,
  hasPermission,
  loading 
}) => {
  const [editingInstructor, setEditingInstructor] = useState(null);
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">指導員一覧</h3>
        {hasPermission && (
          <button
            onClick={onAddInstructor}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            指導員を追加
          </button>
        )}
      </div>
      
      {instructors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">指導員が登録されていません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  専門分野
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  管理者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                {hasPermission && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instructors.map((instructor, index) => {
                const isManager = isTeacherManager(instructor.id, instructors, locationInfo);
                return (
                  <tr key={instructor.id} className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {instructor.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {instructor.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {instructor.email}
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         {instructor.specialization || '未設定'}
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isManager 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isManager ? '管理者' : '一般'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        instructor.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instructor.status === 1 ? '有効' : '無効'}
                      </span>
                    </td>
                    {hasPermission && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingInstructor(instructor)}
                            className="text-white text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => onToggleManager(instructor.id, !isManager)}
                            className={`text-sm px-3 py-1 rounded text-white transition-colors duration-200 ${
                              isManager 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {isManager ? '管理者解除' : '管理者設定'}
                          </button>
                          <button
                            onClick={() => onDeleteInstructor(instructor.id)}
                            className="text-white text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 編集モーダル */}
      {editingInstructor && (
        <EditInstructorModal
          instructor={editingInstructor}
          onSave={async (formData) => {
            await onEditInstructor(editingInstructor.id, formData);
            setEditingInstructor(null);
          }}
          onCancel={() => setEditingInstructor(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default InstructorList;
