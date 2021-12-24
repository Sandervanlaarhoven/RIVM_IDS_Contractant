import React, { useState } from 'react'
import {
	Typography,
	Box,
	Chip,
	ButtonBase,
	IconButton,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import BugReportIcon from '@material-ui/icons/BugReport'
import PriorityLowIcon from '@material-ui/icons/KeyboardArrowDown'
import PriorityMediumIcon from '@material-ui/icons/KeyboardArrowUp'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import PriorityBlockingIcon from '@material-ui/icons/Block'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

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
		flexGrow: 1
	}
}))

interface IProps {
	call: SupplierCall,
	editCall: Function,
	deleteCall: Function,
	readOnly?: boolean,
}

const Call: React.FC<IProps> = ({ call, editCall, deleteCall, readOnly }) => {
	const classes = useStyles()
	const [showDetails, setShowDetails] = useState<boolean>(!!readOnly);

	const onEditClick = (call: SupplierCall) => {
		editCall(call)
	}

	const onDeleteClick = (call: SupplierCall) => {
		deleteCall(call)
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			justifyContent="space-between"
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
						{call.callType === 'Bug' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<BugReportIcon />
						</Box>}
						{call.callType === 'Change' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<MailOutlineIcon />
						</Box>}
						{call?.priority && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							{call?.priority === SupplierPriority.p4 && <PriorityLowIcon className={classes.prioLow} />}
							{call?.priority === SupplierPriority.p3 && <PriorityMediumIcon className={classes.prioMedium} />}
							{call?.priority === SupplierPriority.p2 && <PriorityHighIcon className={classes.prioHigh} />}
							{call?.priority === SupplierPriority.p1 && <PriorityBlockingIcon className={classes.prioBlocking} />}
						</Box>}
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Chip variant="outlined" color="primary" label={call?.status} size="small" />
						</Box>
						{call?.callNumber && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography variant="caption">{call.callNumber} - </Typography>
						</Box>}
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography variant="caption">{call?.createdOn ? format(call?.createdOn, 'Pp', { locale: nl }) : ""}</Typography>
						</Box>
						{call?.description && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography className={classes.greyedOutText} variant="caption">{call?.description}</Typography>
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
						{call?.callNumber && <Typography className={classes.greyedOutText} variant="caption">Call nummer: {call?.callNumber}</Typography>}
						{call?.priority && <Typography className={classes.greyedOutText} variant="caption">Prioriteit: {call?.priority}</Typography>}
						{call?.extraInfo && <Typography className={classes.greyedOutText} variant="caption">Extra info: {call?.extraInfo}</Typography>}
					</Box>}
				</Box>
			</ButtonBase>
			{!readOnly && <Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				justifyContent="flex-end"
				flexGrow={0}
			>
				<IconButton aria-label="delete" className={classes.margin} color="primary" onClick={() => onEditClick(call)}>
					<EditIcon />
				</IconButton>
				<IconButton aria-label="delete" className={classes.margin} color="secondary" onClick={() => onDeleteClick(call)}>
					<DeleteIcon />
				</IconButton>
			</Box>}
		</Box>
	)
}

export default Call
