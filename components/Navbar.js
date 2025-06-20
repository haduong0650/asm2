// components/Navbar.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const router = useRouter()

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
    <nav className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-lg">
      <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
        EcomApp
      </Link>
      <div className="flex space-x-4">
        {user ? (
          <>
            <Link href="/products/add" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Product
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
  )
}

export default Navbar