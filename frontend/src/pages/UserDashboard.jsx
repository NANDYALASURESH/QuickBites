// ==================== src/pages/HomePage.jsx ====================
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { 
  ShoppingCart, User, Search, MapPin, Star, Plus, Minus,
  ChefHat, Clock, Truck, ChevronLeft, ChevronRight, Filter, Heart
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

  // Fetch menu items from backend
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

  // Fetch cart from backend
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

  const filteredItems = menuItems.filter(item =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  // Add to cart - Backend integration
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

  // Remove from cart - Backend integration
  const removeFromCart = async (itemId) => {
    if (cart[itemId] <= 1) {
      // Delete item from cart
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
      // Update quantity
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                  <ChefHat size={24} />
                </div>
                <span className="text-xl font-bold text-gray-900">QuickBite</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-gray-600 text-sm mt-1">
                <MapPin size={14} />
                <span>Deliver to: Adoni, Andhra Pradesh</span>
              </div>
            </div>

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

            <div className="flex items-center space-x-4">
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
<Link to="/profile">
     <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
       Profile
     </button>
   </Link>
      <Link to="/orders">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
          Order History
        </button>
      </Link>
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
              className={`absolute inset-0 flex items-center justify-center text-white transition-transform duration-500 ease-in-out`}
              style={{
                transform: `translateX(${(index - currentSlide) * 100}%)`
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-2xl absolute inset-0"
              />
              <div className="relative z-10 text-center px-4 bg-black bg-opacity-40 w-full h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-lg md:text-xl opacity-90">{slide.subtitle}</p>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselData.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-20"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Our Menu</h2>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
          
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative overflow-hidden rounded-t-lg w-full h-40 group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

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
              
                <div className="p-2">
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

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                    
                    {cart[item._id] > 0 ? (
                      <div className="flex items-center bg-orange-500 rounded-lg">
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
                        className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
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
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition-colors">
              <div className="flex items-center space-x-2">
                <ShoppingCart size={24} />
                <span className="font-medium">{cartCount}</span>
              </div>
            </button>
          </div>
        </Link>
      )}
    </div>
  );
};

export default HomePage;