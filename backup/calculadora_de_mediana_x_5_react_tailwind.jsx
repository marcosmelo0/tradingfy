import { useState } from "react";

export default function TradingDashboard() {
  const [trades, setTrades] = useState([]);

  const parseCSV = (text) => {
    const lines = text.split("\n").filter(Boolean);

    // encontra linha que começa com dados (onde tem ativo;)
    const dataStartIndex = lines.findIndex((l) => l.includes(";"));
    const dataLines = lines.slice(dataStartIndex);

    return dataLines.map((line) => {
      const cols = line.split(";");

      // resultado geralmente está nas últimas colunas
      let raw = cols[cols.length - 3];

      if (!raw) return { result: 0 };

      raw = raw
        .replace(/[^0-9,-]/g, "")
        .replace(/\.(?=\d{3})/g, "")
        .replace(",", ".");

      const value = parseFloat(raw);

      return {
        result: isNaN(value) ? 0 : value,
      };
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseCSV(text);
    setTrades(parsed);
  };

  const results = trades.map((t) => t.result);

  const positives = results.filter((n) => n >= 0);
  const sorted = [...positives].sort((a, b) => a - b);

  const median = (() => {
    if (!sorted.length) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  })();

  const medianX5 = median * 5;

  const totalPnL = results.reduce((a, b) => a + b, 0);

  const wins = results.filter((n) => n > 0);
  const losses = results.filter((n) => n < 0);

  const winrate = trades.length
    ? ((wins.length / trades.length) * 100).toFixed(1)
    : 0;

  const avgWin = wins.length
    ? wins.reduce((a, b) => a + b, 0) / wins.length
    : 0;

  const avgLoss = losses.length
    ? losses.reduce((a, b) => a + b, 0) / losses.length
    : 0;

  const payoff = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

  const expectancy =
    (winrate / 100) * avgWin - (1 - winrate / 100) * Math.abs(avgLoss);

  // drawdown
  let equity = 0;
  let peak = 0;
  let maxDD = 0;

  results.forEach((r) => {
    equity += r;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDD) maxDD = dd;
  });

  const riskPercent = medianX5 ? (Math.abs(totalPnL) / medianX5) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trading Dashboard (Prop Firm)</h1>

        <div className="mb-6">
          <input type="file" accept=".csv" onChange={handleFile} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card title="Mediana" value={median} />
          <Card title="5x Mediana" value={medianX5} />
          <Card title="PnL" value={totalPnL} />
          <Card title="Winrate" value={winrate + "%"} />
          <Card title="Payoff" value={payoff} />
          <Card title="Expectancy" value={expectancy} />
          <Card title="Drawdown" value={maxDD} />
          <Card title="Risco (%)" value={riskPercent.toFixed(1) + "%"} />
        </div>

        <div className="mb-6">
          <div
            className={`p-4 rounded-xl text-center font-bold ${
              totalPnL >= -medianX5
                ? "bg-green-600/20 text-green-400"
                : "bg-red-600/20 text-red-400"
            }`}
          >
            {totalPnL >= -medianX5
              ? "Dentro da Regra"
              : "VIOLAÇÃO DE RISCO"}
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          <h2 className="mb-2">Trades</h2>
          <div className="max-h-64 overflow-y-auto text-sm">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex justify-between border-b border-gray-800 p-2 ${
                  r >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                <span>#{i + 1}</span>
                <span>{r.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-xl font-bold">
        {typeof value === "number" ? value.toFixed(2) : value}
      </p>
    </div>
  );
}
