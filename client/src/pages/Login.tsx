import { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await axios.post(`/api${endpoint}`, { email, password });
      if (isLogin) {
        onLoginSuccess(response.data.token);
      } else {
        setIsLogin(true);
        setError('Registrasi berhasil! Silakan login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ornamen Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">
            <span className="text-gradient">{isLogin ? 'Welcome Back' : 'Create Account'}</span>
          </h1>
          <p className="text-gray-400 text-sm">AI MT5 Scalping Scanner</p>
        </div>

        {error && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${error.includes('berhasil') ? 'bg-green-900/30 text-green-200 border-green-700/50' : 'bg-red-900/30 text-red-200 border-red-700/50'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="trader@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50">
            {loading ? 'Processing...' : isLogin ? 'LOGIN TO TERMINAL' : 'REGISTER ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-blue-400 hover:text-blue-300 font-bold tracking-wide">
            {isLogin ? 'DAFTAR' : 'LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
