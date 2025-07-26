import { useEffect, useState } from 'react';

export default function CartPage() {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save to localStorage when removing
  const removeFromCart = (id) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🛒 Your Cart</h1>
      <a href="/shop" className="text-blue-600 hover:underline">← Back to Shop</a>

      {cart.length === 0 ? (
  <p className="mt-6 text-gray-600">Your cart is empty.</p>
) : (
  <div className="mt-6 space-y-6">
    {cart.map(item => (
      <div key={item.id} className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
            <p className="text-gray-600">Qty: {item.quantity}</p>
            <p className="text-gray-800 font-bold">${item.price * item.quantity}</p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    ))}
    <div className="text-xl font-bold text-right">Total: ${total}</div>
    <div className="text-right mt-4">
      <a
        href="/checkout"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition"
      >
        Proceed to Checkout
      </a>
    </div>
  </div>
)}

    </div>
  );
}
