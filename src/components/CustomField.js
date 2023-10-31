import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';

const CustomFieldInput = styled(InputBase)(({ theme }) => ({
   'label + &': {
      marginTop: theme.spacing(3),
   },
   '& .MuiInputBase-input': {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#2b2b2b',
      border: '1px solid #ced4da',
      fontSize: 14,
      width: '100%',
      padding: '10px 12px',
      transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
      // Use the system font instead of the default Roboto font.
      fontFamily: [
         // "-apple-system",
         // "BlinkMacSystemFont",
         // '"Segoe UI"',
         // "Roboto",
         // '"Helvetica Neue"',
         // "Arial",
         // "sans-serif",
         // '"Apple Color Emoji"',
         // '"Segoe UI Emoji"',
         // '"Segoe UI Symbol"',
         'Inter',
      ].join(','),
      '&:focus': {
         boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
         borderColor: theme.palette.primary.main,
      },
      '&::-webkit-input-placeholder': {
         color: '#000000',
         opacity: 1,
         fontFamily: 'Inter',
         fontSize: 14,
         lineHeight: 24,
      },
   },
}));

export default CustomFieldInput;
