export enum LayoutMode {
  GRID = 'grid',
  CLUSTER = 'cluster',
}

export enum VariationLevel {
  NIEDRIG = 'niedrig',
  MITTEL = 'mittel',
  HOCH = 'hoch',
}

export interface Settings {
  pageW: number;
  pageH: number;
  mTop: number;
  mBot: number;
  mIn: number;
  mOut: number;
  mode: LayoutMode;
  gridCols: number;
  gridRows: number;
  gridGap: number;
  cCols: number;
  cGap: number;
  cRows: number;
  target: number | null;
  varLevel: VariationLevel;
  heroMode: boolean; // New setting for hero image
}

export interface ImageFile {
  file: File;
  url: string;
}

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
  image: ImageFile;
}

export interface PageLayout {
  width: number;
  height: number;
  layout: LayoutRect[];
}

// Internal type for cluster generation
export interface BspRect {
  r: number;
  c: number;
  w: number;
  h: number;
}
