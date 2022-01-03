import { makeStyles } from "@material-ui/core";
import { blue, green, grey, orange, red } from "@material-ui/core/colors";

const useGenericStyles: any = makeStyles(() => ({
	greyedOutText: {
		color: grey[700]
	},
	prioLow: {
		color: green[400]
	},
	prioMedium: {
		color: blue[700]
	},
	prioHigh: {
		color: orange[700]
	},
	prioBlocking: {
		color: red[800]
	},
}))

export default useGenericStyles
