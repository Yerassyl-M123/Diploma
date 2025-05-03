import { useContext, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Nav,
  Row
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../App';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
  const { theme } = useContext(ThemeContext);
  const { refreshAuth } = useContext(AuthContext);
  const history = useHistory();

  const testimonialsData = [
    {
      name: 'Kemalova Assel',
      image: '/img/assel1.png',
      review: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"',
      rating: 5,
    },
    {
      name: 'Kemalova Assel',
      image: '/img/assel2.png',
      review: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"',
      rating: 5,
    },
    {
      name: 'Kemalova Assel',
      image: '/img/assel3.png',
      review: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"',
      rating: 5,
    },
  ];
  
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'filled-star' : 'empty-star'}>
            ★
          </span>
        ))}
      </div>
    );
  };
  
  const recipes = [
    {
      title: 'Beshbarmaq(Et)',
      image: 'img/recipes1.png',
      description: `A dish consisting of boiled horse or mutton meat is the most popular Kazakh dish, and the national dish of Kazakhstan. It is also called "five fingers" because of the way it is eaten.`,
      prepTime: '2h',
    },
    {
      title: 'Shrimp & Arugula Gourmet Salad',
      image: 'img/recipes2.png',
      description: `The salad consists of arugula, shrimp, cherry tomatoes, avocado, and cottage cheese. The salad is dressed with lemon juice, olive oil, and garnished with balsamic cream. Served fresh.`,
      prepTime: '2h',
    },
    {
      title: 'Creamy Tomato Penne',
      image: 'img/recipes3.png',
      description: `Penne pasta in a rich and creamy tomato sauce with aromatic spices. The dish is garnished with fresh herbs, adding a touch of freshness and an appetizing look.`,
      prepTime: '2h',
    },
  ];
  
  const [liked, setLiked] = useState(Array(recipes.length).fill(false));
  
  const toggleLike = (index) => {
    const updatedLikes = [...liked];
    updatedLikes[index] = !updatedLikes[index];
    setLiked(updatedLikes);
  };
  
  const handleNavigateToSignin = () => {
    history.push('/signin');
  };
  
  const handleNavigateToSignup = () => {
    history.push('/signup');
  };

  return (
    <div className={`welcome-page ${theme}`}>
      <Nav className="navbar navbar-expand-lg py-3 shadow-sm" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Container>
          <Nav.Item className="navbar-brand d-flex align-items-center">
            <img 
              src="/img/logo.png" 
              alt="NutriMind Logo"
              style={{ 
                height: '40px',
                marginRight: '10px'
              }}
            />
            <h1 className="m-0">
              <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
              <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
            </h1>
          </Nav.Item>
          
          <div className="navbar-collapse">
            <Nav className="mx-auto">
              <Nav.Link href="#home" className="mx-2">Главная</Nav.Link>
              <Nav.Link href="#features" className="mx-2">Возможности</Nav.Link>
              <Nav.Link href="#recipes" className="mx-2">Рецепты</Nav.Link>
              <Nav.Link href="#reviews" className="mx-2">Отзывы</Nav.Link>
              <Nav.Link href="#contact" className="mx-2">Контакты</Nav.Link>
            </Nav>
            
            <div className="d-flex ms-auto">
              <Button 
                variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} 
                className="me-2"
                onClick={handleNavigateToSignin}
              >
                Войти
              </Button>
              <Button 
                variant="primary"
                onClick={handleNavigateToSignup}
                style={{ 
                  background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                  border: 'none' 
                }}
              >
                Регистрация
              </Button>
            </div>
          </div>
        </Container>
      </Nav>

      <section id="home" className="py-5">
        <Container>
          <Row className="align-items-center hero-section">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="display-4 fw-bold mb-3">
                Откройте для себя новые <br />
                <span className="gradient-text">Рецепты</span> <br />
                без усилий!
              </h2>
              <p className="fs-5 mb-4 text-secondary">
                Сканируйте, анализируйте и готовьте с вашими ингредиентами. Отслеживайте свои запасы и делайте здоровый, осознанный выбор при покупках.
              </p>
              <Button 
                size="lg"
                onClick={handleNavigateToSignup}
                style={{ 
                  background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '30px'
                }}
                className="shadow"
              >
                Начать
              </Button>
            </Col>
            <Col md={6}>
              <img 
                src="img/mainphoto.png" 
                alt="Hero" 
                className="img-fluid rounded-lg shadow-lg"
                style={{
                  borderRadius: '20px',
                  transform: 'perspective(1000px) rotateY(-5deg)',
                  maxHeight: '500px',
                  objectFit: 'cover'
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <div className="text-center my-5">
        <hr className="divider" />
      </div>
      
      <section id="features" className="py-5 bg-light" style={{ 
        backgroundColor: theme === 'dark' ? '#111111' : '#f8f9fa' 
      }}>
        <Container>
          <h2 className="text-center mb-5">
            Наши <span className="gradient-text">Умные</span> Возможности
          </h2>
          
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm feature-card" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#e0e0e0' : 'inherit'
              }}>
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <img src="./img/feature1.png" alt="Scan feature" className="img-fluid" />
                  </div>
                  <Card.Title className="mb-3">
                    <span className="gradient-text">Сканирование</span> и <span className="gradient-text">анализ</span> ингредиентов
                  </Card.Title>
                  <Card.Text>
                    Узнайте всё о продуктах питания, просто отсканировав их этикетку или штрих-код.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm feature-card" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#e0e0e0' : 'inherit'
              }}>
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <img src="./img/feature2.png" alt="Recipe feature" className="img-fluid" />
                  </div>
                  <Card.Title className="mb-3">
                    <span className="gradient-text">Генерация</span> рецептов
                  </Card.Title>
                  <Card.Text>
                    Получайте персонализированные рецепты на основе имеющихся у вас ингредиентов.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm feature-card" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#e0e0e0' : 'inherit'
              }}>
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <img src="./img/feature3.png" alt="AI feature" className="img-fluid" />
                  </div>
                  <Card.Title className="mb-3">
                    <span className="gradient-text">Искусственный</span> интеллект
                  </Card.Title>
                  <Card.Text>
                    ИИ анализирует ваши предпочтения и помогает делать здоровый выбор.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm feature-card" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#e0e0e0' : 'inherit'
              }}>
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <img src="./img/feature4.png" alt="Calendar feature" className="img-fluid" />
                  </div>
                  <Card.Title className="mb-3">
                    <span className="gradient-text">Календарь</span> питания
                  </Card.Title>
                  <Card.Text>
                    Планируйте ваши приемы пищи и создавайте персональное меню на неделю.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      <div className="text-center my-5">
        <hr className="divider" />
      </div>

      <section id="recipes" className="py-5">
        <Container>
          <h2 className="text-center mb-5">
            <span className="gradient-text">Рецепты</span> в жизни
          </h2>
          
          <Row className="g-4">
            {recipes.map((recipe, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-sm recipe-card" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  color: theme === 'dark' ? '#e0e0e0' : 'inherit',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease'
                }}>
                  <div 
                    className="recipe-image"
                    style={{ 
                      height: '200px',
                      backgroundImage: `url(${recipe.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  ></div>
                  <Card.Body className="p-4">
                    <Card.Title className="mb-3">{recipe.title}</Card.Title>
                    <Card.Text className="recipe-description">{recipe.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Badge bg="light" text="dark" className="py-2 px-3">
                        <i className="bi bi-clock"></i> {recipe.prepTime}
                      </Badge>
                      
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <div className="text-center my-5">
        <hr className="divider" />
      </div>

      <section id="reviews" className="py-5 bg-light" style={{ 
        backgroundColor: theme === 'dark' ? '#111111' : '#f8f9fa' 
      }}>
        <Container>
          <h2 className="text-center mb-5">
            Что <span className="gradient-text">говорят</span> наши клиенты
          </h2>
          
          <Row className="g-4">
            {testimonialsData.map((item, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-sm testimonial-card" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  color: theme === 'dark' ? '#e0e0e0' : 'inherit',
                  borderRadius: '12px'
                }}>
                  <Card.Body className="p-4 text-center">
                    <div className="testimonial-image mb-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text className="testimonial-review my-3">{item.review}</Card.Text>
                    <StarRating rating={item.rating} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <div className="text-center my-5">
        <hr className="divider" />
      </div>

      <section id="contact" className="py-5">
        <Container>
          <Row>
            <Col lg={5} className="mb-4 mb-lg-0">
              <div className="contact-info p-4 h-100" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#4682B4',
                color: '#ffffff',
                borderRadius: '12px'
              }}>
                <h2 className="mb-3">Контактная информация</h2>
                <p className="mb-5">Напишите нам, чтобы начать общение!</p>
                
                <div className="info-detail mb-4 d-flex align-items-center">
                  <div className="icon-wrapper me-3">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <p className="mb-0">+77473644672</p>
                </div>
                
                <div className="info-detail mb-4 d-flex align-items-center">
                  <div className="icon-wrapper me-3">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <p className="mb-0">nutrimind@gmail.com</p>
                </div>
                
                <div className="info-detail mb-5 d-flex align-items-center">
                  <div className="icon-wrapper me-3">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <p className="mb-0">Kaskelen city. Abylaykhan 1/1</p>
                </div>
                
                <div className="social-icons d-flex">
                  <a href="#" className="me-3 social-icon">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="me-3 social-icon">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-discord"></i>
                  </a>
                </div>
              </div>
            </Col>
            
            <Col lg={7}>
              <Card className="border-0 shadow-sm" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                color: theme === 'dark' ? '#e0e0e0' : 'inherit',
                borderRadius: '12px'
              }}>
                <Card.Body className="p-4">
                  <Form>
                    <Row className="mb-3">
                      <Col>
                        <Form.Group>
                          <Form.Label>Имя</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Введите ваше имя"
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#333' : '#fff',
                              color: theme === 'dark' ? '#fff' : '#333',
                              border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group>
                          <Form.Label>Фамилия</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Введите вашу фамилию"
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#333' : '#fff',
                              color: theme === 'dark' ? '#fff' : '#333',
                              border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="Введите ваш email"
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#333' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#333',
                          border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
                        }}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Телефон</Form.Label>
                      <Form.Control 
                        type="tel" 
                        placeholder="Введите ваш телефон"
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#333' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#333',
                          border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
                        }}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Сообщение</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={5}
                        placeholder="Напишите ваше сообщение..."
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#333' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#333',
                          border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
                        }}
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit"
                      className="w-100"
                      style={{ 
                        background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                        border: 'none',
                        padding: '10px'
                      }}
                    >
                      Отправить сообщение
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="py-4 mt-5" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
        color: theme === 'dark' ? '#e0e0e0' : '#333333'
      }}>
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-4">
                <img 
                  src="/img/logo.png" 
                  alt="NutriMind Logo"
                  style={{ 
                    height: '30px',
                    marginRight: '10px'
                  }}
                />
                <h5 className="mb-0">Свяжитесь с нами</h5>
              </div>
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-telephone me-2"></i>
                <span>+77473644672</span>
              </div>
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-envelope me-2"></i>
                <span>nutrimind@gmail.com</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt me-2"></i>
                <span>Kaskelen city. Abylaykhan 1/1</span>
              </div>
            </Col>
            
            <Col md={4} className="mb-4 mb-md-0">
              <h5 className="mb-4">Полезные ссылки</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#home" className="text-decoration-none">Главная</a></li>
                <li className="mb-2"><a href="#features" className="text-decoration-none">Возможности</a></li>
                <li className="mb-2"><a href="#recipes" className="text-decoration-none">Рецепты</a></li>
                <li className="mb-2"><a href="#reviews" className="text-decoration-none">Отзывы</a></li>
                <li><a href="#contact" className="text-decoration-none">Контакты</a></li>
              </ul>
            </Col>
            
            <Col md={4}>
              <h5 className="mb-4">Подписывайтесь на нас</h5>
              <div className="d-flex">
                <a href="#" className="me-3 social-icon-footer">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="me-3 social-icon-footer">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="me-3 social-icon-footer">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="social-icon-footer">
                  <i className="bi bi-discord"></i>
                </a>
              </div>
            </Col>
          </Row>
          
          <hr className="my-4" />
          
          <div className="text-center">
            <p className="mb-0">&copy; 2024 NutriMind. Все права защищены.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default WelcomePage;