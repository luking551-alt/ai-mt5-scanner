import { useState, useEffect } from 'react';

const CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
  'MATICUSDT', 'SHIBUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT'
];

const FOREX_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'AUDUSD', 
  'USDCAD', 'NZDUSD', 'USDCHF', 'XAGUSD'
];

export default function MarketTicker() {
  const [prices, setPrices] = useState<any>({});
  const [prevPrices, setPrevPrices] = useState<any>({});

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      const data = await response.json();
      
      const newPrices: any = {};
      data.forEach((item: any) => {
        if (CRYPTO_SYMBOLS.includes(item.symbol)) {
          newPrices[item.symbol] = parseFloat(item.price);
        }
      });
      
      setPrevPrices(prices);
      setPrices((prev: any) => ({ ...prev, ...newPrices }));
    } catch (error) {
      console.error('Gagal mengambil harga crypto', error);
    }
  };

  const simulateForex = () => {
    setPrices((prev: any) => {
      const updated = { ...prev };
      FOREX_SYMBOLS.forEach(symbol => {
        let basePrice = updated[symbol];
        if (!basePrice) {
          if (symbol === 'XAUUSD') basePrice = 2400.00;
          else if (symbol === 'XAGUSD') basePrice = 28.50;
          else if (symbol === 'USDJPY') basePrice = 155.00;
          else basePrice = 1.1000;
        }
        const change = (Math.random() - 0.5) * (symbol === 'XAUUSD' ? 2 : symbol === 'XAGUSD' ? 0.2 : 0.001);
        updated[symbol] = basePrice + change;
      });
      return updated;
    });
  };

  useEffect(() => {
    fetchCryptoPrices();
    simulateForex();

    const interval = setInterval(() => {
      fetchCryptoPrices();
      simulateForex();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderTicker = (symbol: string) => {
    const price = prices[symbol];
    const prev = prevPrices[symbol];
    const isUp = prev ? price >= prev : true;
    
    if (!price) return null;

    let decimals = 4;
    if (symbol === 'XAUUSD' || symbol === 'XAGUSD') decimals = 2;
    if (symbol === 'USDJPY') decimals = 2;
    if (symbol === 'SHIBUSDT') decimals = 6;

    return (
      <div key={symbol} className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50 mx-2">
        <span className="text-xs font-bold text-gray-300">{symbol.replace('USDT', '/USDT')}</span>
        <span className={`text-xs font-mono font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {price.toFixed(decimals)}
        </span>
        <span className={`text-[10px] ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? '▲' : '▼'}
        </span>
      </div>
    );
  };

  const allSymbols = [...CRYPTO_SYMBOLS, ...FOREX_SYMBOLS];

  return (
    <div className="w-full overflow-hidden bg-[#0B0F14] border-y border-gray-800 py-2 relative flex">
      {/* 
        Kita hanya membuat SATU baris panjang. 
        Animasi CSS yang akan memutarnya secara mulus.
      */}
      <div className="flex animate-marquee whitespace-nowrap">
        {allSymbols.map(renderTicker)}
        {/* Duplikasi elemen tepat setelahnya agar saat animasi berulang, layar tidak kosong */}
        {allSymbols.map(renderTicker)}
      </div>
    </div>
  );
}
