import { red, blue, yellow } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

const values = {
	xs: 0,
	sm: 600,
	md: 960,
	lg: 1280,
	xl: 1920,
};

// A custom theme for this app
const theme = createTheme({
	breakpoints: {
		keys: ['xs', 'sm', 'md', 'lg', 'xl'],
		up: key => `@media (min-width:${values[key]}px)`,
	},
	palette: {
		primary: {
			main: blue[900],
		},
		secondary: {
			main: red[900],
		},
		error: {
			main: red.A400,
		},
		background: {
			default: yellow[50],
		},
	}, 
	overrides: {
		MuiTab: {
			root: {
				minWidth: '125px !important'
			}
		},
	}
});

export default theme;