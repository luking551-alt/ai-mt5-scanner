import { useState, useEffect } from 'react';
import axios from 'axios';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://localhost:3001/api/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data.history);
      } catch (error) {
        console.error("Gagal mengambil history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-400 animate-pulse">Memuat riwayat...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">📜 Riwayat Analisis</h2>
      
      {history.length === 0 ? (
        <div className="text-center text-gray-500 glass-panel p-10 rounded-2xl">
          Belum ada riwayat analisis. Silakan kembali ke Scanner.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-xl flex gap-4 items-start">
              {/* Gambar M5 */}
              <img 
                src={`data:${item.mimeType};base64,${item.imageM5}`} 
                alt="Chart" 
                className="w-24 h-24 object-cover rounded-lg border border-gray-600"
              />
              
              {/* Info Analisis */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${item.result.signal === 'BUY' ? 'text-green-400' : item.result.signal === 'SELL' ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.result.signal}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-sm font-mono text-white mb-1">{item.result.pair} • {item.result.timeframe}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{item.result.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}