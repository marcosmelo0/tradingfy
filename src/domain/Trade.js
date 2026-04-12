export class Trade {
  constructor({ id, asset, openDate, closeDate, result, type }) {
    this.id = id;
    this.asset = asset;
    this.openDate = openDate;
    this.closeDate = closeDate;
    this.result = result;
    this.type = type; // 'C' (Compra) or 'V' (Venda)
    this.isWin = result > 0;
  }
}
