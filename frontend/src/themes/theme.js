import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#00796b',
        },
        secondary: {
            main: '#c2185b',
        },
        background: {
            default: '#e0f2f1',
        },
    },
    typography: {
        fontSize: 12,
    },
});

export default theme;
