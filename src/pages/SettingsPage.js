import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Modal, Nav, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import { ThemeContext } from '../contexts/ThemeContext';
import { useWindowSize } from '../hooks/useWindowSize';

const SettingsPage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('Новый пароль должен содержать не менее 8 символов');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('https://back-c6rh.onrender.com/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      }, {
        withCredentials: true
      });
      
      setSuccess('Пароль успешно изменен');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setError('');
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get('https://back-c6rh.onrender.com/check-auth', { withCredentials: true });
      } catch (error) {
        console.error('Ошибка проверки сессии:', error);
      }
    };
    checkSession();
  }, []);

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm mobile-header" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000 
      }}>
        <Col xs={12} className="d-flex align-items-center">
          <h1 className="m-0">
            <Link to="/" className="text-decoration-none">
              <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
              <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
            </Link>
          </h1>
        </Col>
      </Row>

      <div className={`${isMobile ? 'mobile-content' : ''}`}>
        <Row className="m-0">
          {!isMobile && (
            <Col md={3} lg={2} className="p-0 border-end shadow-sm" style={{ 
              minHeight: 'calc(100vh - 60px)', 
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
              position: 'sticky',
              top: '60px',
              height: 'calc(100vh - 60px)',
              overflowY: 'auto'
            }}>
              <Nav className="flex-column py-4">
                <Nav.Link as={Link} to="/" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-house-door me-2"></i> Главная
                </Nav.Link>
                <Nav.Link as={Link} to="/recipes" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-journal-text me-2"></i> Рецепты
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-person me-2"></i> Профиль
                </Nav.Link>
                <Nav.Link as={Link} to="/product-search" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-search me-2"></i> Поиск продуктов
                </Nav.Link>
                <Nav.Link as={Link} to="/ai-scanner" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-camera me-2"></i> AI Сканер
                </Nav.Link>
                <Nav.Link as={Link} to="/chat" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-chat me-2"></i> Чат
                </Nav.Link>
                <Nav.Link as={Link} to="/settings" className="ps-4 py-3 active" style={{
                  borderLeft: '4px solid #2E8B57',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
                }}>
                  <i className="bi bi-gear me-2"></i> Настройки
                </Nav.Link>
              </Nav>
            </Col>
          )}

          <Col xs={12} md={isMobile ? 12 : 9} lg={isMobile ? 12 : 10} 
               className={`${isMobile ? 'px-3' : 'p-4'}`}>
            <h4 className="mb-3">Настройки</h4>
            
            <div className="mobile-settings-cards">
              <Card className="mobile-settings-card shadow-sm" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                color: theme === 'dark' ? '#fff' : '#212529' 
              }}>
                <Card.Header as="h5" style={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
                }}>
                  <i className="bi bi-palette me-2"></i>
                  Настройки темы
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Выберите тему оформления:</Form.Label>
                    <Form.Select 
                      value={theme}
                      onChange={handleThemeChange}
                      style={{
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#333',
                        borderColor: theme === 'dark' ? '#555' : '#ced4da'
                      }}
                    >
                      <option value="light">Светлая тема</option>
                      <option value="dark">Темная тема</option>
                    </Form.Select>
                    <Form.Text className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                      Выбранная тема автоматически сохраняется в браузере
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mobile-settings-card shadow-sm" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                color: theme === 'dark' ? '#fff' : '#212529' 
              }}>
                <Card.Header as="h5" style={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
                }}>
                  <i className="bi bi-shield-lock me-2"></i>
                  Безопасность
                </Card.Header>
                <Card.Body>
                  <p>Защитите свой аккаунт, используя надежный пароль и регулярно меняя его.</p>
                  <Button 
                    variant="primary" 
                    onClick={openPasswordModal}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-key me-2"></i>
                    Изменить пароль
                  </Button>
                </Card.Body>
              </Card>

              <Card className="mobile-settings-card shadow-sm" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                color: theme === 'dark' ? '#fff' : '#212529' 
              }}>
                <Card.Header as="h5" style={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
                }}>
                  <i className="bi bi-info-circle me-2"></i>
                  О приложении
                </Card.Header>
                <Card.Body>
                  <p>
                    <strong>NutriMind</strong> - это приложение для планирования питания и контроля веса, которое помогает вам следить за своим здоровьем.
                  </p>
                  <p className="mb-0">
                    Версия: 1.0.0 <br />
                    © 2025 NutriMind. Все права не защищены.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {isMobile && <MobileNavigation activePage="settings" theme={theme} />}

      <Modal
        show={showPasswordModal}
        onHide={closePasswordModal}
        centered
        backdrop="static"
        style={{
          color: theme === 'dark' ? '#fff' : '#212529'
        }}
      >
        <Modal.Header 
          closeButton
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Modal.Title>
            <i className="bi bi-key me-2"></i>
            Изменение пароля
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff'
          }}
        >
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Текущий пароль</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handleInputChange}
                required
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderColor: theme === 'dark' ? '#555' : '#ced4da'
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Новый пароль</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                required
                minLength={8}
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderColor: theme === 'dark' ? '#555' : '#ced4da'
                }}
              />
              <Form.Text className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                Пароль должен содержать не менее 8 символов
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Подтверждение нового пароля</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  borderColor: theme === 'dark' ? '#555' : '#ced4da'
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
            borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6'
          }}
        >
          <Button variant="secondary" onClick={closePasswordModal}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePasswordSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Изменить пароль
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SettingsPage;