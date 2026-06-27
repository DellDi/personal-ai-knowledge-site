import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

const storageKey = 'theme';
const order: ThemePreference[] = ['system', 'light', 'dark'];

function resolveTheme(preference: ThemePreference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as ThemePreference | null;
    const nextPreference = saved && order.includes(saved) ? saved : 'system';
    setPreference(nextPreference);
    applyTheme(nextPreference);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if ((window.localStorage.getItem(storageKey) ?? 'system') === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const next = order[(order.indexOf(preference) + 1) % order.length];
  const Icon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;
  const label = `Theme: ${preference}. Switch to ${next}.`;

  return (
    <button
      type="button"
      className="theme-toggle focus-ring"
      aria-label={label}
      title={label}
      onClick={() => {
        window.localStorage.setItem(storageKey, next);
        setPreference(next);
        applyTheme(next);
      }}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={2.4} />
    </button>
  );
}
