// pages/products/[id].js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ProductForm from '../../../components/ProductForm';
export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch product for editing');
        }
        setProduct(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product data for editing...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!product) return <p>Product not found for editing.</p>;

  return (
    <div>
      <Head>
        <title>Edit {product.name}</title>
      </Head>
      <ProductForm productData={product} />
    </div>
  );
}