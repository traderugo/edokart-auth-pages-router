import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../utils/supabaseClient';

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setError('Failed to fetch order.');
    } else {
      setOrder(data);
    }

    setLoading(false);
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...order.items];
    updatedItems[index][field] = value;
    setOrder({ ...order, items: updatedItems });
  };

  const updateOrder = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('customer_orders')
      .update({ items: order.items, total: order.total, status: order.status })
      .eq('id', id);

    if (error) {
      console.error(error);
      setError('Update failed.');
    } else {
      router.push('/dashboard');
    }

    setUpdating(false);
  };

  if (loading) return <div className="p-6">Loading order...</div>;
  if (!order) return <div className="p-6 text-red-500">Order not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Edit Order #{id}</h1>

      {order.items.map((item, index) => (
        <div key={index} className="border p-4 rounded mb-4">
          <label className="block mb-1 font-semibold">Item Name</label>
          <input
            className="w-full border px-2 py-1 rounded"
            value={item.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
          />
          <label className="block mt-2 mb-1 font-semibold">Quantity</label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded"
            value={item.quantity}
            onChange={(e) => handleChange(index, 'quantity', parseInt(e.target.value))}
          />
        </div>
      ))}

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Status</label>
        <select
          className="w-full border px-2 py-1 rounded"
          value={order.status}
          onChange={(e) => setOrder({ ...order, status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Total (₦)</label>
        <input
          type="number"
          className="w-full border px-2 py-1 rounded"
          value={order.total}
          onChange={(e) => setOrder({ ...order, total: parseFloat(e.target.value) })}
        />
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        onClick={updateOrder}
        disabled={updating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {updating ? 'Updating...' : 'Update Order'}
      </button>
    </div>
  );
}
