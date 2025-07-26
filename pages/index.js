import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }

      if (user) {
        setUser(user);
        setRole(user.user_metadata?.role || 'No role found');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
        <p className="text-lg">Role: {role}</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
