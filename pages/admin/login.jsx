import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAdmin();

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.push('/admin/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Invalid email or password. Only admin accounts can log in.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-container flex-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex-center mb-4 gap-3">
            <Image 
              src="/logo.png" 
              alt="WinZone Logo" 
              width={64} 
              height={64} 
              className="w-16 h-16 object-contain"
              priority
            />
            <span className="text-2xl sm:text-3xl font-bold text-white">Winzone</span>
          </div>
          <h1 className="heading-2">Admin Portal</h1>
          <p className="text-body-sm mt-2">Sign in to manage draws & prizes</p>
        </div>

        {/* Login Card */}
        <div className="card-dark card-padding shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="badge-error bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-responsive-xs flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-md w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-winzone-purple-light">
            <p className="text-muted text-center">
              Only administrators can access this portal.
              <br />
              <span className="text-slate-600">Configure admin in PocketBase dashboard.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-responsive-xs mt-6">
          &copy; {new Date().getFullYear()} WinZone. Admin Panel.
        </p>
      </div>
    </div>
  );
}


