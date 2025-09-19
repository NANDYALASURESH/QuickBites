import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Mail, Lock, ChefHat, User, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('user');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // ✅ inside functional component

  const onSubmitSuccess = (jwtToken, userRole) => {
    // Clear form
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setRole('user');
    
    // Route based on detected role from backend
    const routes = {
      user: '/home',
      admin: '/admin-dashboard',
      delivery: '/delivery-dashboard'
    };
    // Set JWT token in cookies
    Cookies.set('jwt_token', jwtToken, { expires: 30 }); // 1 day expiry
    Cookies.set('user_role', userRole, { expires: 30 });
    // Set success message
    setMsg('Login successful! Redirecting to dashboard...');
    setTimeout(() => {
      // Navigate to appropriate dashboard
      console.log(`Redirecting to ${routes[userRole] || '/home'}`);
    }, 2000);
    navigate(routes[userRole] || '/home');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMsg('');

    try {
      const response = await fetch(isLogin ? `${apiUrl}/api/auth/login` : `${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin 
          ? { email, password } 
          : { fullName, email, phone, address: (role === 'user' || role === 'delivery') ? address : '', password, role }
        )
      });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

      
      if (isLogin) {
        // Login - role is determined by backend
        const userRole = data.role;
        const jwtToken = data.token;
        // This would come from your API response
        setMsg('Login successful! Redirecting to dashboard...');
        onSubmitSuccess(jwtToken, userRole);
      } else {
        // Registration
        setMsg('Registration successful! Please log in.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setAddress('');
        setRole('user');  

      }
    } catch (err) {
      setMsg(isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMsg('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setRole('user');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-200 via-red-200 to-red-300">
      
      {/* Food delivery themed background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-0 text-6xl opacity-20 transform rotate-12 animate-pulse">🚚</div>
        <div className="absolute top-32 right-20 text-4xl opacity-30 animate-bounce" style={{animationDelay: '1s'}}>🍕</div>
        <div className="absolute bottom-40 left-16 text-5xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}>🍔</div>
        <div className="absolute top-60 left-10 text-3xl opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}>🍟</div>
        <div className="absolute bottom-32 right-32 text-4xl opacity-25 animate-pulse" style={{animationDelay: '1.5s'}}>🌮</div>
        <div className="absolute top-80 right-10 text-3xl opacity-30 animate-bounce" style={{animationDelay: '2.5s'}}>📦</div>
        <div className="absolute bottom-60 left-32 text-3xl opacity-25 animate-pulse" style={{animationDelay: '3s'}}>🌭</div>
        <div className="absolute top-40 left-1/3 text-3xl opacity-30 animate-bounce" style={{animationDelay: '1.8s'}}>🍦</div>
        <div className="absolute bottom-20 right-1/4 text-4xl opacity-25 animate-pulse" style={{animationDelay: '2.2s'}}>🥤</div>
        <div className="absolute top-1/2 right-5 text-3xl opacity-30 animate-bounce" style={{animationDelay: '0.8s'}}>🍩</div>
        
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-bounce" style={{animationDuration: '3s'}}></div>
      </div>

      {/* Login Card */}
      <div className="relative max-w-lg z-10 w-full mx-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-200 border-opacity-40 p-8 transform transition-all duration-300 hover:shadow-3xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">QuickBite</h1>
            <p className="text-gray-600 text-sm mb-2">
              {isLogin ? 'Welcome back to QuickBite' : 'Join our food community'}
            </p>
            <p className="text-orange-600 text-xs font-medium">
              🚀 30 min delivery • 🍕 Fresh & Hot • 📱 Easy ordering
            </p>
            
            {/* Mode Toggle */}
            <div className="flex mt-6 bg-gray-200 bg-opacity-50 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => !isLoading && setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isLogin 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => !isLoading && setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error/Success Message */}
          {msg && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border text-sm font-medium transition-all duration-300 ${
              msg.includes('successful') 
                ? 'bg-green-100 bg-opacity-80 border-green-300 text-green-700' 
                : 'bg-red-100 bg-opacity-80 border-red-300 text-red-700'
            }`}>
              <p>{msg}</p>
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-6">
            
            {/* Registration Fields */}
            {!isLogin && (
              <>
                {/* Role Selection - Only for Registration */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Register as</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`py-3 px-2 text-xs font-medium rounded-lg transition-all duration-300 border ${
                        role === 'user'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                          : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg mb-1">👤</span>
                        <span>Customer</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-3 px-2 text-xs font-medium rounded-lg transition-all duration-300 border ${
                        role === 'admin'
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg mb-1">⚙️</span>
                        <span>Admin</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('delivery')}
                      className={`py-3 px-2 text-xs font-medium rounded-lg transition-all duration-300 border ${
                        role === 'delivery'
                          ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg mb-1">🚴</span>
                        <span>Delivery</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name Field */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative w-full">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative w-full">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Address Field - Only for customers and delivery partners */}
                {(role === 'user' || role === 'delivery') && (
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {role === 'user' ? 'Address' : 'Service Area'}
                    </label>
                    <div className="relative w-full">
                      <MapPin className="absolute left-3 top-5 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                      <textarea
                        placeholder={role === 'user' ? 'Enter your address' : 'Enter your service area'}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        rows="3"
                        className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Field */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20 p-0 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Registration only) */}
            {!isLogin && (
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20 p-0 flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg border-none cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center flex flex-col gap-2">
            {isLogin ? (
              <>
                <div>
                  <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-300 no-underline">
                    Forgot your password?
                  </a>
                </div>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  By registering, you agree to our{' '}
                  <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300 no-underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300 no-underline">
                    Privacy Policy
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button 
                    onClick={toggleMode}
                    className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;