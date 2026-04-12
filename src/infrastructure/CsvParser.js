import Papa from 'papaparse';
import { Trade } from '../domain/Trade';

export class CsvParser {
  /**
   * Parses the trading CSV text and returns an array of Trade entities.
   * @param {string} csvText 
   * @returns {Trade[]}
   */
  static parse(csvText) {
    if (!csvText) return [];

    const results = Papa.parse(csvText, {
      delimiter: ";",
      skipEmptyLines: true,
      header: false
    });

    const lines = results.data;
    
    // The header row is the one that contains 'Ativo'
    const headerIndex = lines.findIndex(line => 
      line.some(cell => typeof cell === 'string' && cell.includes('Ativo'))
    );
    
    if (headerIndex === -1) {
      console.warn("Could not find CSV header starting with 'Ativo'");
      return [];
    }

    const dataLines = lines.slice(headerIndex + 1);

    return dataLines.map((cols, index) => {
      // Index 13 is the "Res. Operação" column
      const rawResult = cols[13];
      const asset = cols[0];
      const side = cols[6]; // Lado: C or V
      
      if (!rawResult) return null;

      const numericResult = this.parseBrazilianNumber(rawResult);

      return new Trade({
        id: index + 1,
        asset: asset,
        openDate: this.parseBrazilianDate(cols[1]),
        closeDate: this.parseBrazilianDate(cols[2]),
        result: numericResult,
        type: side
      });
    }).filter(trade => trade !== null);
  }

  /**
   * Parses DD/MM/YYYY HH:mm:ss format safely.
   * @param {string} dateStr 
   * @returns {string} ISO string
   */
  static parseBrazilianDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    
    // Support formats: "DD/MM/YYYY", "DD/MM/YYYY HH:mm", "DD/MM/YYYY HH:mm:ss"
    const parts = dateStr.trim().split(/[\/\s:]/);
    if (parts.length < 3) return dateStr;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS
    const year = parseInt(parts[2], 10);
    const hour = parts[3] ? parseInt(parts[3], 10) : 0;
    const minute = parts[4] ? parseInt(parts[4], 10) : 0;
    const second = parts[5] ? parseInt(parts[5], 10) : 0;

    const date = new Date(year, month, day, hour, minute, second);
    return date.toISOString();
  }

  /**
   * Normalizes Brazilian number format (1.209,50 or -182,00) to float.
   * @param {string} value 
   * @returns {number}
   */
  static parseBrazilianNumber(value) {
    if (!value) return 0;
    
    const normalized = value
      .toString()
      .trim()
      .replace(/\./g, '')  // Remove thousands separator (.)
      .replace(',', '.');  // Replace decimal separator (,) with dot (.)
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }
}
