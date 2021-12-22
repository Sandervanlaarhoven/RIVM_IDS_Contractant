import React, {  } from 'react'
import {
	Typography,
	Box,
	Button,
} from "@material-ui/core"

import { SupplierCall } from '../../../types'
import Call from './Call'

interface IProps {
	supplierCalls: SupplierCall[]
}

const SupplierCalls: React.FC<IProps> = ({ supplierCalls }) => {
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
				<Button variant="contained" color="default">Call toevoegen</Button>
			</Box>
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
