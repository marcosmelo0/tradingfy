import React, { useState, useMemo } from 'react';
import { TradeItem } from '../components/TradeItem';
import {
  Search,
  Filter,
  BarChart3,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import { parseISO, format as formatDateFns } from 'date-fns';

export const HistoryView = ({ trades }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = recent first
  const [activePeriod, setActivePeriod] = useState('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const setPeriod = (period) => {
    setActivePeriod(period);
    setCurrentPage(1);
    const today = new Date();

    const formatDateStr = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let start = new Date();
    let end = new Date();

    switch (period) {
      case 'today':
        setCustomRange({
          start: formatDateStr(today),
          end: formatDateStr(today)
        });
        break;
      case '7d':
        start.setDate(today.getDate() - 7);
        setCustomRange({
          start: formatDateStr(start),
          end: formatDateStr(today)
        });
        break;
      case '30d':
        start.setDate(today.getDate() - 30);
        setCustomRange({
          start: formatDateStr(start),
          end: formatDateStr(today)
        });
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        setCustomRange({
          start: formatDateStr(start),
          end: formatDateStr(today)
        });
        break;
      case 'all':
        setCustomRange({ start: '', end: '' });
        break;
    }
  };

  const filteredTrades = useMemo(() => {
    return trades
      .filter(t => {
        const matchesSearch = t.asset.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSide = sideFilter === 'all' || t.type === sideFilter;

        // Accurate Date filtering using string comparison (local)
        let matchesDate = true;
        if (customRange.start || customRange.end) {
          const tradeDate = new Date(t.openDate);
          const y = tradeDate.getFullYear();
          const m = String(tradeDate.getMonth() + 1).padStart(2, '0');
          const d = String(tradeDate.getDate()).padStart(2, '0');
          const tradeDateStr = `${y}-${m}-${d}`;

          if (customRange.start && tradeDateStr < customRange.start) matchesDate = false;
          if (customRange.end && tradeDateStr > customRange.end) matchesDate = false;
        }

        return matchesSearch && matchesSide && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.openDate).getTime();
        const dateB = new Date(b.openDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [trades, searchTerm, sideFilter, sortOrder, customRange]);

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrades.slice(start, start + itemsPerPage);
  }, [filteredTrades, currentPage, itemsPerPage]);

  const Pagination = () => {
    return (
      <div className="flex items-center gap-4">
        {/* Items Per Page Selector */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Exibir:</span>
          <select
            className="bg-card border border-border px-3 py-1.5 rounded-xl text-[11px] font-black outline-none focus:border-primary cursor-pointer transition-all shadow-sm hover:border-muted-foreground/30 appearance-none min-w-[55px] text-center"
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-card border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                  if (Math.abs(page - currentPage) === 2) return <span key={page} className="px-1 text-muted-foreground text-[10px]">...</span>;
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-card border border-border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:text-primary transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="bg-transparent text-[11px] font-black text-foreground px-1 py-1 outline-none uppercase min-w-[100px] flex-1 lg:flex-none text-left cursor-pointer hover:text-primary transition-colors"
    >
      {value || placeholder}
    </button>
  ));

  const handleDateChange = (date, name) => {
    if (!date) {
      setCustomRange(prev => ({ ...prev, [name]: '' }));
    } else {
      const dateStr = formatDateFns(date, 'yyyy-MM-dd');
      setCustomRange(prev => ({ ...prev, [name]: dateStr }));
    }
    setActivePeriod('custom');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Main Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <BarChart3 className="text-primary" /> Histórico Operacional
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Análise detalhada de performance por período.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:flex-none min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              placeholder="Buscar ativo..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:border-primary outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="bg-card border border-border px-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-primary cursor-pointer transition-all shadow-sm"
            value={sideFilter}
            onChange={e => {
              setSideFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Long & Short</option>
            <option value="C">Apenas Long</option>
            <option value="V">Apenas Short</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-sm group"
            title={sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}
          >
            {sortOrder === 'desc' ? <ArrowDownAZ size={20} /> : <ArrowUpAZ size={20} />}
          </button>
        </div>
      </div>

      {/* Time Filters Bar */}
      <div className="bg-card/50 border border-border p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-2 text-primary bg-primary/10 rounded-lg mr-1">
            <CalendarDays size={18} />
          </div>
          <PeriodButton active={activePeriod === 'all'} onClick={() => setPeriod('all')} label="Tudo" />
          <PeriodButton active={activePeriod === 'today'} onClick={() => setPeriod('today')} label="Hoje" />
          <PeriodButton active={activePeriod === '7d'} onClick={() => setPeriod('7d')} label="7 Dias" />
          <PeriodButton active={activePeriod === '30d'} onClick={() => setPeriod('30d')} label="30 Dias" />
          <PeriodButton active={activePeriod === 'month'} onClick={() => setPeriod('month')} label="Este Mês" />
        </div>

        <div className="flex items-center gap-3 lg:ml-auto w-full lg:w-auto">
          <div className="relative flex items-center gap-2 bg-background/50 border border-border p-2 sm:p-1 rounded-xl w-full lg:w-auto justify-between lg:justify-start pr-8 lg:pr-1">
            <DatePicker
              selected={customRange.start ? parseISO(customRange.start) : null}
              onChange={date => handleDateChange(date, 'start')}
              customInput={<CustomDateInput placeholder="Início" />}
              dateFormat="dd/MM/yyyy"
              maxDate={customRange.end ? parseISO(customRange.end) : null}
              placeholderText="DD/MM/AAAA"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                    padding: 10,
                  },
                },
              ]}
            />
            <span className="text-muted-foreground/30 text-[10px] font-black italic shrink-0">até</span>
            <DatePicker
              selected={customRange.end ? parseISO(customRange.end) : null}
              onChange={date => handleDateChange(date, 'end')}
              customInput={<CustomDateInput placeholder="Fim" />}
              dateFormat="dd/MM/yyyy"
              minDate={customRange.start ? parseISO(customRange.start) : null}
              placeholderText="DD/MM/AAAA"
              popperPlacement="bottom-end"
              popperModifiers={[
                {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                    padding: 10,
                  },
                },
              ]}
            />
            {(customRange.start || customRange.end) && (
              <button
                onClick={() => setPeriod('all')}
                className="absolute right-2 p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer bg-muted/50 rounded-md lg:static lg:bg-transparent"
                title="Limpar período"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upper Pagination & Counter */}
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {filteredTrades.length} Trades Encontrados
        </span>
        <Pagination />
      </div>

      {/* Trade List */}
      <div className="grid grid-cols-1 gap-3">
        {paginatedTrades.length > 0 ? (
          <>
            {paginatedTrades.map(trade => (
              <TradeItem key={trade.id} trade={trade} />
            ))}
            
            {/* Lower Pagination & Counter */}
            <div className="flex items-center justify-between pt-8 pb-4 border-t border-border/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Página {currentPage} de {totalPages || 1}
              </span>
              <Pagination />
            </div>
          </>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2.5rem] bg-card/30 text-muted-foreground animate-in zoom-in-95 duration-500">
            <div className="p-6 bg-muted rounded-full mb-4">
              <Filter size={32} />
            </div>
            <p className="font-black text-xl text-foreground">Nada por aqui</p>
            <p className="text-sm mt-1 max-w-xs text-center leading-relaxed">Não encontramos operações para o período ou filtros selecionados.</p>
            <button
              onClick={() => setPeriod('all')}
              className="mt-6 text-primary font-bold text-sm hover:underline cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PeriodButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${active
      ? 'bg-primary text-white shadow-lg shadow-primary/20'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
  >
    {label}
  </button>
);
