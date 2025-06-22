// pages/_app.js
import '../styles/global.css'; // Import global styles
import Navbar from '../components/Navbar';
import { CartProvider } from '../components/CartContext';

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Navbar />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </CartProvider>
  );
}

export default MyApp;