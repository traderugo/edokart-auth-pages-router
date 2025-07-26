import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabaseClient';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

 const user = supabase.auth.getUser();

const handleCheckout = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return alert('You must be logged in to place an order.');
  }

  const { data, error } = await supabase
    .from('customer_orders')
    .insert([
      {
        user_id: userData.user.id,
        items: cart,
        total,
        status: 'pending',
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase Error:', error);
    return alert('Failed to save order.');
  }

  localStorage.removeItem('cart');
  router.push(`/thank-you?id=${data.id}`);
};


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🧾 Checkout</h1>
      <a href="/cart" className="text-blue-600 hover:underline">← Back to Cart</a>

      {cart.length === 0 ? (
        <p className="mt-6 text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p>Qty: {item.quantity} | ₦{item.price * item.quantity}</p>
            </div>
          ))}


          <div className="text-xl font-bold text-right">Total: ₦{total}</div>

          <button
            onClick={handleCheckout}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
