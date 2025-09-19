import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, MapPin, Clock, CreditCard, Wallet, Star } from 'lucide-react';
import { Link }  from 'react-router-dom';

const QuickBiteCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Chicken Biryani",
      price: 299,
      restaurant: "Spice Junction",
      image: "🍛",
      rating: 4.5,
      quantity: 2,
      customization: "Extra spicy, No onions"
    },
    {
      id: 2,
      name: "Margherita Pizza",
      price: 249,
      restaurant: "Pizza Palace",
      image: "🍕",
      rating: 4.3,
      quantity: 1,
      customization: "Extra cheese"
    },
    {
      id: 3,
      name: "Classic Burger",
      price: 199,
      restaurant: "Burger Barn",
      image: "🍔",
      rating: 4.7,
      quantity: 1,
      customization: "No pickles"
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, Downtown, City - 400001');

  const promoCodes = {
    'FIRST20': { discount: 20, type: 'percentage', description: '20% off on first order' },
    'SAVE50': { discount: 50, type: 'flat', description: '₹50 off on orders above ₹300' },
    'WELCOME': { discount: 15, type: 'percentage', description: '15% off - Welcome offer' }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return getSubtotal() > 500 ? 0 : 40;
  };

  const getTaxes = () => {
    return Math.round(getSubtotal() * 0.05); // 5% tax
  };

  const getDiscount = () => {
    if (!appliedPromo) return 0;
    const subtotal = getSubtotal();
    if (appliedPromo.type === 'percentage') {
      return Math.round(subtotal * (appliedPromo.discount / 100));
    } else {
      return appliedPromo.discount;
    }
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee() + getTaxes() - getDiscount();
  };

  const applyPromoCode = () => {
    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo(promoCodes[promoCode.toUpperCase()]);
      setPromoCode('');
    } else {
      alert('Invalid promo code!');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-black mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/home">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
            Start Shopping
          </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/home">
              <button className="text-black hover:text-orange-500 transition-colors">
                <ArrowLeft size={24} />
              </button>
              </Link>
              <h1 className="text-2xl font-bold text-black">Your Cart</h1>
            </div>
            <div className="text-3xl font-bold text-orange-500">
              🍽️ QuickBite
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-full">
                  <MapPin className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-black">Delivery Address</h3>
                  <p className="text-gray-600 text-sm">{deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <Clock size={16} />
                <span>Estimated delivery: 25-30 mins</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl bg-orange-50 p-3 rounded-xl">
                      {item.image}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-black">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-gray-600 text-sm">{item.restaurant}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="fill-orange-400 text-orange-400" size={14} />
                          <span className="text-sm text-gray-600">{item.rating}</span>
                        </div>
                      </div>
                      
                      {item.customization && (
                        <p className="text-sm text-gray-500 mb-3 bg-gray-50 px-3 py-1 rounded-full inline-block">
                          {item.customization}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-black">
                          ₹{item.price}
                        </div>
                        
                        <div className="flex items-center space-x-3 bg-orange-50 rounded-full px-4 py-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-orange-500 hover:text-orange-700 transition-colors hover:scale-110"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="text-lg font-bold text-black w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-orange-500 hover:text-orange-700 transition-colors hover:scale-110"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-right">
                        <span className="text-lg font-bold text-black">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Apply Coupon</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
              
              {appliedPromo && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-green-700 font-semibold">Coupon Applied!</p>
                    <p className="text-green-600 text-sm">{appliedPromo.description}</p>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-black">₹{getSubtotal()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-black">
                    {getDeliveryFee() === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${getDeliveryFee()}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold text-black">₹{getTaxes()}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{getDiscount()}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-black">Total</span>
                  <span className="text-orange-500">₹{getTotal()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === 'card'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <CreditCard className="text-gray-600" size={20} />
                    <span className="text-gray-700">Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={selectedPayment === 'wallet'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <Wallet className="text-gray-600" size={20} />
                    <span className="text-gray-700">Digital Wallet</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === 'cod'}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-xl">💵</span>
                    <span className="text-gray-700">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Place Order • ₹{getTotal()}
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                You'll be charged ₹{getTotal()} on delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBiteCart;