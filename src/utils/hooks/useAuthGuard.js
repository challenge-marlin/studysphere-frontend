import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/contexts/AuthContext';
import { isAuthRequiredPage } from '../authUtils';

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
        const role = currentUser.role;
        // 数値のroleに対応
        if (role >= 9) {
          navigate('/admin/dashboard');
        } else if (role >= 4 && role <= 8) {
          navigate('/instructor/dashboard');
        } else if (role >= 1 && role <= 3) {
          navigate('/student/dashboard');
        } else {
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

    if (currentUser && currentUser.role < 9) {
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
    console.log('=== useInstructorGuard Debug ===');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentUser:', currentUser);
    console.log('currentUser.role:', currentUser?.role);
    
    if (isLoading) {
      console.log('Still loading, skipping guard check');
      return;
    }

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to /');
      navigate('/');
      return;
    }

    if (currentUser && (currentUser.role < 4 || currentUser.role > 8)) {
      console.log('User role not authorized for instructor pages, redirecting to /');
      console.log('User role:', currentUser.role, 'Expected: 4-8');
      navigate('/');
      return;
    }
    
    console.log('InstructorGuard: User authorized');
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

    if (currentUser && (currentUser.role < 1 || currentUser.role > 3)) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isLoading, currentUser, navigate]);

  return { isAuthenticated, isLoading, currentUser };
}; 