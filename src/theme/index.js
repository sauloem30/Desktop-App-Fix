import { createTheme } from '@mui/material';

const theme = createTheme({
   palette: {
      primary: {
         main: '#4262FF',
         light: '#7795FF',
      },
      secondary: {
         main: '#F7F9FA',
      },
      success: {
         main: '#4CD1AF',
         light: '#E1F7F1',
         dark: '#34C759',
      },
      danger: {
         main: '#FB4F51',
         dark: '#FF3B30',
      },
      info: {
         main: '#2A41E7',
      },
   },
   typography: {
      fontFamily: 'Inter',
      color: '#000000',
      h1: {
         fontWeight: 700,
         fontSize: 48,
         lineHeight: '150%',
      },
      h2: {
         fontWeight: 600,
         fontSize: 40,
         lineHeight: '150%',
         fontFamily: 'Inter',
         color: '#000000',
      },
      h3: {
         fontWeight: 500,
         fontSize: 32,
         lineHeight: '38px',
      },
      h4: {
         fontWeight: 400,
         fontSize: 24,
         fontFamily: 'Inter',
      },
      h5: {
         fontSize: 20,
         fontWeight: 400,
         lineHeight: '24px',
         fontFamily: 'Inter',
      },
      h6: {
         fontSize: 14,
         fontWeight: 400,
         lineHeight: '24px',
      },
      subheading: {
         fontSize: 24,
         fontWeight: 400,
         lineHeight: '20px',
         color: '#000000',
         fontFamily: 'Inter',
      },
      subheading1: {
         fontSize: 24,
         fontWeight: 400,
         lineHeight: '20px',
         color: '#000000',
         fontFamily: 'Inter',
      },
      body1: {
         fontSize: 16,
         fontWeight: 400,
         lineHeight: '24px',
         color: '#000000',
         fontFamily: 'Inter',
      },
      body2: {
         fontSize: 16,
         fontWeight: 400,
         lineHeight: '24px',
         color: '#727272',
         fontFamily: 'Inter',
      },
      body3: {
         fontSize: 20,
         fontWeight: 400,
         lineHeight: '24px',
         fontFamily: 'Inter',
      },
      body4: {
         fontSize: 36,
         fontWeight: 700,
         lineHeight: '150%',
         fontFamily: 'Inter',
         color: '#2A41E7',
      },
      body5: {
         fontSize: 16,
         fontWeight: 400,
         lineHeight: '24px',
         color: '#727272',
         fontFamily: 'Inter',
      },
      body6: {
         fontSize: 16,
         fontWeight: 700,
         lineHeight: '150%',
         color: '#000000',
      },
   },
});

export default theme;
