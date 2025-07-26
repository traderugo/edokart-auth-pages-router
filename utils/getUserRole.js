// utils/getUserRole.js
import supabase from './supabaseClient';

export const getUserRole = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  const role = user?.user_metadata?.role;

  if (!role) {
    console.warn('No role found in user_metadata');
    return null;
  }

  return role;
};
