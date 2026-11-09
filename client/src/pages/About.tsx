export default function About() {
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Panduan Penggunaan</h1>
        <p className="text-gray-400">Pelajari cara memaksimalkan AI MT5 Scalping Scanner.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kartu 1: Cara Upload */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-700/50">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
          <h2 className="text-xl font-bold text-white mb-2">Siapkan Screenshot Chart</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Buka aplikasi MetaTrader 5 (MT5) di HP atau PC Anda. Ambil *screenshot* chart dengan dua *timeframe* berbeda:
            <br/><br/>
            • <strong className="text-blue-300">H1 / H4</strong> (Untuk melihat arah Tren Utama)<br/>
            • <strong className="text-green-300">M5 / M15</strong> (Untuk melihat area Entry)
          </p>
        </div>

        {/* Kartu 2: Upload ke Web */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-700/50">
          <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
          <h2 className="text-xl font-bold text-white mb-2">Upload ke Scanner</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Kembali ke halaman <strong>Scanner</strong>. Klik kotak ungu (H1) dan kotak hijau (M5) untuk mengunggah kedua gambar tersebut.
            <br/><br/>
            Setelah kedua gambar siap, klik tombol biru besar <strong>🚀 ANALYZE MULTI-TIMEFRAME</strong>.
          </p>
        </div>

        {/* Kartu 3: Membaca Hasil */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-700/50">
          <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
          <h2 className="text-xl font-bold text-white mb-2">Baca Hasil Analisis</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI akan memproses kedua gambar. Jika tren searah, AI akan memberikan sinyal <strong>BUY</strong> atau <strong>SELL</strong>.
            <br/><br/>
            Garis <span className="text-blue-400">Entry</span>, <span className="text-red-400">SL</span>, dan <span className="text-green-400">TP</span> akan otomatis tergambar di atas gambar M5 Anda. Jika tidak ada peluang, AI akan memberikan sinyal <strong>NO TRADE</strong>.
          </p>
        </div>

        {/* Kartu 4: Aturan Emas */}
        <div className="glass-panel p-6 rounded-2xl border border-yellow-700/50 bg-yellow-900/10">
          <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center font-bold text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Aturan Emas (Disiplin)</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            • Selalu gunakan <strong>Stop Loss (SL)</strong>.<br/>
            • Jangan pernah memaksakan entry jika AI memberikan <strong>NO TRADE</strong>.<br/>
            • Sinyal ini bersifat <em>Decision Support</em> (Alat Bantu), bukan jaminan pasti profit.<br/>
            • Gunakan manajemen risiko maksimal 1-2% dari modal Anda.
          </p>
        </div>

      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>AI MT5 Scalping Scanner v1.0</p>
        <p>Dibuat untuk trader yang disiplin dan cerdas.</p>
      </div>
    </div>
  );
}