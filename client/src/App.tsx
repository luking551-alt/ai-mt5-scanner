import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import History from './pages/History';
import Admin from './pages/Admin';
import About from './pages/About';
import UpgradeModal from './pages/UpgradeModal';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  // Tambahkan 'about' ke dalam tipe state halaman
  const [currentPage, setCurrentPage] = useState<'scanner' | 'history' | 'admin' | 'about'>('scanner');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const handleAuthChange = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setCurrentPage('scanner');
  };

  const getUserData = () => {
    if (!token) return { email: '', status: 'free' };
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { email: payload.email, status: payload.status || 'free' };
    } catch (e) {
      return { email: 'Trader', status: 'free' };
    }
  };

  const user = getUserData();

  if (!token) {
    return <Login onLoginSuccess={handleAuthChange} />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        
        {/* Navigasi Kiri */}
        <div className="pointer-events-auto flex items-center gap-2 bg-gray-900/50 backdrop-blur-md border border-gray-700/50 p-1 rounded-xl">
          <button 
            onClick={() => setCurrentPage('scanner')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === 'scanner' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-gray-400 hover:text-white'}`}
          >
            Scanner
          </button>
          <button 
            onClick={() => setCurrentPage('history')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === 'history' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-gray-400 hover:text-white'}`}
          >
            History
          </button>
          <button 
            onClick={() => setCurrentPage('about')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === 'about' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-gray-400 hover:text-white'}`}
          >
            Panduan
          </button>
          
          {/* Tombol Admin */}
          {user.email === 'admin@scanner.com' && (
            <button 
              onClick={() => setCurrentPage('admin')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === 'admin' ? 'bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]' : 'text-gray-400 hover:text-yellow-400'}`}
            >
              👑 Admin
            </button>
          )}
        </div>
        
        {/* Profil Kanan */}
        <div className="pointer-events-auto flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300 bg-gray-900/50 backdrop-blur-md border border-gray-700/50 px-4 py-2 rounded-xl hidden md:block">
            👤 {user.email}
          </span>

          {user.status === 'pro' ? (
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              ⭐ PRO
            </span>
          ) : user.status === 'pending' ? (
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-4 py-2 rounded-xl text-sm font-bold">
              ⏳ PENDING
            </span>
          ) : user.status === 'admin' ? (
            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/50 px-4 py-2 rounded-xl text-sm font-bold">
              👑 ADMIN
            </span>
          ) : (
            <button 
              onClick={() => setIsUpgradeOpen(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all animate-pulse"
            >
              ⭐ Upgrade
            </button>
          )}

          <button onClick={handleLogout} className="bg-red-900/40 hover:bg-red-800/60 backdrop-blur-md text-red-200 text-sm font-bold px-4 py-2 rounded-xl border border-red-700/50 transition-all">
            Logout
          </button>
        </div>
      </div>

      {/* Konten Utama */}
                 <div className="pt-16">
        {currentPage === 'scanner' && <Home onUpgradeClick={() => setIsUpgradeOpen(true)} />}
        {currentPage === 'history' && <History />}
        {currentPage === 'about' && <About />}
        {currentPage === 'admin' && <Admin />}
      </div>

      {isUpgradeOpen && (
        <UpgradeModal 
  onClose={() => setIsUpgradeOpen(false)} 
/>
      )}
    </div>
  );
}
