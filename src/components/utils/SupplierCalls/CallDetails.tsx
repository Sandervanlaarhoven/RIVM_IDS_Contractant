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
import format from 'date-fns/format';
import { nl } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { parse } from 'date-fns';

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
	const { enqueueSnackbar } = useSnackbar()
	
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
	const [enteredDate, setEnteredDate] = useState<string | ''>(format(callData.createdOn, 'dd-MM-yyyy', { locale: nl }))
	const [enteredDateValid, setEnteredDateValid] = useState<boolean>(true);

	type selectEventProps = {
		name?: string | undefined,
		value: unknown
	}

	const handleChangeSelect = (event: React.ChangeEvent<selectEventProps>, fieldName: CallFieldName) => {
		const newUpdatedCall = {
			...updatedCall,
			[fieldName]: event.target.value
		}
		if (fieldName === CallFieldName.callType) {
			if (event.target.value === SupplierCallType.bug) {
				newUpdatedCall.priority = SupplierPriority.p4
			} else {
				newUpdatedCall.priority = SupplierPriority.nvt
			}
		}
		setUpdatedCall(newUpdatedCall)
	}

	const handleChangeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: CallFieldName) => {
		setUpdatedCall({
			...updatedCall,
			[fieldName]: catitaliseFirstLetter(event.target.value)
		})
	}

	const handleChangeEnteredDate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		var pattern = new RegExp(/^([0-9]|[-/]){0,10}$/i)
		if (pattern.test(event.target.value)) {
			setEnteredDate(event.target.value.replace('/', '-'))
			setEnteredDateValid(true)
		}
	}

	const handleBlurEnteredDate = () => {
		var pattern = new RegExp(/^(?:(?:31(-)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(-)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/i)
		if (enteredDate && pattern.test(enteredDate)) {
			setUpdatedCall({
				...updatedCall,
				createdOn: parse(enteredDate, 'dd-MM-yyyy', new Date(), { locale: nl })
			})
		} else {
			enqueueSnackbar('De ingevoerde aanmaakdatum is niet correct.', {
				variant: 'error',
			})
			setEnteredDateValid(false)
		}
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
						<MenuItem value={SupplierCallStatus.new}>{SupplierCallStatus.new}</MenuItem>
						<MenuItem value={SupplierCallStatus.open}>{SupplierCallStatus.open}</MenuItem>
						<MenuItem value={SupplierCallStatus.gepland}>{SupplierCallStatus.gepland}</MenuItem>
						<MenuItem value={SupplierCallStatus.test}>{SupplierCallStatus.test}</MenuItem>
						<MenuItem value={SupplierCallStatus.verified}>{SupplierCallStatus.verified}</MenuItem>
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
				justifyContent="center"
				width="100%"
				pb={3}
			>
				<TextField
					label="Aanmaakdatum"
					value={enteredDate}
					fullWidth
					error={!enteredDateValid}
					variant="outlined"
					onChange={(event) => handleChangeEnteredDate(event)}
					onBlur={handleBlurEnteredDate}
					helperText={enteredDateValid ? '' : 'Voer een juiste datum in: "dag-maand-jaar"'}
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
						<MenuItem value={SupplierPriority.nvt}>{SupplierPriority.nvt}</MenuItem>
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
