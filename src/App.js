import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import AiScannerPage from './pages/AiScannerPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import HomePage from './pages/HomePage';
import ProductSearchPage from './pages/ProductSearchPage';
import ProfilePage from './pages/ProfilePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipePage from './pages/RecipePage';
import SettingsPage from './pages/SettingsPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import WelcomePage from './pages/WelcomePage';
import './styles/theme.css';
import { withAuth } from './utils/auth';

export const AuthContext = React.createContext({
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: () => {}
});

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  const refreshAuth = async () => {
    setAuthState({
      ...authState, 
      isLoading: true
    });
    
    try {
      const storedSid = localStorage.getItem('sid');
      
      const searchParams = new URLSearchParams(window.location.search);
      const urlSid = searchParams.get('sid');
      
      const sid = urlSid || storedSid;
      
      if (urlSid) {
        localStorage.setItem('sid', urlSid);
        
        const url = new URL(window.location);
        url.searchParams.delete('sid');
        window.history.replaceState({}, document.title, url);
      }
      
      const timestamp = new Date().getTime();
      
      const url = sid 
        ? `https://back-c6rh.onrender.com/check-auth?t=${timestamp}&sid=${sid}`
        : `https://back-c6rh.onrender.com/check-auth?t=${timestamp}`;
        
      console.log("Auth check request URL:", url);
      
      const response = await axios.get(url, { 
        withCredentials: true
      });
      
      console.log("Auth success, user data:", response.data);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.data.user
      });
      
      return true;
    } catch (error) {
      console.error("Auth error:", error);
      
      localStorage.removeItem('sid'); 
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      
      return false;
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loginSuccess = searchParams.get('login_success');
    
    if (loginSuccess === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
      refreshAuth();
    } else {
      refreshAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, refreshAuth }}>
      <ThemeProvider>
        <Router>
          <div className="app-container">
            <main>
              {authState.isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : (
                <Switch>
                  <Route path="/welcome" component={WelcomePage} />
                  <Route path="/signup" component={SignupPage} />
                  <Route path="/signin" component={SigninPage} />
                  <Route path="/recipes/:id" component={withAuth(RecipeDetailPage)} />
                  <Route path="/create-recipe" component={withAuth(CreateRecipePage)} />
                  <Route path="/edit-recipe/:id" component={withAuth(EditRecipePage)} />
                  <Route path="/recipes" component={withAuth(RecipePage)} />
                  <Route path="/profile" component={withAuth(ProfilePage)} />
                  <Route path="/product-search" component={withAuth(ProductSearchPage)} />
                  <Route path="/ai-scanner" component={withAuth(AiScannerPage)} />
                  <Route path="/settings" component={withAuth(SettingsPage)} />
                  <Route path="/" component={withAuth(HomePage)} />
                </Switch>
              )}
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default App;