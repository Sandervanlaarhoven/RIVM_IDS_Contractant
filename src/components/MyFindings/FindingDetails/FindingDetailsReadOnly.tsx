import React, { useState } from 'react'
import {
	Typography,
	Box,
	Button,
	Paper,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import { Finding } from '../../../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import HistoryOverview from '../../utils/HistoryOverview'
import SupplierCalls from '../../utils/SupplierCalls'

const useStyles: any = makeStyles((theme) => ({
	optionListItem: {
		width: '100%',
	},
	button: {
		marginLeft: 10
	},
	formControl: {
		minWidth: 200
	},
	optionList: {
		width: '100%'
	},
	paperForForm: {
		width: '100%',
		padding: 20,
		marginBottom: 20,
	},
	marginBottom20: {
		marginBottom: 20
	},
	greyedOutText: {
		color: 'grey'
	},
}))

interface IProps {
	finding?: Finding
}

const FindingDetailsReadOnly: React.FC<IProps> = ({ finding }) => {
	const classes = useStyles()
	const history = useHistory()
	const [showHistory, setShowHistory] = useState<boolean>(false);

	const back = () => {
		history.goBack()
	}

	return (
		<Box
			display="flex"
			width="100%"
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="center"
			className={classes.dummy}
			p={2}
		>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				justifyContent="space-between"
				width="100%"
				pb={5}
			>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
				>
					<Typography variant="h4">Ticket details</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Button variant="text" className={classes.button} onClick={back}>Terug</Button>
				</Box>
			</Box>
			{!showHistory && <>
				<Paper className={classes.paperForForm}>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="space-between"
						width="100%"
					>
						<Box
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
							justifyContent="center"
							mb={2}
						>
							<Typography variant="caption">Testdatum: {finding?.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""}</Typography>
							{finding?.userEmail && <Typography variant="caption">Opgevoerd door: {finding?.userEmail}</Typography>}
						</Box>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-end"
						>
							<Button variant="outlined" className={classes.button} onClick={() => setShowHistory(!showHistory)}>{showHistory ? 'Terug' : 'Toon historie'}</Button>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						{finding?.description && <Typography variant="body1">Omschrijving: {finding?.description}</Typography>}
						{finding?.supplier && <Typography variant="body1">Leverancier: {finding?.supplier}</Typography>}
						{finding?.type && <Typography variant="body1">Type: {finding?.type}</Typography>}
						{finding?.priority && <Typography variant="body1">Prioriteit: {finding?.priority}</Typography>}
						{finding?.featureRequestDescription && <Typography variant="body1">Beschrijving van de verbetering: {finding?.featureRequestDescription}</Typography>}
						{finding?.featureRequestProposal && <Typography variant="body1">Oplossingsrichting: {finding?.featureRequestProposal}</Typography>}
						{finding?.theme && <Typography variant="body1">Thema: {finding?.theme}</Typography>}
						{finding?.expectedResult && <Typography variant="body1">Verwachte uitkomst: {finding?.expectedResult}</Typography>}
						{finding?.actualResult && <Typography variant="body1">Daadwerkelijke uitkomst: {finding?.actualResult}</Typography>}
						{finding?.additionalInfo && <Typography variant="body1">Extra informatie: {finding?.additionalInfo}</Typography>}
						{finding?.browser && <Typography variant="body1">Browser: {finding?.browser}</Typography>}
						{finding?.status && <Typography variant="body1">Status: {finding?.status}</Typography>}
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						mb={2}
					>
						<Typography variant="body2"><i>Eventuele screenshots zijn opgeslagen onder de volgende naam: </i></Typography>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						mb={2}
					>
						<Typography variant="body2"><b>"{finding?.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""} - {finding?.userEmail || 'onbekend'}"</b></Typography>
					</Box>
				</Paper>
				<Paper className={`${classes.paperForForm} ${classes.marginBottom20}`}>
					<SupplierCalls supplierCalls={finding?.supplierCalls || []} readOnly={true} />
				</Paper>
				<Paper className={classes.paperForForm}>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						mb={1}
					>
						<Typography variant="h6">Terugkoppeling en status informatie</Typography>
					</Box>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						pb={1}
					>
						{finding?.status && <Typography variant="body1">Status: {finding.status}</Typography>}
						{finding?.feedbackTeam && <Typography variant="body1">Terugkoppeling van het team: {finding.feedbackTeam}</Typography>}
						{finding?.feedbackProductOwner && <Typography variant="body1">Terugkoppeling van de product owner: {finding.feedbackProductOwner}</Typography>}
						{finding?.feedbackContractManagement && <Typography variant="body1">Terugkoppeling van contractmanagement: {finding.feedbackContractManagement}</Typography>}
						{finding?.feedbackSupplier && <Typography variant="body1">Terugkoppeling vanuit de leverancier: {finding.feedbackSupplier}</Typography>}
					</Box>
				</Paper>
			</>}
			{showHistory && finding?.history && <Paper className={classes.paperForForm}>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="space-between"
					width="100%"
				>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						mb={2}
					>
						<Typography variant="caption">Testdatum: {finding?.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""}</Typography>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-end"
					>
						<Button variant="outlined" className={classes.button} onClick={() => setShowHistory(!showHistory)}>{showHistory ? 'Terug' : 'Toon historie'}</Button>
					</Box>
				</Box>
				<HistoryOverview findingHistory={finding.history} />
			</Paper>}
		</Box>
	)
}

export default FindingDetailsReadOnly
