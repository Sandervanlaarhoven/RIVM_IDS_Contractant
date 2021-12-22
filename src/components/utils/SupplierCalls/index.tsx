import React, { useState } from 'react'
import {
	Typography,
	Box,
	Button,
} from "@material-ui/core"

import { SupplierCall } from '../../../types'
import Call from './Call'
import CallDetails from './CallDetails'

interface IProps {
	supplierCalls: SupplierCall[],
	updateCalls: Function
}

const SupplierCalls: React.FC<IProps> = ({ supplierCalls, updateCalls }) => {
	interface CallDetails {
		call?: SupplierCall,
		show: boolean
	}

	const [callDetails, setCallDetails] = useState<CallDetails | null>(null)

	const showNewCall = () => {
		setCallDetails({
			show: true
		})
	}

	const saveCall = (call: SupplierCall) => {
		const found = supplierCalls.find((supplierCall) => supplierCall.callNumber === call.callNumber)
		let newSupplierCalls: SupplierCall[] = []
		if (found) {
			newSupplierCalls = supplierCalls.map((supplierCall) => supplierCall.callNumber === call.callNumber ? call : supplierCall)
		} else {
			newSupplierCalls = [
				...supplierCalls,
				call
			]
		}
		updateCalls(newSupplierCalls)
		setCallDetails(null)
	}

	const hideCallDetails = () => {
		setCallDetails(null)
	}

	// const showUpdateCall = (call: SupplierCall) => {
	// 	setCallDetails({
	// 		show: true,
	// 		call
	// 	})
	// }
	
	return (
		<Box
			display="flex"
			width="100%"
			flexDirection="column"
			alignItems="flex-start"
			justifyContent="center"
			pb={2}
		>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				justifyContent="space-between"
				width="100%"
				pb={3}
			>
				<Typography variant="h6">Calls bij de leverancier</Typography>
				{!callDetails?.show && <Button variant="contained" color="default" onClick={showNewCall}>Call toevoegen</Button>}
			</Box>
			{callDetails?.show && <Box
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="flex-start"
				width="100%"
				mt={2}
			>
				<CallDetails call={callDetails?.call} cancel={hideCallDetails} save={saveCall}/>
			</Box>}
			<Box
				display="flex"
				flexDirection="column"
				alignItems="flex-start"
				justifyContent="flex-start"
				width="100%"
				mt={2}
			>
				{supplierCalls.length === 0 && <Box
					display="flex"
					flexDirection="column"
					alignItems="flex-start"
					justifyContent="center"
				>
					<Typography variant="body2"><i>Er zijn (nog) geen calls gevonden.</i></Typography>
				</Box>}
				{supplierCalls && supplierCalls.map((supplierCall, index) => <Call key={index} item={supplierCall}/>)}
			</Box>
		</Box>
	)
}

export default SupplierCalls
