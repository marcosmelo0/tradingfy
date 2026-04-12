export class Account {
  constructor({ 
    id = null, 
    name, 
    initialMargin = 0, 
    bufferValue = 0, 
    profitTarget = 0,
    hasMedian = true, 
    medianMultiplier = 5,
    type = 'challenge'
  }) {
    this.id = id;
    this.name = name;
    this.initialMargin = initialMargin;
    this.bufferValue = bufferValue;
    this.profitTarget = profitTarget;
    this.hasMedian = hasMedian;
    this.medianMultiplier = medianMultiplier;
    this.type = type;
  }
}
