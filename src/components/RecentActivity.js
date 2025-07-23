import React from 'react';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson':
        return '📚';
      case 'assignment':
        return '📝';
      case 'test':
        return '📊';
      default:
        return '📋';
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'lesson':
        return 'レッスン';
      case 'assignment':
        return '課題';
      case 'test':
        return 'テスト';
      default:
        return '活動';
    }
  };

  const getStatusColor = (status) => {
    if (status === '完了' || status === '提出済み' || status.includes('点')) {
      return 'text-green-600';
    } else if (status === '進行中') {
      return 'text-yellow-600';
    } else {
      return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="mb-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start p-4 rounded-lg mb-2 transition-colors duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-200">
            <div className="text-2xl mr-4 flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 mb-2 leading-relaxed">
                {activity.title}
              </div>
              <div className="flex gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                  {getActivityTypeLabel(activity.type)}
                </span>
                <span className="text-gray-500">{activity.date}</span>
              </div>
              {activity.course && (
                <div className="text-sm text-indigo-600 mb-1 font-medium">
                  📖 {activity.course}
                </div>
              )}
              {activity.status && (
                <div className={`text-sm font-semibold inline-block px-2 py-1 rounded bg-green-100 ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full bg-gray-50 text-indigo-600 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:-translate-y-0.5">
        すべての活動を見る
      </button>
    </div>
  );
};

export default RecentActivity; 