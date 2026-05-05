export const CATEGORY_CONFIG = {
  Startup: { risk: 'High', range: [100, 300], minMult: 0.5, maxMult: 1.9, volatility: [-0.3, 0.4] },
  Tech: { risk: 'Medium-High', range: [150, 400], minMult: 0.6, maxMult: 1.8, volatility: [-0.2, 0.25] },
  Finance: { risk: 'Medium', range: [100, 250], minMult: 0.7, maxMult: 1.6, volatility: [-0.1, 0.15] },
  PSU: { risk: 'Low', range: [50, 150], minMult: 0.8, maxMult: 1.4, volatility: [-0.05, 0.08] }
};

export const GAME_DEFAULTS = {
  rounds: [600, 600, 600, 300]
};
