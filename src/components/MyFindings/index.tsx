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
	ButtonBase,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import BugReportIcon from '@material-ui/icons/BugReport'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import PriorityLowIcon from '@material-ui/icons/KeyboardArrowDown'
import PriorityMediumIcon from '@material-ui/icons/KeyboardArrowUp'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import PriorityBlockingIcon from '@material-ui/icons/Block'
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer"
import { useSnackbar } from 'notistack'
import { blue } from '@material-ui/core/colors'

import { Finding, FindingTheme, FindingFieldName, Status, Priority, FindingType } from '../../types'
import { useRealmApp } from '../App/RealmApp'
import { useHistory } from 'react-router-dom'
import { BSON } from 'realm-web'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { setMyFindings } from '../../redux/currentTabPosition/currentTabPositionSlice'
import { useAppDispatch } from '../../hooks'
import useGenericStyles from '../utils/GenericStyles'

const useStyles: any = makeStyles(() => ({
	button: {
		marginLeft: 10
	},
	formControl: {
		minWidth: 200
	},
	buttonBase: {
		flexGrow: 1,
		padding: 10
	},
}))

interface IProps {
}

type PropsFilter = {
	theme?: string,
}

const ManageFindings: React.FC<IProps> = () => {
	const classes = useStyles()
	const dispatch = useAppDispatch()
	const genericClasses = useGenericStyles()
	const [filteredFindings, setfilteredFindings] = useState<Finding[]>([])
	const [filterString, setFilterString] = useState<string>('')
	const [propsFilter, setPropsFilter] = useState<PropsFilter>({})
	const history = useHistory()
	const app = useRealmApp()
	const uid = app.currentUser.id
	const { enqueueSnackbar } = useSnackbar()
	const mongo = app.currentUser.mongoClient("mongodb-atlas")
	const mongoFindingsCollection = mongo.db("RIVM_IDS_CONTRACTANT").collection("findings")
	const mongoFindingThemesCollection = mongo.db("RIVM_IDS_CONTRACTANT").collection("finding_themes")
	const [findingThemes, setFindingThemes] = useState<FindingTheme[]>([])
	const [findings, setFindings] = useState<Finding[]>([])
	const currentTab = useSelector((state: RootState) => state.currentTabPosition.myFindings)

	const getData = async () => {
		try {
			const findingsData = mongoFindingsCollection.find({
				uid
			})
			let findingThemesData = mongoFindingThemesCollection.find()
			setFindings(await findingsData)
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
			setfilteredFindings(findings.filter((finding) => {
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
				if (propsFilter) {
					if (propsFilter.theme && finding.theme !== propsFilter.theme) {
						passedPropsFilter = false
					}
				}
				if (!isGesloten && currentTab === 1) passedPropsFilter = false
				if (isGesloten && currentTab === 0) passedPropsFilter = false
				return passedPropsFilter && (finding.description.toLowerCase().includes(filterString.toLowerCase()) || format(finding.testDate, 'Pp', { locale: nl }).includes(filterString.toLowerCase()))
			}))
		}, 500);
		return () => clearTimeout(filterTimeout)
	}, [filterString, propsFilter, findings, currentTab])

	const FindingComponent = (finding: Finding) => {
		return <Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			justifyContent="space-between"
			marginTop={1}
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

	const onCreateNewFindingClick = () => {
		history.push('/findings/new')
	}

	const onEditClick = (findingID: BSON.ObjectId | undefined) => {
		if (findingID) history.push(`/findings/${findingID}`)
	}

	const onDeleteClick = async (findingID: BSON.ObjectId | undefined) => {
		if (findingID) {
			try {
				await mongoFindingsCollection.deleteOne({
					_id: new BSON.ObjectId(findingID)
				})
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
		dispatch(setMyFindings(newValue))
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
					<Typography variant="h4">Mijn tickets</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Button variant="contained" className={classes.button} color="primary" onClick={onCreateNewFindingClick}>
						Nieuw ticket
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
				mt={2}
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
						flexDirection="row"
						alignItems="center"
						justifyContent="space-between"
						width="100%"
						border={finding.lastUpdatedBySupplier ? `1px solid ${blue[600]}` : '1px solid rgba(0, 0, 0, 0.23)'}
						borderRadius={11}
						bgcolor={finding.lastUpdatedBySupplier ? blue[50] : '#FFF'}
						mb={2}
					>
						<ButtonBase className={classes.buttonBase} onClick={() => onEditClick(finding._id)}>
							<Box
								display="flex"
								flexGrow={1}
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								width="100%"
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
										flexGrow={1}
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
											{finding?.priority === Priority.low && <PriorityLowIcon className={genericClasses.prioLow} />}
											{finding?.priority === Priority.medium && <PriorityMediumIcon className={genericClasses.prioMedium} />}
											{finding?.priority === Priority.high && <PriorityHighIcon className={genericClasses.prioHigh} />}
											{finding?.priority === Priority.blocking && <PriorityBlockingIcon className={genericClasses.prioBlocking} />}
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
									</Box>
								</Box>
								{FindingComponent(finding)}
							</Box>
						</ButtonBase>
						{finding._id && <Box
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-end"
						>
							{finding.lastUpdatedBySupplier && <Chip variant="outlined" color="primary" label={finding.supplier ? `update van ${finding.supplier}` : 'update'} size="small" />}
							{finding.status === Status.Open && <IconButton aria-label="delete" className={classes.margin} color="secondary" onClick={() => onDeleteClick(finding._id)}>
								<DeleteIcon />
							</IconButton>}
						</Box>}
					</Box> : null
				})}
			</Box>
		</Box>
	)
}

export default ManageFindings
