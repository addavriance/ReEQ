/**
 * Canvas dimensions
 */
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 300;
export const GAIN_CANVAS_WIDTH = 50;
export const GAIN_CANVAS_HEIGHT = 300;

/**
 * Frequency range
 */
export const MIN_FREQUENCY = 5;
export const MAX_FREQUENCY = 22050; // Nyquist frequency at 44.1kHz

/**
 * Gain range
 */
export const MIN_GAIN = -30;
export const MAX_GAIN = 30;

/**
 * Q range
 */
export const MIN_Q = 0.2;
export const MAX_Q = 11;

export const SAMPLE_RATE = 44100;

/**
 * Q adjustment sensitivity
 */
export const Q_SENSITIVITY = 0.01;

/**
 * Grid settings
 */
export const FREQUENCY_LABELS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
export const GAIN_LABELS = [-30, -20, -10, 0, 10, 20, 30];

/**
 * Visual settings
 */
export const FILTER_DOT_RADIUS = 8;
export const GAIN_LINE_HEIGHT = 5;

/**
 * Colors
 */
export const COLORS = {
  background: '#2C3E50',
  grid: '#A8D8EA',
  text: '#E8F4F8',
  filterCurve: '#CDF7E1',
  lowShelfCurve: '#c5a9f6',
  highShelfCurve: '#c5a9f6',
  filterDot: '#A8D8EA',
  filterDotActive: '#E8F4F8',
  gainLine: '#A8D8EA',
  fftBar: 'rgba(168, 216, 234, 0.3)',
};

/**
 * FFT settings
 */
export const FFT_SIZE = 2048;
export const FFT_UPDATE_RATE = 30; // fps

/**
 * Number of filters
 */
export const FILTER_COUNT = 11;
