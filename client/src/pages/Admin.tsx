import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Admin() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:3001/api/admin/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(response.data.pending);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (email: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('http://localhost:3001/api/admin/approve', { targetEmail: email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`User ${email} berhasil di-upgrade ke PRO!`);
      fetchPending(); // Refresh list
    } catch (error) {
      alert('Gagal approve user');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">👑 Dashboard Admin - Verifikasi Pembayaran</h2>
      
      {loading ? (
        <p className="text-gray-400">Memuat data...</p>
      ) : pending.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl text-center text-gray-400">
          Tidak ada pembayaran yang menunggu verifikasi.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((user) => (
            <div key={user.email} className="glass-panel p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-white font-bold">{user.email}</p>
                <p className="text-sm text-gray-400">Status: Menunggu Verifikasi</p>
              </div>
              <button 
                onClick={() => handleApprove(user.email)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                Approve PRO
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}