import { BSON } from "realm-web";

export enum Role {
	call_handler = "call_handler",
}

export type UserData = {
	_id?: BSON.ObjectId,
	name?: string,
	roles: Array<Role>
}

export type User = {
	_id: BSON.ObjectId,
	email: string
}

export enum UserGroup {
	rivm = 'RIVM',
	ivention = 'iVention',
	other = 'other'
}

export type FindingTheme = {
	_id?: BSON.ObjectId;
	name: string;
}

export enum FindingType {
	Bug = 'bug',
	Verbetering = 'verbetering',
}

export enum Status {
	Open = 'open',
	Submitted = 'ingediend',
	Verified = 'geverifieerd',
	Gepland = 'ingepland',
	ReadyForRelease = 'klaar voor release',
	Hertest = 'hertest',
	TestFailed = 'hertest niet ok',
	Denied = 'afgewezen',
	Closed = 'gesloten',
	AllStatussus = 'alle statussen',
	Archived = 'gearchiveerd',
}

export enum Browser {
	Chrome = 'Chrome',
	Edge = 'Edge',
	Firefox = 'Firefox',
	InternetExplorer = 'Internet Explorer',
}

export enum Supplier {
	ivention = 'iVention',
}

export type FindingData = {
	_id?: BSON.ObjectId;
	uid?: BSON.ObjectId;
	userEmail?: string;
	type: FindingType;
	priority?: Priority;
	description: string;
	featureRequestDescription?: string;
	featureRequestProposal?: string;
	expectedResult?: string;
	actualResult?: string;
	additionalInfo?: string;
	browser?: Browser[];
	theme?: string;
	status?: Status;
	feedbackTeam?: string;
	feedbackSupplier?: string;
	feedbackProductOwner?: string;
	feedbackContractManagement?: string;
	testDate: Date;
	history?: HistoryElement[];
	supplierCalls: SupplierCall[];
	supplier: Supplier;
}

export type HistoryElement = {
	createdBy: User;
	createdOn: Date;
	finding: FindingData;
}

export type Finding = {
	_id?: BSON.ObjectId;
	uid?: BSON.ObjectId;
	userEmail?: string;
	type: FindingType;
	priority: Priority;
	description: string;
	featureRequestDescription?: string;
	featureRequestProposal?: string;
	expectedResult?: string;
	actualResult?: string;
	additionalInfo?: string;
	browser?: Browser[];
	theme?: string;
	status?: Status;
	feedbackTeam?: string;
	feedbackSupplier?: string;
	feedbackProductOwner?: string;
	feedbackContractManagement?: string;
	testDate: Date;
	history: HistoryElement[];
	supplierCalls: SupplierCall[];
	supplier: Supplier;
}

export enum FindingFieldName {
	userEmail = 'userEmail',
	description = 'description',
	expectedResult = 'expectedResult',
	actualResult = 'actualResult',
	additionalInfo = 'additionalInfo',
	type = 'type',
	priority = 'priority',
	findingTheme = 'theme',
	browser = 'browser',
	status = 'status',
	feedbackTeam = 'feedbackTeam',
	feedbackProductOwner = 'feedbackProductOwner',
	featureRequestDescription = 'featureRequestDescription',
	featureRequestProposal = 'featureRequestProposal',
	supplier = 'supplier',
	feedbackContractManagement = 'feedbackContractManagement',
	feedbackSupplier = 'feedbackSupplier',
}

export type LinkType = {
	name: string;
	url: string;
}

export type Contact = {
	email: string;
	name: string;
	role: string;
	telephone_number: string;
}

export type Information = {
	_id?: BSON.ObjectId;
	text: string;
	links: LinkType[];
	contacts: Contact[]
}


export enum Priority {
	low = 'Laag',
	medium = 'Normaal',
	high = 'Hoog',
	blocking = 'Blokkerend',
}

export enum SupplierPriority {
	p1 = 'p1',
	p2 = 'p2',
	p3 = 'p3',
	p4 = 'p4',
	nvt = 'nvt'
}

export enum SupplierCallType {
	bug = 'Bug',
	change = 'Change',
}

export enum SupplierCallStatus {
	open = 'Open',
	verified = 'Geverifieerd',
	gepland = 'Ingepland',
	test = 'Test',
	readyForRelease = 'Klaar voor release',
	denied = 'Afgewezen',
	closed = 'Gesloten',
}

export type SupplierCall = {
	callNumber: string;
	status: SupplierCallStatus;
	createdOn: Date;
	description: string;
	priority: SupplierPriority;
	callType: SupplierCallType;
	extraInfo: string;
}

export enum CallFieldName {
	callNumber = 'callNumber',
	status = 'status',
	createdOn = 'createdOn',
	description = 'description',
	priority = 'priority',
	callType = 'callType',
	extraInfo = 'extraInfo',
}
