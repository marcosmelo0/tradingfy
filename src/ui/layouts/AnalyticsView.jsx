import React, { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, BarChart3,
  PieChart as PieChartIcon, Calendar, DollarSign,
  Award, Clock, AlertTriangle
} from 'lucide-react';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
  itemStyle: { color: '#fff', fontWeight: 'bold' },
  labelStyle: { color: '#fff', marginBottom: '4px', opacity: 0.8 },
  cursor: { fill: 'rgba(255,255,255,0.05)' }
};

export const AnalyticsView = ({ trades, activeAccount }) => {

  // 1. Equity Curve
  const equityData = useMemo(() => {
    if (!activeAccount) return [];
    const sorted = [...trades].sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
    let balance = Number(activeAccount.initial_margin || 0);
    const data = [{ name: 'Início', balance }];
    sorted.forEach(t => {
      balance += Number(t.result);
      data.push({ name: new Date(t.closeDate).toLocaleDateString(), balance: parseFloat(balance.toFixed(2)) });
    });
    return data;
  }, [trades, activeAccount]);

  // 2. Monthly Performance
  const monthlyData = useMemo(() => {
    const months = {};
    trades.forEach(t => {
      const date = new Date(t.closeDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = {
        month: new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date),
        profit: 0, wins: 0, total: 0, rawKey: key
      };
      months[key].profit += Number(t.result);
      months[key].total++;
      if (Number(t.result) > 0) months[key].wins++;
    });
    return Object.values(months).sort((a, b) => a.rawKey.localeCompare(b.rawKey));
  }, [trades]);

  // 3. Stats
  const stats = useMemo(() => {
    const total = trades.length;
    if (total === 0) return null;
    const wins = trades.filter(t => Number(t.result) > 0);
    const losses = trades.filter(t => Number(t.result) < 0);
    const totalProfit = wins.reduce((s, t) => s + Number(t.result), 0);
    const totalLoss = Math.abs(losses.reduce((s, t) => s + Number(t.result), 0));
    const netProfit = trades.reduce((s, t) => s + Number(t.result), 0);
    const avgWin = wins.length > 0 ? totalProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
    const profitFactor = totalLoss === 0 ? totalProfit : totalProfit / totalLoss;
    const roi = activeAccount?.initial_margin > 0 ? (netProfit / Number(activeAccount.initial_margin)) * 100 : 0;
    return {
      winRate: ((wins.length / total) * 100).toFixed(1),
      profitFactor: profitFactor.toFixed(2),
      roi: roi.toFixed(1), total,
      netProfit: netProfit.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      rrRatio: avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '∞',
      winsCount: wins.length,
      lossesCount: losses.length
    };
  }, [trades, activeAccount]);

  // 4. Day of Week
  const dayOfWeekData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const results = days.map(d => ({ name: d, profit: 0, total: 0 }));
    trades.forEach(t => { const i = new Date(t.closeDate).getDay(); results[i].profit += Number(t.result); results[i].total++; });
    return results.filter(r => r.total > 0 || (r.name !== 'Dom' && r.name !== 'Sáb'));
  }, [trades]);

  // 5. Asset Performance
  const assetData = useMemo(() => {
    const assets = {};
    trades.forEach(t => {
      if (!assets[t.asset]) assets[t.asset] = { name: t.asset, profit: 0, total: 0 };
      assets[t.asset].profit += Number(t.result);
      assets[t.asset].total++;
    });
    return Object.values(assets).sort((a, b) => b.profit - a.profit);
  }, [trades]);

  // 6. Streaks
  const streakMetrics = useMemo(() => {
    let maxW = 0, maxL = 0, curW = 0, curL = 0;
    [...trades].sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate)).forEach(t => {
      const r = Number(t.result);
      if (r > 0) { curW++; curL = 0; if (curW > maxW) maxW = curW; }
      else if (r < 0) { curL++; curW = 0; if (curL > maxL) maxL = curL; }
    });
    return { maxWinStreak: maxW, maxLossStreak: maxL };
  }, [trades]);

  // 7. Side Bias
  const sideData = useMemo(() => {
    const sides = { C: { name: 'Compras', profit: 0, total: 0 }, V: { name: 'Vendas', profit: 0, total: 0 } };
    trades.forEach(t => { if (sides[t.type]) { sides[t.type].profit += Number(t.result); sides[t.type].total++; } });
    return Object.values(sides).filter(s => s.total > 0);
  }, [trades]);

  // 8. Hourly Performance
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}h`, profit: 0, total: 0 }));
    trades.forEach(t => { const h = new Date(t.openDate).getHours(); hours[h].profit += Number(t.result); hours[h].total++; });
    return hours.filter(h => h.total > 0);
  }, [trades]);

  // 9. Magnitude Distribution
  const distributionData = useMemo(() => {
    if (trades.length === 0) return [];
    const results = trades.map(t => Number(t.result));
    const min = Math.min(...results), max = Math.max(...results);
    const step = (max - min) / 8 || 1;
    const buckets = Array.from({ length: 9 }, (_, i) => ({ range: `$ ${(min + i * step).toFixed(0)}`, count: 0 }));
    trades.forEach(t => { const idx = Math.min(8, Math.floor((Number(t.result) - min) / step)); buckets[idx].count++; });
    return buckets;
  }, [trades]);

  // 10. Recovery Factor & Max Drawdown
  const efficiency = useMemo(() => {
    const net = trades.reduce((s, t) => s + Number(t.result), 0);
    let peak = 0, bal = 0, maxDD = 0;
    trades.forEach(t => { bal += Number(t.result); if (bal > peak) peak = bal; const dd = peak - bal; if (dd > maxDD) maxDD = dd; });
    return { recoveryFactor: maxDD > 0 ? (net / maxDD).toFixed(2) : '∞', maxDD: maxDD.toFixed(2) };
  }, [trades]);

  // 11. NEW: Drawdown Curve
  const drawdownData = useMemo(() => {
    let peak = 0, bal = 0;
    const sorted = [...trades].sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
    return [{ name: 'Início', drawdown: 0 }, ...sorted.map(t => {
      bal += Number(t.result);
      if (bal > peak) peak = bal;
      const dd = peak > 0 ? -((peak - bal) / peak) * 100 : 0;
      return { name: new Date(t.closeDate).toLocaleDateString(), drawdown: parseFloat(dd.toFixed(2)) };
    })];
  }, [trades]);

  // 12. NEW: Hall da Fama (Top 3 melhores e piores)
  const hallOfFame = useMemo(() => {
    const sorted = [...trades].sort((a, b) => Number(b.result) - Number(a.result));
    const best = sorted.slice(0, 3).map(t => ({ ...t, result: Number(t.result) }));
    const worst = sorted.slice(-3).reverse().map(t => ({ ...t, result: Number(t.result) }));
    return { best, worst };
  }, [trades]);

  // 13. NEW: Win Rate por Mês
  const winRateByMonth = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.month,
      winRate: m.total > 0 ? parseFloat(((m.wins / m.total) * 100).toFixed(1)) : 0,
      total: m.total
    }));
  }, [monthlyData]);

  // 14. NEW: Duração dos Trades
  const durationData = useMemo(() => {
    const buckets = {
      '< 5min': { label: '< 5min', profit: 0, total: 0 },
      '5-30min': { label: '5-30min', profit: 0, total: 0 },
      '30min-2h': { label: '30m-2h', profit: 0, total: 0 },
      '> 2h': { label: '> 2h', profit: 0, total: 0 }
    };
    trades.forEach(t => {
      const minutes = (new Date(t.closeDate) - new Date(t.openDate)) / 60000;
      const profit = Number(t.result);
      if (minutes < 5) { buckets['< 5min'].profit += profit; buckets['< 5min'].total++; }
      else if (minutes < 30) { buckets['5-30min'].profit += profit; buckets['5-30min'].total++; }
      else if (minutes < 120) { buckets['30min-2h'].profit += profit; buckets['30min-2h'].total++; }
      else { buckets['> 2h'].profit += profit; buckets['> 2h'].total++; }
    });
    return Object.values(buckets).filter(b => b.total > 0);
  }, [trades]);

  if (!activeAccount) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <BarChart3 className="text-primary" size={32} /> Inteligência Analítica
        </h2>
        <p className="text-muted-foreground mt-1 font-medium">Insights profundos sobre sua performance operacional.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Taxa de Acerto" value={`${stats?.winRate || 0}%`} icon={<Target className="text-primary" />} subValue={`${stats?.winsCount || 0} de ${stats?.total || 0} trades`} />
        <StatCard label="Fator de Lucro" value={stats?.profitFactor || '0.00'} icon={<TrendingUp className="text-green-500" />} subValue="Eficiência lucro/risco" />
        <StatCard label="Retorno Total (ROI)" value={`${stats?.roi || 0}%`} icon={<DollarSign className="text-blue-500" />} subValue={`$ ${stats?.netProfit || '0.00'} líquidos`} />
        <StatCard label="Expectativa" value={stats?.total > 0 ? `$ ${(stats?.netProfit / stats?.total).toFixed(2)}` : '$ 0.00'} icon={<PieChartIcon className="text-purple-500" />} subValue="Média por trade" />
      </div>

      {/* NEW: R/R Real + Max Drawdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-4xl flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ganho Médio por Win</span>
          <span className="text-3xl font-black text-green-500">$ {stats?.avgWin || '0.00'}</span>
          <span className="text-xs text-muted-foreground">Quanto você ganha quando acerta</span>
        </div>
        <div className="bg-card border border-border p-6 rounded-4xl flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Perda Média por Loss</span>
          <span className="text-3xl font-black text-red-500">$ {stats?.avgLoss || '0.00'}</span>
          <span className="text-xs text-muted-foreground">Quanto você perde quando erra</span>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-4xl flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Razão Risco/Retorno Real</span>
          <span className="text-3xl font-black">{stats?.rrRatio || '0.00'} : 1</span>
          <span className="text-xs text-muted-foreground">Para cada $ 1 que perde, ganha $ {stats?.rrRatio || '0.00'}</span>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="bg-card border border-border p-6 md:p-8 rounded-4xl shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black">Evolução do Patrimônio</h3>
            <p className="text-sm text-muted-foreground font-medium">Curva de crescimento acumulado</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-2xl"><TrendingUp size={24} /></div>
        </div>
        <div className="h-64 md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} tickFormatter={v => `$ ${v.toLocaleString()}`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toLocaleString()}`, 'Saldo']} />
              <Area type="monotone" dataKey="balance" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: Drawdown Curve */}
      <div className="bg-card border border-border p-6 md:p-8 rounded-4xl shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2"><AlertTriangle size={20} className="text-red-500" /> Curva de Drawdown</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Quanto seu capital caiu em cada momento em relação ao pico. Quanto mais perto de 0%, melhor.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Máximo Drawdown</p>
            <p className="text-2xl font-black text-red-500">$ {efficiency.maxDD}</p>
          </div>
        </div>
        <div className="h-56 md:h-[250px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdownData}>
              <defs>
                <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toFixed(2)}%`, 'Drawdown']} />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDD)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly + Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border p-6 md:p-8 rounded-4xl shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-muted rounded-xl"><Calendar size={20} className="text-muted-foreground" /></div>
            <div>
              <h3 className="font-bold">Resultado por Mês</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Performance Mensal</p>
            </div>
          </div>
          <div className="h-56 md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado']} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-6 md:p-8 rounded-4xl flex flex-col justify-between">
          <div>
            <div className="inline-flex p-3 bg-primary/20 text-primary rounded-2xl mb-6"><PieChartIcon size={24} /></div>
            <h3 className="text-xl font-black mb-2">Qualidade do Setup</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Taxa de acerto de <strong>{stats?.winRate}%</strong>.
              {Number(stats?.winRate) > 50 ? ' Vantagem estatística sólida. Mantenha o gerenciamento rigoroso.' : ' Foque na seletividade dos trades.'}
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-primary/10">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Fator de Recuperação</span>
                <div className="text-3xl font-black">{efficiency.recoveryFactor}</div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${Number(efficiency.recoveryFactor) > 1.5 ? 'text-green-500' : 'text-yellow-500'}`}>
                {Number(efficiency.recoveryFactor) > 1.5 ? 'Excelente' : 'Ajustável'} <TrendingUp size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Win Rate por Mês */}
      <div className="bg-card border border-border p-6 md:p-8 rounded-4xl shadow-xl">
        <h3 className="text-xl font-black mb-1 flex items-center gap-2"><Target size={20} className="text-primary" /> Taxa de Acerto por Mês</h3>
        <p className="text-sm text-muted-foreground mb-8">Evolução da sua consistência mês a mês. Acima de 50% é zona segura.</p>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={winRateByMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: '50%', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Taxa de Acerto']} />
              <Line type="monotone" dataKey="winRate" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: Hall da Fama */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl"><Award size={20} /></div>
          <div>
            <h3 className="text-xl font-bold">Hall da Fama</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Seus 3 melhores e 3 piores trades de todos os tempos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-green-500/70">🏆 Top 3 — Melhores Trades</p>
            {hallOfFame.best.map((t, i) => (
              <div key={i} className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg font-black text-green-500/40 shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">{t.asset}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.closeDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className="text-lg font-black text-green-500 shrink-0">+ $ {t.result.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-red-500/70">💀 Top 3 — Piores Trades</p>
            {hallOfFame.worst.map((t, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg font-black text-red-500/40 shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">{t.asset}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.closeDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className="text-lg font-black text-red-500 shrink-0">- $ {Math.abs(t.result).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comportamento Operacional */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl"><PieChartIcon size={20} /></div>
          <div>
            <h3 className="text-xl font-bold">Comportamento Operacional</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Insights por Ativo e Dia da Semana</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-8 rounded-4xl shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar size={14} className="text-primary" /> Performance Semanal</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado']} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {dayOfWeekData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border border-border p-8 rounded-4xl shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={14} className="text-primary" /> Resultado por Ativo</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} width={60} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado Líquido']} />
                  <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                    {assetData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-2xl"><TrendingUp size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-500/70">Melhor Sequência</p>
                <h4 className="text-2xl font-black text-green-500">{streakMetrics.maxWinStreak} Wins</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Psicologia Forte</p>
              <div className="h-1 w-12 bg-green-500/30 rounded-full mt-1 ml-auto"></div>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl"><TrendingDown size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Sequência de Perdas</p>
                <h4 className="text-2xl font-black text-red-500">{streakMetrics.maxLossStreak} Losses</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Gerenciamento</p>
              <div className="h-1 w-12 bg-red-500/30 rounded-full mt-1 ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Anatomia do Trade */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><TrendingUp size={20} /></div>
          <div>
            <h3 className="text-xl font-bold">Anatomia do Trade</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Viés Operacional e Ciclos Intradiários</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-8 rounded-4xl shadow-xl flex flex-col">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingDown size={14} className="text-primary" /> Viés: Compras vs Vendas</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sideData} barGap={12}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado']} />
                  <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                    {sideData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Fator de Recuperação</span>
              <span className="text-xl font-black text-primary">{efficiency.recoveryFactor}</span>
            </div>
          </div>
          <div className="bg-card border border-border p-8 rounded-4xl shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar size={14} className="text-primary" /> Ciclo por Horário</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado']} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {hourlyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* NEW: Duração dos Trades */}
        <div className="bg-card border border-border p-8 rounded-4xl shadow-xl">
          <h4 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <Clock size={14} className="text-primary" /> Resultado por Duração do Trade
          </h4>
          <p className="text-xs text-muted-foreground mb-6">Descubra se trades rápidos ou longos te dão mais lucro.</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$ ${v.toFixed(2)}`, 'Resultado']} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {durationData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Magnitude Distribution */}
        <div className="bg-card border border-border p-8 rounded-4xl shadow-xl">
          <h4 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" /> Quanto Ganho e Quanto Perco por Trade
          </h4>
          <p className="text-xs text-muted-foreground mb-6">Cada barra mostra quantos trades tiveram aquele resultado. Quanto mais à direita, maiores os ganhos.</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 10 }} />
                <YAxis hide />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [v, 'trades nessa faixa']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((e, i) => (
                    <Cell key={i} fill={parseFloat(e.range.replace('$ ', '').replace('$-', '-')) >= 0 ? '#10b981' : '#ef4444'} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-red-400/70">← Maiores perdas</span>
            <span className="text-green-400/70">Maiores ganhos →</span>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ label, value, icon, subValue }) => (
  <div className="bg-card border border-border p-6 rounded-4xl hover:shadow-lg transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-background rounded-xl ring-1 ring-border group-hover:ring-primary/30 transition-all">{icon}</div>
      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-black tracking-tight">{value}</div>
    <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">{subValue}</div>
  </div>
);
