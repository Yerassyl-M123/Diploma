import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MobileNavigation = ({ activePage, theme }) => {
  return (
    <Nav className="mobile-nav d-flex flex-row justify-content-around">
      <Nav.Link as={Link} to="/" className={`flex-fill ${activePage === 'home' ? 'active' : ''}`}>
        <i className="bi bi-house-door"></i>
        <span>Главная</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/recipes" className={`flex-fill ${activePage === 'recipes' ? 'active' : ''}`}>
        <i className="bi bi-journal-text"></i>
        <span>Рецепты</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/profile" className={`flex-fill ${activePage === 'profile' ? 'active' : ''}`}>
        <i className="bi bi-person"></i>
        <span>Профиль</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/product-search" className={`flex-fill ${activePage === 'product-search' ? 'active' : ''}`}>
        <i className="bi bi-search d-block"></i>
        <span>Поиск</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/ai-scanner" className={`flex-fill ${activePage === 'ai-scanner' ? 'active' : ''}`}>
        <i className="bi bi-camera d-block"></i>
        <span>Сканер</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/chat" className={`flex-fill ${activePage === 'chat' ? 'active' : ''}`}>
        <i className="bi bi-chat-dots"></i>
        <span>Чат</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/settings" className={`flex-fill ${activePage === 'settings' ? 'active' : ''}`}>
        <i className="bi bi-gear"></i>
        <span>Настройки</span>
      </Nav.Link>

    </Nav>
  );
};

export default MobileNavigation;