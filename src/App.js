import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
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
      const timestamp = new Date().getTime();
      
      const searchParams = new URLSearchParams(window.location.search);
      const sid = searchParams.get('sid');
      
      const url = sid 
        ? `https://back-c6rh.onrender.com/check-auth?t=${timestamp}&sid=${sid}`
        : `https://back-c6rh.onrender.com/check-auth?t=${timestamp}`;
      
      const response = await axios.get(url, { 
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Auth response:", response.data);
      
      if (sid) {
        localStorage.setItem('sid', sid);
      }
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.data.user || null
      });
      
      return true;
    } catch (error) {
      console.error("Auth error:", error);
      
      const savedSid = localStorage.getItem('sid');
      if (savedSid) {
        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(
            `https://back-c6rh.onrender.com/check-auth?t=${timestamp}&sid=${savedSid}`, 
            { withCredentials: true }
          );
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: response.data.user || null
          });
          
          return true;
        } catch (retryError) {
          localStorage.removeItem('sid'); 
        }
      }
      
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
                  <Route path="/signup">
                    {authState.isAuthenticated ? <Redirect to="/" /> : <SignupPage />}
                  </Route>
                  <Route path="/signin">
                    {authState.isAuthenticated ? <Redirect to="/" /> : <SigninPage />}
                  </Route>
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