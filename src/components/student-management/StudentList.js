import React from 'react';
import { isExpired, formatUTCToJapanTimeString } from '../../utils/dateUtils';

const StudentList = ({ 
  students, 
  onIssueTemporaryPassword, 
  onEditStudent, 
  onToggleStatus, 
  onDeleteStudent,
  selectedStudents,
  onSelectStudent 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectStudent(students.map(s => s.id));
                    } else {
                      onSelectStudent([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left">利用者名</th>
              <th className="px-4 py-3 text-left">担当指導員</th>
              <th className="px-4 py-3 text-left">タグ</th>
              <th className="px-4 py-3 text-left">進行度</th>
              <th className="px-4 py-3 text-left">ステータス</th>
              <th className="px-4 py-3 text-left">本日の利用状況</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectStudent([...selectedStudents, student.id]);
                      } else {
                        onSelectStudent(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.login_code}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {student.instructor_name || '未設定'}
                  </div>
                </td>
                <td className="px-4 py-3 w-48">
                  <div className="flex flex-wrap gap-1 max-w-44">
                    {student.tags && student.tags.length > 0 ? (
                      student.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full truncate max-w-20"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">タグなし</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${student.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{student.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status === 1 ? '稼働中' : '停止中'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
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
                        <button 
                          className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 mt-1"
                          onClick={() => onIssueTemporaryPassword(student.id)}
                          title="一時パスワードを再発行"
                        >
                          再発行
                        </button>
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

export default StudentList;
