import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Custom securely typed Hook abstracting away useContext boilerplate and stopping Prop Drilling!
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be called strictly within an <AuthProvider> tree');
  }

  return context;
};
