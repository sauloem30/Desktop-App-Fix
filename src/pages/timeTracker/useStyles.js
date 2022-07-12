
import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.white,
		height: "100vh",
		overflow: "hidden",
	},
	loginContainer: {
		padding: "0px 0px",
		textAlign: "center",
	},
	ListItem: {
		display: "flex",
		justifyContent: "space-between",
	},
	style:{
		width: "100%",
		maxWidth: 360,
		bgcolor: "background.paper",
	},
	loginContent: {
		[theme.breakpoints.down("sm")]: {
				padding: "24px 0px 0px 0px",
		},
	},
	formContent: {
		marginTop: 10,
		"& > *": {
				marginBottom: 10,
		},
		width: "100%",
	},
	projectContainer: {
		maxHeight: "40vh",
		overflow: "auto",
		scrollbarWidth: 'thin'
	}
}));
