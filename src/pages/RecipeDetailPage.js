import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, ListGroup, Nav, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { theme } = useContext(ThemeContext);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToMealPlan, setAddingToMealPlan] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const recipeResponse = await axios.get(`http://localhost:8080/recipes/${id}`);
        setRecipe(recipeResponse.data);
        
        try {
          const authResponse = await axios.get('http://localhost:8080/check-auth', { withCredentials: true });
          if (authResponse.status === 200) {
            const profileResponse = await axios.get('http://localhost:8080/profile', { withCredentials: true });
            setUserId(profileResponse.data.id);
            
            const favoritesResponse = await axios.get('http://localhost:8080/favorite-recipes', { withCredentials: true });
            const isInFavorites = favoritesResponse.data.some(favRecipe => favRecipe.id === parseInt(id));
            setIsFavorite(isInFavorites);
          }
        } catch (authError) {
          console.log('Пользователь не авторизован');
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить рецепт. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот рецепт?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/my-recipes/${id}`, { withCredentials: true });
      history.push('/recipes');
    } catch (error) {
      console.error('Ошибка при удалении рецепта:', error);
      setError('Не удалось удалить рецепт. Пожалуйста, попробуйте позже.');
    }
  };

  const handleEdit = () => {
    history.push(`/edit-recipe/${id}`);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:8080/favorite-recipes/${id}`, { withCredentials: true });
      } else {
        await axios.post(`http://localhost:8080/favorite-recipes/${id}`, {}, { withCredentials: true });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      setError('Не удалось обновить избранное. Пожалуйста, попробуйте позже.');
    }
  };

  const handleAddToPlan = async (mealType) => {
    setAddingToMealPlan(true);
    
    try {
      await axios.post(
        'http://localhost:8080/meal-plan',
        {
          recipe_id: parseInt(id),
          date: selectedDate,
          meal_type: mealType,
        },
        { withCredentials: true }
      );
      
      setShowDatePicker(false);
      setShowMealTypeSelector(false);
      
      alert(`Рецепт успешно добавлен в ${mealType === 'breakfast' ? 'завтрак' : 
                                         mealType === 'lunch' ? 'обед' : 
                                         mealType === 'dinner' ? 'ужин' : 'перекус'} 
             на ${new Date(selectedDate).toLocaleDateString()}`);
      
    } catch (error) {
      console.error('Ошибка при добавлении в план:', error);
      setError('Не удалось добавить рецепт в план. Пожалуйста, попробуйте позже.');
    } finally {
      setAddingToMealPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <Container className="py-5 text-center">
        <h2>Рецепт не найден</h2>
        <Button as={Link} to="/recipes" variant="primary" className="mt-3">
          Вернуться к рецептам
        </Button>
      </Container>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : 
                     (typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : []);
  
  const steps = Array.isArray(recipe.steps) ? recipe.steps : 
                (typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : []);
  
  const imageUrl = recipe.image ? `http://localhost:8080${recipe.image}` : '';

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm" style={{ 
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
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/recipes"
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i> Назад к рецептам
          </Button>
        </Col>
      </Row>

      <Row className="m-0">
        {/* Боковая навигация */}
        <Col xs={12} md={3} lg={2} className="p-0 border-end shadow-sm" style={{ 
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
            <Nav.Link as={Link} to="/recipes" className="ps-4 py-3 active" style={{
              borderLeft: '4px solid #2E8B57',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
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
            <Nav.Link as={Link} to="/settings" className="ps-4 py-3" style={{
              borderLeft: '4px solid transparent'
            }}>
              <i className="bi bi-gear me-2"></i> Настройки
            </Nav.Link>
          </Nav>
        </Col>

        {/* Основной контент */}
        <Col xs={12} md={9} lg={10} className="p-4">
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <div className="mb-4 d-flex justify-content-between align-items-center">
            <h1>{recipe.name}</h1>
            <div>
              {userId && (
                <Button 
                  variant={isFavorite ? 'danger' : 'outline-danger'} 
                  onClick={toggleFavorite}
                  className="me-2"
                >
                  <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </Button>
              )}
              {userId === recipe.user_id && (
                <>
                  <Button variant="outline-primary" onClick={handleEdit} className="me-2">
                    <i className="bi bi-pencil me-2"></i>Редактировать
                  </Button>
                  <Button variant="outline-danger" onClick={handleDelete}>
                    <i className="bi bi-trash me-2"></i>Удалить
                  </Button>
                </>
              )}
            </div>
          </div>

          <Row>
            <Col md={6} className="mb-4">
              <Card className="shadow-sm border-0" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {imageUrl ? (
                  <div style={{ 
                    height: '350px', 
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ 
                    height: '350px', 
                    backgroundColor: theme === 'dark' ? '#3d3d3d' : '#f5f5f5'
                  }}>
                    <i className="bi bi-card-image text-muted" style={{ fontSize: '4rem' }}></i>
                  </div>
                )}
                <Card.Body>
                  <Card.Text>{recipe.description}</Card.Text>
                  <div className="d-flex flex-wrap">
                    <Badge bg="light" text="dark" className="me-2 mb-2 p-2">
                      <i className="bi bi-clock me-1"></i> Время приготовления: {recipe.cooking_time} мин
                    </Badge>
                    <Badge bg="light" text="dark" className="me-2 mb-2 p-2">
                      <i className="bi bi-people me-1"></i> Порций: {recipe.serving}
                    </Badge>
                    <Badge bg="light" text="dark" className="mb-2 p-2">
                      <i className="bi bi-fire me-1"></i> Калорийность: {recipe.calories || '0'} ккал
                    </Badge>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mt-4 shadow-sm border-0" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Добавить в план питания</h5>
                </Card.Header>
                <Card.Body>
                  {/* Выбор даты */}
                  <div className="mb-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-100 mb-2"
                    >
                      <i className="bi bi-calendar me-2"></i>
                      {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Выберите дату'}
                    </Button>
                    
                    {showDatePicker && (
                      <div className="mt-2 p-2 border rounded">
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="form-control mb-2"
                        />
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => setShowDatePicker(false)}
                          className="w-100"
                        >
                          Подтвердить
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Выбор типа приема пищи */}
                  <Button 
                    variant="success" 
                    onClick={() => setShowMealTypeSelector(!showMealTypeSelector)}
                    className="w-100"
                    disabled={addingToMealPlan}
                  >
                    {addingToMealPlan ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Добавление...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Добавить в план питания
                      </>
                    )}
                  </Button>
                  
                  {showMealTypeSelector && (
                    <div className="mt-3">
                      <h6>Выберите прием пищи:</h6>
                      <Button 
                        variant="warning" 
                        block 
                        className="mb-2 w-100" 
                        onClick={() => handleAddToPlan('breakfast')}
                      >
                        <i className="bi bi-cup-hot me-2"></i> Завтрак
                      </Button>
                      <Button 
                        variant="success" 
                        block 
                        className="mb-2 w-100" 
                        onClick={() => handleAddToPlan('lunch')}
                      >
                        <i className="bi bi-egg-fried me-2"></i> Обед
                      </Button>
                      <Button 
                        variant="primary" 
                        block 
                        className="mb-2 w-100" 
                        onClick={() => handleAddToPlan('dinner')}
                      >
                        <i className="bi bi-moon me-2"></i> Ужин
                      </Button>
                      <Button 
                        variant="info" 
                        block 
                        className="w-100" 
                        onClick={() => handleAddToPlan('snack')}
                      >
                        <i className="bi bi-apple me-2"></i> Перекус
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4 shadow-sm border-0" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">Ингредиенты</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient, index) => (
                      <ListGroup.Item 
                        key={index}
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                          color: theme === 'dark' ? '#e0e0e0' : '#333333',
                          borderColor: theme === 'dark' ? '#444' : '#dee2e6'
                        }}
                      >
                        <i className="bi bi-check-circle-fill me-2 text-success"></i>
                        {ingredient}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item 
                      style={{ 
                        backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                        color: theme === 'dark' ? '#e0e0e0' : '#333333'
                      }}
                    >
                      Ингредиенты не указаны
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>

              <Card className="shadow-sm border-0" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <Card.Header className="bg-info text-dark">
                  <h5 className="mb-0">Способ приготовления</h5>
                </Card.Header>
                <Card.Body>
                  {steps.length > 0 ? (
                    <ol className="ps-3">
                      {steps.map((step, index) => (
                        <li key={index} className="mb-3">
                          <div className="d-flex">
                            <div className="me-3">
                              <Badge pill bg="primary" style={{ width: '24px', height: '24px' }} className="d-flex align-items-center justify-content-center">
                                {index + 1}
                              </Badge>
                            </div>
                            <div>{step}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>Шаги приготовления не указаны</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeDetailPage;