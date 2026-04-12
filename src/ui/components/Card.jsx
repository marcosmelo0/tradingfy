import { Info } from 'lucide-react';

export const Card = ({ title, value, subValue, tooltip, highlight = false, negative = false, currency = false, precision = 2 }) => {
  const formattedValue = typeof value === 'number' 
    ? (currency 
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : value.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision }))
    : value;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      highlight 
        ? (negative ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20') 
        : 'bg-card border-border hover:border-muted-foreground/30 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</p>
        {tooltip && (
          <div title={tooltip} className="text-muted-foreground/40 hover:text-primary transition-colors cursor-help">
            <Info size={12} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${
        highlight 
          ? (negative ? 'text-red-400' : 'text-blue-400') 
          : 'text-foreground'
      }`}>
        {formattedValue}
      </p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-2 font-medium">{subValue}</p>
      )}
    </div>
  );
};
