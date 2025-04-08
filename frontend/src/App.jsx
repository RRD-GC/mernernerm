import { Route, Routes, useLocation } from 'react-router-dom';

// pages
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import Recipe from './pages/Recipe';
import UserRecipes from './pages/UserRecipes';
import About from './pages/Aboutpage';

// components
import UserProfile from './components/UserProfile'; // Corrected path
import ViewRecipe from './components/ViewRecipe';

// services
import CreateRecipe from './services/CreateRecipe';
import EditRecipe from './services/EditRecipe';

// protected route wrapper
import ProtectedRoute from '../protected-routes/ProtectedRoute';
import NavBar from './components/NavBar';

import OAuthSuccess from './components/OAuthSuccess';
import { AuthProvider } from './context/AuthContext';

function App() {
  const location = useLocation();

  // Define routes where you want to HIDE the NavBar
  const hideNavBarOn = ['/login', '/register'];

  const shouldShowNavBar = !hideNavBarOn.includes(location.pathname);

  return (
    <AuthProvider>
      <>
        {shouldShowNavBar && <NavBar />}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/recipe-page"
            element={
              <ProtectedRoute>
                <Recipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-recipe"
            element={
              <ProtectedRoute>
                <ViewRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-recipe"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-recipe"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-recipe"
            element={
              <ProtectedRoute>
                <UserRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about-page"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </AuthProvider>
  );
}

export default App;
