import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { 
  ShoppingCart, User, Search, MapPin, Star, Plus, Minus,
  ChefHat, Clock, Truck, ChevronLeft, ChevronRight, Filter, Heart, X, SlidersHorizontal
} from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [cartCount, setCartCount] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'none',
    minRating: 0,
    maxPrice: Infinity,
    showPopularOnly: false,
    showFavoritesOnly: false
  });

  const navigate = useNavigate();

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/menu-items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchCart = useCallback(async () => {
    try {
      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        const cartObj = {};
        let count = 0;
        cartData.forEach(item => {
          cartObj[item.menuItem._id] = item.quantity;
          count += item.quantity;
        });
        setCart(cartObj);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCart();
  }, [fetchItems, fetchCart]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' ? true : item.category === activeCategory;
    const matchesSearch = searchQuery === '' ? true : 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = item.rating >= filters.minRating;
    const matchesPrice = item.price <= filters.maxPrice;
    const matchesPopular = !filters.showPopularOnly || item.popular;
    const matchesFavorites = !filters.showFavoritesOnly || favorites.has(item._id);
    
    return matchesCategory && matchesSearch && matchesRating && matchesPrice && matchesPopular && matchesFavorites;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const addToCart = async (itemId) => {
    try {
      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menuItemId: itemId, quantity: 1 })
      });

      if (response.ok) {
        setCart(prev => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1
        }));
        setCartCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (cart[itemId] <= 1) {
      try {
        const token = Cookie.get('jwt_token');
        const response = await fetch(`${apiUrl}/api/user/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setCart(prev => {
            const newCart = { ...prev };
            delete newCart[itemId];
            return newCart;
          });
          setCartCount(prev => prev - 1);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      try {
        const token = Cookie.get('jwt_token');
        const response = await fetch(`${apiUrl}/api/user/cart`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ menuItemId: itemId, quantity: cart[itemId] - 1 })
        });

        if (response.ok) {
          setCart(prev => ({
            ...prev,
            [itemId]: prev[itemId] - 1
          }));
          setCartCount(prev => prev - 1);
        }
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }
  };

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

  const resetFilters = () => {
    setFilters({
      sortBy: 'none',
      minRating: 0,
      maxPrice: Infinity,
      showPopularOnly: false,
      showFavoritesOnly: false
    });
  };

  const onLogout = () => {
    Cookie.remove('jwt_token');
    Cookie.remove('user_role');
    navigate('/login');
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'veg', name: 'Vegetarian', icon: '🥗' },
    { id: 'nonveg', name: 'Non-Veg', icon: '🍖' },
    { id: 'veg-starter', name: 'Veg Starters', icon: '🥙' },
    { id: 'nonveg-starter', name: 'Non-Veg Starters', icon: '🍗' }
  ];

  const activeFiltersCount = [
    filters.sortBy !== 'none',
    filters.minRating > 0,
    filters.maxPrice !== Infinity,
    filters.showPopularOnly,
    filters.showFavoritesOnly
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <ChefHat size={24} />
                </div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">QuickBite</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-gray-600 text-xs lg:text-sm mt-1">
                <MapPin size={14} className="text-orange-500" />
                <span>Adoni, Andhra Pradesh</span>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for food, restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all bg-gray-50 hover:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link to="/cart">
                <button className="cursor-pointer relative p-2 lg:p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              <div className="relative">
                <button 
                  className="cursor-pointer p-2 lg:p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <User size={22} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-14 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-48 z-10 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500">
                      <p className="text-sm font-semibold text-white">Hello, User!</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile">
                        <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center space-x-2">
                          <User size={16} />
                          <span>Profile</span>
                        </button>
                      </Link>
                      <Link to="/checkout">
                        <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center space-x-2">
                          <Truck size={16} />
                          <span>Checkout</span>
                        </button>
                      </Link>
                      <Link to="/orders">
                        <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Order History</span>
                        </button>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
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
      <div className="md:hidden bg-white border-b border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-gray-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Carousel - Hide when searching */}
      {!searchQuery && (
        <div className="flex justify-center items-center py-4 lg:py-8">
          <div className="relative w-full max-w-6xl h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl mx-4 shadow-xl">
            {carouselData.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 flex items-center justify-center text-white transition-transform duration-700 ease-in-out`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="relative z-10 text-center px-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg animate-fade-in">{slide.title}</h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 drop-shadow-lg">{slide.subtitle}</p>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length)}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all shadow-lg z-20 hover:scale-110"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselData.length)}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all shadow-lg z-20 hover:scale-110"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {carouselData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-6 sm:w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {searchQuery ? `Search Results (${filteredItems.length})` : 'Our Menu'}
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 hover:bg-orange-50 rounded-lg"
            >
              <SlidersHorizontal size={18} />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter & Sort</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white text-sm"
                  >
                    <option value="none">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating: {filters.minRating}★
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0★</span>
                    <span>5★</span>
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price: ₹{filters.maxPrice === Infinity ? '∞' : filters.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={filters.maxPrice === Infinity ? 1000 : filters.maxPrice}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      maxPrice: parseInt(e.target.value) === 1000 ? Infinity : parseInt(e.target.value) 
                    })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹1000+</span>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFilters({ ...filters, showPopularOnly: !filters.showPopularOnly })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.showPopularOnly
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⭐ Popular Only
                </button>
                <button
                  onClick={() => setFilters({ ...filters, showFavoritesOnly: !filters.showFavoritesOnly })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.showFavoritesOnly
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ❤️ Favorites Only
                </button>
              </div>
            </div>
          )}
          
          {!searchQuery && (
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-base sm:text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading delicious food...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-orange-200 hover:-translate-y-1">
                <div className="relative overflow-hidden w-full h-36 sm:h-48 lg:h-56">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <button
                    onClick={() => toggleFavorite(item._id)}
                    className={`absolute top-2 right-2 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all ${
                      favorites.has(item._id) 
                        ? 'bg-red-100 text-red-500 scale-110' 
                        : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={favorites.has(item._id) ? 'currentColor' : 'none'}
                    />
                  </button>

                  {item.popular && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                      ⭐ Popular
                    </div>
                  )}
                </div>
              
                <div className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      item.type === 'veg' ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'
                    }`}></div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-yellow-700">{item.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock size={14} />
                      <span>{item.prepTime}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900 text-base sm:text-lg">₹{item.price}</span>
                    
                    {cart[item._id] > 0 ? (
                      <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="cursor-pointer p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 sm:px-4 py-1 text-white text-sm sm:text-base font-semibold">{cart[item._id]}</span>
                        <button
                          onClick={() => addToCart(item._id)}
                          className="cursor-pointer p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item._id)}
                        className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && (
        <Link to="/cart">
          <div className="fixed bottom-6 right-6 md:hidden z-40">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-bounce">
              <div className="flex items-center space-x-2">
                <ShoppingCart size={24} />
                <span className="font-bold text-lg">{cartCount}</span>
              </div>
            </button>
          </div>
        </Link>
      )}
    </div>
  );
};

export default HomePage;