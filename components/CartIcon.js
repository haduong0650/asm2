import { useCart } from './CartContext';

const CartIcon = ({ className = '' }) => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="text-2xl">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </div>
  );
};

export default CartIcon; 