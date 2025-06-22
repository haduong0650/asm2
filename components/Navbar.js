// components/Navbar.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { useCart } from './CartContext'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const router = useRouter()
  const { getTotalItems } = useCart()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-lg">
        <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
          EcomApp
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/products" className="px-4 py-2 text-white hover:text-blue-300">
                Products
              </Link>
              <Link href="/products/add" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add Product
              </Link>
              <Link href="/cart" className="relative px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                🛒 Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Import Cart component dynamically to avoid SSR issues */}
      {typeof window !== 'undefined' && (
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  )
}

// Dynamic import for Cart component
const Cart = ({ isOpen, onClose }) => {
  const [CartComponent, setCartComponent] = useState(null)

  useEffect(() => {
    if (isOpen) {
      import('./Cart').then((module) => {
        setCartComponent(() => module.default)
      })
    }
  }, [isOpen])

  if (!CartComponent) return null

  return <CartComponent isOpen={isOpen} onClose={onClose} />
}

export default Navbar