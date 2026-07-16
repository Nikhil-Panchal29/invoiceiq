import { Theme, Container } from './types';

const injectedTheme: string = '%INJECTED_THEME%';
const injectedContainer: string = '%INJECTED_CONTAINER%';

let theme: Theme = 'light';
let container: Container = 'none';

if (injectedTheme === 'light' || injectedTheme === 'dark') {
  theme = injectedTheme;
}
if (injectedContainer === 'centered' || injectedContainer === 'none') {
  container = injectedContainer;
}

export const colors = {
  primary: '#BA5A5A',
  primaryDark: '#a04b4b',
  primaryDeeper: '#8a3f3f',
  accent: '#86BCBD',
  accent2: '#A4CE8B',
  accent3: '#F7E49B',
  background: '#F7F8F6',
  backgroundSecondary: '#EEF4F2',
  surface: '#FFFFFF',
  darkBg: '#1E293B',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  border: '#DCE5E2',
  success: '#5AAE7A',
  warning: '#E3B341',
  error: '#C95F5F',
  shadow: 'rgba(20,20,20,0.08)',
} as const;

export default {
  theme,
  container,
  colors,
};
