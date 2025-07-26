import { useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          businessName,
          phone,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (!data.session) {
      alert('✅ Check your email for the confirmation link!');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-xl space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
