import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { ThemeContext } from '../contexts/ThemeContext';

const SigninPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); 
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const history = useHistory();
  const location = useLocation();
  const { theme } = useContext(ThemeContext) || { theme: 'light' };
  const { refreshAuth } = useContext(AuthContext); 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    
    if (errorMsg === 'user_not_found') {
      setError('Пользователь с этим Google аккаунтом не найден. Пожалуйста, зарегистрируйтесь.');
    }
  }, [location]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        'https://back-c6rh.onrender.com/signin', 
        { email, password },
        { withCredentials: true }
      );
      
      setSuccess('Успешный вход! Перенаправление...');
      
      if (response.data.userId) {
        localStorage.setItem('sid', response.data.userId.toString());
        console.log("Сохранен sid в localStorage:", response.data.userId);
      }
      
      refreshAuth()
        .then(() => {
          setTimeout(() => {
            refreshAuth().then(() => {
              const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
              sessionStorage.removeItem('redirectAfterLogin');
              history.push(redirectPath);
            });
          }, 300);
        });
      
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка входа. Пожалуйста, проверьте данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = () => {
    window.location.href = 'https://back-c6rh.onrender.com/auth/google?type=signin';
  };

  const handleRequestCode = async () => {
    if (!resetEmail) {
      setResetError('Пожалуйста, введите ваш email');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const response = await axios.post('https://back-c6rh.onrender.com/reset-password', { email: resetEmail });
      setResetSuccess('Код для восстановления пароля отправлен на ваш email');
      setResetStep(2);
    } catch (error) {
      setResetError(error.response?.data?.error || 'Не удалось отправить код. Пожалуйста, проверьте email и попробуйте снова.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      setResetError('Пожалуйста, введите полученный код');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const response = await axios.post('https://back-c6rh.onrender.com/verify-code', { 
        email: resetEmail, 
        code: resetCode 
      });
      setResetSuccess('Код подтвержден. Теперь вы можете установить новый пароль');
      setResetStep(3);
    } catch (error) {
      setResetError(error.response?.data?.error || 'Неверный код. Пожалуйста, проверьте и попробуйте снова.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetError('Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Пароль должен содержать не менее 8 символов');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const response = await axios.post('https://back-c6rh.onrender.com/update-password', {
        email: resetEmail,
        newPassword: newPassword
      });
      setResetSuccess('Пароль успешно изменен! Теперь вы можете войти в систему.');
      
      setTimeout(() => {
        resetForm();
        setShowResetModal(false);
      }, 2000);
    } catch (error) {
      setResetError(error.response?.data?.error || 'Не удалось обновить пароль. Пожалуйста, попробуйте позже.');
    } finally {
      setResetLoading(false);
    }
  };

  const resetForm = () => {
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const renderResetModal = () => {
    return (
      <Modal 
        show={showResetModal} 
        onHide={() => { resetForm(); setShowResetModal(false); }}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6',
            color: theme === 'dark' ? '#fff' : '#212529'
          }}
        >
          <Modal.Title>Восстановление пароля</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            color: theme === 'dark' ? '#fff' : '#212529'
          }}
        >
          {resetError && <Alert variant="danger">{resetError}</Alert>}
          {resetSuccess && <Alert variant="success">{resetSuccess}</Alert>}
          
          {resetStep === 1 && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Введите ваш email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                  }}
                />
                <Form.Text className="text-muted">
                  На этот адрес будет отправлен код для восстановления пароля
                </Form.Text>
              </Form.Group>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleRequestCode}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить код'
                  )}
                </Button>
              </div>
            </Form>
          )}
          
          {resetStep === 2 && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Код подтверждения</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите код из email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                  }}
                />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleVerifyCode}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Проверка...
                    </>
                  ) : (
                    'Подтвердить код'
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setResetStep(1)}
                  disabled={resetLoading}
                >
                  Назад
                </Button>
              </div>
            </Form>
          )}
          
          {resetStep === 3 && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Новый пароль</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Минимум 8 символов"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Подтверждение пароля</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Повторите новый пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                  }}
                />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleUpdatePassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить новый пароль'
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setResetStep(2)}
                  disabled={resetLoading}
                >
                  Назад
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center" style={{
      backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
      backgroundImage: theme === 'dark' 
        ? 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("/images/food-bg-dark.jpg")'
        : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("/images/food-bg-light.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0" style={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            boxShadow: theme === 'dark' 
              ? '0 15px 25px rgba(0, 0, 0, 0.6)' 
              : '0 15px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h1 className="mb-3">
                  <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
                  <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
                </h1>
                <p className="text-muted">Войдите в свой аккаунт для доступа к сервису</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSignin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Введите ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#333',
                      borderRadius: '8px',
                      padding: '12px 15px',
                      border: theme === 'dark' ? '1px solid #444' : '1px solid #ced4da',
                    }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#333',
                      borderRadius: '8px',
                      padding: '12px 15px',
                      border: theme === 'dark' ? '1px solid #444' : '1px solid #ced4da',
                    }}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end mb-4">
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none" 
                    onClick={() => setShowResetModal(true)}
                    style={{
                      color: theme === 'dark' ? '#4682B4' : '#2E8B57',
                      fontWeight: '500'
                    }}
                  >
                    Забыли пароль?
                  </Button>
                </div>
                
                <div className="d-grid gap-3 mb-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      background: 'linear-gradient(to right, #2E8B57, #4682B4)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Вход...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Войти
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-danger" 
                    onClick={handleGoogleSignin}
                    className="d-flex align-items-center justify-content-center"
                    size="lg"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme === 'dark' ? 'rgba(220, 53, 69, 0.1)' : 'transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#dc3545';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(220, 53, 69, 0.1)' : 'transparent';
                    }}
                  >
                    <i className="bi bi-google me-2"></i>
                    Войти через Google
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="mb-0">
                    Нет аккаунта? {' '}
                    <Link to="/signup" style={{ color: theme === 'dark' ? '#4682B4' : '#2E8B57', fontWeight: '500' }}>
                      Зарегистрируйтесь
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {renderResetModal()}
    </Container>
  );
};

export default SigninPage;