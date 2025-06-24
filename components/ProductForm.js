// components/ProductForm.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

const ProductForm = ({ productData = {}, onSubmit }) => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: productData.name || '',
    description: productData.description || '',
    price: productData.price || '',
    image: productData.image || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  // const [preview, setPreview] = useState(null);
  const [filePreview, setFilePreview] = useState(productData.image || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      console.log('Current session:', session);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
  if (productData && productData.id) {
    // Trường hợp edit sản phẩm
    setForm({
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || '',
      image: productData.image || '',
    });
    setFilePreview(productData.image || '');
    setSelectedFile(null);
  } else if (!productData) {
    // Chỉ reset khi productData thực sự thay đổi sang null
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
    });
    setFilePreview('');
    setSelectedFile(null);
  }
}, [productData]); // ✅ chỉ theo dõi productData

// Tách message ra effect riêng
useEffect(() => {
  if (message) {
    setMessage('');
  }
}, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(form.image || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Lấy session mới nhất trước khi submit
    const { data: { session: latestSession } } = await supabase.auth.getSession();
    console.log('Token used for add product:', latestSession?.access_token);
    if (!latestSession) {
      setMessage('Bạn phải đăng nhập để sử dụng chức năng này.');
      setIsSubmitting(false);
      return;
    }

    if (!form.name || !form.description || !form.price) {
      setMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      setMessage('Price must be a positive number.');
      setIsSubmitting(false);
      return;
    }

    let imageUrl = form.image;
    if (selectedFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${latestSession.access_token}`
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Image upload failed');
        }
        imageUrl = uploadData.imageUrl;
      } catch (uploadError) {
        setMessage(`Image upload error: ${uploadError.message}`);
        setIsSubmitting(false);
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const productDataToSend = { ...form, image: imageUrl };

    try {
      if (onSubmit) {
        // Use the onSubmit prop if provided
        await onSubmit(productDataToSend);
        setMessage('Product saved successfully!');
      } else {
        // Fallback to default behavior
        const apiEndpoint = productData.id
          ? `/api/products/${productData.id}`
          : '/api/products';
        const httpMethod = productData.id ? 'PUT' : 'POST';

        const res = await fetch(apiEndpoint, {
          method: httpMethod,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${latestSession.access_token}`,
          },
          body: JSON.stringify(productDataToSend),
        });

        const data = await res.json();

        if (res.ok) {
          router.push('/products');
        } else {
          throw new Error(data.message || 'Something went wrong!');
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="form-title">{productData.id ? 'Edit Product' : ''}</h1>
      {message && (
        <div
          className={`p-4 rounded-md text-center font-semibold ${message.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price (e.g. 100)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
          <input
            type="file"
            id="imageUpload"
            name="imageUpload"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {filePreview && (
            <div className="mt-4 text-center">
              <Image
               src={filePreview}
               alt="Preview"
               width={300}
               height={200}
               className="object-cover"
              />
           </div>
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
          <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;