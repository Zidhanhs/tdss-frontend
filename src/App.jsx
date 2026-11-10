import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, CheckCircle2, XCircle, 
  ChevronRight, BarChart2, Activity, Send
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [syariahOnly, setSyariahOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stocks');
        const data = await response.json();
        setStocks(data);
        if (data.length > 0) {
          setSelectedStock(data[0]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data dari API:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh tiap 1 menit
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !selectedStock) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4" style={{ height: '100vh', background: '#f8fafc' }}>
        <Activity size={48} color="#059669" className="animate-pulse" />
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>Menarik Data Bursa Live...</h2>
      </div>
    );
  }

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSyariah = syariahOnly ? stock.isSyariah : true;
    return matchesSearch && matchesSyariah;
  });

  return (
    <div className="dashboard-container">
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon"><Activity size={20} /></div>
          <div>
            <h1 className="brand-title">TDSS Engine</h1>
            <p className="brand-subtitle">Trading Decision Support System</p>
          </div>
        </div>
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari kode saham (misal: TLKM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="nav-actions">
          <button onClick={() => setSyariahOnly(!syariahOnly)} className={`syariah-btn ${syariahOnly ? 'active' : ''}`}>
            <ShieldCheck size={16} />
            <span>Syariah Only</span>
          </button>
          <div className="status-badge">
            <span className="pulse-dot"></span>
            <span>BEI Live</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="info-card">
          <div>
            <div className="title-row">
              <h2>{selectedStock.name} ({selectedStock.ticker})</h2>
              {selectedStock.isSyariah ? <span className="syariah-tag">☪ SYARIAH</span> : <span className="non-syariah-tag">Non-Syariah</span>}
            </div>
            <p className="subtitle">Bursa Efek Indonesia • Real-Time Daily Technical Scanning</p>
          </div>
          <div className="price-row">
            <span className="main-price">Rp {selectedStock.price.toLocaleString('id-ID')}</span>
            <span className={`change-badge ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
              {selectedStock.change >= 0 ? `+${selectedStock.change}%` : `${selectedStock.change}%`}
            </span>
          </div>
        </div>

        <div className="grid-layout">
          <div className="chart-card">
            <div className="card-header">
              <div className="header-title">
                <BarChart2 size={18} color="#059669" />
                <h3>Grafik Teknikal & Overlays</h3>
              </div>
              <div className="indicator-tags">
                <span>EMA 50</span>
                <span>EMA 200</span>
                <span>MACD</span>
              </div>
            </div>

            <div className="chart-visual" style={{ padding: '16px 16px 0 16px' }}>
              <div className="chart-top">
                <span>Riwayat Harga (30 Hari Terakhir)</span>
                <span>Live Data Terhubung</span>
              </div>
              
              {/* INTERACTIVE CHART RECHARTS */}
              <div className="chart-body" style={{ height: '220px', width: '100%', marginTop: '16px' }}>
                {selectedStock.chartData && selectedStock.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedStock.chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="price" name="Harga" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                      <Area type="monotone" dataKey="ema50" name="EMA 50" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
                    Data grafik memuat...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className={`signal-card ${selectedStock.signal.toLowerCase().replace(' ', '-')}`}>
              <div className="signal-header">
                <div>
                  <p className="card-label">INSTANT SIGNAL ACTION</p>
                  <h3>REKOMENDASI</h3>
                </div>
                <span className={`signal-badge ${selectedStock.signal.toLowerCase().replace(' ', '-')}`}>{selectedStock.signal}</span>
              </div>

              {selectedStock.signal !== 'SELL' ? (
                <div className="signal-details">
                  <div className="detail-row">
                    <span>Area Beli (Entry)</span>
                    <strong>Rp {selectedStock.entryLow.toLocaleString('id-ID')} - Rp {selectedStock.entryHigh.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Target Profit (TP)</span>
                    <strong className="text-green">Rp {selectedStock.tp.toLocaleString('id-ID')} (+5.2%)</strong>
                  </div>
                  <div className="detail-row">
                    <span>Stop Loss (SL)</span>
                    <strong className="text-red">Rp {selectedStock.sl.toLocaleString('id-ID')} (-2.5%)</strong>
                  </div>
                </div>
              ) : (
                <div className="sell-warning">
                  <strong>⚠️ Sinyal Jual / Hindari Saham Ini</strong>
                  <p>Indikator teknikal menunjukkan tren melemah atau tidak memenuhi kriteria beli.</p>
                </div>
              )}
              {/* TOMBOL TELEGRAM BARU */}
              <button 
                className="btn-telegram" 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = 'MENGIRIM...';
                  btn.disabled = true;
                  btn.style.opacity = '0.7';
                  
                  try {
                    const response = await fetch('http://localhost:5000/api/telegram', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(selectedStock)
                    });
                    
                    if (response.ok) {
                      alert(`✅ Alert Saham ${selectedStock.ticker} berhasil dikirim ke Telegram kamu!`);
                    } else {
                      alert("❌ Gagal mengirim alert.");
                    }
                  } catch (err) {
                    alert("❌ Server Python belum merespon atau error jaringan.");
                  } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                  }
                }}
              >
                <Send size={14} />
                <span>Kirim Alert ke Telegram</span>
              </button>
            </div>

            <div className="score-card">
              <div className="card-header">
                <h3>Technical Checklist</h3>
                <span className="score-badge">Score: {selectedStock.score}%</span>
              </div>
              <div className="checklist">
                <div className="check-item">
                  <span>Trend (Di atas EMA 50/200)</span>
                  {selectedStock.checks.trend ? <CheckCircle2 size={16} color="#059669" /> : <XCircle size={16} color="#e11d48" />}
                </div>
                <div className="check-item">
                  <span>MACD (Golden Cross)</span>
                  {selectedStock.checks.macd ? <CheckCircle2 size={16} color="#059669" /> : <XCircle size={16} color="#e11d48" />}
                </div>
                <div className="check-item">
                  <span>Volume (&gt; VMA 20)</span>
                  {selectedStock.checks.volume ? <CheckCircle2 size={16} color="#059669" /> : <XCircle size={16} color="#e11d48" />}
                </div>
                <div className="check-item">
                  <span>Kepatuhan Syariah (OJK)</span>
                  {selectedStock.checks.syariah ? <CheckCircle2 size={16} color="#059669" /> : <XCircle size={16} color="#e11d48" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-card">
          <h3>Watchlist Saham</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>SAHAM</th>
                <th>STATUS SYARIAH</th>
                <th>HARGA (LIVE)</th>
                <th>REKOMENDASI</th>
                <th>SCORE</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.ticker} onClick={() => setSelectedStock(stock)} className={selectedStock.ticker === stock.ticker ? 'selected-row' : ''}>
                  <td><strong>{stock.ticker}</strong><div className="sub-name">{stock.name}</div></td>
                  <td>{stock.isSyariah ? <span className="syariah-tag">☪ Syariah</span> : <span className="text-gray">Non-Syariah</span>}</td>
                  <td><strong>Rp {stock.price.toLocaleString('id-ID')}</strong></td>
                  <td><span className={`signal-badge ${stock.signal.toLowerCase().replace(' ', '-')}`}>{stock.signal}</span></td>
                  <td><strong>{stock.score}%</strong></td>
                  <td style={{ textAlign: 'right' }}><button className="btn-select">Pilih <ChevronRight size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}