import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../utils/supabaseClient';

export default function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('customer_orders')
      .select('id, items, total, status, created_at')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setOrders(data);
    setLoading(false);
  };

  const fetchLogistics = async () => {
    const { data, error } = await supabase.from('logistics').select('*');
    if (error) console.error(error);
    else setLogistics(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchLogistics();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📦 Seller Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
  <div key={order.id} className="border p-4 rounded-md shadow-sm mb-4">
    <h3 className="text-lg font-semibold">Order ID: {order.id}</h3>
    <p>Customer: {order.customer_name}</p>
    <p>Total: ₦{order.total}</p>

    <ul className="ml-4 list-disc">
      {order.items.map((item, index) => (
        <li key={index}>{item.name} x {item.quantity}</li>
      ))}
    </ul>

    <div className="mt-2">
      <Link href={`/edit-order/${order.id}`}>
        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Edit Order
        </button>
      </Link>
    </div>
  </div>
))}
            <div className="flex justify-between mt-4">
              <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
              <span>Page {page}</span>
              <button onClick={() => setPage(prev => prev + 1)} className="bg-gray-300 px-4 py-2 rounded">Next</button>
            </div>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
        <div className="flex gap-4">
          <a href="/add-product" className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</a>
          <a href="/manage-products" className="bg-purple-600 text-white px-4 py-2 rounded">Manage Products</a>
        </div>
      </section>

      
    </div>
  );
}
