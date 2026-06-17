/** @type {import('tailwindcss').Config} */
// Chorus Loom design tokens. Colors are exposed through CSS variables so that
// theme switching (dark default, light variant) happens without rebuilding.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink0: 'var(--ink0)',
        ink1: 'var(--ink1)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        ink4: 'var(--ink4)',
        ink5: 'var(--ink5)',
        bone: 'var(--bone)',
        bone2: 'var(--bone2)',
        ash: 'var(--ash)',
        mute: 'var(--mute)',
        dim: 'var(--dim)',
        sage: 'var(--sage)',
        'sage-text': 'var(--sage-text)',
        champagne: 'var(--champagne)',
        'champagne-text': 'var(--champagne-text)',
        ember: 'var(--ember)',
        crimson: 'var(--crimson)',
        line1: 'var(--line1)',
        line2: 'var(--line2)',
        line3: 'var(--line3)'
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif']
      },
      transitionTimingFunction: {
        loom: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
}
