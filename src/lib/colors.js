// The colors a category can have.
// Tailwind only includes classes it can find written out in full,
// so every class is spelled out here instead of being built from pieces.
//   dot:  a small solid circle
//   pill: a soft colored label (works in light and dark mode)
const COLORS = {
  blue: {
    label: 'Blue',
    dot: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  },
  sky: {
    label: 'Sky',
    dot: 'bg-sky-500',
    pill: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  cyan: {
    label: 'Cyan',
    dot: 'bg-cyan-500',
    pill: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  },
  teal: {
    label: 'Teal',
    dot: 'bg-teal-500',
    pill: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  },
  indigo: {
    label: 'Indigo',
    dot: 'bg-indigo-500',
    pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  violet: {
    label: 'Violet',
    dot: 'bg-violet-500',
    pill: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  },
  fuchsia: {
    label: 'Fuchsia',
    dot: 'bg-fuchsia-500',
    pill: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
  },
  pink: {
    label: 'Pink',
    dot: 'bg-pink-500',
    pill: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  },
  orange: {
    label: 'Orange',
    dot: 'bg-orange-500',
    pill: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  },
  brown: {
    label: 'Brown',
    dot: 'bg-amber-700',
    pill: 'bg-amber-100/60 text-amber-800 dark:bg-amber-700/20 dark:text-amber-300',
  },
  slate: {
    label: 'Gray',
    dot: 'bg-slate-500',
    pill: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  },
}

export const COLOR_NAMES = Object.keys(COLORS)

// Get the classes for a color name; unknown names fall back to gray.
export function colorClasses(name) {
  return COLORS[name] ?? COLORS.slate
}
