import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function Products() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'seller') {
        setRole('unauthorized');
        setLoading(false);
        return;
      }

      const userBusiness = user.user_metadata.businessName;
      setRole('seller');
      setBusinessName(userBusiness);

      const { data: categoriesData, error: catErr } = await supabase
        .from('categories')
        .select('name')
        .eq('business_name', userBusiness);

      if (catErr) console.error(catErr.message);
      else setCategoriesList(categoriesData);

      await fetchProducts(userBusiness);
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchProducts = async (bizName) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_name', bizName.toLowerCase());

    if (error) console.error(error.message);
    else setProducts(data);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setBrand('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !businessName || !category || !brand) {
      setStatus('All fields are required');
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setStatus('Not authenticated');
      return;
    }

    const productData = {
      name,
      price: parseFloat(price),
      business_name: businessName.toLowerCase(),
      category: category.toLowerCase(),
      brand: brand.toLowerCase(),
      user_id: user.id,
    };

    let result;
    if (editingId) {
      result = await supabase.from('products').update(productData).eq('id', editingId);
      setStatus(result.error ? '❌ Failed to update' : '✅ Product updated');
    } else {
      result = await supabase.from('products').insert([productData]);
      setStatus(result.error ? '❌ Failed to add' : '✅ Product added');
    }

    if (!result.error) {
      await fetchProducts(businessName);
      resetForm();
    }
  };

  const handleEdit = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setBrand(product.brand);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setStatus('❌ Failed to delete');
    } else {
      setStatus('✅ Product deleted');
      await fetchProducts(businessName);
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <p className="p-4">Loading...</p>;
  if (role !== 'seller') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-red-600 text-xl font-semibold">🚫 Access Denied</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Product Manager</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold">{editingId ? '✏️ Edit Product' : '➕ Add Product'}</h2>

        <input type="text" placeholder="Name" className="w-full border p-2 rounded"
          value={name} onChange={(e) => setName(e.target.value)} />

        <input type="number" placeholder="Price" className="w-full border p-2 rounded"
          value={price} onChange={(e) => setPrice(e.target.value)} />

        <select className="w-full border p-2 rounded"
          value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">-- Select Category --</option>
          {categoriesList.map((cat) => (
            <option key={cat.name} value={cat.name.toLowerCase()}>{cat.name}</option>
          ))}
        </select>

        <input type="text" placeholder="Brand" className="w-full border p-2 rounded"
          value={brand} onChange={(e) => setBrand(e.target.value)} />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editingId ? 'Update Product' : 'Add Product'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="ml-2 text-sm text-gray-500 underline">
            Cancel Edit
          </button>
        )}
        {status && <p className="text-sm mt-2 text-gray-700">{status}</p>}
      </form>

      {/* PRODUCT TABLE */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Your Products</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-2 border whitespace-nowrap">Name</th>
                <th className="p-2 border whitespace-nowrap">Price</th>
                <th className="p-2 border whitespace-nowrap">Category</th>
                <th className="p-2 border whitespace-nowrap">Brand</th>
                <th className="p-2 border whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
                <tr key={prod.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border">{prod.name}</td>
                  <td className="p-2 border">₦{prod.price}</td>
                  <td className="p-2 border">{prod.category}</td>
                  <td className="p-2 border">{prod.brand}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(prod)} className="text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(prod.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
