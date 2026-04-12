export class StatisticsService {
  /**
   * Calculates trading dashboard statistics with account-specific settings.
   * @param {Trade[]} trades 
   * @param {object} accountSettings
   */
  static calculate(trades, accountSettings = { medianMultiplier: 5, hasMedian: true }) {
    if (!trades || trades.length === 0) {
      return this.getEmptyStats();
    }

    const results = trades.map(t => t.result);
    
    // Per rules: Median is calculated from POSITIVE results only
    const positiveResults = results
      .filter(r => r >= 0)
      .sort((a, b) => a - b);
    
    const median = this.calculateMedian(positiveResults);
    const multiplier = accountSettings.medianMultiplier || 5;
    const medianLimit = median * multiplier;
    
    const totalPnL = results.reduce((a, b) => a + b, 0);
    
    const wins = trades.filter(t => t.result > 0);
    const losses = trades.filter(t => t.result < 0);
    
    const winrate = (wins.length / trades.length) * 100;
    
    const totalWinsValue = wins.reduce((a, b) => a + b.result, 0);
    const totalLossesValue = Math.abs(losses.reduce((a, b) => a + b.result, 0));
    
    const payoff = totalLossesValue !== 0 ? totalWinsValue / totalLossesValue : totalWinsValue;

    // Expectancy
    const avgWin = wins.length > 0 ? totalWinsValue / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossesValue / losses.length : 0;
    const winrateDecimal = winrate / 100;
    const expectancy = (winrateDecimal * avgWin) - ((1 - winrateDecimal) * Math.abs(avgLoss));
    
    // Max Drawdown & Threshold Logic
    let currentPnL = 0;
    let peakPnL = 0;
    let maxDD = 0;
    results.forEach(r => {
      currentPnL += r;
      if (currentPnL > peakPnL) peakPnL = currentPnL;
      const dd = peakPnL - currentPnL;
      if (dd > maxDD) maxDD = dd;
    });

    // Rule: Diferent drawdown behaviors
    const initialBalance = accountSettings.initialMargin || 0;
    const buffer = accountSettings.bufferValue || 0;
    const isFunded = accountSettings.type === 'funded';
    
    let thresholdPnL = -buffer; // Default for Challenge (Static)

    if (isFunded) {
      // Trailing RT for Funded: follows peak until it reaches the initial margin
      thresholdPnL = peakPnL - buffer;
      if (peakPnL >= buffer) {
        thresholdPnL = 0; // Fixed at initial margin once cushion is hit
      }
    }
    
    const drawdownThreshold = initialBalance + thresholdPnL;
    const distanceToThreshold = (initialBalance + totalPnL) - drawdownThreshold;

    const isRiskViolation = accountSettings.hasMedian && totalPnL < -medianLimit;
    const isDrawdownViolation = (initialBalance + totalPnL) <= drawdownThreshold;

    // Performance by Side
    const buyTrades = trades.filter(t => t.type === 'C');
    const sellTrades = trades.filter(t => t.type === 'V');
    
    const buyWinrate = buyTrades.length > 0 ? (buyTrades.filter(t => t.result > 0).length / buyTrades.length) * 100 : 0;
    const sellWinrate = sellTrades.length > 0 ? (sellTrades.filter(t => t.result > 0).length / sellTrades.length) * 100 : 0;

    // Best Asset Performance
    const assetStats = {};
    trades.forEach(t => {
      if (!assetStats[t.asset]) assetStats[t.asset] = 0;
      assetStats[t.asset] += t.result;
    });
    
    let bestAsset = { name: 'N/A', pnl: 0 };
    Object.entries(assetStats).forEach(([name, pnl]) => {
      if (pnl > bestAsset.pnl) {
        bestAsset = { name, pnl };
      }
    });

    const maxGain = results.length > 0 ? Math.max(...results) : 0;
    const maxLoss = results.length > 0 ? Math.min(...results) : 0;

    return {
      median,
      medianX5: medianLimit,
      totalPnL,
      winrate,
      payoff,
      expectancy,
      maxDrawdown: maxDD,
      peakPnL,
      maxGain,
      maxLoss,
      isRiskViolation,
      isDrawdownViolation,
      drawdownThreshold,
      distanceToThreshold,
      tradesCount: trades.length,
      winsCount: wins.length,
      lossesCount: losses.length,
      buyWinrate,
      sellWinrate,
      bestAsset,
      mostAssertiveSide: buyWinrate >= sellWinrate ? 'Compra' : 'Venda'
    };
  }

  static calculateMedian(values) {
    if (values.length === 0) return 0;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  }

  static getEmptyStats() {
    return {
      median: 0,
      medianX5: 0,
      totalPnL: 0,
      winrate: 0,
      payoff: 0,
      expectancy: 0,
      maxDrawdown: 0,
      peakPnL: 0,
      maxGain: 0,
      maxLoss: 0,
      isRiskViolation: false,
      isDrawdownViolation: false,
      drawdownThreshold: 0,
      distanceToThreshold: 0,
      tradesCount: 0,
      winsCount: 0,
      lossesCount: 0,
      buyWinrate: 0,
      sellWinrate: 0,
      bestAsset: { name: 'N/A', pnl: 0 },
      mostAssertiveSide: 'N/A'
    };
  }
}
