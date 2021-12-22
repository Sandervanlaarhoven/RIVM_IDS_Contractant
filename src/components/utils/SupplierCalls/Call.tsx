import React, { useState } from 'react'
import {
	Typography,
	Box,
	Chip,
	ButtonBase,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import BugReportIcon from '@material-ui/icons/BugReport'
import PriorityLowIcon from '@material-ui/icons/KeyboardArrowDown'
import PriorityMediumIcon from '@material-ui/icons/KeyboardArrowUp'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import PriorityBlockingIcon from '@material-ui/icons/Block'
import MailOutlineIcon from '@material-ui/icons/MailOutline'

import { SupplierCall, SupplierPriority } from '../../../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { blue, green, grey, orange, red } from '@material-ui/core/colors'

const useStyles: any = makeStyles(() => ({
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
	buttonBase: {
		width: '100%'
	}
}))

interface IProps {
	item: SupplierCall,
}

const Call: React.FC<IProps> = ({ item }) => {
	const classes = useStyles()
	const [showDetails, setShowDetails] = useState<boolean>(false);

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="center"
			border={"1px solid rgba(0, 0, 0, 0.23)"}
			borderRadius={11}
			width="100%"
			mb={2}
		>
			<ButtonBase className={classes.buttonBase} onClick={() => setShowDetails(!showDetails)}>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					width="100%"
				>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						p={1}
					>
						{item.callType === 'Bug' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<BugReportIcon />
						</Box>}
						{item.callType === 'Change' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<MailOutlineIcon />
						</Box>}
						{item?.priority && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							{item?.priority === SupplierPriority.p4 && <PriorityLowIcon className={classes.prioLow} />}
							{item?.priority === SupplierPriority.p3 && <PriorityMediumIcon className={classes.prioMedium} />}
							{item?.priority === SupplierPriority.p2 && <PriorityHighIcon className={classes.prioHigh} />}
							{item?.priority === SupplierPriority.p1 && <PriorityBlockingIcon className={classes.prioBlocking} />}
						</Box>}
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Chip variant="outlined" color="primary" label={item?.status} size="small" />
						</Box>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography variant="caption">{item?.createdOn ? format(item?.createdOn, 'Pp', { locale: nl }) : ""}</Typography>
						</Box>
						{item?.description && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography className={classes.greyedOutText} variant="caption">{item?.description}</Typography>
						</Box>}
					</Box>
					{showDetails && <Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						p={1}
						mb={1}
					>
						{item?.extraInfo && <Typography className={classes.greyedOutText} variant="caption">Extra info: {item?.extraInfo}</Typography>}
					</Box>}
				</Box>
			</ButtonBase>
		</Box>
	)
}

export default Call
