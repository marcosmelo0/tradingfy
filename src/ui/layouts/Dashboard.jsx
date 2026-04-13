import React, { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { TradeItem } from '../components/TradeItem';
import { FileUpload } from '../components/FileUpload';
import { CsvParser } from '../../infrastructure/CsvParser';
import { StatisticsService } from '../../domain/StatisticsService';
import { SyncTrades } from '../../application/SyncTrades';
import { useAuth } from '../contexts/AuthContext';
import { useAccounts } from '../contexts/AccountContext';
import { useModal } from '../contexts/ModalContext';
import { AccountSwitcher } from '../components/AccountSwitcher';
import {
  AlertTriangle,
  CheckCircle2,
  Target,
  Trophy,
  Loader2,
  DollarSign,
  ArrowRightLeft,
  BarChart,
  ShieldAlert,
  Zap,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function MainDashboard({ trades, onRefresh, totalWithdrawn }) {
  const { user } = useAuth();
  const { activeAccount, registerWithdrawal } = useAccounts();
  const { confirm } = useModal();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const stats = useMemo(() =>
    StatisticsService.calculate(trades, {
      initialMargin: activeAccount?.initial_margin,
      bufferValue: activeAccount?.buffer_value,
      medianMultiplier: activeAccount?.median_multiplier,
      hasMedian: activeAccount?.has_median,
      type: activeAccount?.type
    }),
    [trades, activeAccount]
  );

  const handleFileSelect = async (file) => {
    if (!activeAccount) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsedTrades = CsvParser.parse(text);
      const { error } = await SyncTrades.execute(parsedTrades, activeAccount.id, user.id);

      if (error) {
        alert('Erro ao sincronizar: ' + error.message);
      } else {
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFileName('');
    }
  };




  const cushionProgress = activeAccount?.buffer_value > 0
    ? Math.min(100, Math.max(0, (stats.peakPnL / activeAccount.buffer_value) * 100))
    : 100;

  const isFunded = activeAccount?.type === 'funded';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">
            Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            Regra: {isFunded ? 'Trailing RT (Drawdown persegue lucro)' : 'Static (Drawdown fixo na margem)'}.
          </p>
          <AccountSwitcher />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="w-full md:w-80">
            {uploading ? (
              <div className="flex items-center justify-center p-4 bg-card border border-border rounded-xl animate-pulse">
                <Loader2 className="animate-spin text-primary mr-2" size={18} />
                <span className="text-sm font-bold">Sincronizando...</span>
              </div>
            ) : (
              <FileUpload
                onFileSelect={handleFileSelect}
                fileName={fileName}
                onClear={() => setFileName('')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFunded ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
        <Card title="PnL Total" value={stats.totalPnL} highlight={true} negative={stats.totalPnL < 0} currency={true} />
        <Card title="Colchão" value={activeAccount?.buffer_value || 0} currency={true} />
        {isFunded && <Card title="Pág. (Total)" value={totalWithdrawn || 0} currency={true} />}
        <Card title="Winrate" value={`${stats.winrate.toFixed(1)}%`} subValue={`${stats.winsCount} V / ${stats.lossesCount} D`} />
        <Card title="Payoff" value={stats.payoff.toFixed(2)} precision={2} />
        <Card title="Média P/L" value={stats.expectancy} currency={true} />
      </div>

      {/* Goal Progress Section */}

      {trades.length > 0 && (
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-6 transition-all duration-500 ${(stats.isRiskViolation || stats.isDrawdownViolation)
          ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-xl shadow-red-500/10'
          : 'bg-green-500/10 border-green-500/20 text-green-500 shadow-xl shadow-green-500/10'
          }`}>
          <div className={`p-4 rounded-2xl ${(stats.isRiskViolation || stats.isDrawdownViolation) ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            {(stats.isRiskViolation || stats.isDrawdownViolation) ? <AlertTriangle size={40} /> : <CheckCircle2 size={40} />}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black uppercase tracking-tight">
              {(stats.isRiskViolation || stats.isDrawdownViolation) ? 'Atenção ao Risco' : 'Operação Segura'}
            </h3>
            <p className={`mt-1 font-medium ${(stats.isRiskViolation || stats.isDrawdownViolation) ? 'text-red-400' : 'text-green-400'}`}>
              {stats.isDrawdownViolation
                ? `CONTA BLOQUEADA: Saldo abaixo do limite de perda (${activeAccount?.type}).`
                : stats.isRiskViolation
                  ? `VIOLAÇÃO: PnL abaixo de ${activeAccount?.median_multiplier}x a mediana.`
                  : `Sua conta (${activeAccount?.name}) está operando dentro dos parâmetros.`}
            </p>
          </div>
        </div>
      )}
      {activeAccount?.profit_target > 0 && (
        <div className="bg-card border border-border p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
            <Trophy className="w-20 h-20 md:w-[120px] md:h-[120px]" />
          </div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-2">
                  <Target size={14} /> Objetivo da Conta
                </h4>
                <p className="text-3xl font-black italic">{isFunded ? 'Rumo ao Saque' : 'Rumo à Aprovação'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground mb-1">Progresso Atual</p>
                <p className="text-4xl font-black text-primary">
                  {activeAccount?.profit_target > 0
                    ? Math.max(0, (stats.totalPnL / activeAccount.profit_target) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="h-6 bg-muted rounded-full p-1 border border-border shadow-inner">
              <div
                title={`Progresso da Meta: ${activeAccount?.profit_target > 0 ? Math.max(0, (stats.totalPnL / activeAccount.profit_target) * 100).toFixed(1) : 0}%`}
                className="h-full bg-linear-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.4)] cursor-help"
                style={{
                  width: `${Math.min(100, Math.max(0, (stats.totalPnL / activeAccount.profit_target) * 100))}%`
                }}
              ></div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground gap-4 sm:gap-0">
              <div className="flex flex-col">
                <span>Balance</span>
                <span className="text-foreground text-sm">
                  {(activeAccount.initial_margin + stats.totalPnL).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="flex flex-col sm:items-center">
                <span>Faltam</span>
                <span className="text-foreground text-sm">
                  {Math.max(0, activeAccount.profit_target - stats.totalPnL).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="flex flex-col sm:items-end">
                <span>Meta</span>
                <span className="text-primary text-sm">
                  {activeAccount.profit_target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Stats: Cushions & Risk */}
      <div className={`grid grid-cols-1 ${isFunded ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Cushion Progress Card - Only for Funded */}
        {isFunded && (
          <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-500" /> Meta do Colchão
                </h4>
                <p className="text-lg font-black italic">Para Drawdown Fixo</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.totalPnL >= activeAccount?.buffer_value ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {stats.totalPnL >= activeAccount?.buffer_value ? 'Cushion OK' : 'Trajetória'}
                </span>
                <div title="No modo Funded, atingir o colchão trava o drawdown na margem inicial. No Challenge, ele já começa estático." className="text-muted-foreground cursor-help">
                  <Info size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Progresso</span>
                  <span className="text-2xl font-black text-primary">{cushionProgress.toFixed(1)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Buffer</span>
                  <p className="text-sm font-bold text-foreground">
                    {stats.totalPnL.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })} / {activeAccount?.buffer_value.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}
                  </p>
                </div>
              </div>
              <div
                className="h-3 bg-muted rounded-full overflow-hidden border border-border p-0.5"
                title={`Progresso para Colchão: ${cushionProgress.toFixed(1)}%`}
              >
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.3)] cursor-help"
                  style={{ width: `${cushionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Drawdown Risk Card */}
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-500" /> Monitor de Risco
              </h4>
              <p className="text-lg font-black italic">Distância do Limite</p>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stats.distanceToThreshold < 500 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
                {stats.distanceToThreshold < 500 ? 'Risco Crítico' : 'Seguro'}
              </span>
              <div title={isFunded ? "Regra Trailing RT: O limite sobe junto com o seu maior lucro." : "Regra Static: O limite não se move, permitindo que o drawdown 'desça' conforme você ganha."} className="text-muted-foreground cursor-help">
                <Info size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Distância do Stop</span>
                <span className={`text-2xl font-black leading-tight ${stats.distanceToThreshold < 500 ? 'text-red-500' : 'text-foreground'}`}>
                  {stats.distanceToThreshold.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="sm:text-right flex flex-col sm:items-end group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Threshold</span>
                <p className="text-sm font-bold text-muted-foreground tabular-nums">
                  {stats.drawdownThreshold.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>

            <div
              className="relative h-4 bg-muted rounded-full overflow-hidden border border-border p-0.5"
              title={`Consumo de Risco: ${Math.max(0, Math.min(100, (1 - (stats.distanceToThreshold / activeAccount?.buffer_value)) * 100)).toFixed(1)}%`}
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 cursor-help ${(1 - (stats.distanceToThreshold / activeAccount?.buffer_value)) * 100 > 80 ? 'bg-red-500' :
                  (1 - (stats.distanceToThreshold / activeAccount?.buffer_value)) * 100 > 50 ? 'bg-yellow-500' : 'bg-primary'
                  }`}
                style={{
                  width: `${Math.max(0, Math.min(100, (1 - (stats.distanceToThreshold / (activeAccount?.buffer_value || 1))) * 100))}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
              <span>Início</span>
              <span className="italic">{isFunded ? 'Trailing RT' : 'Static Mode'}</span>
              <span>Stop Out</span>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assertividade Lados</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>COMPRA</span>
                    <span className="text-blue-400">{stats.buyWinrate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.buyWinrate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>VENDA</span>
                    <span className="text-purple-400">{stats.sellWinrate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${stats.sellWinrate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-3xl flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl">
                  <Trophy size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Melhor Ativo</p>
                  <h4 className="text-2xl font-black">{stats.bestAsset.name}</h4>
                  <p className="text-xs font-bold text-green-500">+{stats.bestAsset.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-card border border-border p-8 rounded-3xl">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Maior Ganho</p>
                  <h4 className="text-3xl font-black text-green-400">
                    +{stats.maxGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </h4>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl">
                  <TrendingDown size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Maior Perda</p>
                  <h4 className="text-3xl font-black text-red-500">
                    {stats.maxLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </h4>
                </div>
              </div>
            </div>
          </div>


        </div>

        <div className="space-y-4">
          <Card 
            title="Mediana (Ganhos)" 
            value={stats.median} 
            currency={true} 
            tooltip="Valor central dos seus trades vencedores. É a base para o cálculo do seu limite de risco pessoal."
          />
          <Card 
            title="Limite Pessoal" 
            value={stats.medianX5} 
            negative={true} 
            currency={true} 
            highlight={stats.totalPnL < -stats.medianX5}
            tooltip={`Seu limite máximo de perda sugerido (${activeAccount?.median_multiplier || 5}x a mediana). Se o seu PnL cair abaixo disso, o sistema emitirá um alerta de risco.`}
          />
          <Card
            title="Histórico Drawdown"
            value={stats.maxDrawdown}
            negative={true}
            currency={true}
            tooltip="Maior valor de perda (drawdown) que a conta já atingiu desde o seu ponto mais alto de lucro."
          />
          <Card title="Threshold" value={stats.drawdownThreshold} currency={true} />

          <div className="bg-card border border-border p-6 rounded-3xl">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <BarChart size={16} className="text-primary" /> Distribuição
            </h4>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              <div className="bg-green-500 h-full" style={{ width: `${stats.winrate}%` }}></div>
              <div className="bg-red-500 h-full" style={{ width: `${100 - stats.winrate}%` }}></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="text-green-500">{stats.winsCount} Wins</span>
              <span className="text-red-500">{stats.lossesCount} Losses</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
