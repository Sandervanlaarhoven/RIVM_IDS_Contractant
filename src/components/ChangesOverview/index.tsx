import React, { useEffect, useState } from 'react'
import {
	Typography,
	Box,
	FormControl,
	TextField,
	Button,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Chip,
	Tab,
	Tabs,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import ArchiveIcon from '@material-ui/icons/Archive'
import EditIcon from '@material-ui/icons/Edit'
import BugReportIcon from '@material-ui/icons/BugReport'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import PriorityLowIcon from '@material-ui/icons/KeyboardArrowDown'
import PriorityMediumIcon from '@material-ui/icons/KeyboardArrowUp'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import PriorityBlockingIcon from '@material-ui/icons/Block'
import { useSnackbar } from 'notistack'
import { blue, green, orange, red } from '@material-ui/core/colors'

import { Finding, FindingTheme, FindingType, FindingFieldName, Status, FindingData, Priority } from '../../types'
import { useRealmApp } from '../App/RealmApp'
import { useHistory } from 'react-router-dom'
import { BSON } from 'realm-web'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { set } from '../../redux/findings/findingsSlice'
import { useAppSelector, useAppDispatch } from '../../hooks'

const useStyles: any = makeStyles(() => ({
	button: {
		marginLeft: 10
	},
	formControl: {
		minWidth: 200
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
	}
}))

interface IProps {
}

type PropsFilter = {
	theme?: string,
	userEmail?: string,
}

const ChangesOverview: React.FC<IProps> = () => {
	const classes = useStyles()
	const dispatch = useAppDispatch()
	const [filteredFindings, setfilteredFindings] = useState<Finding[]>([])
	const [filterString, setFilterString] = useState<string>('')
	const [propsFilter, setPropsFilter] = useState<PropsFilter>({})
	const history = useHistory()
	const app = useRealmApp()
	const { enqueueSnackbar } = useSnackbar()
	const mongo = app.currentUser.mongoClient("mongodb-atlas")
	const mongoFindingsCollection = mongo.db("RIVM_CONTRACTANT").collection("findings")
	const mongoArchivedFindingsCollection = mongo.db("RIVM_CONTRACTANT").collection("archived_findings")
	const mongoFindingThemesCollection = mongo.db("RIVM_CONTRACTANT").collection("finding_themes")
	const [findingThemes, setFindingThemes] = useState<FindingTheme[]>([])
	const findingsDataState = useAppSelector(state => state.findingsData)
	const { findings } = findingsDataState
	const [currentTab, setCurrentTab] = React.useState(0);
	const [userEmails, setUserEmails] = useState<string[]>([])

	const getData = async () => {
		try {
			const findingsData = mongoFindingsCollection.find({
				type: "verbetering"
			}, {
				sort: { testDate: -1 },
			})
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
				let passedPropsFilter = true
				if (propsFilter) {
					if (propsFilter.theme && finding.theme !== propsFilter.theme) passedPropsFilter = false
				}
				switch (currentTab) {
					case 0: {
						passedPropsFilter = finding.status === Status.Open
						break
					}
					case 1: {
						passedPropsFilter = finding.status === Status.Submitted
						break
					}
					case 2: {
						passedPropsFilter = finding.status === Status.Verified
						break
					}
					case 3: {
						passedPropsFilter = finding.status === Status.Gepland
						break
					}
					case 4: {
						passedPropsFilter = finding.status === Status.ReadyForRelease
						break
					}
					case 5: {
						passedPropsFilter = finding.status === Status.Hertest
						break
					}
					case 6: {
						passedPropsFilter = finding.status === Status.TestFailed
						break
					}
					case 7: {
						passedPropsFilter = finding.status === Status.Denied
						break
					}
					case 8: {
						passedPropsFilter = finding.status === Status.Closed
						break
					}
					case 9: {
						passedPropsFilter = true
						break
					}

					default:
						passedPropsFilter = false
						break
				}
				if (propsFilter.userEmail && finding.userEmail !== propsFilter.userEmail) passedPropsFilter = false
				return passedPropsFilter && (finding.description.toLowerCase().includes(filterString.toLowerCase()) || format(finding.testDate, 'Pp', { locale: nl }).includes(filterString.toLowerCase()))
			}).sort((a, b) => b.testDate.valueOf() - a.testDate.valueOf())
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

	const VerbeteringFinding = (finding: Finding) => {
		return <Box
			display="flex"
			flexDirection="row"
			alignItems="top"
			justifyContent="space-between"
			width="100%"
		>
			<Box>
				<Typography>{finding.description}</Typography>
			</Box>
			{finding.theme && <Box ml={2}>
				<Chip label={finding.theme} size="small" />
			</Box>}
		</Box>
	}

	const OpenFinding = (finding: Finding) => {
		return <Box
			display="flex"
			flexDirection="row"
			alignItems="top"
			justifyContent="space-between"
			width="100%"
		>
			<Box>
				<Typography>{finding.description}</Typography>
			</Box>
			{finding.theme && <Box ml={2}>
				<Chip label={finding.theme} size="small" />
			</Box>}
		</Box>
	}

	const FindingComponent = (finding: Finding) => {
		switch (finding.type) {

			case FindingType.Bug: {
				return OpenFinding(finding)
			}

			case FindingType.Verbetering: {
				return VerbeteringFinding(finding)
			}

			default:
				break
		}
	}

	const onCreateNewFindingClick = () => {
		history.push('/findings/new')
	}

	const onEditClick = (findingID: BSON.ObjectId | undefined) => {
		if (findingID) history.push(`/productowneroverview/${findingID}`)
	}

	const onArchiveClick = async (finding: Finding) => {
		if (finding?._id) {
			try {
				const updatedFinding = {
					...finding,
					status: Status.Archived,
					history: [...finding.history],
				}
				const findingData: FindingData = {
					...updatedFinding,
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


				await mongoFindingsCollection.deleteOne({
					_id: new BSON.ObjectId(finding._id)
				})
				await mongoArchivedFindingsCollection.insertOne(updatedFinding)
				getData()
			} catch (error) {
				enqueueSnackbar('Er is helaas iets mis gegaan bij het verwijderen.', {
					variant: 'error',
				})
			}
		}
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
		setCurrentTab(newValue)
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
					<Typography variant="h4">Change requests</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Button variant="contained" className={classes.button} color="primary" onClick={onCreateNewFindingClick}>
						Nieuwe bevinding
					</Button>
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
			<Tabs value={currentTab} onChange={handleChangeTab} indicatorColor="primary" variant="scrollable">
				<Tab label={Status.Open} />
				<Tab label={Status.Submitted} />
				<Tab label={Status.Verified} />
				<Tab label={Status.Gepland} />
				<Tab label={Status.ReadyForRelease} />
				<Tab label={Status.Hertest} />
				<Tab label={Status.TestFailed} />
				<Tab label={Status.Denied} />
				<Tab label={Status.Closed} />
				<Tab label={Status.AllStatussus} />
			</Tabs>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="flex-start"
				width="100%"
				my={5}
			>
				{filteredFindings.length === 0 && <Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
				>
					<Typography variant="body2"><i>Er zijn geen bevindingen met deze status.</i></Typography>
				</Box>}
				{filteredFindings && filteredFindings.map((finding, index) => {
					return finding ? <Box
						display="flex"
						key={index}
						flexDirection="column"
						alignItems="flex-start"
						justifyContent="center"
						width="100%"
						border={"1px solid rgba(0, 0, 0, 0.23)"}
						borderRadius={11}
						bgcolor="#FFF"
						p={1}
						pb={2}
						mb={2}
					>
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
							>
								{finding.type === 'bug' && <Box
									display="flex"
									flexDirection="row"
									alignItems="center"
									justifyContent="flex-start"
								>
									<BugReportIcon />
								</Box>}
								{finding.type === 'verbetering' && <Box
									display="flex"
									flexDirection="row"
									alignItems="center"
									justifyContent="flex-start"
								>
									<MailOutlineIcon />
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
								<IconButton aria-label="delete" className={classes.margin} color="primary" onClick={() => onEditClick(finding._id)}>
									<EditIcon />
								</IconButton>
								<IconButton aria-label="archive" className={classes.margin} color="secondary" onClick={() => onArchiveClick(finding)}>
									<ArchiveIcon />
								</IconButton>
							</Box>}
						</Box>
						{FindingComponent(finding)}
					</Box> : null
				})}
			</Box>
		</Box>
	)
}

export default ChangesOverview