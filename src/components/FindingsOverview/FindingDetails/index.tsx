import React, { useEffect, useState } from 'react'
import {
	Typography,
	Box,
	FormControl,
	TextField,
	Button,
	InputLabel,
	MenuItem,
	Select,
	Paper,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'

import { useParams, useHistory } from 'react-router-dom'
import { BSON } from 'realm-web'

import { useRealmApp } from '../../App/RealmApp'
import { Browser, Finding, FindingData, FindingFieldName, FindingType, Priority, Status, Supplier, SupplierCall } from '../../../types'
import { catitaliseFirstLetter } from '../../utils'
import { FindingTheme } from '../../../types/index';
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import HistoryOverview from '../../utils/HistoryOverview'
import SupplierCalls from '../../utils/SupplierCalls'
import useGenericStyles from '../../utils/GenericStyles'

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
}))

interface params {
	id: string
}

interface IProps {
}

const FindingDetailsAdmin: React.FC<IProps> = () => {
	const classes = useStyles()
	const genericClasses = useGenericStyles()
	const app = useRealmApp()
	const history = useHistory()
	let { id } = useParams<params>()
	const mongo = app.currentUser.mongoClient("mongodb-atlas")
	const mongoFindingsCollection = mongo.db("RIVM_CONTRACTANT").collection("findings")
	const mongoFindingThemesCollection = mongo.db("RIVM_CONTRACTANT").collection("finding_themes")
	const [finding, setFinding] = useState<Finding>()
	const [findingThemes, setFindingThemes] = useState<FindingTheme[]>([])
	const [showNewTheme, setShowNewTheme] = useState<boolean>(false)
	const [newTheme, setNewTheme] = useState<FindingTheme | undefined>()
	const [showHistory, setShowHistory] = useState<boolean>(false);
	const { enqueueSnackbar } = useSnackbar()

	const onChangeNewTheme = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setNewTheme({
			name: catitaliseFirstLetter(event.target.value)
		})
	}

	const createNewTheme = async () => {
		if (newTheme?.name) {
			try {
				await mongoFindingThemesCollection.updateOne({
					name: newTheme?.name
				}, newTheme, {
					upsert: true
				})
				setFindingThemes([
					...findingThemes,
					newTheme
				])
				setNewTheme(undefined)
				setShowNewTheme(false)
			} catch (error) {
				enqueueSnackbar('Er is helaas iets mis gegaan bij het aanmaken van het nieuwe thema.', {
					variant: 'error',
				})
			}
		}
	}

	const getData = async () => {
		try {
			let findingData = {
				description: "",
				status: Status.Open,
				type: FindingType.Bug,
				priority: Priority.low,
				supplierCalls: [],
				supplier: Supplier.ivention,
				testDate: new Date(),
				history: []
			}
			let findingThemesDataRequest = mongoFindingThemesCollection.find()
			if (id) {
				findingData = await mongoFindingsCollection.findOne({
					_id: new BSON.ObjectId(id)
				})
			}
			if (!findingData.status) findingData.status = Status.Open
			if (!findingData.testDate) findingData.testDate = new Date()
			setFinding(findingData)
			setFindingThemes(await findingThemesDataRequest)
		} catch (error) {
			enqueueSnackbar('Er is helaas iets mis gegaan bij het ophalen van de gegevens.', {
				variant: 'error',
			})
		}
	}

	useEffect(() => {
		getData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const cancel = () => {
		history.goBack()
	}

	const wasInitiallyEnteredAsBug = () => {
		let wasBug = false
		if (finding?.expectedResult) wasBug = true
		if (finding?.additionalInfo) wasBug = true
		if (finding?.actualResult) wasBug = true
		if (finding?.browser) wasBug = true
		if (finding?.theme) wasBug = true
		return wasBug
	}

	const save = async () => {
		try {
			if (id && finding) {
				const updatedFinding: Finding = {
					...finding
				}
				updatedFinding.lastUpdatedBySupplier = false
				delete updatedFinding._id
				const findingData: FindingData = {
					...updatedFinding
				}
				delete findingData.history
				updatedFinding.history.push({
					finding: findingData,
					createdOn: new Date(),
					createdBy: {
						_id: app.currentUser.id,
						email: app.currentUser.profile?.email || "Onbekend",
					}
				})
				await mongoFindingsCollection.updateOne({
					_id: new BSON.ObjectId(id)
				}, updatedFinding)
				enqueueSnackbar('De bevinding is aangepast.', {
					variant: 'success',
				})
			} else if (finding) {
				await mongoFindingsCollection.insertOne(finding)
				enqueueSnackbar('De nieuwe bevinding is aangemaakt.', {
					variant: 'success',
				})
			}
			history.push("/findingsoverview")
		} catch (error) {
			enqueueSnackbar('Er is helaas iets mis gegaan bij het opslaan van de bevinding.', {
				variant: 'error',
			})
		}
	}

	const handleChangeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: FindingFieldName) => {
		if (finding) {
			setFinding({
				...finding,
				[fieldName]: catitaliseFirstLetter(event.target.value)
			})
		}
	}

	type selectEventProps = {
		name?: string | undefined,
		value: unknown
	}

	const handleChangeSelect = (event: React.ChangeEvent<selectEventProps>, fieldName: FindingFieldName) => {
		if (finding) {
			let newFinding = {
				...finding,
				[fieldName]: event.target.value
			}
			if (fieldName === FindingFieldName.type) {
				newFinding.status = Status.Open
			}
			setFinding(newFinding)
		}
	}

	const updateCalls = (calls: SupplierCall[]) => {
		if (finding) {
			const newFinding: Finding = {
				...finding
			}
			newFinding.supplierCalls = calls
			setFinding(newFinding)
		}
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
					<Typography variant="h4">{id ? 'Bevinding aanpassen' : 'Nieuwe bevinding'}</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Button variant="text" className={classes.button} onClick={cancel}>Annuleren</Button>
					<Button variant="contained" className={classes.button} color="primary" onClick={save}>
						Opslaan
					</Button>
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
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					pb={3}
				>
					<Typography variant="body1">Omschrijving: {finding?.description || ''}</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					pb={3}
				>
					<FormControl className={classes.formControl}>
						<InputLabel id="type">Leverancier</InputLabel>
						<Select
							labelId="supplier"
							id="supplier"
							value={finding?.supplier || ''}
							onChange={(event) => handleChangeSelect(event, FindingFieldName.supplier)}
						>
							<MenuItem value={Supplier.ivention}>{Supplier.ivention}</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					pb={3}
				>
					<FormControl className={classes.formControl}>
						<InputLabel id="type">Type bevinding</InputLabel>
						<Select
							labelId="type"
							id="type"
							value={finding?.type || ''}
							onChange={(event) => handleChangeSelect(event, FindingFieldName.type)}
						>
							<MenuItem value={''}></MenuItem>
							<MenuItem value={FindingType.Bug}>Bug</MenuItem>
							<MenuItem value={FindingType.Verbetering}>Verbetering</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					pb={3}
				>
					<FormControl className={classes.formControl}>
						<InputLabel id="type">Prioriteit</InputLabel>
						<Select
							labelId="priority"
							id="priority"
							value={finding?.priority || ''}
							onChange={(event) => handleChangeSelect(event, FindingFieldName.priority)}
						>
							<MenuItem value={Priority.low}>{Priority.low}</MenuItem>
							<MenuItem value={Priority.medium}>{Priority.medium}</MenuItem>
							<MenuItem value={Priority.high}>{Priority.high}</MenuItem>
							<MenuItem value={Priority.blocking}>{Priority.blocking}</MenuItem>
						</Select>
					</FormControl>
				</Box>
				{finding?.type === FindingType.Verbetering && <>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<TextField
							label="Beschrijving van de verbetering"
							value={finding?.featureRequestDescription || ''}
							fullWidth
							multiline
							variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.featureRequestDescription)}
							helperText="Beschrijf zo goed mogelijk wat je graag zou willen verbeteren in de applicatie"
						/>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<TextField
							label="Oplossingsrichting"
							value={finding?.featureRequestProposal || ''}
							fullWidth
							multiline
							variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.featureRequestProposal)}
							helperText="Beschrijf zo goed mogelijk wat de voorgestelde oplossingsrichting is"
						/>
					</Box>
				</>}
				{finding?.type === FindingType.Bug && finding?.featureRequestDescription && <>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<Typography align="left" className={genericClasses.greyedOutText} variant="h6">Voorheen ingevoerd als verbetering</Typography>
						<Typography align="left" className={genericClasses.greyedOutText} variant="body2">Beschrijving: {finding?.featureRequestDescription || ''}</Typography>
					</Box>
				</>}
				{finding?.type === FindingType.Verbetering && wasInitiallyEnteredAsBug() && <>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<Typography align="left" className={genericClasses.greyedOutText} variant="h6">Voorheen ingevoerd als Bug</Typography>
						{finding?.theme && <Typography align="left" className={genericClasses.greyedOutText} variant="body2">Thema: {finding?.theme}</Typography>}
						{finding?.expectedResult && <Typography align="left" className={genericClasses.greyedOutText} variant="body2">Verwachte uitkomst: {finding?.expectedResult}</Typography>}
						{finding?.actualResult && <Typography align="left" className={genericClasses.greyedOutText} variant="body2">Daadwerkelijke uitkomst: {finding?.actualResult}</Typography>}
						{finding?.additionalInfo && <Typography align="left" className={genericClasses.greyedOutText} variant="body2">Extra informatie: {finding?.additionalInfo}</Typography>}
						{finding?.browser && <Typography align="left" className={genericClasses.greyedOutText} variant="body2">Browser: {finding?.browser}</Typography>}
					</Box>
				</>}
				{finding?.type === FindingType.Bug && <>
					{!showNewTheme && <Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						pb={3}
					>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
						>
							<FormControl className={classes.formControl}>
								<InputLabel id="type">Thema</InputLabel>
								<Select
									labelId="type"
									id="type"
									value={finding?.theme || ''}
									onChange={(event) => handleChangeSelect(event, FindingFieldName.findingTheme)}
								>
									<MenuItem key="" value={''}>Geen specifiek thema</MenuItem>
									{findingThemes.map((findingTheme) => <MenuItem key={findingTheme.name} value={findingTheme.name}>{findingTheme.name}</MenuItem>)}
								</Select>
							</FormControl>
						</Box>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
						>
							<Button variant="outlined" className={classes.button} color="primary" onClick={() => setShowNewTheme(true)}>
								Nieuw thema
							</Button>
						</Box>
					</Box>}
					{showNewTheme && <Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						pb={3}
					>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
							width={300}
						>
							<TextField
								label="Thema"
								value={newTheme?.name || ''}
								fullWidth
								multiline
								variant="outlined"
								onChange={onChangeNewTheme}
							/>
						</Box>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
						>
							<Button variant="text" className={classes.button} color="default" onClick={() => setShowNewTheme(false)}>
								Annuleren
							</Button>
							<Button variant="contained" className={classes.button} color="primary" onClick={createNewTheme}>
								Aanmaken
							</Button>
						</Box>
					</Box>}
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<TextField
							label="Verwachte uitkomst"
							value={finding?.expectedResult || ''}
							fullWidth
							multiline
							variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.expectedResult)}
							helperText="Schrijf hier in stappen uit wat je getest hebt en met welke data"
						/>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<TextField
							label="Daadwerkelijke uitkomst"
							value={finding?.actualResult || ''}
							fullWidth
							multiline
							variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.actualResult)}
							helperText="Schrijf hier in stappen uit wat de daadwerkelijke uitkomst was en waarom dit niet aan je verwachting voldoet"
						/>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
						width="100%"
						pb={3}
					>
						<TextField
							label="Extra informatie"
							value={finding?.additionalInfo || ''}
							fullWidth
							multiline
							variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.additionalInfo)}
							helperText="Testdata / specifieke rollen, rechten"
						/>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
						width="100%"
						pb={3}
					>
						<Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="center"
						>
							<FormControl className={classes.formControl}>
								<InputLabel id="browser">Browser</InputLabel>
								<Select
									labelId="browser"
									id="browser"
									value={finding?.browser || ''}
									onChange={(event) => handleChangeSelect(event, FindingFieldName.browser)}
								>
									<MenuItem key="" value={''}>Kies de browser waarmee is getest</MenuItem>
									<MenuItem key={Browser.Chrome} value={Browser.Chrome}>{Browser.Chrome}</MenuItem>
									<MenuItem key={Browser.Edge} value={Browser.Edge}>{Browser.Edge}</MenuItem>
									<MenuItem key={Browser.Firefox} value={Browser.Firefox}>{Browser.Firefox}</MenuItem>
									<MenuItem key={Browser.InternetExplorer} value={Browser.InternetExplorer}>{Browser.InternetExplorer}</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Box>
				</>
				}
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
				<SupplierCalls supplierCalls={finding?.supplierCalls || []} updateCalls={updateCalls} />
			</Paper>
			<Paper className={classes.paperForForm}>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					my={1}
				>
					<Typography variant="h6">Terugkoppeling en status informatie</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
				>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
					>
						<FormControl className={classes.formControl}>
							<InputLabel id="status">Status</InputLabel>
							<Select
								labelId="status"
								id="status"
								value={finding?.status || Status.Open}
								onChange={(event) => handleChangeSelect(event, FindingFieldName.status)}
							>
									<MenuItem key={Status.Open} value={Status.Open}>{Status.Open}</MenuItem>
									<MenuItem key={Status.Submitted} value={Status.Submitted}>{Status.Submitted}</MenuItem>
									<MenuItem key={Status.Verified} value={Status.Verified}>{Status.Verified}</MenuItem>
									<MenuItem key={Status.Gepland} value={Status.Gepland}>{Status.Gepland}</MenuItem>
									<MenuItem key={Status.ReadyForRelease} value={Status.ReadyForRelease}>{Status.ReadyForRelease}</MenuItem>
									<MenuItem key={Status.Hertest} value={Status.Hertest}>{Status.Hertest}</MenuItem>
									<MenuItem key={Status.TestFailed} value={Status.TestFailed}>{Status.TestFailed}</MenuItem>
									<MenuItem key={Status.Denied} value={Status.Denied}>{Status.Denied}</MenuItem>
									<MenuItem key={Status.Closed} value={Status.Closed}>{Status.Closed}</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="center"
					width="100%"
					my={3}
				>
					<TextField
						label="Terugkoppeling van het team"
						value={finding?.feedbackTeam || ''}
						multiline
						fullWidth
						variant="outlined"
						onChange={(event) => handleChangeTextField(event, FindingFieldName.feedbackTeam)}
					/>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="center"
					width="100%"
					my={3}
				>
					<TextField
						label="Terugkoppeling van de product owner"
						value={finding?.feedbackProductOwner || ''}
						multiline
						fullWidth
						variant="outlined"
						onChange={(event) => handleChangeTextField(event, FindingFieldName.feedbackProductOwner)}
					/>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="center"
					width="100%"
					my={3}
				>
					<TextField
						label="Terugkoppeling van contractmanagement"
						value={finding?.feedbackContractManagement || ''}
						multiline
						fullWidth
						variant="outlined"
							onChange={(event) => handleChangeTextField(event, FindingFieldName.feedbackContractManagement)}
					/>
				</Box>
				{finding?.feedbackSupplier && <Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					my={3}
				>
					<Typography variant="caption">Terugkoppeling vanuit de leverancier: {finding.feedbackSupplier}</Typography>
				</Box>}
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

export default FindingDetailsAdmin
