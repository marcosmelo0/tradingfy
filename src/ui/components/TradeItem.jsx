import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const TradeItem = ({ trade }) => {
  const isPositive = trade.result >= 0;

  const formatDate = (dateValue) => {
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return dateValue;
      
      const d = date.toLocaleDateString('pt-BR');
      const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      return `${d} ${t}`;
    } catch (e) {
      return dateValue;
    }
  };

  const formatDuration = (open, close) => {
    try {
      const start = new Date(open);
      const end = new Date(close);
      if (isNaN(start) || isNaN(end)) return null;

      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) return `${diffMins}m`;
      
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-muted-foreground/30 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${trade.type === 'C' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
          {trade.type === 'C' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {trade.asset}
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
              {trade.type === 'C' ? 'LONG' : 'SHORT'}
            </span>
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatDate(trade.openDate)}
              </span>
              {formatDuration(trade.openDate, trade.closeDate) && (
                <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-black text-primary">
                  {formatDuration(trade.openDate, trade.closeDate)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{trade.result.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>
      </div>
    </div>
  );
};
