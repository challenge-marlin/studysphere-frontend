import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Study Sphere
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses" 
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === '/courses' 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  コース一覧
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-200">田中太郎さん</span>
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-sm">
              田
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 