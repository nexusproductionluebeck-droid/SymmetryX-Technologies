export const motion = {
  duration: {
    instant: 80,
    fast: 140,
    base: 220,
    slow: 360,
    glacial: 600,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    magnetic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;
