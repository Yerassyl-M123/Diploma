import axios from 'axios';
import { useContext, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Nav, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import { ThemeContext } from '../contexts/ThemeContext';
import { useWindowSize } from '../hooks/useWindowSize';

const CreateRecipePage = () => {
  const history = useHistory();
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    serving: 1,
    cooking_time: 30,
    calories: 0,
    ingredients: [],
    steps: [],
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [stepInput, setStepInput] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ 
      ...recipe, 
      [name]: name === 'serving' || name === 'cooking_time' || name === 'calories' 
        ? Number(value) 
        : value 
    });
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setRecipe((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()],
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (indexToRemove) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAddStep = () => {
    if (stepInput.trim()) {
      setRecipe((prev) => ({
        ...prev,
        steps: [...prev.steps, stepInput.trim()],
      }));
      setStepInput('');
    }
  };

  const removeStep = (indexToRemove) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
    }
  };

  const validateForm = () => {
    if (!recipe.name.trim()) {
      setError('Необходимо указать название рецепта');
      return false;
    }
    if (!recipe.description.trim()) {
      setError('Добавьте описание рецепта');
      return false;
    }
    if (recipe.ingredients.length === 0) {
      setError('Добавьте хотя бы один ингредиент');
      return false;
    }
    if (recipe.steps.length === 0) {
      setError('Добавьте хотя бы один шаг приготовления');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError('');
      
      const formData = new FormData();
      formData.append('name', recipe.name);
      formData.append('description', recipe.description);
      formData.append('serving', recipe.serving);
      formData.append('cooking_time', recipe.cooking_time);
      formData.append('calories', recipe.calories || 0);
      formData.append('ingredients', JSON.stringify(recipe.ingredients));
      formData.append('steps', JSON.stringify(recipe.steps));
      
      if (image) {
        formData.append('image', image); 
      }

      const response = await axios.post(
        'https://back-c6rh.onrender.com/my-recipes',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      
      alert('Рецепт успешно создан!');
      history.push(`/recipes/${response.data.recipe.id}`);
    } catch (error) {
      console.error('Ошибка при создании рецепта:', error.response?.data || error.message);
      setError('Не удалось создать рецепт: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="px-0">
      <Row className="m-0 py-3 border-bottom shadow-sm mobile-header" style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000 
      }}>
        <Col xs={6} className="d-flex align-items-center">
        <img 
              src="/img/logo.png" 
              alt="NutriMind Logo"
              style={{ 
                height: '40px',
                marginRight: '10px'
              }}
            />
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
                  <i className="bi bi-camera me-2"></i> AI Сканер
                </Nav.Link>
                <Nav.Link as={Link} to="/chat" className="ps-4 py-3" style={{
                  borderLeft: '4px solid transparent'
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

          <Col xs={12} md={isMobile ? 12 : 9} lg={isMobile ? 12 : 10} 
               className={`${isMobile ? 'mobile-form-container' : 'p-4'}`}>
            <div className="mb-4">
              <h2>Создать новый рецепт</h2>
              <Badge bg="primary" className="mt-2">
                Поля, отмеченные * обязательны для заполнения
              </Badge>
            </div>

            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Card className="shadow-sm border-0 mb-4" style={{ 
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: '12px'
                  }}>
                    <Card.Header className="bg-primary text-white">
                      <h5 className="mb-0">Основная информация</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Название: *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={recipe.name}
                          onChange={handleChange}
                          placeholder="Введите название рецепта"
                          required
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Описание: *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          value={recipe.description}
                          onChange={handleChange}
                          placeholder="Опишите блюдо кратко"
                          required
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Количество порций: *</Form.Label>
                            <Form.Control
                              type="number"
                              name="serving"
                              value={recipe.serving}
                              onChange={handleChange}
                              min="1"
                              required
                              style={{
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Время приготовления (мин): *</Form.Label>
                            <Form.Control
                              type="number"
                              name="cooking_time"
                              value={recipe.cooking_time}
                              onChange={handleChange}
                              min="1"
                              required
                              style={{
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Калорийность (ккал):</Form.Label>
                            <Form.Control
                              type="number"
                              name="calories"
                              value={recipe.calories}
                              onChange={handleChange}
                              min="0"
                              style={{
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm border-0 mb-4" style={{ 
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: '12px'
                  }}>
                    <Card.Header className="bg-warning text-dark">
                      <h5 className="mb-0">Ингредиенты *</h5>
                    </Card.Header>
                    <Card.Body>
                      <InputGroup className="mb-3">
                        <Form.Control
                          value={ingredientInput}
                          onChange={(e) => setIngredientInput(e.target.value)}
                          placeholder="Введите ингредиент (например: 2 яблока, 150г муки)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                        <Button 
                          variant="warning" 
                          onClick={handleAddIngredient}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </InputGroup>

                      {recipe.ingredients.length > 0 ? (
                        <div className="mt-3 p-3 border rounded" style={{
                          backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {recipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                              <div>
                                <i className="bi bi-dash me-2 text-warning"></i>
                                {ingredient}
                              </div>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => removeIngredient(index)}
                                style={{ width: '30px', height: '30px', padding: 0 }}
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-3 text-muted">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          Добавьте хотя бы один ингредиент
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm border-0 mb-4" style={{ 
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: '12px'
                  }}>
                    <Card.Header className="bg-info text-dark">
                      <h5 className="mb-0">Шаги приготовления *</h5>
                    </Card.Header>
                    <Card.Body>
                      <InputGroup className="mb-3">
                        <Form.Control
                          value={stepInput}
                          onChange={(e) => setStepInput(e.target.value)}
                          placeholder="Введите шаг приготовления"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                        <Button 
                          variant="info" 
                          onClick={handleAddStep}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </InputGroup>

                      {recipe.steps.length > 0 ? (
                        <div className="mt-3 p-3 border rounded" style={{
                          backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                          maxHeight: '250px',
                          overflowY: 'auto'
                        }}>
                          {recipe.steps.map((step, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex">
                                <Badge pill bg="primary" className="me-2" style={{ minWidth: '24px', height: '24px' }}>
                                  {index + 1}
                                </Badge>
                                <div>{step}</div>
                              </div>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => removeStep(index)}
                                style={{ width: '30px', height: '30px', padding: 0 }}
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-3 text-muted">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          Добавьте хотя бы один шаг приготовления
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="shadow-sm border-0 mb-4" style={{ 
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: '12px'
                  }}>
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">Изображение</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Загрузить изображение:</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleImageChange}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                        <div className="mt-2 text-muted small">
                          <i className="bi bi-info-circle me-1"></i> 
                          Допустимые форматы: JPG, JPEG, PNG
                        </div>
                      </Form.Group>
                      
                      {previewImage ? (
                        <div className="mt-3">
                          <p className="fw-bold">Предпросмотр изображения:</p>
                          <div 
                            className="rounded mb-3" 
                            style={{ 
                              height: '200px',
                              backgroundImage: `url(${previewImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`
                            }}
                          ></div>
                        </div>
                      ) : (
                        <div className="mt-3 text-center p-4 rounded" style={{ 
                          backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                          border: `1px dashed ${theme === 'dark' ? '#666' : '#ccc'}`
                        }}>
                          <i className="bi bi-image" style={{ fontSize: '2rem', color: theme === 'dark' ? '#666' : '#aaa' }}></i>
                          <p className="mt-2 mb-0 text-muted">Предпросмотр изображения</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm border-0" style={{ 
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: '12px',
                    position: 'sticky',
                    top: '80px'
                  }}>
                    <Card.Header className="bg-primary text-white">
                      <h5 className="mb-0">Действия</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          type="submit" 
                          disabled={saving}
                          className="d-flex align-items-center justify-content-center"
                        >
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Создание...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Создать рецепт
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          as={Link} 
                          to="/recipes"
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Отменить
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </div>

      {isMobile && <MobileNavigation activePage="recipes" theme={theme} />}
    </Container>
  );
};

export default CreateRecipePage;