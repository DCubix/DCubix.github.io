import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
});

// random app theme color
const colors = [
  '#547FF0',
  '#F07B60',
  '#47CEF0',
  '#F0B930',
  '#3CF0B1'
];

const colorsDark = [
  '#0A0F1C',
  '#1C0E0B',
  '#08181C',
  '#1C1606',
  '#071C15'
];

const index = ~~(Math.random() * colors.length);

document.documentElement.style.setProperty('--color-theme', colors[index]);
document.documentElement.style.setProperty('--color-theme-bg', colorsDark[index]);

export default app;
