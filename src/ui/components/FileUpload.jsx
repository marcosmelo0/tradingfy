import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export const FileUpload = ({ onFileSelect, fileName, onClear }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      {!fileName ? (
        <label 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-card/30 hover:bg-card/50 hover:border-primary/50 transition-all group"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-3 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <p className="text-sm text-foreground font-medium">Clique para enviar o CSV</p>
            <p className="text-xs text-muted-foreground mt-1">Formatos suportados: .csv</p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".csv" 
            onChange={handleChange} 
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Arquivo carregado</p>
            </div>
          </div>
          <button 
            onClick={onClear}
            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
