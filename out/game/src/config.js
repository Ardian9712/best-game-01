export const WIDTH = 1280;
export const HEIGHT = 720;
export const BEST_KEY = 'sunseed.best';
export const LEVELS = [
  { name: 'THE FIRST LIFT', source: [1,6], seed: [4,4], dark: [7,5], goal: [10,1], blocked: [[4,2],[8,4]], mirrors: [[4,6],[4,1]], initial: [1,1], solution: [0,0] },
  { name: 'CANOPY BRIDGE', source: [1,6], seed: [4,4], dark: [8,5], goal: [6,5], blocked: [[4,2],[7,3]], mirrors: [[4,6],[4,1],[9,1],[9,5]], initial: [1,1,0,1], solution: [0,0,1,0] },
  { name: 'DAWN ENGINE', source: [1,6], seed: [4,4], dark: [10,6], goal: [6,3], blocked: [[4,2],[7,3],[10,4]], mirrors: [[4,6],[4,1],[9,1],[9,5],[6,5]], initial: [1,1,0,1,0], solution: [0,0,1,0,1] },
];
