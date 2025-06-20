import Link from 'next/link';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">Welcome to EcomApp</h1>
      <p className="text-lg text-gray-700 mb-4">Your one-stop shop for amazing products!</p>
      <Link href="/products" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        View Products
      </Link>
    </div>
  );
};

export default Home;