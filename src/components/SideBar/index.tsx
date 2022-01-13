import React, { useEffect } from 'react'
import { List, ListItem, ListItemText, Box, ListItemIcon } from "@material-ui/core"
import ListIcon from "@material-ui/icons/List"
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd"
import SettingsIcon from "@material-ui/icons/Settings"
import InfoIcon from "@material-ui/icons/InfoOutlined"
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer"
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import BugReportIcon from "@material-ui/icons/BugReport"
import ArchiveIcon from "@material-ui/icons/ArchiveOutlined"
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import logo from "../../images/logo.jpg"
import { toggle } from '../../redux/menu/menuSlice'
import { RootState } from '../../redux/store'
import { set } from '../../redux/user/userSlice'
import { useRealmApp } from '../App/RealmApp'
import { Role, UserGroup } from '../../types'
import { getUsergroupFromUserEmail } from '../utils'

interface IProps { }

const SideBar: React.FC<IProps> = () => {
	let history = useHistory()
	const app = useRealmApp()
	const user = app.currentUser
	const dispatch = useDispatch()
	const userDataState = useSelector((state: RootState) => state.userData)
	const { userData, loading } = userDataState
	const hasCallHandlerRole = !loading && userData && userData.roles?.find((el) => el === Role.call_handler)
	const userEmail = app.currentUser?.profile?.email || 'onbekend'
	const userGroup = getUsergroupFromUserEmail(userEmail)
	const isRIVM = userGroup === UserGroup.rivm
	const isSupplier = userGroup !== UserGroup.rivm && userGroup !== UserGroup.other

	const navigate = (target: string) => {
		history.push(target)
		dispatch(toggle())
	}

	const checkRoles = async () => {
		const customUserData = await user.refreshCustomData()
		if (customUserData?.roles) {
			await dispatch(set(customUserData))
		}
	}

	useEffect(() => {
		checkRoles()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="center"
		>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="flex-start"
				ml={2}
				mb={2}
			>
				<img width="200px" src={logo} alt="Logo" />
			</Box>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="flex-start"
				minWidth={350}
			>
				<List dense>
					{(isRIVM || hasCallHandlerRole) && <ListItem
						button
						onClick={() => navigate('/')}
					>
						<ListItemIcon><PlaylistAddIcon /></ListItemIcon>
						<ListItemText
							primary='Mijn tickets'
						/>
					</ListItem>}
					{hasCallHandlerRole && <ListItem
						button
						onClick={() => navigate('/findingsoverview')}
					>
						<ListItemIcon><BugReportIcon /></ListItemIcon>
						<ListItemText
							primary='Calls'
						/>
					</ListItem>}
					{hasCallHandlerRole && <ListItem
						button
						onClick={() => navigate('/changesoverview')}
					>
						<ListItemIcon><MailOutlineIcon /></ListItemIcon>
						<ListItemText
							primary='Change requests'
						/>
					</ListItem>}
					{hasCallHandlerRole && <ListItem
						button
						onClick={() => navigate('/informationrequestoverview')}
					>
						<ListItemIcon><QuestionAnswerIcon /></ListItemIcon>
						<ListItemText
							primary='Informatieaanvragen'
						/>
					</ListItem>}
					{isSupplier && <ListItem
						button
						onClick={() => navigate('/supplieroverview')}
					>
						<ListItemIcon><ListIcon /></ListItemIcon>
						<ListItemText
							primary='Leverancier overzicht'
						/>
					</ListItem>}
					{hasCallHandlerRole && <ListItem
						button
						onClick={() => navigate('/settings')}
					>
						<ListItemIcon><SettingsIcon /></ListItemIcon>
						<ListItemText
							primary='Instellingen en masterdata'
						/>
					</ListItem>}
					<ListItem
						button
						onClick={() => navigate('/information')}
					>
						<ListItemIcon><InfoIcon /></ListItemIcon>
						<ListItemText
							primary='Informatie'
						/>
					</ListItem>
					{hasCallHandlerRole && <ListItem
						button
						onClick={() => navigate('/archive')}
					>
						<ListItemIcon><ArchiveIcon /></ListItemIcon>
						<ListItemText
							primary='Archief'
						/>
					</ListItem>}
				</List>
			</Box>
		</Box>
	)
}

export default SideBar
