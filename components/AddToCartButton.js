import { useState } from 'react';
import { useCart } from './CartContext';

const AddToCartButton = ({ product, className = '', showQuantity = true }) => {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      addToCart(product, quantity);
      alert(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
    } catch (error) {
      alert('Error adding to cart: ' + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center space-x-2">
          <label htmlFor={`quantity-${product?.id}`} className="text-sm font-medium text-gray-700">
            Qty:
          </label>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 text-xs"
            >
              -
            </button>
            <input
              type="number"
              id={`quantity-${product?.id}`}
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border border-gray-300 rounded-md px-1 py-1 text-sm"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 text-xs"
            >
              +
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleAddToCart}
        disabled={addingToCart || !product}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
      >
        {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
      </button>
    </div>
  );
};

export default AddToCartButton; 