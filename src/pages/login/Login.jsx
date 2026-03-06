import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

// Hardcoded credentials (for development only)
const CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123',
};

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      toast.error('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate a short network delay for better UX
    await new Promise((r) => setTimeout(r, 600));

    if (trimmedUsername === CREDENTIALS.username && trimmedPassword === CREDENTIALS.password) {
      toast.success('Login successful. Redirecting…');
      setTimeout(() => navigate('/home', { replace: true }), 400);
    } else {
      setIsLoading(false);
      toast.error('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              Suite Bridge Project
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <FaUser className="w-5 h-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <FaLock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[40px]"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Use the configured credentials to sign in.
        </p>
      </div>
    </div>
  );
}

export default Login;
