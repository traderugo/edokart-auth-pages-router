// pages/categories.js
import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (error) console.error(error);
    else setCategories(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !businessName) return alert('All fields required');

    const user = supabase.auth.getUser();
    const payload = {
      name,
      business_name: businessName,
      user_id: (await user).data.user.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingId);
      if (error) console.error(error);
      else {
        setEditingId(null);
        setName('');
        setBusinessName('');
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) console.error(error);
      else {
        setName('');
        setBusinessName('');
        fetchCategories();
      }
    }
  }

  async function handleDelete(id) {
    const confirmDelete = confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error(error);
    else fetchCategories();
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setBusinessName(category.business_name);
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {editingId ? 'Update Category' : 'Add Category'}
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex justify-between items-center border p-2 rounded">
            <div>
              <strong>{cat.name}</strong> <br />
              <small>{cat.business_name}</small>
            </div>
            <div className="space-x-2">
              <button onClick={() => startEdit(cat)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
