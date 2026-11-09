import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import MarketTicker from '../components/MarketTicker';

interface HomeProps {
  onUpgradeClick: () => void;
}

export default function Home({ onUpgradeClick }: HomeProps) {
  const [imageH1, setImageH1] = useState<File | null>(null);
  const [imageM5, setImageM5] = useState<File | null>(null);
  const [previewH1, setPreviewH1] = useState<string | null>(null);
  const [previewM5, setPreviewM5] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);

  const fileH1Ref = useRef<HTMLInputElement>(null);
  const fileM5Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsPro(payload.status === 'pro');
      } catch (e) {}
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'H1' | 'M5') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'H1') {
        setImageH1(file);
        setPreviewH1(URL.createObjectURL(file));
      } else {
        setImageM5(file);
        setPreviewM5(URL.createObjectURL(file));
      }
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageH1 || !imageM5) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('imageH1', imageH1);
    formData.append('imageM5', imageM5);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/api/analyze', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.data.ok) {
        setResult(response.data.result);
        if (!isPro && quota) setQuota(quota - 1);
      } else {
        setError(response.data.message || 'Gagal menganalisis gambar.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server AI sedang mati atau terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImageH1(null); setImageM5(null);
    setPreviewH1(null); setPreviewM5(null);
    setResult(null); setError(null);
  };

  const renderOverlay = () => {
    if (!result || result.signal === 'NO_TRADE') return null;
    const { entry, sl, tp1, tp2 } = result;
    if (!entry || !sl || !tp1 || !tp2) return null;

    const maxPrice = Math.max(entry, sl, tp1, tp2);
    const minPrice = Math.min(entry, sl, tp1, tp2);
    const priceRange = maxPrice - minPrice;

    const getPosition = (price: number) => {
      if (priceRange === 0) return 50;
      return ((maxPrice - price) / priceRange) * 80 + 10; 
    };

    return (
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
        <div className="absolute w-full border-t-2 border-green-500/50" style={{ top: `${getPosition(tp2)}%` }}>
          <span className="absolute right-2 -top-3 bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded backdrop-blur-md border border-green-500/50">TP2: {tp2}</span>
        </div>
        <div className="absolute w-full border-t-2 border-green-500" style={{ top: `${getPosition(tp1)}%` }}>
          <span className="absolute right-2 -top-3 bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded backdrop-blur-md border border-green-500/50">TP1: {tp1}</span>
        </div>
        <div className="absolute w-full border-t-2 border-blue-500 border-dashed" style={{ top: `${getPosition(entry)}%` }}>
          <span className="absolute right-2 -top-3 bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded backdrop-blur-md border border-blue-500/50">ENTRY: {entry}</span>
        </div>
        <div className="absolute w-full border-t-2 border-red-500" style={{ top: `${getPosition(sl)}%` }}>
          <span className="absolute right-2 -top-3 bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded backdrop-blur-md border border-red-500/50">SL: {sl}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-10 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-16 w-full left-0 z-10">
        <MarketTicker />
      </div>

      <div className="text-center mb-8 relative z-10 mt-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
          <span className="text-gradient">AI MT5 Scalping Scanner</span>
        </h1>
        <p className="text-gray-400 text-lg">Top-Down Analysis (H1 + M5)</p>
      </div>

      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 relative z-10">
        {/* Kotak H1 */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-sm font-semibold tracking-wider text-blue-100 uppercase">Chart H1 / H4 (Trend)</p>
          </div>
          {!previewH1 ? (
            <div onClick={() => fileH1Ref.current?.click()} className="w-full h-72 glass-panel rounded-2xl flex flex-col items-center justify-center cursor-pointer upload-glow-h1 border-dashed border-2 border-gray-600">
              <svg className="w-12 h-12 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="text-gray-300 font-medium">Klik Upload H1</p>
            </div>
          ) : (
            <div className="relative w-full glass-panel p-2 rounded-2xl">
              <img src={previewH1} alt="H1" className="rounded-xl w-full object-contain max-h-64" />
              <button onClick={() => { setPreviewH1(null); setImageH1(null); }} className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-500 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20">X</button>
            </div>
          )}
        </div>

        {/* Kotak M5 (Dengan Overlay) */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm font-semibold tracking-wider text-green-100 uppercase">Chart M5 / M15 (Entry)</p>
          </div>
          {!previewM5 ? (
            <div onClick={() => fileM5Ref.current?.click()} className="w-full h-72 glass-panel rounded-2xl flex flex-col items-center justify-center cursor-pointer upload-glow-m5 border-dashed border-2 border-gray-600">
              <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="text-gray-300 font-medium">Klik Upload M5</p>
            </div>
          ) : (
            <div className="relative w-full glass-panel p-2 rounded-2xl">
              <div className="relative">
                <img src={previewM5} alt="M5" className="rounded-xl w-full object-contain max-h-64" />
                {renderOverlay()}
              </div>
              <button onClick={() => { setPreviewM5(null); setImageM5(null); }} className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-500 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg z-20">X</button>
            </div>
          )}
        </div>
      </div>

      <input type="file" accept="image/*" ref={fileH1Ref} onChange={(e) => handleImageChange(e, 'H1')} className="hidden" />
      <input type="file" accept="image/*" ref={fileM5Ref} onChange={(e) => handleImageChange(e, 'M5')} className="hidden" />
      
      {previewH1 && previewM5 && !loading && !result && (
        <button onClick={handleAnalyze} className="mt-8 w-full max-w-3xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg py-4 px-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 relative z-10">
          🚀 ANALYZE MULTI-TIMEFRAME
        </button>
      )}

      {(previewH1 || previewM5) && !loading && (
        <button onClick={resetForm} className="mt-4 w-full max-w-3xl glass-panel hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-2xl transition-all relative z-10">
          Reset Form
        </button>
      )}

      {loading && (
        <div className="mt-10 flex flex-col items-center glass-panel p-8 rounded-2xl relative z-10">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-400 font-medium animate-pulse text-lg tracking-widest uppercase">Scanning Market Structure...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 w-full max-w-3xl bg-red-900/30 backdrop-blur-md border border-red-700/50 text-red-200 px-6 py-4 rounded-2xl shadow-lg relative z-10 flex flex-col items-center">
          <p>⚠️ {error}</p>
          {error.includes('Kuota') && (
            <button onClick={onUpgradeClick} className="mt-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg text-sm">
              ⭐ Upgrade ke PRO Sekarang
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="mt-10 w-full max-w-3xl glass-panel rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative z-10 border border-gray-600/50">
          <div className={`p-6 border-b border-gray-700/50 flex justify-between items-center ${result.signal === 'BUY' ? 'bg-green-500/10' : result.signal === 'SELL' ? 'bg-red-500/10' : 'bg-gray-800/50'}`}>
            <h2 className={`text-3xl font-black flex items-center gap-3 tracking-tighter ${result.signal === 'BUY' ? 'text-green-400' : result.signal === 'SELL' ? 'text-red-400' : 'text-gray-400'}`}>
              {result.signal === 'BUY' && '🟢 BUY'}
              {result.signal === 'SELL' && '🔴 SELL'}
              {result.signal === 'NO_TRADE' && '⚪ NO TRADE'}
            </h2>
            <span className="text-sm font-bold bg-gray-900/80 border border-gray-600 px-4 py-2 rounded-xl text-gray-200">{result.pair} • {result.timeframe}</span>
          </div>
          
          <div className="p-8 space-y-8">
            {result.signal !== 'NO_TRADE' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Entry Price</p>
                  <p className="font-mono text-2xl text-white font-semibold">{result.entry}</p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-xl border border-red-900/30">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Stop Loss</p>
                  <p className="font-mono text-2xl text-red-400 font-semibold">{result.sl}</p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-xl border border-green-900/30">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Take Profit 1</p>
                  <p className="font-mono text-2xl text-green-400 font-semibold">{result.tp1}</p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-xl border border-green-900/30">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Take Profit 2</p>
                  <p className="font-mono text-2xl text-green-400 font-semibold">{result.tp2}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4 text-lg">AI tidak menemukan setup scalping yang valid saat ini.</p>
            )}

            <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confidence Score</p>
                <p className="text-sm font-bold text-white">{result.confidence}/100</p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-1000 ${result.confidence > 70 ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-y from-yellow-500 to-yellow-400'}`} style={{ width: `${result.confidence}%` }}></div>
              </div>
            </div>

            <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-900/30">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">AI Analysis Reason</p>
              <p className="text-sm text-gray-200 leading-relaxed">{result.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- BANNER UPGRADE DI POJOK KANAN BAWAH --- */}
      {!isPro && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="glass-panel border border-yellow-500/50 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-gradient-to-r from-yellow-900/40 to-orange-900/40">
            <div className="text-3xl">🚀</div>
            <div>
              <p className="text-sm font-bold text-yellow-400">Mau Profit Konsisten?</p>
              <p className="text-xs text-gray-300">Upgrade ke PRO sekarang!</p>
            </div>
            <button 
              onClick={onUpgradeClick} 
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-sm transition-all ml-2"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
      {/* ------------------------------------------- */}

    </div>
  );
}