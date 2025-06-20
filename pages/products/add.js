// pages/products/add.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ProductForm from '../../components/ProductForm'
import { supabase } from '../../lib/supabase'
import withAuth from '../../lib/withAuth'

function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (!session) {
          router.push('/login')
          return
        }
        
        setSession(session)
        setLoading(false)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (formData) => {
    if (!session) {
      setError('Not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Cannot add product.')
      }

      alert('Product added successfully!')
      router.push('/products')
    } catch (err) {
      setError(err.message)
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id, formData) => {
    if (!session) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cannot update product.');
      }

      alert('Product updated successfully!');
      router.push('/products');
    } catch (err) {
      setError(err.message);
      console.error('Edit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <>
      <Head>
        <title>Add New Product</title>
      </Head>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Product</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </>
  )
}

export default withAuth(AddProductPage)