import { useColorScheme } from 'react-native';

export interface AlbumColors {
  ink: string;
  inkSoft: string;
  paper: string;
  card: string;
  line: string;
  amber: string;
  amberInk: string;
  teal: string;
  plum: string;
  raspberry: string;
  locked: string;
}

const light: AlbumColors = {
  ink: '#241b16',
  inkSoft: '#6b5c4d',
  paper: '#e9e2d6',
  card: '#fbf7ee',
  line: 'rgba(36, 27, 22, 0.14)',
  amber: '#e8a33d',
  amberInk: '#5c3b0a',
  teal: '#1d8a79',
  plum: '#6e5aa8',
  raspberry: '#d9455c',
  locked: '#b7ac9c',
};

const dark: AlbumColors = {
  ink: '#ede6d8',
  inkSoft: '#b8ab97',
  paper: '#17130f',
  card: '#241c16',
  line: 'rgba(237, 230, 216, 0.14)',
  amber: '#f3b65b',
  amberInk: '#3a2504',
  teal: '#2fa592',
  plum: '#9683d1',
  raspberry: '#f06b80',
  locked: '#4a4237',
};

export function useAlbumColors(): AlbumColors {
  return useColorScheme() === 'dark' ? dark : light;
}
