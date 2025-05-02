import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Image, ListGroup, Nav, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../App';
import MobileNavigation from '../components/MobileNavigation';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/MobileStyles.css';

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
  const history = useHistory();
  const { refreshAuth } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [weekDays, setWeekDays] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/profile', {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - today.getDay() + i);
      days.push(day);
    }
    
    setWeekDays(days);
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchMealPlan = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await axios.get('https://back-c6rh.onrender.com/meal-plan', {
          params: { date: dateStr },
          withCredentials: true
        });
        
        const groupedMeals = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };
        
        response.data.forEach(meal => {
          if (groupedMeals[meal.meal_type]) {
            groupedMeals[meal.meal_type].push(meal);
          }
        });
        
        setMealPlan(groupedMeals);
      } catch (error) {
        console.error('Ошибка при получении плана питания:', error);
      }
    };
    
    fetchMealPlan();
  }, [selectedDate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/recipes', {
          withCredentials: true
        });
        setRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при получении рецептов:', error);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const fetchWeightRecords = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/weight-records', {
          withCredentials: true
        });
        setWeightRecords(response.data);
      } catch (error) {
        console.error('Ошибка при получении записей о весе:', error);
      }
    };

    fetchWeightRecords();
  }, []);

  const formatDayName = (date) => {
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric' }).format(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe ? recipe.name : `Рецепт #${recipeId}`;
  };

  const getRecipeImage = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe && recipe.image ? `https://back-c6rh.onrender.com${recipe.image}` : null;
  };

  const handleSignOut = async () => {
    try {
      await axios.post('https://back-c6rh.onrender.com/signout', {}, { 
        withCredentials: true 
      });
      
      localStorage.removeItem('authState');
      
      setTimeout(() => {
        refreshAuth().then(() => {
          history.push('/welcome');
        });
      }, 300);
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      refreshAuth();
      history.push('/welcome');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="px-0 pb-5">
      <Row className="m-0 py-3 border-bottom shadow-sm fixed-top" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        zIndex: 1000 
      }}>
        <Col xs={6} className="d-flex align-items-center">
          <h1 className="m-0">
            <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
            <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
          </h1>
        </Col>
        <Col xs={6} className="d-flex justify-content-end align-items-center">
          {user && (
            <>
              <Link to="/profile" className="d-flex align-items-center text-decoration-none me-3">
                {user.profile_picture ? (
                  <Image 
                    src={`https://back-c6rh.onrender.com${user.profile_picture}`} 
                    roundedCircle 
                    width={40} 
                    height={40} 
                    className="border"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ 
                      width: 40, 
                      height: 40, 
                      background: 'linear-gradient(135deg, #4682B4, #2E8B57)',
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="ms-2 d-none d-md-inline" style={{ color: theme === 'dark' ? '#e0e0e0' : '#333333' }}>
                  {user.full_name || user.email}
                </span>
              </Link>
              <Button 
                variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} 
                size="sm"
                onClick={handleSignOut}
                className="d-flex align-items-center"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                <span className="d-none d-md-inline">Выйти</span>
              </Button>
            </>
          )}
        </Col>
      </Row>

      <div style={{ paddingTop: '60px' }}>
        <Row className="m-0">
          {window.innerWidth > 768 ? (
            <Col xs={12} md={3} lg={2} className="p-0 border-end shadow-sm" style={{ 
              minHeight: 'calc(100vh - 60px)', 
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
              position: 'sticky',
              top: '60px',
              height: 'calc(100vh - 60px)',
              overflowY: 'auto'
            }}>
              <div className="py-4">
                {user && (
                  <div className="text-center mb-4 d-block d-md-none">
                    {user.profile_picture ? (
                      <Image 
                        src={`https://back-c6rh.onrender.com${user.profile_picture}`} 
                        roundedCircle 
                        width={60} 
                        height={60} 
                        className="mb-2 border"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-2"
                        style={{ 
                          width: 60, 
                          height: 60, 
                          background: 'linear-gradient(135deg, #4682B4, #2E8B57)',
                          fontSize: '1.5rem' 
                        }}
                      >
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="m-0" style={{ color: theme === 'dark' ? '#e0e0e0' : '#333333' }}>
                      {user.full_name || user.email}
                    </p>
                  </div>
                )}
                
                <Nav className="flex-column">
                  <Nav.Link as={Link} to="/" className="ps-4 py-3 active" style={{
                    borderLeft: '4px solid #2E8B57',
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
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
                  <Nav.Link as={Link} to="/settings" className="ps-4 py-3" style={{
                    borderLeft: '4px solid transparent'
                  }}>
                    <i className="bi bi-gear me-2"></i> Настройки
                  </Nav.Link>
                </Nav>

                {user && (
                  <div className="p-4 mt-4">
                    <Card className="border-0 shadow-sm" style={{ 
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffffff',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <Card.Body className="p-0">
                        <div className="p-3" style={{
                          background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                        }}>
                          <h6 className="m-0 text-white">Мой прогресс</h6>
                        </div>
                        <div className="p-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>Текущий вес:</span>
                            <span style={{ fontWeight: 'bold' }}>{user.weight || '—'} кг</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>Целевой вес:</span>
                            <span style={{ fontWeight: 'bold' }}>{user.goal_weight || '—'} кг</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </div>
            </Col>
          ) : null}

          <Col xs={12} md={9} lg={10} className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="m-0">План питания</h2>
              <Button 
                as={Link}
                to="/create-recipe"
                variant="primary"
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-circle me-2"></i> Создать рецепт
              </Button>
            </div>

            <Card className="mb-4 shadow-sm" style={{ 
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
              borderRadius: '12px',
              border: 'none'
            }}>
              <Card.Body>
                <div className="d-flex justify-content-between overflow-auto pb-2">
                  {weekDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-2 rounded mx-1 ${isToday(day) ? 'text-white' : ''}`}
                      style={{ 
                        cursor: 'pointer',
                        minWidth: '80px',
                        background: isToday(day) 
                          ? 'linear-gradient(135deg, #2E8B57, #4682B4)' 
                          : selectedDate.getDate() === day.getDate() && !isToday(day) 
                            ? (theme === 'dark' ? '#444' : '#e9ecef') 
                            : 'transparent',
                        boxShadow: selectedDate.getDate() === day.getDate() ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        color: theme === 'dark' && !isToday(day) ? '#e0e0e0' : selectedDate.getDate() === day.getDate() && !isToday(day) ? '#333' : ''
                      }}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div>{formatDayName(day)}</div>
                      <div className="mt-1" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatDate(day)}</div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            <div className="d-flex align-items-center mb-4">
              <h4 className="m-0">
                План на {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              <Badge bg="primary" className="ms-2 py-2 px-3" style={{ borderRadius: '20px' }}>
                {Object.values(mealPlan).flat().length} блюд
              </Badge>
            </div>

            <Row>
              <Col md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm border-0" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div className="py-3 px-4" style={{ 
                    background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                    color: '#212529'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <i className="bi bi-cup-hot me-2"></i> Завтрак
                      </h5>
                      <Button 
                        variant="light" 
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={() => history.push('/recipes')}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                  <ListGroup variant="flush">
                    {mealPlan.breakfast.length > 0 ? (
                      mealPlan.breakfast.map(meal => (
                        <ListGroup.Item 
                          key={meal.id} 
                          style={{ 
                            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                            color: theme === 'dark' ? '#e0e0e0' : '#333333',
                            border: 'none',
                            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`
                          }}
                          className="d-flex align-items-center p-3"
                        >
                          <div 
                            className="rounded me-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                              backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#eee',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {!getRecipeImage(meal.recipe_id) && <i className="bi bi-card-image text-muted"></i>}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 'bold' }}>{getRecipeName(meal.recipe_id)}</div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#aaa' : '#777' }}>
                              {new Date(meal.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item 
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                          color: theme === 'dark' ? '#999' : '#777',
                          border: 'none',
                          padding: '2rem 1rem',
                          textAlign: 'center'
                        }}
                      >
                        <i className="bi bi-calendar-x mb-2" style={{ fontSize: '1.5rem', display: 'block' }}></i>
                        Ничего не запланировано
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>
              </Col>

              <Col md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm border-0" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div className="py-3 px-4" style={{ 
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: '#fff'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <i className="bi bi-egg-fried me-2"></i> Обед
                      </h5>
                      <Button 
                        variant="light" 
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={() => history.push('/recipes')}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                  <ListGroup variant="flush">
                    {mealPlan.lunch.length > 0 ? (
                      mealPlan.lunch.map(meal => (
                        <ListGroup.Item 
                          key={meal.id} 
                          style={{ 
                            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                            color: theme === 'dark' ? '#e0e0e0' : '#333333',
                            border: 'none',
                            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`
                          }}
                          className="d-flex align-items-center p-3"
                        >
                          <div 
                            className="rounded me-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                              backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#eee',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {!getRecipeImage(meal.recipe_id) && <i className="bi bi-card-image text-muted"></i>}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 'bold' }}>{getRecipeName(meal.recipe_id)}</div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#aaa' : '#777' }}>
                              {new Date(meal.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item 
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                          color: theme === 'dark' ? '#999' : '#777',
                          border: 'none',
                          padding: '2rem 1rem',
                          textAlign: 'center'
                        }}
                      >
                        <i className="bi bi-calendar-x mb-2" style={{ fontSize: '1.5rem', display: 'block' }}></i>
                        Ничего не запланировано
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>
              </Col>

              <Col md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm border-0" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div className="py-3 px-4" style={{ 
                    background: 'linear-gradient(135deg, #007bff, #6610f2)',
                    color: '#fff'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <i className="bi bi-moon me-2"></i> Ужин
                      </h5>
                      <Button 
                        variant="light" 
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={() => history.push('/recipes')}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                  <ListGroup variant="flush">
                    {mealPlan.dinner.length > 0 ? (
                      mealPlan.dinner.map(meal => (
                        <ListGroup.Item 
                          key={meal.id} 
                          style={{ 
                            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                            color: theme === 'dark' ? '#e0e0e0' : '#333333',
                            border: 'none',
                            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`
                          }}
                          className="d-flex align-items-center p-3"
                        >
                          <div 
                            className="rounded me-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                              backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#eee',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {!getRecipeImage(meal.recipe_id) && <i className="bi bi-card-image text-muted"></i>}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 'bold' }}>{getRecipeName(meal.recipe_id)}</div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#aaa' : '#777' }}>
                              {new Date(meal.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item 
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                          color: theme === 'dark' ? '#999' : '#777',
                          border: 'none',
                          padding: '2rem 1rem',
                          textAlign: 'center'
                        }}
                      >
                        <i className="bi bi-calendar-x mb-2" style={{ fontSize: '1.5rem', display: 'block' }}></i>
                        Ничего не запланировано
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>
              </Col>

              <Col md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm border-0" style={{ 
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div className="py-3 px-4" style={{ 
                    background: 'linear-gradient(135deg, #17a2b8, #20c997)',
                    color: '#fff'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <i className="bi bi-apple me-2"></i> Перекусы
                      </h5>
                      <Button 
                        variant="light" 
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={() => history.push('/recipes')}
                      >
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                  <ListGroup variant="flush">
                    {mealPlan.snack.length > 0 ? (
                      mealPlan.snack.map(meal => (
                        <ListGroup.Item 
                          key={meal.id} 
                          style={{ 
                            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                            color: theme === 'dark' ? '#e0e0e0' : '#333333',
                            border: 'none',
                            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`
                          }}
                          className="d-flex align-items-center p-3"
                        >
                          <div 
                            className="rounded me-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                              backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#eee',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {!getRecipeImage(meal.recipe_id) && <i className="bi bi-card-image text-muted"></i>}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 'bold' }}>{getRecipeName(meal.recipe_id)}</div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#aaa' : '#777' }}>
                              {new Date(meal.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item 
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff', 
                          color: theme === 'dark' ? '#999' : '#777',
                          border: 'none',
                          padding: '2rem 1rem',
                          textAlign: 'center'
                        }}
                      >
                        <i className="bi bi-calendar-x mb-2" style={{ fontSize: '1.5rem', display: 'block' }}></i>
                        Ничего не запланировано
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
            
            {recipes.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-3">Рекомендуемые рецепты</h4>
                <Row className="g-3">
                  {recipes.slice(0, 3).map(recipe => (
                    <Col md={6} lg={4} key={recipe.id}>
                      <Card className="h-100 shadow-sm border-0" style={{ 
                        backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => history.push(`/recipes/${recipe.id}`)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.06)';
                      }}
                      >
                        <div style={{ 
                          height: '140px', 
                          backgroundImage: recipe.image ? `url(https://back-c6rh.onrender.com${recipe.image})` : 'none',
                          backgroundColor: recipe.image ? 'transparent' : '#f5f5f5',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {!recipe.image && <i className="bi bi-card-image text-muted" style={{ fontSize: '2rem' }}></i>}
                        </div>
                        <Card.Body>
                          <Card.Title>{recipe.name}</Card.Title>
                          <div className="d-flex mt-2">
                            <div className="d-flex align-items-center me-3" style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
                              <i className="bi bi-clock me-1"></i> {recipe.cooking_time} мин
                            </div>
                            <div className="d-flex align-items-center" style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
                              <i className="bi bi-people me-1"></i> {recipe.serving} порц.
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {window.innerWidth <= 768 && <MobileNavigation activePage="home" theme={theme} />}
    </Container>
  );
};

export default HomePage;