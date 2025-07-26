// pages/thank-you.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabaseClient';

export default function ThankYouPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Order fetch error:', error);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your receipt...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Order not found.
      </div>
    );
  }

  const { items, total } = order;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-100 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">🎉 Thank You!</h1>
        <p className="text-gray-700 mb-6">Your order has been placed successfully.</p>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">🧾 Order Summary</h2>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded shadow-sm"
            >
              <div>
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity} × ₦{item.price}</p>
              </div>
              <div className="text-right text-md font-semibold text-gray-800">
                ₦{item.quantity * item.price}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4 text-right">
          <span className="text-xl font-bold text-gray-900">Total: ₦{total}</span>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/search"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            🛍️ Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
