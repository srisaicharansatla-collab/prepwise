import React, { createContext, useState, useEffect } from 'react';

// Initialize context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Try mapping token from LocalStorage strictly on boot to keep user securely signed in across refreshes
  const [token, setToken] = useState(localStorage.getItem('prepwise_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Gamification Algorithm computing Level exactly based upon their Total XP.
  // We use a math floor formula creating a curve where higher levels require geometrically more XP
  const level = user ? Math.floor(Math.sqrt(user.totalXP / 100)) + 1 : 1;

  useEffect(() => {
    // Hydrate User User Profile when App Boots or Token specifically changes
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`, // Leveraging Bearer architecture
            },
          });
          const data = await response.json();
          
          if (data.success) {
            setUser(data.data);
          } else {
            // Token is likely expired or invalid, auto-kick user
            logout();
          }
        } catch (error) {
          console.error("Failed to initialize authentication strictly", error);
          logout();
        }
      }
      setIsLoading(false); // Drop loading curtain regardless of success/fail
    };

    initializeAuth();
  }, [token]);

  // Login execution abstracting away fetch logic from UI components
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Login rejected' };
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.data);
        localStorage.setItem('prepwise_token', data.token); // Secure persistence
        return { success: true };
      }
      return { success: false, message: data.message || 'Login rejected' };
    } catch (error) {
      return { success: false, message: 'Unable to reach server' };
    }
  };

  const register = async (credentials) => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.data);
        localStorage.setItem('prepwise_token', data.token);
        return { success: true };
      }

      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: 'Unable to reach server' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('prepwise_token'); // Purge token
    // Side-note: In a real environment with httpOnly cookies, you'd also fetch('/api/users/logout')
  };

  // refreshStats exclusively grabs gamification updates without requiring a hard refresh or unmounting components
  const refreshStats = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Only update gamification slices avoiding wiping out other local React states
        setUser((prev) => ({
          ...prev,
          totalXP: data.data.totalXP,
          currentStreak: data.data.currentStreak,
          badges: data.data.badges,
        }));
      }
    } catch (error) {
      console.error("Failed to dynamically refresh gamification stats", error);
    }
  };

  // Memoize properties injected down exactly as requested
  const value = {
    user,
    token,
    isLoading,
    level, // Easy-access Gamification stat
    login,
    register,
    logout,
    refreshStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading PrepWise...</div>}
    </AuthContext.Provider>
  );
};
