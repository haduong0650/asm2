import { useState } from 'react';
import { useCart } from '../components/CartContext';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paying, setPaying] = useState(false);

  const handleQuantityChange = async (productId, newQuantity) => {
    setIsUpdating(true);
    try {
      updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('Are you sure you want to remove this item from cart?')) {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      // Lấy access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to place an order.');
        setPlacingOrder(false);
        return;
      }
      const token = session.access_token;
      // Chuẩn bị dữ liệu order
      const products = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }));
      const totalAmount = getTotalPrice();
      // Gửi request tạo order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ products, totalAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      setOrderId(data.data.id);
      setShowPaymentModal(true);
      clearCart();
    } catch (error) {
      alert('Error placing order: ' + error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to pay.');
        setPaying(false);
        return;
      }
      const token = session.access_token;
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }
      setShowPaymentModal(false);
      setOrderId(null);
      alert('Thanh toán thành công! Đơn hàng đã được cập nhật trạng thái "paid".');
    } catch (error) {
      alert('Error during payment: ' + error.message);
    } finally {
      setPaying(false);
    }
  };

  if (items.length === 0 && !showPaymentModal) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
             {"Looks like you haven't added any products to your cart yet."}
          </p>
          <Link 
            href="/products"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Cart Items ({items.length})</h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <Image
                     src={item.image}
                     alt={item.name}
                     width={100}        // hoặc kích thước phù hợp
                     height={100}
                     objectFit="cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-lg font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? 'Placing Order...' : 'Proceed to Checkout'}
              </button>
              
              <button
                onClick={handleClearCart}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Cart
              </button>
              
              <Link 
                href="/products"
                className="block w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Xác nhận thanh toán</h2>
            <p className="mb-6">Bạn có muốn thanh toán cho đơn hàng vừa đặt không?</p>
            <button
              onClick={handleSimulatePayment}
              disabled={paying}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {paying ? 'Đang thanh toán...' : 'Thanh toán'}
            </button>
            <button
              onClick={() => { setShowPaymentModal(false); setOrderId(null); }}
              disabled={paying}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 