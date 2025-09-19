import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "../src/app.css"
import QuickBiteWelcome from "./pages/welcome"
import Login from '../src/pages/login';
import HomePage from './pages/UserDashboard';
import ProtectedRoute from './ProtectedRoute/app';
import QuickBiteCart from './pages/cart';
import PublicRoute from './PublicRoute/app';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicRoute><QuickBiteWelcome/></PublicRoute>} />
        <Route path='/cart' element={<ProtectedRoute><QuickBiteCart /></ProtectedRoute>} />
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/home' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
