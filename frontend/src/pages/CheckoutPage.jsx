import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { 
  ChevronLeft, MapPin, Phone, Wallet, CreditCard, 
  Smartphone, DollarSign, Package, CheckCircle, AlertCircle
} from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [paymentStep, setPaymentStep] = useState('details'); // details, payment, processing, success
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchCart();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          deliveryAddress: userData.address || '',
          phone: userData.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/cart`, {
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
        throw new Error('Failed to fetch cart');
      }

      const cartData = await response.json();
      setCart(cartData);
      
      if (cartData.length === 0) {
        alert('Your cart is empty');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };

  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% success rate simulation
        resolve(Math.random() > 0.05);
      }, 2000);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.deliveryAddress || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setPaymentStep('payment');

    try {
      // Simulate payment processing for card/UPI
      if (formData.paymentMethod !== 'cash') {
        const paymentSuccess = await simulatePayment();
        
        if (!paymentSuccess) {
          setPaymentStep('details');
          setProcessing(false);
          alert('Payment failed. Please try again.');
          return;
        }
      }

      setPaymentStep('processing');

      const token = Cookie.get('jwt_token');
      const response = await fetch(`${apiUrl}/api/user/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      setPaymentStep('success');
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      setPaymentStep('details');
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'Cash on Delivery', 
      icon: <DollarSign size={20} />,
      description: 'Pay when your order arrives'
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: <CreditCard size={20} />,
      description: 'Secure payment via card'
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: <Smartphone size={20} />,
      description: 'Pay via UPI apps'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Payment Processing Screen
  if (paymentStep === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  // Order Processing Screen
  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Placing Your Order</h2>
          <p className="text-gray-600">Almost done! Setting up your order...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed. You'll receive updates on your order status.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              🚚 Estimated delivery time: 30-45 minutes
            </p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 h-16">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Delivery Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin size={20} className="text-orange-500" />
                  <span>Delivery Details</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows="3"
                      required
                      placeholder="Enter your complete delivery address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Any special instructions for delivery..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Wallet size={20} className="text-orange-500" />
                  <span>Payment Method</span>
                </h2>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className={`${formData.paymentMethod === method.id ? 'text-orange-500' : 'text-gray-400'}`}>
                            {method.icon}
                          </div>
                          <span className="font-medium text-gray-900">{method.name}</span>
                          {formData.paymentMethod === method.id && (
                            <CheckCircle size={18} className="text-orange-500 ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 ml-8">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Payment Info Alert */}
                {formData.paymentMethod !== 'cash' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p>Your payment will be processed securely. You'll be charged ₹{calculateTotal()} immediately.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Package size={20} className="text-orange-500" />
                  <span>Order Summary</span>
                </h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-orange-500">₹{calculateTotal()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Place Order - ₹{calculateTotal()}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;