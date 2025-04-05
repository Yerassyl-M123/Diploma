import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const history = useHistory();
  const location = useLocation();
  const { theme } = useContext(ThemeContext) || { theme: 'light' };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    
    if (errorMsg === 'email_exists') {
      setError('Пользователь с этим Google аккаунтом уже существует. Пожалуйста, войдите в систему.');
    } else if (errorMsg === 'registration_failed') {
      setError('Не удалось зарегистрироваться. Пожалуйста, попробуйте еще раз.');
    }
  }, [location]);

  const validateForm = () => {
    if (!email || !username || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        'http://localhost:8080/signup', 
        { email, username, password },
        { withCredentials: true }
      );
      setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
      setTimeout(() => {
        history.push('/signin');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:8080/auth/google?type=signup';
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
                <p className="text-muted">Создайте аккаунт для доступа к сервису</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSignup}>
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
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Введите имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    placeholder="Минимум 8 символов"
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
                
                <Form.Group className="mb-4">
                  <Form.Label>Подтверждение пароля</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Регистрация...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Зарегистрироваться
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-danger" 
                    onClick={handleGoogleSignup}
                    className="d-flex align-items-center justify-content-center"
                    size="lg"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme === 'dark' ? 'rgba(220, 53, 69, 0.1)' : 'transparent'
                    }}
                  >
                    <i className="bi bi-google me-2"></i>
                    Регистрация через Google
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="mb-0">
                    Уже есть аккаунт? {' '}
                    <Link to="/signin" style={{ color: theme === 'dark' ? '#4682B4' : '#2E8B57', fontWeight: '500' }}>
                      Войдите
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;