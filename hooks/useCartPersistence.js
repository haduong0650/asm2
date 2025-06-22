import { useEffect } from 'react';
import { useCart } from '../components/CartContext';

export const useCartPersistence = () => {
  const { items } = useCart();

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          // Note: This would need to be handled in the CartContext
          // For now, we'll just log it
          console.log('Loaded cart from localStorage:', cartItems);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  return null;
}; 