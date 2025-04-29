import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

axios.interceptors.request.use(
  config => {
    if (config.url.includes('back-c6rh.onrender.com') && !config.url.includes('sid=')) {
      const sid = localStorage.getItem('sid');
      if (sid) {
        const separator = config.url.includes('?') ? '&' : '?';
        config.url = `${config.url}${separator}sid=${sid}`;
        console.log("Добавлен SID к запросу:", config.url);
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const history = useHistory();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const searchParams = new URLSearchParams(location.search);
        const sidFromUrl = searchParams.get('sid');
        
        if (sidFromUrl) {
          localStorage.setItem('sid', sidFromUrl);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('sid');
          window.history.replaceState({}, '', newUrl.toString());
        }
        
        const loginSuccess = searchParams.get('login_success');
        if (loginSuccess === 'true') {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('login_success');
          if (newUrl.searchParams.has('mobile')) {
            newUrl.searchParams.delete('mobile');
          }
          window.history.replaceState({}, '', newUrl.toString());
        }

        try {
          const timestamp = new Date().getTime();
          const url = `https://back-c6rh.onrender.com/check-auth?t=${timestamp}`;
          
          const response = await axios.get(url, { withCredentials: true });
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check error:', error);
          sessionStorage.setItem('redirectAfterLogin', location.pathname);
          history.push('/welcome');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [history, location]);

    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  const checkAuth = async () => {
    try {
      const sid = localStorage.getItem('sid');
      const timestamp = new Date().getTime();
      let url = `https://back-c6rh.onrender.com/check-auth?t=${timestamp}`;
      
      const response = await axios.get(url, { withCredentials: true });
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.data.user || null
      });
      return true;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { ...authState, checkAuth };
}