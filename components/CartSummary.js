import { useCart } from './CartContext';

const CartSummary = ({ className = '', showDetails = false }) => {
  const { items, getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showDetails ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-green-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} • ${totalPrice.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CartSummary; 