import React, { useEffect, useState } from 'react'
import {
	Typography,
	Box,
	FormControl,
	TextField,
	InputLabel,
	MenuItem,
	Select,
	Chip,
	ButtonBase,
	Tab,
	Tabs,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import BugReportIcon from '@material-ui/icons/BugReport'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import PriorityLowIcon from '@material-ui/icons/KeyboardArrowDown'
import PriorityMediumIcon from '@material-ui/icons/KeyboardArrowUp'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import PriorityBlockingIcon from '@material-ui/icons/Block'
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer"
import { useSnackbar } from 'notistack'
import { blue, green, orange, red } from '@material-ui/core/colors'

import { Finding, FindingTheme, FindingFieldName, Priority, Status, UserGroup, FindingType } from '../../types'
import { useRealmApp } from '../App/RealmApp'
import { useHistory } from 'react-router-dom'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { set } from '../../redux/findings/findingsSlice'
import { useAppSelector, useAppDispatch } from '../../hooks'
import { BSON } from 'realm-web'
import { getUsergroupFromUserEmail } from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { setSupplierOverview } from '../../redux/currentTabPosition/currentTabPositionSlice'

const useStyles: any = makeStyles(() => ({
	button: {
		marginLeft: 10
	},
	formControl: {
		minWidth: 200
	},
	buttonBase: {
		width: "100%",
		marginBottom: 10
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

interface IProps {
}

type PropsFilter = {
	theme?: string,
	userEmail?: string,
}

const SupplierOverview: React.FC<IProps> = () => {
	const classes = useStyles()
	const dispatch = useAppDispatch()
	const [filteredFindings, setfilteredFindings] = useState<Finding[]>([])
	const [filterString, setFilterString] = useState<string>('')
	const [propsFilter, setPropsFilter] = useState<PropsFilter>({})
	const history = useHistory()
	const app = useRealmApp()
	const { enqueueSnackbar } = useSnackbar()
	const mongo = app.currentUser.mongoClient("mongodb-atlas")
	const mongoFindingsCollection = mongo.db("RIVM_IDS_CONTRACTANT").collection("findings")
	const mongoFindingThemesCollection = mongo.db("RIVM_IDS_CONTRACTANT").collection("finding_themes")
	const [findingThemes, setFindingThemes] = useState<FindingTheme[]>([])
	const findingsDataState = useAppSelector(state => state.findingsData)
	const { findings } = findingsDataState
	const [userEmails, setUserEmails] = useState<string[]>([])
	const currentTab = useSelector((state: RootState) => state.currentTabPosition.supplierOverview)
	const userEmail = app.currentUser?.profile?.email || 'onbekend'
	const userGroup = getUsergroupFromUserEmail(userEmail)

	const getData = async () => {
		try {
			let findingsData
			if (userGroup !== UserGroup.other && userGroup !== UserGroup.rivm) {
				findingsData = mongoFindingsCollection.find({
					supplier: userGroup
				}, {
					sort: { testDate: -1 }
				})
			} else {
				enqueueSnackbar('Je bent niet ingelogd als leverancier, daarom kun je geen gebruik maken van deze functionaliteit.', {
					variant: 'error',
				})
				return
			}
			let findingThemesData = mongoFindingThemesCollection.find()
			dispatch(set(await findingsData))
			setFindingThemes(await findingThemesData)
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

	useEffect(() => {
		const filterTimeout = setTimeout(() => {
			const newFilteredFindings = findings.filter((finding) => {
				let isGesloten: boolean = false
				switch (finding.status) {
					case Status.Closed:
					case Status.Denied:
						isGesloten = true
						break;

					default:
						break;
				}
				let passedPropsFilter = true
				if (!isGesloten && currentTab === 1) passedPropsFilter = false
				if (isGesloten && currentTab === 0) passedPropsFilter = false
				if (propsFilter) {
					if (propsFilter.theme && finding.theme !== propsFilter.theme) passedPropsFilter = false
				}
				if (propsFilter.userEmail && finding.userEmail !== propsFilter.userEmail) passedPropsFilter = false
				return passedPropsFilter && (finding.description.toLowerCase().includes(filterString.toLowerCase()) || format(finding.testDate, 'Pp', { locale: nl }).includes(filterString.toLowerCase()))
			})
			setUserEmailDropdownValues(newFilteredFindings)
			setfilteredFindings(newFilteredFindings)
		}, 500);
		return () => clearTimeout(filterTimeout)
	}, [filterString, propsFilter, findings, currentTab])

	const setUserEmailDropdownValues = (findings: Finding[]) => {
		const emailList = findings.map((finding) => finding.userEmail || 'onbekend')
		const uniqueEmailList = Array.from(new Set(emailList))
		setUserEmails(uniqueEmailList)
	}

	const FindingComponent = (finding: Finding) => {
		return <Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			justifyContent="space-between"
			width="100%"
		>
			<Box>
				<Typography align="left" variant="body2">{finding.description}</Typography>
			</Box>
			{finding.theme && <Box ml={2}>
				<Chip label={finding.theme} size="small" />
			</Box>}
		</Box>
	}

	const showDetails = (findingID: BSON.ObjectId | undefined) => {
		if (findingID) history.push(`/supplieroverview/${findingID}`)
	}

	const onChangeFilterString = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterString(event.target.value)
	}

	type selectEventProps = {
		name?: string | undefined,
		value: unknown
	}

	const handleChangeSelect = (event: React.ChangeEvent<selectEventProps>, fieldName: FindingFieldName) => {
		setPropsFilter({
			...propsFilter,
			[fieldName]: event.target.value
		})
	}

	const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
		dispatch(setSupplierOverview(newValue))
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
				pb={3}
			>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
				>
					<Typography variant="h4">Leverancier overzicht</Typography>
				</Box>
			</Box>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				justifyContent="space-between"
				width="100%"
				pb={3}
			>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
					flexGrow={1}
					mr={3}
				>
					<TextField
						label="Zoeken op omschrijving of datum (dd-mm-jjjj)"
						onChange={onChangeFilterString}
						InputLabelProps={{
							shrink: true,
						}}
						fullWidth
						value={filterString || ''}
						variant="outlined"
					/>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="center"
					>
						<FormControl className={classes.formControl}>
							<InputLabel id="type">Aanmelder</InputLabel>
							<Select
								labelId="type"
								id="type"
								value={propsFilter.userEmail || ''}
								onChange={(event) => handleChangeSelect(event, FindingFieldName.userEmail)}
							>
								<MenuItem key="" value={''}>Alle gebruikers</MenuItem>
								{userEmails.map((userEmail) => <MenuItem key={userEmail} value={userEmail}>{userEmail}</MenuItem>)}
							</Select>
						</FormControl>
					</Box>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
					ml={2}
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
								value={propsFilter.theme || ''}
								onChange={(event) => handleChangeSelect(event, FindingFieldName.findingTheme)}
							>
								<MenuItem key="" value={''}>Geen specifiek thema</MenuItem>
								{findingThemes.map((findingTheme) => <MenuItem key={findingTheme.name} value={findingTheme.name}>{findingTheme.name}</MenuItem>)}
							</Select>
						</FormControl>
					</Box>
				</Box>
			</Box>
			<Tabs value={currentTab} onChange={handleChangeTab} indicatorColor="primary" variant="scrollable" >
				<Tab label={Status.Open} />
				<Tab label={Status.Closed} />
			</Tabs>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="flex-start"
				width="100%"
				my={1}
				mt={4}
			>
				{filteredFindings.length === 0 && <Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
				>
					<Typography variant="body2"><i>Er zijn geen bevindingen gevonden.</i></Typography>
				</Box>}
				{filteredFindings && filteredFindings.map((finding, index) => {
					return finding ? <ButtonBase key={index} className={classes.buttonBase} onClick={() => showDetails(finding._id)}><Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						border={finding.lastUpdatedBySupplier ? `1px solid ${blue[600]}` : '1px solid rgba(0, 0, 0, 0.23)'}
						borderRadius={11}
						bgcolor={finding.lastUpdatedBySupplier ? blue[50] : '#FFF'}
						p={1}
					>
							<Box
								display="flex"
								flexDirection="column"
								alignItems="flex-start"
								justifyContent="center"
								width="100%"
							>
								<Box
									display="flex"
									flexDirection="row"
									alignItems="center"
									justifyContent="space-between"
									width="100%"
									pb={1}
								>
									<Box
										display="flex"
										flexDirection="row"
										alignItems="center"
										justifyContent="flex-start"
									>
										{finding.type === FindingType.bug && <Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
										>
											<BugReportIcon />
										</Box>}
										{finding.type === FindingType.verbetering && <Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
										>
											<MailOutlineIcon />
										</Box>}
										{finding.type === FindingType.infoRequest && <Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
										>
											<QuestionAnswerIcon />
										</Box>}
										{finding?.priority && <Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
										>
											{finding?.priority === Priority.low && <PriorityLowIcon className={classes.prioLow} />}
											{finding?.priority === Priority.medium && <PriorityMediumIcon className={classes.prioMedium} />}
											{finding?.priority === Priority.high && <PriorityHighIcon className={classes.prioHigh} />}
											{finding?.priority === Priority.blocking && <PriorityBlockingIcon className={classes.prioBlocking} />}
										</Box>}
										<Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
											ml={1}
										>
											<Chip variant="outlined" color="primary" label={finding.status} size="small" />
										</Box>
										<Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
											ml={1}
										>
											<Typography variant="caption">{finding.supplier} - </Typography>
										</Box>
										<Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
											ml={1}
										>
											<Typography variant="caption">{finding.testDate ? format(finding.testDate, 'Pp', { locale: nl }) : ""}</Typography>
										</Box>
										{finding.userEmail && <Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
											ml={1}
										>
											<Typography variant="caption"> - {finding.userEmail}</Typography>
										</Box>}
									</Box>
									{finding._id && <Box
										display="flex"
										flexDirection="row"
										alignItems="center"
										justifyContent="flex-end"
									>
										{finding.lastUpdatedBySupplier && <Chip variant="outlined" color="primary" label="behandeld" size="small" />}
									</Box>}
								</Box>
								{FindingComponent(finding)}
							</Box>
					</Box></ButtonBase> : null
				})}
			</Box>
		</Box>
	)
}

export default SupplierOverview
