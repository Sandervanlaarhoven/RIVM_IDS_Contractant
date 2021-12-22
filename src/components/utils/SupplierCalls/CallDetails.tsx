import React, { useState } from 'react'
import {
	Typography,
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Button,
	TextField,
} from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles'

import { CallFieldName, SupplierCall, SupplierCallType } from '../../../types'
import { SupplierCallStatus, SupplierPriority } from '../../../types/index';
import { grey } from '@material-ui/core/colors';
import { catitaliseFirstLetter } from '..';

const useStyles: any = makeStyles(() => ({
	greyedOutText: {
		color: grey[700]
	},
	formControl: {
		minWidth: 200
	},
}))

interface IProps {
	call?: SupplierCall,
	cancel: Function,
	save: Function,
}

const CallDetails: React.FC<IProps> = ({ call, cancel, save }) => {
	const classes = useStyles()
	
	const callData: SupplierCall = call || {
		callNumber: '',
		status: SupplierCallStatus.open,
		createdOn: new Date(),
		description: '',
		priority: SupplierPriority.p4,
		callType: SupplierCallType.bug,
		extraInfo: '',
	}

	const [updatedCall, setUpdatedCall] = useState<SupplierCall>(callData)

	type selectEventProps = {
		name?: string | undefined,
		value: unknown
	}

	const handleChangeSelect = (event: React.ChangeEvent<selectEventProps>, fieldName: CallFieldName) => {
		setUpdatedCall({
			...updatedCall,
			[fieldName]: event.target.value
		})
	}

	const handleChangeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: CallFieldName) => {
		setUpdatedCall({
			...updatedCall,
			[fieldName]: catitaliseFirstLetter(event.target.value)
		})
	}

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="center"
			border={"1px solid rgba(0, 0, 0, 0.23)"}
			borderRadius={11}
			width="100%"
			p={2}
		>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				justifyContent="space-between"
				width="100%"
				mb={2}
			>
				<Typography variant="h6">{call ? 'Call aanpassen' : 'Nieuwe call'}</Typography>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
				>
					<Button variant="text" color="default" onClick={() => cancel()}>Annuleren</Button>
					<Button variant="contained" color="primary" onClick={() => save(updatedCall)}>{call ? 'Bijwerken' : 'Toevoegen'}</Button>
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
				<FormControl className={classes.formControl}>
					<InputLabel id="supplier">Status</InputLabel>
					<Select
						labelId="supplier"
						id="supplier"
						value={updatedCall?.status}
						onChange={(event) => handleChangeSelect(event, CallFieldName.status)}
					>
						<MenuItem value={SupplierCallStatus.open}>{SupplierCallStatus.open}</MenuItem>
						<MenuItem value={SupplierCallStatus.verified}>{SupplierCallStatus.verified}</MenuItem>
						<MenuItem value={SupplierCallStatus.gepland}>{SupplierCallStatus.gepland}</MenuItem>
						<MenuItem value={SupplierCallStatus.test}>{SupplierCallStatus.test}</MenuItem>
						<MenuItem value={SupplierCallStatus.readyForRelease}>{SupplierCallStatus.readyForRelease}</MenuItem>
						<MenuItem value={SupplierCallStatus.denied}>{SupplierCallStatus.denied}</MenuItem>
						<MenuItem value={SupplierCallStatus.closed}>{SupplierCallStatus.closed}</MenuItem>
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
					<InputLabel id="supplier">Type</InputLabel>
					<Select
						labelId="supplier"
						id="supplier"
						value={updatedCall?.callType}
						onChange={(event) => handleChangeSelect(event, CallFieldName.callType)}
					>
						<MenuItem value={SupplierCallType.bug}>{SupplierCallType.bug}</MenuItem>
						<MenuItem value={SupplierCallType.change}>{SupplierCallType.change}</MenuItem>
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
					<InputLabel id="priority">Prioriteit</InputLabel>
					<Select
						labelId="priority"
						id="priority"
						value={updatedCall?.priority}
						onChange={(event) => handleChangeSelect(event, CallFieldName.priority)}
					>
						<MenuItem value={SupplierPriority.p1}>{SupplierPriority.p1}</MenuItem>
						<MenuItem value={SupplierPriority.p2}>{SupplierPriority.p2}</MenuItem>
						<MenuItem value={SupplierPriority.p3}>{SupplierPriority.p3}</MenuItem>
						<MenuItem value={SupplierPriority.p4}>{SupplierPriority.p4}</MenuItem>
					</Select>
				</FormControl>
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
					label="Callnummer"
					value={updatedCall.callNumber}
					fullWidth
					variant="outlined"
					onChange={(event) => handleChangeTextField(event, CallFieldName.callNumber)}
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
					label="Omschrijving"
					value={updatedCall.description}
					fullWidth
					variant="outlined"
					onChange={(event) => handleChangeTextField(event, CallFieldName.description)}
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
					value={updatedCall.extraInfo}
					fullWidth
					variant="outlined"
					onChange={(event) => handleChangeTextField(event, CallFieldName.extraInfo)}
					helperText="Eventuele extra informatie over het verloop van de call"
				/>
			</Box>
		</Box>
	)
}

export default CallDetails