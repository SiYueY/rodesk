import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--dsw-alias-bg-base)',
        foreground: 'var(--dsw-alias-label-primary)',
        card: 'var(--dsw-static-neutral-bluish-00)',
        'card-foreground': 'var(--dsw-alias-label-primary)',
        primary: 'var(--dsw-static-deepseek-500)',
        'primary-foreground': 'var(--dsw-static-neutral-bluish-00)',
        secondary: 'var(--dsw-static-neutral-bluish-100)',
        'secondary-foreground': 'var(--dsw-alias-label-primary)',
        muted: 'var(--dsw-static-neutral-bluish-50)',
        'muted-foreground': 'var(--dsw-alias-label-secondary)',
        accent: 'var(--dsw-alias-interactive-bg-hover)',
        'accent-foreground': 'var(--dsw-alias-label-primary)',
        destructive: '#b42318',
        'destructive-foreground': 'var(--dsw-static-neutral-bluish-00)',
        border: 'var(--dsw-alias-border-l2)',
        input: 'var(--dsw-alias-border-l2)',
        ring: 'var(--dsw-static-deepseek-500)',
      },
      borderRadius: {
        sm: 'var(--dsw-radius-sm)',
        md: 'var(--dsw-radius-md)',
        lg: 'var(--dsw-radius-lg)',
      },
    },
  },
  plugins: [],
} satisfies Config;
