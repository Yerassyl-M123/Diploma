import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Nav, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../App';
import MobileNavigation from '../components/MobileNavigation';
import WeightTracking from '../components/WeightTracking';
import { ThemeContext } from '../contexts/ThemeContext';
import { useWindowSize } from '../hooks/useWindowSize';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    gender: '',
    weight: '',
    goal_weight: '',
    profile_picture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [mealPlan, setMealPlan] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [loadingMealPlan, setLoadingMealPlan] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recipes, setRecipes] = useState([]); 
  
  const history = useHistory();
  const { theme } = useContext(ThemeContext);
  const { refreshAuth } = useContext(AuthContext);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/profile', {
          withCredentials: true
        });
        setUser(response.data);
        setEditForm({
          full_name: response.data.full_name || '',
          gender: response.data.gender || '',
          weight: response.data.weight ? String(response.data.weight) : '',
          goal_weight: response.data.goal_weight ? String(response.data.goal_weight) : '',
          profile_picture: null
        });
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при получении данных профиля:', err);
        setError('Не удалось загрузить данные профиля');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
            history.push('/welcome');
        }
      }
    };

    fetchUserProfile();
  }, [history]);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        setLoadingFavorites(true);
        const response = await axios.get('https://back-c6rh.onrender.com/favorite-recipes', { 
          withCredentials: true 
        });
        setFavoriteRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке избранных рецептов:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavoriteRecipes();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/recipes');
        setRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке рецептов:', error);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchMealPlan = async () => {
      try {
        setLoadingMealPlan(true);
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
      } finally {
        setLoadingMealPlan(false);
      }
    };
    
    fetchMealPlan();
  }, [selectedDate]);

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe ? recipe.name : `Рецепт #${recipeId}`;
  };

  const getRecipeImage = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe && recipe.image ? `https://back-c6rh.onrender.com${recipe.image}` : null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const goToRecipe = (recipeId) => {
    history.push(`/recipes/${recipeId}`);
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({
        ...editForm,
        profile_picture: file
      });
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('full_name', editForm.full_name);
      formData.append('gender', editForm.gender);
      formData.append('weight', editForm.weight);
      formData.append('goal_weight', editForm.goal_weight);
      
      if (editForm.profile_picture) {
        formData.append('profile_picture', editForm.profile_picture);
      }
      
      const response = await axios.put('https://back-c6rh.onrender.com/profile', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(response.data.user);
      setUpdateSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль: ' + (err.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const RecipeCard = ({ recipe }) => {
    const imageUrl = recipe.image ? `https://back-c6rh.onrender.com${recipe.image}` : '';
    
    return (
      <Card 
        className="h-100 shadow-sm border-0" 
        style={{ 
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
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundColor: imageUrl ? 'transparent' : (theme === 'dark' ? '#3d3d3d' : '#f5f5f5'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!imageUrl && <i className="bi bi-card-image text-muted" style={{ fontSize: '2rem' }}></i>}
        </div>
        <Card.Body>
          <Card.Title className="mb-2 text-truncate">{recipe.name}</Card.Title>
          <Card.Text className="text-truncate mb-2" style={{ 
            fontSize: '0.9rem', 
            color: theme === 'dark' ? '#aaa' : '#6c757d' 
          }}>
            {recipe.description || 'Нет описания'}
          </Card.Text>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex">
              <Badge bg="light" text="dark" className="me-1">
                <i className="bi bi-clock me-1"></i> {recipe.cooking_time} мин
              </Badge>
              <Badge bg="light" text="dark">
                <i className="bi bi-people me-1"></i> {recipe.serving} порц.
              </Badge>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm mobile-header" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000 
      }}>
        <Col xs={6} className="d-flex align-items-center">
          <h1 className="m-0">
            <Link to="/" className="text-decoration-none">
              <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
              <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
            </Link>
          </h1>
        </Col>
        <Col xs={6} className="d-flex justify-content-end align-items-center">
          {/* <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
            onClick={() => setShowEditModal(true)}
            className="me-2 d-flex align-items-center"
          >
            <i className="bi bi-pencil me-2"></i> Редактировать
          </Button> */}
          <Button 
            variant={theme === 'dark' ? 'outline-danger' : 'outline-danger'} 
            onClick={handleSignOut}
            className="d-flex align-items-center"
          >
            <i className="bi bi-box-arrow-right me-2"></i> Выйти
          </Button>
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
                <Nav.Link as={Link} to="/profile" className="ps-4 py-3 active" style={{
                  borderLeft: '4px solid #2E8B57',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
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
            </Col>
          )}

          <Col xs={12} md={isMobile ? 12 : 9} lg={isMobile ? 12 : 10} 
               className={`${isMobile ? 'px-3' : 'p-4'}`}>
            {isMobile && (
              <div className="mobile-profile-header">
                {user?.profile_picture ? (
                  <img 
                    src={`https://back-c6rh.onrender.com${user.profile_picture}`} 
                    alt="Фото профиля" 
                    className="rounded-circle mobile-profile-image"
                  />
                ) : (
                  <div className="mobile-profile-image rounded-circle mx-auto d-flex justify-content-center align-items-center">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h4>{user?.full_name || user?.username}</h4>
                <p className="text-muted mb-3">{user?.email}</p>
              </div>
            )}

              <div className="mb-4">
                <h2 className="mb-2">Личный кабинет</h2>
                <p className="text-muted">Управляйте своим профилем и отслеживайте прогресс</p>
              </div>
              
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              
              {user && (
                <Row>
                  <Col md={5} lg={4} xl={3}>
                    <Card className="shadow-sm border-0 mb-4" style={{ 
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      borderRadius: '12px'
                    }}>
                      <Card.Body className="text-center py-4">
                        {user.profile_picture ? (
                          <img 
                            src={`https://back-c6rh.onrender.com${user.profile_picture}`} 
                            alt="Фото профиля" 
                            className="rounded-circle mb-3"
                            style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #4682B4' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle mx-auto mb-3 d-flex justify-content-center align-items-center"
                            style={{ 
                              width: '120px', 
                              height: '120px', 
                              background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                              color: 'white',
                              fontSize: '3rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        
                        <h4 className="mb-1">{user.full_name || user.username}</h4>
                        <p className="text-muted mb-3">{user.email}</p>
                        
                        <div className="d-flex justify-content-center mb-3">
                          <Badge bg="primary" className="me-2 px-3 py-2">
                            <i className="bi bi-person-fill me-1"></i> {user.role}
                          </Badge>
                          <Badge bg={user.gender ? 'info' : 'secondary'} className="px-3 py-2">
                            <i className={`bi bi-gender-${user.gender === 'male' ? 'male' : (user.gender === 'female' ? 'female' : 'ambiguous')}`}></i>
                            {' '}
                            {user.gender === 'male' ? 'Мужчина' : (user.gender === 'female' ? 'Женщина' : 'Не указан')}
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="outline-primary" 
                          className="w-100 d-flex align-items-center justify-content-center"
                          onClick={() => setShowEditModal(true)}
                        >
                          <i className="bi bi-pencil-square me-2"></i> Редактировать профиль
                        </Button>
                      </Card.Body>
                    </Card>
                    
                    <Card className="shadow-sm border-0 mb-4" style={{ 
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      borderRadius: '12px'
                    }}>
                      <Card.Header className="bg-primary text-white">
                        <h5 className="mb-0">Информация о весе</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Текущий вес:</span>
                            <span className="fw-bold">{user.weight ? `${user.weight} кг` : 'Не указан'}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Целевой вес:</span>
                            <span className="fw-bold">{user.goal_weight ? `${user.goal_weight} кг` : 'Не указан'}</span>
                          </div>
                        </div>
                        
                        {user.weight && user.goal_weight && (
                          <div className="mt-3">
                            <p className="mb-1 text-center">Прогресс к цели:</p>
                            <div className="position-relative pt-1">
                              <div className="progress" style={{ height: '15px', borderRadius: '8px' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${Math.min(100, Math.max(0, 100 - (Math.abs(user.weight - user.goal_weight) / Math.max(user.weight, user.goal_weight) * 100)))}%`,
                                    backgroundColor: user.weight === user.goal_weight ? '#28a745' : '#007bff'
                                  }} 
                                  aria-valuenow={Math.min(100, Math.max(0, 100 - (Math.abs(user.weight - user.goal_weight) / Math.max(user.weight, user.goal_weight) * 100)))} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              {user.weight === user.goal_weight && (
                                <Badge bg="success" className="mt-2 d-block text-center w-100">
                                  <i className="bi bi-emoji-smile me-1"></i> Цель достигнута!
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={7} lg={8} xl={9}>
                    <Card className="shadow-sm border-0 mb-4" style={{ 
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      borderRadius: '12px'
                    }}>
                      <Card.Header className="bg-info text-white">
                        <h5 className="mb-0">Отслеживание и аналитика</h5>
                      </Card.Header>
                      <Card.Body>
                        <Tabs defaultActiveKey="weight" className="mb-3">
                          <Tab eventKey="weight" title={<span><i className="bi bi-graph-up me-2"></i>Отслеживание веса</span>}>
                            <WeightTracking 
                              currentWeight={user.weight} 
                              goalWeight={user.goal_weight} 
                            />
                          </Tab>
                          <Tab eventKey="nutrition" title={<span><i className="bi bi-cup-hot me-2"></i>Питание</span>}>
                            {loadingMealPlan ? (
                              <div className="text-center p-5">
                                <Spinner animation="border" />
                              </div>
                            ) : Object.values(mealPlan).flat().length > 0 ? (
                              <div className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h5>План питания на {formatDate(selectedDate)}</h5>
                                  <div>
                                    <Button variant="outline-primary" size="sm" onClick={() => changeDate(-1)} className="me-2">
                                      <i className="bi bi-arrow-left"></i>
                                    </Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => setSelectedDate(new Date())}>
                                      Сегодня
                                    </Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => changeDate(1)} className="ms-2">
                                      <i className="bi bi-arrow-right"></i>
                                    </Button>
                                  </div>
                                </div>
                                
                                {mealPlan.breakfast.length > 0 && (
                                  <div className="mb-4">
                                    <h6 className="mb-2"><i className="bi bi-cup-hot me-2"></i>Завтрак</h6>
                                    <Row xs={1} md={2} lg={3} className="g-3">
                                      {mealPlan.breakfast.map(meal => (
                                        <Col key={meal.id}>
                                          <Card 
                                            className="shadow-sm border-0 h-100" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => goToRecipe(meal.recipe_id)}
                                          >
                                            <div className="d-flex align-items-center p-2">
                                              <div 
                                                className="rounded me-3" 
                                                style={{ 
                                                  width: '50px', 
                                                  height: '50px', 
                                                  backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                                                  backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#f5f5f5',
                                                  backgroundSize: 'cover',
                                                  backgroundPosition: 'center'
                                                }}
                                              ></div>
                                              <div>
                                                <div className="fw-bold">{getRecipeName(meal.recipe_id)}</div>
                                              </div>
                                            </div>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  </div>
                                )}
                                
                                {mealPlan.lunch.length > 0 && (
                                  <div className="mb-4">
                                    <h6 className="mb-2"><i className="bi bi-egg-fried me-2"></i>Обед</h6>
                                    <Row xs={1} md={2} lg={3} className="g-3">
                                      {mealPlan.lunch.map(meal => (
                                        <Col key={meal.id}>
                                          <Card 
                                            className="shadow-sm border-0 h-100" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => goToRecipe(meal.recipe_id)}
                                          >
                                            <div className="d-flex align-items-center p-2">
                                              <div 
                                                className="rounded me-3" 
                                                style={{ 
                                                  width: '50px', 
                                                  height: '50px', 
                                                  backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                                                  backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#f5f5f5',
                                                  backgroundSize: 'cover',
                                                  backgroundPosition: 'center'
                                                }}
                                              ></div>
                                              <div>
                                                <div className="fw-bold">{getRecipeName(meal.recipe_id)}</div>
                                              </div>
                                            </div>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  </div>
                                )}
                                
                                {mealPlan.dinner.length > 0 && (
                                  <div className="mb-4">
                                    <h6 className="mb-2"><i className="bi bi-moon me-2"></i>Ужин</h6>
                                    <Row xs={1} md={2} lg={3} className="g-3">
                                      {mealPlan.dinner.map(meal => (
                                        <Col key={meal.id}>
                                          <Card 
                                            className="shadow-sm border-0 h-100" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => goToRecipe(meal.recipe_id)}
                                          >
                                            <div className="d-flex align-items-center p-2">
                                              <div 
                                                className="rounded me-3" 
                                                style={{ 
                                                  width: '50px', 
                                                  height: '50px', 
                                                  backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                                                  backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#f5f5f5',
                                                  backgroundSize: 'cover',
                                                  backgroundPosition: 'center'
                                                }}
                                              ></div>
                                              <div>
                                                <div className="fw-bold">{getRecipeName(meal.recipe_id)}</div>
                                              </div>
                                            </div>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  </div>
                                )}
                                
                                {mealPlan.snack.length > 0 && (
                                  <div>
                                    <h6 className="mb-2"><i className="bi bi-apple me-2"></i>Перекусы</h6>
                                    <Row xs={1} md={2} lg={3} className="g-3">
                                      {mealPlan.snack.map(meal => (
                                        <Col key={meal.id}>
                                          <Card 
                                            className="shadow-sm border-0 h-100" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => goToRecipe(meal.recipe_id)}
                                          >
                                            <div className="d-flex align-items-center p-2">
                                              <div 
                                                className="rounded me-3" 
                                                style={{ 
                                                  width: '50px', 
                                                  height: '50px', 
                                                  backgroundImage: getRecipeImage(meal.recipe_id) ? `url(${getRecipeImage(meal.recipe_id)})` : 'none',
                                                  backgroundColor: getRecipeImage(meal.recipe_id) ? 'transparent' : '#f5f5f5',
                                                  backgroundSize: 'cover',
                                                  backgroundPosition: 'center'
                                                }}
                                              ></div>
                                              <div>
                                                <div className="fw-bold">{getRecipeName(meal.recipe_id)}</div>
                                              </div>
                                            </div>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 text-center">
                                <i className="bi bi-clipboard-data mb-3" style={{fontSize: '3rem', color: theme === 'dark' ? '#aaa' : '#6c757d'}}></i>
                                <h4>План питания на сегодня пуст</h4>
                                <p>Добавьте рецепты в ваш план питания, чтобы видеть их здесь.</p>
                                <Button as={Link} to="/" variant="outline-primary">
                                  <i className="bi bi-plus-circle me-2"></i>
                                  Перейти к созданию плана
                                </Button>
                              </div>
                            )}
                          </Tab>
                          <Tab eventKey="favorites" title={<span><i className="bi bi-heart me-2"></i>Избранные рецепты</span>}>
                            {loadingFavorites ? (
                              <div className="text-center p-5">
                                <Spinner animation="border" />
                              </div>
                            ) : favoriteRecipes.length > 0 ? (
                              <div className="p-3">
                                <Row xs={1} md={2} lg={3} xl={4} className="g-3">
                                  {favoriteRecipes.map(recipe => (
                                    <Col key={recipe.id}>
                                      <RecipeCard recipe={recipe} />
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            ) : (
                              <div className="p-4 text-center">
                                <i className="bi bi-bookmark-heart mb-3" style={{fontSize: '3rem', color: theme === 'dark' ? '#aaa' : '#6c757d'}}></i>
                                <h4>У вас пока нет избранных рецептов</h4>
                                <p>Добавляйте понравившиеся рецепты в избранное, чтобы быстро находить их здесь.</p>
                                <Button as={Link} to="/recipes" variant="outline-primary">
                                  <i className="bi bi-search me-2"></i>
                                  Найти рецепты
                                </Button>
                              </div>
                            )}
                          </Tab>
                        </Tabs>
                      </Card.Body>
                    </Card>
                    
                    <Card className="shadow-sm border-0" style={{ 
                      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                      borderRadius: '12px'
                    }}>
                      <Card.Header className="bg-success text-white">
                        <h5 className="mb-0">Полезные советы</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex mb-3">
                          <div className="flex-shrink-0">
                            <i className="bi bi-lightbulb-fill me-3" style={{fontSize: '2rem', color: '#ffc107'}}></i>
                          </div>
                          <div>
                            <h5>Не пропускайте приемы пищи</h5>
                            <p className="mb-0">Регулярное питание помогает поддерживать стабильный уровень сахара в крови и предотвращает переедание.</p>
                          </div>
                        </div>
                        
                        <div className="d-flex mb-3">
                          <div className="flex-shrink-0">
                            <i className="bi bi-droplet-fill me-3" style={{fontSize: '2rem', color: '#17a2b8'}}></i>
                          </div>
                          <div>
                            <h5>Пейте достаточно воды</h5>
                            <p className="mb-0">Вода помогает контролировать аппетит и улучшает обмен веществ. Стремитесь выпивать 8 стаканов в день.</p>
                          </div>
                        </div>
                        
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <i className="bi bi-heart-pulse-fill me-3" style={{fontSize: '2rem', color: '#dc3545'}}></i>
                          </div>
                          <div>
                            <h5>Двигайтесь каждый день</h5>
                            <p className="mb-0">Даже небольшая физическая активность улучшает настроение и помогает поддерживать здоровый вес.</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
              
              <Modal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)} 
                size="lg"
                centered
                backdrop="static"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'
                }}
              >
                <Modal.Header 
                  closeButton
                  style={{
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6',
                    color: theme === 'dark' ? '#fff' : '#212529'
                  }}
                >
                  <Modal.Title>Редактирование профиля</Modal.Title>
                </Modal.Header>
                <Modal.Body
                  style={{
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#212529'
                  }}
                >
                  {updateSuccess && (
                    <Alert variant="success">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Профиль успешно обновлен!
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleEditSubmit}>
                    <Row>
                      <Col md={4} className="text-center mb-4">
                        <Form.Group>
                          <Form.Label className="fw-bold mb-3">Фото профиля</Form.Label>
                          <div className="d-flex flex-column align-items-center">
                            {previewImage ? (
                              <img 
                                src={previewImage} 
                                alt="Превью" 
                                className="rounded-circle mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #4682B4' }}
                              />
                            ) : user.profile_picture ? (
                              <img 
                                src={`https://back-c6rh.onrender.com${user.profile_picture}`} 
                                alt="Текущее фото" 
                                className="rounded-circle mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #4682B4' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle mb-3 d-flex justify-content-center align-items-center"
                                style={{ 
                                  width: '150px', 
                                  height: '150px', 
                                  background: 'linear-gradient(135deg, #2E8B57, #4682B4)',
                                  color: 'white',
                                  fontSize: '4rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <Form.Control 
                              type="file" 
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handleFileChange}
                              className="mt-2"
                              style={{
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                              }}
                            />
                            <div className="text-muted small mt-2">
                              <i className="bi bi-info-circle me-1"></i>
                              Допустимые форматы: JPG, JPEG, PNG
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Полное имя</Form.Label>
                          <Form.Control 
                            type="text" 
                            name="full_name"
                            value={editForm.full_name}
                            onChange={handleInputChange}
                            placeholder="Введите ваше полное имя"
                            style={{
                              backgroundColor: theme === 'dark' ? '#333' : '#fff',
                              color: theme === 'dark' ? '#fff' : '#333',
                            }}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Пол</Form.Label>
                          <Form.Select 
                            name="gender"
                            value={editForm.gender}
                            onChange={handleInputChange}
                            style={{
                              backgroundColor: theme === 'dark' ? '#333' : '#fff',
                              color: theme === 'dark' ? '#fff' : '#333',
                            }}
                          >
                            <option value="">Выберите пол</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                            <option value="other">Другой</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Текущий вес (кг)</Form.Label>
                              <Form.Control 
                                type="number" 
                                step="0.1"
                                min="0"
                                name="weight"
                                value={editForm.weight}
                                onChange={handleInputChange}
                                placeholder="Введите ваш текущий вес"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                  color: theme === 'dark' ? '#fff' : '#333',
                                }}
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Целевой вес (кг)</Form.Label>
                              <Form.Control 
                                type="number" 
                                step="0.1"
                                min="0"
                                name="goal_weight"
                                value={editForm.goal_weight}
                                onChange={handleInputChange}
                                placeholder="Введите ваш целевой вес"
                                style={{
                                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                  color: theme === 'dark' ? '#fff' : '#333',
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="d-grid gap-2 mt-4">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={isSubmitting}
                            className="d-flex align-items-center justify-content-center"
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                <span>Сохранение...</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Сохранить изменения
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowEditModal(false)}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Отмена
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </Modal.Body>
              </Modal>
            </Col>
          </Row>
        </div>

      {isMobile && <MobileNavigation activePage="profile" theme={theme} />}
    </Container>
  );
};

export default ProfilePage;