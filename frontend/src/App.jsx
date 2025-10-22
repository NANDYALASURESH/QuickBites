import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "../src/App.css"
import QuickBiteWelcome from "./pages/welcome"
import Login from '../src/pages/login';
import HomePage from './pages/UserDashboard';
import ProtectedRoute from './ProtectedRoute/app';
import QuickBiteCart from './pages/cart';
import PublicRoute from './PublicRoute/app';
import CheckoutPage from "./pages/CheckoutPage"
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from '../pages/OrderHistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicRoute><QuickBiteWelcome/></PublicRoute>} />
        <Route path='/cart' element={<ProtectedRoute><QuickBiteCart /></ProtectedRoute>} />
        <Route path='/checkout' element={<ProtectedRoute><CheckoutPage></CheckoutPage></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/home' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
