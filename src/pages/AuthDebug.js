import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';

const AuthDebug = () => {
  const [authState, setAuthState] = useState({
    checkingAuth: true,
    isAuthenticated: false,
    userData: null,
    error: null,
    cookiesInfo: '',
    storageInfo: {}
  });

  const checkAuth = async () => {
    setAuthState(prev => ({ ...prev, checkingAuth: true }));
    
    const storageItems = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storageItems[key] = localStorage.getItem(key);
    }
    
    try {
      const sid = localStorage.getItem('sid');
      
      const url = sid 
        ? `https://back-c6rh.onrender.com/check-auth?sid=${sid}`
        : `https://back-c6rh.onrender.com/check-auth`;
      
      console.log(`Проверка авторизации по URL: ${url}`);
      
      const response = await axios.get(url, { withCredentials: true });
      
      setAuthState({
        checkingAuth: false,
        isAuthenticated: true,
        userData: response.data.user,
        error: null,
        cookiesInfo: document.cookie,
        storageInfo: storageItems
      });
    } catch (error) {
      setAuthState({
        checkingAuth: false,
        isAuthenticated: false,
        userData: null,
        error: error.response?.data || error.message,
        cookiesInfo: document.cookie,
        storageInfo: storageItems
      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'https://back-c6rh.onrender.com/signin', 
        { email: "meirkhanyerassyl@gmail.com", password: "password" },
        { withCredentials: true }
      );
      
      if (response.data.userId) {
        localStorage.setItem('sid', response.data.userId.toString());
        alert('Успешный вход! SID: ' + response.data.userId);
        checkAuth();
      }
    } catch (error) {
      alert('Ошибка входа: ' + (error.response?.data?.error || error.message));
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('sid');
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Отладка авторизации на мобильных устройствах</h1>
      
      <Card className="mb-4">
        <Card.Header as="h5">Состояние авторизации</Card.Header>
        <Card.Body>
          {authState.checkingAuth ? (
            <p>Проверка авторизации...</p>
          ) : authState.isAuthenticated ? (
            <Alert variant="success">
              <h4>Авторизован!</h4>
              <p>Пользователь: {authState.userData?.email || 'нет данных'}</p>
              <p>ID: {authState.userData?.id || 'нет данных'}</p>
            </Alert>
          ) : (
            <Alert variant="danger">
              <h4>Не авторизован</h4>
              {authState.error && <p>Ошибка: {JSON.stringify(authState.error)}</p>}
            </Alert>
          )}
          
          <div className="d-grid gap-2 mt-3">
            <Button variant="primary" onClick={checkAuth}>Проверить статус авторизации</Button>
            <Button variant="success" onClick={handleLogin}>Тестовый вход</Button>
            <Button variant="danger" onClick={clearAuthData}>Очистить данные авторизации</Button>
          </div>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header as="h5">Хранилище данных</Card.Header>
        <Card.Body>
          <h6>localStorage:</h6>
          <pre style={{background: '#f8f9fa', padding: '10px'}}>
            {JSON.stringify(authState.storageInfo, null, 2)}
          </pre>
          
          <h6 className="mt-3">Cookies:</h6>
          <pre style={{background: '#f8f9fa', padding: '10px'}}>
            {authState.cookiesInfo || 'Нет сохранённых куков'}
          </pre>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header as="h5">Информация о браузере</Card.Header>
        <Card.Body>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Платформа:</strong> {navigator.platform}</p>
          <p><strong>Мобильное устройство:</strong> {/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Да' : 'Нет'}</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuthDebug;