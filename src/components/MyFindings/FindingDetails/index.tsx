import React, { useEffect, useState } from 'react'
import {
	Typography,
	Box,
	FormControl,
	FormControlLabel,
	Switch,
	TextField,
	Button,
	InputLabel,
	MenuItem,
	Select,
	FormGroup,
	Paper,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'

import { useParams, useHistory } from 'react-router-dom'
import { BSON } from 'realm-web'

import { useRealmApp } from '../../App/RealmApp'
import { Browser, Finding, FindingFieldName, FindingType, Priority, Status, Supplier, SupplierCall } from '../../../types'
import { catitaliseFirstLetter } from '../../utils'
import { FindingTheme, FindingData } from '../../../types/index';
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
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
	},
	marginBottom20: {
		marginBottom: 20
	},
}))

interface params {
	id: string
}

const FindingDetails = () => {
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
	const { enqueueSnackbar } = useSnackbar()
	const [anotherNewFinding, setAnotherNewFinding] = useState<boolean>(false)

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
				uid: app.currentUser.id,
				userEmail: app.currentUser.profile?.email || "Onbekend",
				history: [],
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
					...finding,
				}
				const findingData: FindingData = {
					...updatedFinding
				}
				delete findingData.history
				delete findingData._id
				updatedFinding.history.push({
					finding: findingData,
					createdOn: new Date(),
					createdBy: {
						_id: app.currentUser.id,
						email: app.currentUser.profile?.email || "Onbekend",
					}
				})
				delete updatedFinding._id
				await mongoFindingsCollection.updateOne({
					_id: new BSON.ObjectId(id)
				}, updatedFinding)
				enqueueSnackbar('De bevinding is aangepast.', {
					variant: 'success',
				})
			} else if (finding) {
				const findingData: FindingData = {
					...finding
				}
				delete findingData.history
				const newFinding = {
					...finding,
					history: [{
						finding: findingData,
						createdOn: new Date(),
						createdBy: {
							_id: app.currentUser.id,
							email: app.currentUser.profile?.email || "Onbekend",
						}
					}]
				}
				await mongoFindingsCollection.insertOne(newFinding)
				enqueueSnackbar('De nieuwe bevinding is aangemaakt.', {
					variant: 'success',
				})
			}
			if (!anotherNewFinding) {
				history.push("/findings")
			} else {
				const newFinding: Finding = {
					description: '',
					type: FindingType.Bug,
					priority: Priority.low,
					supplierCalls: [],
					supplier: Supplier.ivention,
					status: Status.Open,
					testDate: new Date(),
					uid: app.currentUser.id,
					userEmail: app.currentUser.profile?.email || "Onbekend",
					history: [],
				}
				if (finding?.theme) newFinding.theme = finding.theme
				const findingData: FindingData = {
					...newFinding
				}
				delete findingData.history
				newFinding.history.push({
					finding: findingData,
					createdOn: new Date(),
					createdBy: {
						_id: app.currentUser.id,
						email: app.currentUser.profile?.email || "Onbekend",
					}
				})
				setFinding(newFinding)
				history.push("/findings/new")
			}
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
			setFinding({
				...finding,
				[fieldName]: event.target.value
			})
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
			<Paper className={classes.paperForForm}>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
					mb={2}
				>
					<Typography variant="caption">Testdatum: {finding?.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""}</Typography>
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
						label="Omschrijving"
						value={finding?.description || ''}
						fullWidth
						variant="outlined"
						onChange={(event) => handleChangeTextField(event, FindingFieldName.description)}
						helperText="Korte omschrijving van de bevinding"
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
							label="Verwachte uitkomst"
							value={finding?.expectedResult || ''}
							fullWidth
							variant="outlined"
							multiline
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
					<Typography variant="body2"><i>Screenshots kunnen door middel van een word document via Teams worden gedeeld met de testcoördinator. Geef het word document daarbij de volgende naam (kopiëren): </i></Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					mb={2}
				>
					<Typography variant="body2"><b>"{finding?.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""} - {app.currentUser.profile?.email || 'onbekend'}"</b></Typography>
				</Box>
			</Paper>
			<Box
				display="flex"
				flexDirection="column"
				justifyContent="center"
				alignItems="flex-end"
				width="100%"
				my={2}
			>
				<FormGroup row>
					<FormControlLabel
						control={
							<Switch
								checked={anotherNewFinding}
								onChange={() => setAnotherNewFinding(!anotherNewFinding)}
								name="anotherNewFinding"
								color="primary"
							/>
						}
						label="Nog een bevinding toevoegen"
					/>
				</FormGroup>
			</Box>
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
					mb={1}
				>
					<Typography variant="h6">Terugkoppeling en status informatie</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					mb={1}
				>
					<Typography variant="caption">Status: {finding?.status || Status.Open}</Typography>
				</Box>
				{finding?.feedbackTeam && <Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					mb={1}
				>
					<Typography variant="caption">Terugkoppeling van het team: {finding?.feedbackTeam}</Typography>
				</Box>}
				{finding?.feedbackProductOwner && <Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					mb={1}
				>
					<Typography variant="caption">Terugkoppeling van de product owner: {finding?.feedbackProductOwner}</Typography>
				</Box>}
				{finding?.feedbackSupplier && <Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
					width="100%"
					mb={1}
				>
					<Typography variant="caption">Terugkoppeling vanuit de leverancier: {finding.feedbackSupplier}</Typography>
				</Box>}
			</Paper>
		</Box>
	)
}

export default FindingDetails
