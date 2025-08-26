import React from 'react';
import { isExpired } from '../../utils/dateUtils';

const StudentTable = ({
  students,
  selectedStudents,
  onSelectStudent,
  onSelectAllStudents,
  onIssueTemporaryPassword,
  onEditStudent,
  onToggleStatus,
  onDeleteStudent,
  userCourses,
  onViewDailyReports
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto" style={{ minWidth: '1200px' }}>
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={onSelectAllStudents}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '150px' }}>利用者名</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>担当指導員</th>
                             <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '250px' }}>コース・タグ</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '180px' }}>進捗状況</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>パスワード</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-800 border-b border-indigo-200" style={{ width: '120px' }}>操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => onSelectStudent(student.id)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <button 
                      className="text-left font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => {/* TODO: 利用者詳細画面に遷移 */}}
                      title="利用者詳細を表示"
                    >
                      {student.name}
                    </button>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {student.login_code}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {student.instructor_name || '未設定'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {/* コース情報 */}
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const studentCourses = userCourses.filter(uc => uc.user_id === student.id);
                        const uniqueCourses = studentCourses.filter((course, index, self) => 
                          index === self.findIndex(c => c.course_id === course.course_id)
                        );
                        
                        return (
                          <>
                            {uniqueCourses.slice(0, 4).map(uc => (
                              <span key={uc.id} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                {uc.course_title && uc.course_title.length > 12 ? uc.course_title.substring(0, 12) + '...' : uc.course_title}
                              </span>
                            ))}
                            {uniqueCourses.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{uniqueCourses.length - 4}
                              </span>
                            )}
                            {uniqueCourses.length === 0 && (
                              <span className="text-gray-400 text-xs">未割り当て</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {/* タグ情報 */}
                    <div className="flex flex-wrap gap-1">
                      {student.tags && Array.isArray(student.tags) && student.tags.length > 0 ? (
                        student.tags.slice(0, 5).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                            {tag.length > 10 ? tag.substring(0, 10) + '...' : tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">タグなし</span>
                      )}
                      {student.tags && Array.isArray(student.tags) && student.tags.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{student.tags.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {/* 進捗バー */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (student.progress || 0) >= 75 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : (student.progress || 0) >= 50 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                              : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${student.progress || 0}%` }}
                      />
                    </div>
                    {/* 進捗情報 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{student.progress || 0}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (student.progress || 0) >= 75 
                          ? 'bg-green-100 text-green-800' 
                          : (student.progress || 0) > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(student.progress || 0) >= 75 ? '合格' : (student.progress || 0) > 0 ? '受講中' : '未開始'}
                      </span>
                    </div>
                    {/* 状態 */}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 1 ? '稼働中' : '停止中'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {student.temp_password ? (
                      <div className="text-xs">
                        <div className="font-semibold text-blue-600 font-mono">
                          {student.temp_password}
                        </div>
                        <div className="text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className={student.expires_at && !isExpired(student.expires_at) ? 'text-green-600' : 'text-red-600'}>
                              {student.expires_at && !isExpired(student.expires_at) ? '有効' : '期限切れ'}
                            </span>
                            {student.expires_at && (
                              <span className="text-gray-400">
                                ({student.expires_at})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <div className="text-gray-400 mb-1">未発行</div>
                        <button 
                          className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                          onClick={() => onIssueTemporaryPassword(student.id)}
                          title="一時パスワードを発行"
                        >
                          発行
                        </button>
                      </div>
                    )}
                    {student.temp_password && (
                      <button 
                        className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                        onClick={() => onIssueTemporaryPassword(student.id)}
                        title="一時パスワードを再発行"
                      >
                        再発行
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <button 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-all duration-200"
                      onClick={() => onEditStudent(student)}
                      title="利用者情報と個別支援計画を編集"
                    >
                      ✏️ 編集
                    </button>
                    <button 
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-all duration-200"
                      onClick={() => {/* TODO: テスト合否確認機能を実装 */}}
                      title="テストの合否確認"
                    >
                      📝 合否確認
                    </button>
                    <button 
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-all duration-200"
                      onClick={() => {/* TODO: 提出物確認機能を実装 */}}
                      title="提出物の確認"
                    >
                      📄 提出物確認
                    </button>
                    <button 
                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200 transition-all duration-200"
                      onClick={() => onViewDailyReports(student)}
                      title="日報確認・編集・コメント"
                    >
                      📊 日報確認
                    </button>
                    <button 
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        student.status === 1 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      onClick={() => onToggleStatus(student.id)}
                    >
                      {student.status === 1 ? '停止' : '再開'}
                    </button>
                    <button 
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-all duration-200"
                      onClick={() => onDeleteStudent(student.id)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
