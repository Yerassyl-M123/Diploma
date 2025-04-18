import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Nav, Row, Spinner } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';

const EditRecipePage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { theme } = useContext(ThemeContext);
  const [recipe, setRecipe] = useState(null);
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`https://back-c6rh.onrender.com/recipes/${id}`, { 
          withCredentials: true 
        });
        const recipeData = response.data;
        setRecipe(recipeData);
        
        setIngredientsText(JSON.stringify(recipeData.ingredients, null, 2));
        setStepsText(JSON.stringify(recipeData.steps, null, 2));
        
        if (recipeData.image) {
          setPreviewImage(`https://back-c6rh.onrender.com${recipeData.image}`);
        }
      } catch (error) {
        console.error('Ошибка при загрузке рецепта:', error);
        setError('Не удалось загрузить рецепт');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleInputChange = (field, value) => {
    setRecipe({ ...recipe, [field]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
    }
  };

  const validateJson = (jsonString, fieldName) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      setError(`Некорректный JSON в поле "${fieldName}"`);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateJson(ingredientsText, 'Ингредиенты') || !validateJson(stepsText, 'Шаги')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const formData = new FormData();
      formData.append('name', recipe.name);
      formData.append('description', recipe.description);
      formData.append('serving', recipe.serving);
      formData.append('cooking_time', recipe.cooking_time);
      formData.append('calories', recipe.calories || 0); 
      formData.append('ingredients', ingredientsText);
      formData.append('steps', stepsText);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      await axios.put(`https://back-c6rh.onrender.com/my-recipes/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Рецепт успешно обновлён');
      history.push(`/recipes/${id}`);
    } catch (error) {
      console.error('Ошибка при обновлении рецепта:', error);
      setError('Не удалось обновить рецепт: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setSaving(false);
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
            to={`/recipes/${id}`}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i> Назад к рецепту
          </Button>
        </Col>
      </Row>

      <Row className="m-0">
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

        <Col xs={12} md={9} lg={10} className="p-4">
          <div className="mb-4">
            <h2>Редактировать рецепт</h2>
            <Badge bg="primary" className="mt-2">
              Вы редактируете: {recipe.name}
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

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
                    <Form.Label>Название:</Form.Label>
                    <Form.Control
                      type="text"
                      value={recipe.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#333',
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Описание:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={recipe.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      style={{
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#333',
                      }}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Количество порций:</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={recipe.serving}
                          onChange={(e) => handleInputChange('serving', parseInt(e.target.value) || 0)}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Время приготовления (мин):</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={recipe.cooking_time}
                          onChange={(e) => handleInputChange('cooking_time', parseInt(e.target.value) || 0)}
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
                          min="0"
                          value={recipe.calories || 0}
                          onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
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
                  <h5 className="mb-0">Ингредиенты (JSON формат)</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    style={{
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#333',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div className="mt-2 text-muted small">
                    <i className="bi bi-info-circle me-1"></i> 
                    Пример формата: ["2 яблока", "150г муки", "50г сахара"]
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0 mb-4" style={{ 
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                borderRadius: '12px'
              }}>
                <Card.Header className="bg-info text-dark">
                  <h5 className="mb-0">Шаги приготовления (JSON формат)</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    style={{
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#333',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div className="mt-2 text-muted small">
                    <i className="bi bi-info-circle me-1"></i> 
                    Пример формата: ["Подготовить ингредиенты", "Смешать все в миске", "Выпекать 30 минут"]
                  </div>
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
                  
                  {previewImage && (
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
                      onClick={handleSave} 
                      disabled={saving}
                      className="d-flex align-items-center justify-content-center"
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Сохранение...
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
                      as={Link} 
                      to={`/recipes/${id}`}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Отменить изменения
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default EditRecipePage;