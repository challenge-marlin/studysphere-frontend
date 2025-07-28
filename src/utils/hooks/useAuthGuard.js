import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/contexts/AuthContext';
import { isMockLogin, isAuthRequiredPage } from '../authUtils';

// 認証ガード用のカスタムフック
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const pathname = window.location.pathname;
    
    // 認証が必要なページで認証されていない場合
    if (isAuthRequiredPage(pathname) && !isAuthenticated) {
      navigate('/');
      return;
    }

    // 認証済みでログインページにアクセスした場合
    if (isAuthenticated && (pathname === '/' || pathname.startsWith('/student/login'))) {
      if (currentUser) {
        switch (currentUser.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'instructor':
            navigate('/instructor/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentUser, navigate]);

  return { isAuthenticated, isLoading, currentUser };
};

// 管理者専用ページ用のガード
export const useAdminGuard = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (currentUser && currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isLoading, currentUser, navigate]);

  return { isAuthenticated, isLoading, currentUser };
};

// 指導員専用ページ用のガード
export const useInstructorGuard = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (currentUser && currentUser.role !== 'instructor') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isLoading, currentUser, navigate]);

  return { isAuthenticated, isLoading, currentUser };
};

// 生徒専用ページ用のガード
export const useStudentGuard = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (currentUser && currentUser.role !== 'student') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isLoading, currentUser, navigate]);

  return { isAuthenticated, isLoading, currentUser };
}; 