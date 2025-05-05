import axios from 'axios';
import { useContext, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Image, Nav, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import { ThemeContext } from '../contexts/ThemeContext';

const AiScannerPage = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      setError('Пожалуйста, выберите изображение в формате JPEG или PNG');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла не должен превышать 10MB');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setScanResult(null);
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Пожалуйста, выберите изображение для сканирования');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('https://back-c6rh.onrender.com/analyze-product', formData, {
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setScanResult(response.data);
    } catch (err) {
      console.error('Ошибка при сканировании:', err);
      setError(err.response?.data?.error || 'Не удалось выполнить сканирование. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    return (
      <Card 
        className="mt-4 shadow-sm" 
        style={{
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
          borderColor: theme === 'dark' ? '#444' : '#dee2e6',
          color: theme === 'dark' ? '#fff' : '#212529'
        }}
      >
        <Card.Header 
          as="h5" 
          className="d-flex align-items-center"
          style={{ 
            backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
            borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
          }}
        >
          <i className="bi bi-card-checklist me-2"></i>
          Результаты анализа
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Основная информация</h5>
              <p>
                <strong>Название:</strong> {scanResult.productName}
              </p>
              <p>
                <strong>Статус Халяль:</strong>{' '}
                {scanResult.isHalal ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Халяль
                  </span>
                ) : (
                  <span className="text-danger">
                    <i className="bi bi-x-circle-fill me-1"></i>
                    Не Халяль
                  </span>
                )}
              </p>
              <p>
                <strong>Калорийность:</strong> {scanResult.calories} ккал на 100г
              </p>
              <p>
                <strong>Белки:</strong> {scanResult.proteins}г
              </p>
              <p>
                <strong>Жиры:</strong> {scanResult.fats}г
              </p>
              <p>
                <strong>Углеводы:</strong> {scanResult.carbohydrates}г
              </p>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Состав</h5>
              <div 
                className="p-3 rounded" 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderLeft: `4px solid ${scanResult.isHalal ? '#28a745' : '#dc3545'}`
                }}
              >
                {scanResult.ingredients.map((ingredient, index) => (
                  <div key={index} className="mb-1">
                    • {ingredient.name}{' '}
                    {ingredient.isHalal ? (
                      <i className="bi bi-check text-success"></i>
                    ) : (
                      <i className="bi bi-x text-danger"></i>
                    )}
                  </div>
                ))}
              </div>
              
              {scanResult.warnings && scanResult.warnings.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Предупреждения:
                  </h6>
                  <ul className="ps-3">
                    {scanResult.warnings.map((warning, index) => (
                      <li key={index} className="text-warning">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="px-0">
      <div className="mobile-header">
        <Row className="m-0 py-2" style={{ 
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
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
      </div>

      <div className="mobile-content">
        {!isMobile ? (
          <Row className="m-0">
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
                <Nav.Link as={Link} to="/ai-scanner" className="ps-4 py-3 active" style={{
                  borderLeft: '4px solid #2E8B57',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e9ecef'
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

            <Col md={9} lg={10} className="p-4">
              <Row className="mb-4">
                <Col>
                  <h1 className="mb-2">AI Сканер Продуктов</h1>
                  <p className="text-muted">
                    Загрузите фотографию продукта, и наш ИИ определит его состав, калорийность и статус Халяль/Харам.
                  </p>
                </Col>
              </Row>

              {error && <Alert variant="danger">{error}</Alert>}

              <Card 
                className="mb-4 shadow-sm" 
                style={{
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                  borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                  color: theme === 'dark' ? '#fff' : '#212529'
                }}
              >
                <Card.Header 
                  as="h5" 
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
                  }}
                >
                  <i className="bi bi-upload me-2"></i>
                  Загрузка изображения
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label>Выберите изображение продукта</Form.Label>
                        <Form.Control
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleImageChange}
                          style={{
                            backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#333',
                            borderColor: theme === 'dark' ? '#555' : '#ced4da'
                          }}
                        />
                        <Form.Text className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                          Поддерживаемые форматы: JPG, JPEG, PNG. Максимальный размер: 10MB
                        </Form.Text>
                      </Form.Group>

                      <div className="d-grid gap-2 mt-3">
                        <Button 
                          variant="primary" 
                          onClick={handleScan}
                          disabled={!selectedImage || loading}
                          className="d-flex align-items-center justify-content-center"
                        >
                          {loading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                              Сканирование...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-camera me-2"></i>
                              Сканировать продукт
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={resetScan}
                          disabled={!selectedImage || loading}
                        >
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Сбросить
                        </Button>
                      </div>

                      {loading && (
                        <div className="mt-3">
                          <ProgressBar 
                            animated 
                            now={uploadProgress} 
                            label={`${uploadProgress}%`} 
                            variant="success" 
                          />
                          <p className="text-center mt-2">
                            Анализируем изображение... Пожалуйста, подождите.
                          </p>
                        </div>
                      )}
                    </Col>
                    <Col md={6} className="d-flex align-items-center justify-content-center">
                      <div
                        className="d-flex align-items-center justify-content-center rounded border"
                        style={{
                          width: '100%',
                          height: '280px',
                          borderColor: theme === 'dark' ? '#555' : '#dee2e6',
                          backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                          overflow: 'hidden'
                        }}
                      >
                        {previewUrl ? (
                          <Image 
                            src={previewUrl} 
                            alt="Предпросмотр продукта" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              objectFit: 'contain' 
                            }} 
                          />
                        ) : (
                          <div className="text-center p-4">
                            <i className="bi bi-camera" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                            <p className="mt-3 mb-0">Предпросмотр изображения</p>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {renderScanResult()}

              <div className="mt-5">
                <h4 className="mb-3">Как это работает?</h4>
                <Card 
                  style={{
                    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                    borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                    color: theme === 'dark' ? '#fff' : '#212529'
                  }}
                >
                  <Card.Body>
                    <div className="d-flex mb-4">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                        <i className="bi bi-1-circle-fill text-white fs-4"></i>
                      </div>
                      <div>
                        <h5>Загрузите фото</h5>
                        <p className="mb-0">Сделайте фото продукта или выберите готовое изображение из галереи.</p>
                      </div>
                    </div>
                    
                    <div className="d-flex mb-4">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                        <i className="bi bi-2-circle-fill text-white fs-4"></i>
                      </div>
                      <div>
                        <h5>ИИ анализирует состав</h5>
                        <p className="mb-0">Нейросеть распознает продукт и анализирует его состав по изображению.</p>
                      </div>
                    </div>
                    
                    <div className="d-flex">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                        <i className="bi bi-3-circle-fill text-white fs-4"></i>
                      </div>
                      <div>
                        <h5>Получите результат</h5>
                        <p className="mb-0">Вы увидите детальную информацию о продукте, включая его статус Халяль/Харам, калорийность и состав.</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        ) : (
          <div className="p-3">
            <Row className="mb-4">
              <Col>
                <h1 className="mb-2">AI Сканер Продуктов</h1>
                <p className="text-muted">
                  Загрузите фотографию продукта, и наш ИИ определит его состав, калорийность и статус Халяль/Харам.
                </p>
              </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card 
              className="mb-4 shadow-sm" 
              style={{
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                color: theme === 'dark' ? '#fff' : '#212529'
              }}
            >
              <Card.Header 
                as="h5" 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #dee2e6' 
                }}
              >
                <i className="bi bi-upload me-2"></i>
                Загрузка изображения
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3 mb-md-0">
                    <Form.Group>
                      <Form.Label>Выберите изображение продукта</Form.Label>
                      <Form.Control
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageChange}
                        style={{
                          backgroundColor: theme === 'dark' ? '#333' : '#fff',
                          color: theme === 'dark' ? '#fff' : '#333',
                          borderColor: theme === 'dark' ? '#555' : '#ced4da'
                        }}
                      />
                      <Form.Text className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                        Поддерживаемые форматы: JPG, JPEG, PNG. Максимальный размер: 10MB
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2 mt-3">
                      <Button 
                        variant="primary" 
                        onClick={handleScan}
                        disabled={!selectedImage || loading}
                        className="d-flex align-items-center justify-content-center"
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Сканирование...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-camera me-2"></i>
                            Сканировать продукт
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={resetScan}
                        disabled={!selectedImage || loading}
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Сбросить
                      </Button>
                    </div>

                    {loading && (
                      <div className="mt-3">
                        <ProgressBar 
                          animated 
                          now={uploadProgress} 
                          label={`${uploadProgress}%`} 
                          variant="success" 
                        />
                        <p className="text-center mt-2">
                          Анализируем изображение... Пожалуйста, подождите.
                        </p>
                      </div>
                    )}
                  </Col>
                  <Col md={6} className="d-flex align-items-center justify-content-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded border"
                      style={{
                        width: '100%',
                        height: '280px',
                        borderColor: theme === 'dark' ? '#555' : '#dee2e6',
                        backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
                        overflow: 'hidden'
                      }}
                    >
                      {previewUrl ? (
                        <Image 
                          src={previewUrl} 
                          alt="Предпросмотр продукта" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                          }} 
                        />
                      ) : (
                        <div className="text-center p-4">
                          <i className="bi bi-camera" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                          <p className="mt-3 mb-0">Предпросмотр изображения</p>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {renderScanResult()}

            <div className="mt-5">
              <h4 className="mb-3">Как это работает?</h4>
              <Card 
                style={{
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
                  borderColor: theme === 'dark' ? '#444' : '#dee2e6',
                  color: theme === 'dark' ? '#fff' : '#212529'
                }}
              >
                <Card.Body>
                  <div className="d-flex mb-4">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                      <i className="bi bi-1-circle-fill text-white fs-4"></i>
                    </div>
                    <div>
                      <h5>Загрузите фото</h5>
                      <p className="mb-0">Сделайте фото продукта или выберите готовое изображение из галереи.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex mb-4">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                      <i className="bi bi-2-circle-fill text-white fs-4"></i>
                    </div>
                    <div>
                      <h5>ИИ анализирует состав</h5>
                      <p className="mb-0">Нейросеть распознает продукт и анализирует его состав по изображению.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50, minWidth: 50 }}>
                      <i className="bi bi-3-circle-fill text-white fs-4"></i>
                    </div>
                    <div>
                      <h5>Получите результат</h5>
                      <p className="mb-0">Вы увидите детальную информацию о продукте, включая его статус Халяль/Харам, калорийность и состав.</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </div>

      {isMobile && <MobileNavigation activePage="ai-scanner" theme={theme} />}
    </Container>
  );
};

export default AiScannerPage;