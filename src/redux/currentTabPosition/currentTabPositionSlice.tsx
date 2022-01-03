import { createSlice } from "@reduxjs/toolkit";

const currentTabPosition = createSlice({
	name: 'currentTabPosition',
	initialState: {
		myFindings: 0,
		changesOverview: 0,
		findingsOverview: 0,
		supplierOverview: 0,
	},
	reducers: {
		set: (state, action) => {
			state = action.payload
		},
		setMyFindings: (state, action) => {
			state.myFindings = action.payload
		},
		setChangesOverview: (state, action) => {
			state.changesOverview = action.payload
		},
		setFindingsOverview: (state, action) => {
			state.findingsOverview = action.payload
		},
		setSupplierOverview: (state, action) => {
			state.supplierOverview = action.payload
		},
	}
})

export const {
	set,
	setMyFindings,
	setChangesOverview,
	setFindingsOverview,
	setSupplierOverview,
} = currentTabPosition.actions

export default currentTabPosition.reducer
