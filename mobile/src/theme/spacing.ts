// Civic Horizon spacing & shape tokens — design.md §8
export const spacing = {
  containerMargin: 16,
  stackGap: 12,
  gridGutter: 12,
  touchTargetMin: 44,
} as const;

export const shape = {
  rounded: 12,
  roundedLg: 20,
  roundedXl: 26,
} as const;

export type Spacing = typeof spacing;
export type Shape = typeof shape;
