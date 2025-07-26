import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../utils/supabaseClient';
import { toast, Toaster } from 'react-hot-toast';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const router = useRouter();
  const { store, category } = router.query;

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch products by business_name and category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!store) return;

      let query = supabase
        .from('products')
        .select('*')
        .eq('business_name', store.toLowerCase());

      if (category) {
        query = query.eq('category', category.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error.message);
      } else {
        setProducts(data);
        setCurrentPage(1); // Reset to first page when store/category changes
      }

      setLoading(false);
    };

    if (router.isReady) {
      fetchProducts();
    }
  }, [router.isReady, store, category]);

  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`${product.name} quantity increased by 1`);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart`);
    }
  };

  const titleCase = (str) =>
    str
      .toLowerCase()
      .split(/[\s\-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      <Toaster position="top-right" />
<div className="sticky top-0 z-50 bg-gray-100 shadow-sm">
  <div className="flex justify-between items-center p-3">
    <h1 className="text-3xl font-bold text-gray-800">🛍 Market</h1>
    <button
      onClick={() => router.push('/cart')}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      🛒 View Cart ({cart.length})
    </button>
  </div>
</div>

{/* Rest of your page */}
<div className="min-h-screen bg-gray-100 p-6">
  {/* Your product grid or whatever else here */}



        <h3 className="text-3xl font-bold text-gray-800">
          {store ? `${titleCase(store)}'s Store` : 'Store'}
        </h3>
        {category && (
          <p className="text-lg text-gray-600 mb-4">
            Category: <strong>{titleCase(category)}</strong>
          </p>
        )}
        <hr className="mb-4" />

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found for this store.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                >
                  <img
                    src={
                      product.image_url ||
                      'https://placehold.co/300x300?text=No+Image&font=roboto'
                    }
                    alt={product.name}
                    className="h-60 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-md font-medium text-gray-800 truncate">
                      {product.name}
                    </h2>
                    <p className="text-lg font-bold text-blue-700 mt-2 mb-4">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-auto bg-blue-600 text-white text-sm py-2 rounded hover:bg-pink-700 transition-colors duration-300"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
            
          </>
        )}
        
      </div>
      
    </>
  );
}
