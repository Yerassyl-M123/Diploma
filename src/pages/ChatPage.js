import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Container, Form, Nav, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/MobileStyles.css';

const ChatPage = () => {
  const { theme } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      // Здесь будет запрос к вашему бэкенду с ChatGPT
      const response = await axios.post('https://back-c6rh.onrender.com/chat', {
        message: newMessage
      }, {
        withCredentials: true
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    } finally {
      setLoading(false);
    }
  };

  const Message = ({ message }) => (
    <div className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
      <Card 
        className="shadow-sm"
        style={{
          maxWidth: '80%',
          backgroundColor: message.role === 'user' 
            ? (theme === 'dark' ? '#4682B4' : '#007bff') 
            : (theme === 'dark' ? '#2d2d2d' : '#f8f9fa'),
          borderRadius: '15px',
          border: 'none'
        }}
      >
        <Card.Body 
          className="p-3"
          style={{
            color: message.role === 'user' 
              ? '#fff' 
              : (theme === 'dark' ? '#e0e0e0' : '#333')
          }}
        >
          <div style={{ fontSize: '0.9rem' }}>{message.content}</div>
          <div 
            className="mt-2" 
            style={{ 
              fontSize: '0.7rem', 
              opacity: 0.7,
              color: message.role === 'user' ? '#fff' : (theme === 'dark' ? '#aaa' : '#666')
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm fixed-top" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        zIndex: 1000 
      }}>
        <Col xs={6} md={3} className="d-flex align-items-center">
          <h1 className="m-0">
            <Link to="/" className="text-decoration-none">
              <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
              <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
            </Link>
          </h1>
        </Col>
      </Row>

      <div style={{ 
        paddingTop: '60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Row className="m-0 flex-grow-1">
          {!isMobile && (
            <Col md={3} lg={2} className="p-0 border-end" style={{ 
              position: 'fixed',
              top: '60px',
              bottom: 0,
              overflowY: 'auto',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
              borderRight: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`
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
                  <i className="bi bi-search me-2"></i> AI Сканер
                </Nav.Link>
                <Nav.Link as={Link} to="/chat" className="ps-4 py-3 active" style={{
                  borderLeft: '4px solid #2E8B57',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
                }}>
                  <i className="bi bi-chat me-2"></i> Чат
                </Nav.Link>
                <Nav.Link as={Link} to="/settings" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
                }}>
                  <i className="bi bi-gear me-2"></i> Настройки
                </Nav.Link>
              </Nav>
            </Col>
          )}

          <Col 
            xs={12} 
            md={!isMobile ? 9 : 12} 
            lg={!isMobile ? 10 : 12} 
            className="p-4"
            style={{ 
              marginLeft: !isMobile ? '16.666667%' : 0,
              marginBottom: isMobile ? '60px' : 0
            }}
          >
            <div className="d-flex flex-column" style={{ height: 'calc(100vh - 140px)' }}>
              <div className="flex-grow-1 overflow-auto mb-3">
                {messages.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-chat-dots mb-3" style={{ fontSize: '3rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                    <h4>Начните общение</h4>
                    <p>Здесь вы можете поделиться своими мыслями и получить поддержку</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <Message key={index} message={message} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <Form onSubmit={handleSubmit}>
                <div className="d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    style={{ 
                      resize: 'none',
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      color: theme === 'dark' ? '#e0e0e0' : '#333333',
                      border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
                      borderRadius: '12px'
                    }}
                    rows={2}
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading || !newMessage.trim()}
                    style={{ alignSelf: 'flex-end', borderRadius: '12px', padding: '10px 20px' }}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>

      {isMobile && <MobileNavigation activePage="chat" theme={theme} />}
    </Container>
  );
};

export default ChatPage;