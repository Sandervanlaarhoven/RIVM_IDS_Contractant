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

import { HistoryElement, Priority } from '../../../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { blue, green, grey, orange, red } from '@material-ui/core/colors'
import SupplierCalls from '../SupplierCalls'

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
	item: HistoryElement,
}

const HistoryItem: React.FC<IProps> = ({ item }) => {
	const classes = useStyles()
	const [showDetails, setShowDetails] = useState<boolean>(false);

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
						{item?.finding?.type === 'bug' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<BugReportIcon />
						</Box>}
						{item?.finding?.type === 'verbetering' && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							<MailOutlineIcon />
						</Box>}
						{item?.finding?.priority && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
						>
							{item?.finding?.priority === Priority.low && <PriorityLowIcon className={classes.prioLow} />}
							{item?.finding?.priority === Priority.medium && <PriorityMediumIcon className={classes.prioMedium} />}
							{item?.finding?.priority === Priority.high && <PriorityHighIcon className={classes.prioHigh} />}
							{item?.finding?.priority === Priority.blocking && <PriorityBlockingIcon className={classes.prioBlocking} />}
						</Box>}
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Chip variant="outlined" color="primary" label={item?.finding?.status} size="small" />
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
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography variant="caption">{item?.createdBy?.email ? ` - ${item.createdBy.email}` : ""}</Typography>
						</Box>
					</Box>
					{showDetails && <>
						<Box
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
							justifyContent="center"
							width="100%"
							p={1}
						>
							{item?.finding?.description && <Typography className={classes.greyedOutText} variant="caption">Omschrijving: {item?.finding?.description}</Typography>}
							{item?.finding?.theme && <Typography className={classes.greyedOutText} variant="caption">Thema: {item?.finding?.theme}</Typography>}
							{item?.finding?.featureRequestDescription && <Typography className={classes.greyedOutText} variant="caption">Beschrijving: {item?.finding?.featureRequestDescription}</Typography>}
							{item?.finding?.expectedResult && <Typography className={classes.greyedOutText} variant="caption">Verwachte uitkomst: {item?.finding?.expectedResult}</Typography>}
							{item?.finding?.actualResult && <Typography className={classes.greyedOutText} variant="caption">Daadwerkelijke uitkomst: {item?.finding?.actualResult}</Typography>}
							{item?.finding?.additionalInfo && <Typography className={classes.greyedOutText} variant="caption">Extra informatie: {item?.finding?.additionalInfo}</Typography>}
							{item?.finding?.browser && <Typography className={classes.greyedOutText} variant="caption">Browser: {item?.finding?.browser}</Typography>}
						</Box>
						<Box
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
							justifyContent="center"
							width="100%"
							p={1}
						>
							<SupplierCalls supplierCalls={item?.finding?.supplierCalls || []} readOnly={true} />
						</Box>
						<Box
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
							justifyContent="center"
							width="100%"
							p={1}
						>
							<Typography variant="h6">Terugkoppeling en status informatie</Typography>
							{item?.finding?.feedbackTeam && <Typography className={classes.greyedOutText} variant="caption">Terugkoppeling van het team: {item?.finding?.feedbackTeam}</Typography>}
							{item?.finding?.feedbackProductOwner && <Typography className={classes.greyedOutText} variant="caption">Terugkoppeling van de product owner: {item?.finding?.feedbackProductOwner}</Typography>}
							{item?.finding?.feedbackContractManagement && <Typography className={classes.greyedOutText} variant="caption">Terugkoppeling van contractmanagemnt: {item?.finding?.feedbackContractManagement}</Typography>}
						</Box>
					</>}
				</Box>
			</ButtonBase>
		</Box>
	)
}

export default HistoryItem
