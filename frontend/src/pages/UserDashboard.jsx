import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Cookie from 'js-cookie';
import { 
  ShoppingCart, 
  User, 
  Search, 
  MapPin, 
  Star, 
  Plus, 
  Minus,
  ChefHat,
  Clock,
  Truck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;


const HomePage = () => {
  const [cartCount, setCartCount] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  // Carousel data
  const carouselData = [
    {
      id: 1,
      title: "Super Fast Delivery",
      subtitle: "Get your food in 30 minutes or less",
      image: "https://res-console.cloudinary.com/sanesh-ccbp-tech/thumbnails/v1/image/upload/v1758092901/R2VtaW5pX0dlbmVyYXRlZF9JbWFnZV82NWJ2dGs2NWJ2dGs2NWJ2XzJfbnJ1dnYx/drilldown"
    },
    {
      id: 2,
      title: "Fresh & Hot Food",
      subtitle: "Quality ingredients, amazing taste",
      image: "https://res-console.cloudinary.com/sanesh-ccbp-tech/thumbnails/v1/image/upload/v1758092900/R2VtaW5pX0dlbmVyYXRlZF9JbWFnZV82NWJ2dGs2NWJ2dGs2NWJ2XzFfaGh1dWdh/drilldown"
    },
    {
      id: 3,
      title: "Best Deals & Offers",
      subtitle: "Save more on every order",
      image: "https://res-console.cloudinary.com/sanesh-ccbp-tech/thumbnails/v1/image/upload/v1758092900/R2VtaW5pX0dlbmVyYXRlZF9JbWFnZV82NWJ2dGs2NWJ2dGs2NWJ2X3p0bjMxMw==/drilldown"
    }
  ];

  // Carousel auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  // Fetch items function - using useCallback to prevent unnecessary re-renders
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch( `${apiUrl}/api/auth/menu-item`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookie.get('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched menu items:', data);
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  }, []);

  // Fetch items on component mount only
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Filter items based on active category
  const filteredItems = menuItems.filter(item =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  // Add to cart function - using _id instead of id
  const addToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    setCartCount(prev => prev + 1);
  };

  // Remove from cart function - using _id instead of id
  const removeFromCart = (itemId) => {
    if (cart[itemId] > 0) {
      setCart(prev => ({
        ...prev,
        [itemId]: prev[itemId] - 1
      }));
      setCartCount(prev => prev - 1);
    }
  };

  // Toggle favorite - using _id instead of id
  const toggleFavorite = (itemId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const onLogout = () => {
    Cookie.remove('jwt_token');
    navigate('/login');
  };

  // Category buttons
  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'veg', name: 'Vegetarian', icon: '🥗' },
    { id: 'nonveg', name: 'Non-Veg', icon: '🍖' },
    { id: 'veg-starter', name: 'Veg Starters', icon: '🥙' },
    { id: 'nonveg-starter', name: 'Non-Veg Starters', icon: '🍗' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Location */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                  <ChefHat size={24} />
                </div>
                <span className="text-xl font-bold text-gray-900">QuickBite</span>
              </div>
              
              {/* Location - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 text-gray-600 text-sm mt-1">
                <MapPin size={14} />
                <span>Deliver to: Adoni, Andhra Pradesh</span>
              </div>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search for food, restaurants..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart">
              <button className="cursor-pointer relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
</Link>
              {/* Profile */}
              <div className="relative">
                <button 
                  className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <User size={24} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 min-w-48 z-10">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Hello, User!</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
                        Profile
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        onClick={onLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search for food..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Carousel */}
      <div className="flex justify-center items-center py-6">
        <div className="relative w-full max-w-4xl min-h-[20rem] md:min-h-[24rem] overflow-hidden rounded-2xl mx-4">

          {carouselData.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-r ${slide.bgClass} flex items-center justify-center text-white transition-transform duration-500 ease-in-out`}
              style={{
                transform: `translateX(${(index - currentSlide) * 100}%)`
              }}
            >
              <div className="text-center px-4">
                <div className="text-6xl md:text-8xl mb-4">
                  <img
  src={slide.image}
  alt={slide.title}
  className="w-full h-full object-cover rounded-2xl"
/>


                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-lg md:text-xl opacity-90">{slide.subtitle}</p>
              </div>
            </div>
          ))}
          
          {/* Carousel Navigation */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselData.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Quick Stats */}
        
        {/* Menu Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
          
          {/* Category Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50 shadow-sm'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="">
                {/* Item Header */}
                <div className="flex justify-between items-start mb-3 relative">
  <div className="relative overflow-hidden rounded-lg w-full h-40 group">
  <img
    src={item.image}
    alt={item.name}
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
  />

  {/* Heart Icon */}
  <button
    onClick={() => toggleFavorite(item._id)}
    className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors ${
      favorites.has(item._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
    }`}
  >
    <Heart
      size={16}
      fill={favorites.has(item._id) ? 'currentColor' : 'none'}
    />
  </button>
</div>

</div>
              
                
                {/* Indicators */}
                <div className='p-2'>
                 
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {item.popular && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                
                {/* Rating and time */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>{item.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{item.prepTime}</span>
                  </div>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">₹{item.price}</span>
                  
                  {cart[item._id] > 0 ? (
                    <div className=" flex items-center bg-orange-500 rounded-lg">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="cursor-pointer p-1 text-white hover:bg-orange-600 rounded-l-lg transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 text-white text-sm font-medium">{cart[item._id]}</span>
                      <button
                        onClick={() => addToCart(item._id)}
                        className="cursor-pointer p-1 text-white hover:bg-orange-600 rounded-r-lg transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item._id)}
                      className=" cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                    >
                     Add
                    </button>
                  )}
                </div>
              </div>
            </div>
             </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Load More Items
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <ChefHat size={20} />
                </div>
                <span className="text-xl font-bold">QuickBite</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your favorite food delivery app that brings delicious meals from the best restaurants 
                right to your doorstep. Fast, fresh, and always satisfying.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">📘</span>
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">🐦</span>
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">📷</span>
                </button>
                <button className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">💼</span>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Our Menu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Restaurants</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Become a Partner</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Delivery Areas</a></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Track Order</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact & App Download */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin size={16} />
                  <span className="text-sm">Adoni, Andhra Pradesh, India</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <span className="text-lg">📞</span>
                  <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <span className="text-lg">✉️</span>
                  <span className="text-sm">support@quickbite.com</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-3">Download Our App</p>
                <div className="space-y-2">
                  <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 flex items-center space-x-3 transition-colors">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Download on the</p>
                      <p className="text-sm font-medium">App Store</p>
                    </div>
                  </button>
                  <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 flex items-center space-x-3 transition-colors">
                    <span className="text-2xl">🤖</span>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Get it on</p>
                      <p className="text-sm font-medium">Google Play</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 QuickBite. All rights reserved. Made with ❤️ for food lovers.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>

          {/* Features Banner */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-semibold">Fast Delivery</h4>
                <p className="text-gray-400 text-sm">Lightning-fast delivery in 30 minutes or less</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-semibold">Quality Food</h4>
                <p className="text-gray-400 text-sm">Fresh ingredients and top-rated restaurants</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-semibold">24/7 Support</h4>
                <p className="text-gray-400 text-sm">Round-the-clock customer support</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition-colors">
            <div className="flex items-center space-x-2">
              <ShoppingCart size={24} />
              <span className="font-medium">{cartCount}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;