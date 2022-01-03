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
import SupplierCalls from '../SupplierCalls'
import useGenericStyles from '../GenericStyles'

const useStyles: any = makeStyles(() => ({
	buttonBase: {
		flexGrow: 1
	},
	dateTime: {
		minWidth: 103
	},
}))

interface IProps {
	item: HistoryElement,
}

const HistoryItem: React.FC<IProps> = ({ item }) => {
	const classes = useStyles()
	const genericClasses = useGenericStyles()
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
							{item?.finding?.priority === Priority.low && <PriorityLowIcon className={genericClasses.prioLow} />}
							{item?.finding?.priority === Priority.medium && <PriorityMediumIcon className={genericClasses.prioMedium} />}
							{item?.finding?.priority === Priority.high && <PriorityHighIcon className={genericClasses.prioHigh} />}
							{item?.finding?.priority === Priority.blocking && <PriorityBlockingIcon className={genericClasses.prioBlocking} />}
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
							<Typography align="left" className={classes.dateTime} variant="caption">{item?.createdOn ? format(item?.createdOn, 'Pp', { locale: nl }) : ""}</Typography>
						</Box>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							ml={1}
						>
							<Typography align="left" variant="caption">{item?.createdBy?.email ? ` - ${item.createdBy.email}` : ""}</Typography>
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
							{item?.finding?.description && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Omschrijving: {item?.finding?.description}</Typography>}
							{item?.finding?.theme && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Thema: {item?.finding?.theme}</Typography>}
							{item?.finding?.featureRequestDescription && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Beschrijving: {item?.finding?.featureRequestDescription}</Typography>}
							{item?.finding?.expectedResult && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Verwachte uitkomst: {item?.finding?.expectedResult}</Typography>}
							{item?.finding?.actualResult && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Daadwerkelijke uitkomst: {item?.finding?.actualResult}</Typography>}
							{item?.finding?.additionalInfo && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Extra informatie: {item?.finding?.additionalInfo}</Typography>}
							{item?.finding?.browser && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Browser: {item?.finding?.browser}</Typography>}
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
							{item?.finding?.feedbackTeam && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Terugkoppeling vanuit het team: {item?.finding?.feedbackTeam}</Typography>}
							{item?.finding?.feedbackProductOwner && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Terugkoppeling van de product owner: {item?.finding?.feedbackProductOwner}</Typography>}
							{item?.finding?.feedbackContractManagement && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Terugkoppeling van contractmanagemnt: {item?.finding?.feedbackContractManagement}</Typography>}
							{item?.finding?.feedbackSupplier && <Typography align="left" className={genericClasses.greyedOutText} variant="caption">Terugkoppeling vanuit de leverancier: {item?.finding?.feedbackSupplier}</Typography>}
						</Box>
					</>}
				</Box>
			</ButtonBase>
		</Box>
	)
}

export default HistoryItem
