import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const from = location.state?.from?.pathname || '/';
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(credentials);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Unable to sign in. Please check your credentials.');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-700/70 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-light/80">PrepWise</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">Sign in to continue</h1>
          <p className="mt-3 text-sm text-slate-400">Keep your progress, XP, and learning streak synced across sessions.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-brand-light focus:ring-2 focus:ring-brand-light/25"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Password</span>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-brand-light focus:ring-2 focus:ring-brand-light/25"
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl bg-brand-light px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in…' : 'Continue to PrepWise'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-slate-500">
          New to PrepWise? <Link to="/register" className="font-semibold text-white hover:text-brand-light">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
