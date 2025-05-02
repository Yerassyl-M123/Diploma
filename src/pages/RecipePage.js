import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Nav, Row, Spinner, Tab } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/MobileStyles.css';

const RecipePage = () => {
  const { theme } = useContext(ThemeContext);
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('all');
  const [allRecipes, setAllRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/recipes');
        setAllRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке всех рецептов:', error);
        setError('Не удалось загрузить рецепты. Пожалуйста, попробуйте позже.');
      }
    };

    fetchAllRecipes();
  }, []);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/my-recipes', { withCredentials: true });
        setUserRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке рецептов пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, []);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        const response = await axios.get('https://back-c6rh.onrender.com/favorite-recipes', { withCredentials: true });
        setFavoriteRecipes(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке избранных рецептов:', error);
      }
    };

    fetchFavoriteRecipes();
  }, []);

  const handleCreateRecipe = () => {
    history.push('/create-recipe');
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await axios.delete(`https://back-c6rh.onrender.com/my-recipes/${recipeId}`, { withCredentials: true });
      setUserRecipes(userRecipes.filter((r) => r.id !== recipeId));
      
      setFavoriteRecipes(favoriteRecipes.filter((r) => r.id !== recipeId));
      
      setAllRecipes(allRecipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error('Ошибка при удалении рецепта:', error);
      setError('Не удалось удалить рецепт. Пожалуйста, попробуйте позже.');
    }
  };

  const toggleFavorite = async (recipe) => {
    try {
      const isInFavorites = favoriteRecipes.some(favRecipe => favRecipe.id === recipe.id);
      
      if (isInFavorites) {
        await axios.delete(`https://back-c6rh.onrender.com/favorite-recipes/${recipe.id}`, { withCredentials: true });
        setFavoriteRecipes(favoriteRecipes.filter(r => r.id !== recipe.id));
      } else {
        await axios.post(`https://back-c6rh.onrender.com/favorite-recipes/${recipe.id}`, {}, { withCredentials: true });
        setFavoriteRecipes([...favoriteRecipes, recipe]);
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      setError('Не удалось обновить избранное. Пожалуйста, попробуйте позже.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`https://back-c6rh.onrender.com/search-recipes?q=${searchQuery}`);
      setSearchResults(response.data);
      setActiveTab('search');
    } catch (error) {
      console.error('Ошибка при поиске рецептов:', error);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSearching(false);
    }
  };

  const isInFavorites = (recipeId) => {
    return favoriteRecipes.some(recipe => recipe.id === recipeId);
  };

  const RecipeCard = ({ recipe, isUserRecipe = false }) => {
    const imageUrl = recipe.image ? `https://back-c6rh.onrender.com${recipe.image}` : '';
    
    return (
      <Card 
        className="h-100 shadow-sm border-0" 
        style={{ 
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.06)';
        }}
      >
        <div 
          className="position-relative" 
          style={{ 
            height: '180px', 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundColor: imageUrl ? 'transparent' : (theme === 'dark' ? '#3d3d3d' : '#f5f5f5'),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
          onClick={() => history.push(`/recipes/${recipe.id}`)}
        >
          {!imageUrl && (
            <div className="d-flex align-items-center justify-content-center h-100">
              <i className="bi bi-card-image text-muted" style={{ fontSize: '2rem' }}></i>
            </div>
          )}
          
          <Button
            variant={theme === 'dark' ? 'dark' : 'light'}
            size="sm"
            className="position-absolute top-0 end-0 m-2 rounded-circle"
            style={{ width: '32px', height: '32px', padding: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe);
            }}
          >
            <i className={`bi ${isInFavorites(recipe.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
          </Button>
        </div>
        
        <Card.Body>
          <Card.Title 
            className="mb-2 text-truncate" 
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(`/recipes/${recipe.id}`)}
          >
            {recipe.name}
          </Card.Title>
          
          <Card.Text className="text-truncate mb-3" style={{ 
            fontSize: '0.9rem', 
            color: theme === 'dark' ? '#aaa' : '#6c757d' 
          }}>
            {recipe.description || 'Нет описания'}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex">
              <Badge bg="light" text="dark" className="me-2 d-flex align-items-center">
                <i className="bi bi-clock me-1"></i> {recipe.cooking_time} мин
              </Badge>
              <Badge bg="light" text="dark" className="me-2 d-flex align-items-center">
                <i className="bi bi-people me-1"></i> {recipe.serving} порц.
              </Badge>
              <Badge bg="light" text="dark" className="d-flex align-items-center">
                <i className="bi bi-fire me-1"></i> {recipe.calories || '0'} ккал
              </Badge>
            </div>
            
            {isUserRecipe && (
              <div className="d-flex">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-1 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    history.push(`/edit-recipe/${recipe.id}`);
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
                      handleDeleteRecipe(recipe.id);
                    }
                  }}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            )}
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
        {window.innerWidth > 768 && (
          <Col md={9} className="d-flex justify-content-end">
            <Form onSubmit={handleSearch} className="d-flex w-50">
              <InputGroup>
                <Form.Control
                  placeholder="Поиск рецептов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333'
                  }}
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </Button>
              </InputGroup>
            </Form>
          </Col>
        )}
      </Row>

      <div style={{ 
        paddingTop: '60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Row className="m-0 flex-grow-1">
          {window.innerWidth > 768 && (
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

          <Col 
            xs={12} 
            md={window.innerWidth > 768 ? 9 : 12} 
            lg={window.innerWidth > 768 ? 10 : 12} 
            className="p-4"
            style={{ 
              marginLeft: window.innerWidth > 768 ? '16.666667%' : 0,
              marginBottom: window.innerWidth <= 768 ? '60px' : 0
            }}
          >
            {window.innerWidth <= 768 && (
              <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup>
                  <Form.Control
                    placeholder="Поиск рецептов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#333'
                    }}
                  />
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </Button>
                </InputGroup>
              </Form>
            )}

            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="m-0">Рецепты</h2>
              <Button 
                variant="primary" 
                onClick={handleCreateRecipe}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-circle me-2"></i> Создать рецепт
              </Button>
            </div>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="all" style={{ 
                    color: activeTab === 'all' ? (theme === 'dark' ? '#fff' : '#333') : (theme === 'dark' ? '#aaa' : '#6c757d'),
                    backgroundColor: activeTab === 'all' ? (theme === 'dark' ? '#2a2a2a' : '#fff') : 'transparent',
                    border: activeTab === 'all' ? `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}` : 'none'
                  }}>
                    Все рецепты
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="my" style={{ 
                    color: activeTab === 'my' ? (theme === 'dark' ? '#fff' : '#333') : (theme === 'dark' ? '#aaa' : '#6c757d'),
                    backgroundColor: activeTab === 'my' ? (theme === 'dark' ? '#2a2a2a' : '#fff') : 'transparent',
                    border: activeTab === 'my' ? `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}` : 'none'
                  }}>
                    Мои рецепты
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="favorite" style={{ 
                    color: activeTab === 'favorite' ? (theme === 'dark' ? '#fff' : '#333') : (theme === 'dark' ? '#aaa' : '#6c757d'),
                    backgroundColor: activeTab === 'favorite' ? (theme === 'dark' ? '#2a2a2a' : '#fff') : 'transparent',
                    border: activeTab === 'favorite' ? `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}` : 'none'
                  }}>
                    Избранное
                  </Nav.Link>
                </Nav.Item>
                {activeTab === 'search' && (
                  <Nav.Item>
                    <Nav.Link eventKey="search" style={{ 
                      color: theme === 'dark' ? '#fff' : '#333',
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
                      border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`
                    }}>
                      Результаты поиска
                    </Nav.Link>
                  </Nav.Item>
                )}
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="all">
                  {allRecipes.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-journal-x mb-3" style={{ fontSize: '3rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                      <h4>Пока нет рецептов</h4>
                      <p>Создайте первый рецепт или дождитесь, пока другие пользователи добавят свои</p>
                    </div>
                  ) : (
                    <Row className="m-0">
                      {window.innerWidth <= 768 && (
                        <div className="mobile-search">
                          <Form onSubmit={handleSearch}>
                            <InputGroup>
                              <Form.Control
                                placeholder="Поиск рецептов..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              <Button variant="primary" type="submit" disabled={isSearching}>
                                {isSearching ? <Spinner animation="border" size="sm" /> : <i className="bi bi-search"></i>}
                              </Button>
                            </InputGroup>
                          </Form>
                        </div>
                      )}
                      <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-4 mobile-grid">
                        {allRecipes.map((recipe) => (
                          <Col key={recipe.id}>
                            <RecipeCard recipe={recipe} />
                          </Col>
                        ))}
                      </Row>
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="my">
                  {userRecipes.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-journal-plus mb-3" style={{ fontSize: '3rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                      <h4>У вас пока нет рецептов</h4>
                      <p>Создайте свой первый рецепт, нажав кнопку "Создать рецепт"</p>
                      <Button variant="primary" onClick={handleCreateRecipe}>
                        <i className="bi bi-plus-circle me-2"></i> Создать рецепт
                      </Button>
                    </div>
                  ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                      {userRecipes.map((recipe) => (
                        <Col key={recipe.id}>
                          <RecipeCard recipe={recipe} isUserRecipe={true} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="favorite">
                  {favoriteRecipes.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-heart mb-3" style={{ fontSize: '3rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                      <h4>У вас пока нет избранных рецептов</h4>
                      <p>Добавляйте рецепты в избранное, нажимая на иконку сердечка</p>
                    </div>
                  ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                      {favoriteRecipes.map((recipe) => (
                        <Col key={recipe.id}>
                          <RecipeCard recipe={recipe} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="search">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-search mb-3" style={{ fontSize: '3rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                      <h4>По запросу "{searchQuery}" ничего не найдено</h4>
                      <p>Попробуйте изменить запрос или проверить правильность написания</p>
                    </div>
                  ) : (
                    <>
                      <h5 className="mb-3">Результаты поиска по запросу: "{searchQuery}"</h5>
                      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                        {searchResults.map((recipe) => (
                          <Col key={recipe.id}>
                            <RecipeCard recipe={recipe} isUserRecipe={userRecipes.some(r => r.id === recipe.id)} />
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </div>

      {window.innerWidth <= 768 && (
        <Nav className="mobile-nav d-flex flex-row justify-content-around" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderTop: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
          <Nav.Link as={Link} to="/" className="flex-fill">
            <i className="bi bi-house-door"></i>
            <span>Главная</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/recipes" className="flex-fill active">
            <i className="bi bi-journal-text"></i>
            <span>Рецепты</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/profile" className="flex-fill">
            <i className="bi bi-person"></i>
            <span>Профиль</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/settings" className="flex-fill">
            <i className="bi bi-gear"></i>
            <span>Настройки</span>
          </Nav.Link>
        </Nav>
      )}
    </Container>
  );
};

export default RecipePage;