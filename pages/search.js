import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabaseClient';

export default function CategoryLinks() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = router.query.store;
    if (fromQuery) {
      setSearch(fromQuery);
      fetchCategories(fromQuery);
    }
  }, [router.isReady, router.query.store]);

  const fetchCategories = async (value = search) => {
    if (!value) return;

    setQuerying(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('business_name', `%${value}%`);

    if (error) {
      console.error(error);
      setCategories([]);
    } else {
      setCategories(data);
    }

    setQuerying(false);
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push(`?store=${encodeURIComponent(search.trim())}`);
    fetchCategories();
  };

  const formatBusinessName = (name) =>
    name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🧢 Header */}
      <header className="bg-white shadow-sm py-2">
        <h1 className="text-center text-2xl font-bold text-blue-600">Cartify</h1>
      </header>

      {/* 🔍 Search Bar */}
      <div className="max-w-xl mx-auto mt-6 px-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name..."
            className="flex-grow px-3 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {querying ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* 📦 Results */}
      <div className="max-w-2xl mx-auto mt-4 px-2 space-y-2">
        {categories.length === 0 && !querying && (
          <p className="text-center text-gray-500 text-sm">No results found. Try another name.</p>
        )}

        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/store/${cat.business_name.toLowerCase()}?category=${cat.name.toLowerCase()}`}
            className="block bg-white rounded shadow-sm p-2 hover:shadow transition border border-gray-200"
          >
            <div className="flex gap-3 items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                alt="Store Icon"
                className="w-10 h-10 object-cover rounded-full bg-gray-200"
              />
              <div>
                <h2 className="text-base font-medium text-gray-900">{cat.name}</h2>
                <p className="text-xs text-gray-500">{formatBusinessName(cat.business_name)}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
