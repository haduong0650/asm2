import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import AddToCartButton from '../../components/AddToCartButton';

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

//   const handleUpdate = async (id, updatedData) => {
//     try {
//       const res = await fetch(`/api/products/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: updatedData.name,
//           price: updatedData.price,
//           description: updatedData.description,
//           image: updatedData.image || '/placeholder.png',
//         }),
//       });

//       if (!res.ok) {
//         throw new Error('Failed to update product');
//       }

//       const updatedProduct = await res.json();
//       setProducts(products.map((product) => (product.id === id ? updatedProduct.data : product)));
//       setIsEditModalOpen(false);
//       router.push('/products');
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          throw new Error('User not authenticated');
        }
        const token = session.access_token;

        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to delete product');
        }

        setProducts(products.filter((product) => product.id !== id));
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const openEditPage = (id) => {
    router.push(`/products/edit/${id}`);
  };

  const handleSaveProduct = async (productData) => {
    try {
      const method = productData.id ? 'PUT' : 'POST';
      const url = productData.id ? `/api/products/${productData.id}` : '/api/products';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productData.name,
          price: productData.price,
          description: productData.description,
          image: productData.image || '/placeholder.png',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} product`);
      }

      const savedProduct = await res.json();

      if (method === 'POST') {
        setProducts([...products, savedProduct.data]);
      } else {
        setProducts(products.map((product) => (product.id === productData.id ? savedProduct.data : product)));
      }

      setIsEditModalOpen(false);
      router.push('/products');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
            <Link href={`/products/${product.id}`}>
              <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-48 object-cover mb-4 cursor-pointer" />
            </Link>
            <h2 className="text-lg font-bold mb-2">{product.name}</h2>
            <p className="text-green-600 font-bold">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            {/* Add to Cart Button */}
            <div className="mb-4">
              <AddToCartButton product={product} showQuantity={false} />
            </div>
            
            <div className="flex space-x-4">              
              <button
                onClick={() => openEditPage(product.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProduct(currentProduct);
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Price</label>
                <input
                  type="number"
                  value={currentProduct.price}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;