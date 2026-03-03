import { RowDataPacket } from "mysql2";

// Augment Express Request to include user from JWT middleware
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT
export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Auth
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Database record interfaces
interface BaseRecord extends RowDataPacket {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface User extends BaseRecord {
  name: string;
  email: string;
  password: string;
}

export interface Baptism extends BaseRecord {
  baptismNo: string;
  dateOfBaptism: string;
  dateOfBirth: string;
  age: string;
  fullName: string;
  surname: string;
  fatherName: string;
  motherName: string;
  fatherResidence: string;
  fatherProfession: string;
  nationality: string;
  placeofBirth: string;
  godfatherName: string;
  godfatherSurname: string;
  godfatherResidence: string;
  godmotherName: string;
  godmotherSurname: string;
  godmotherResidence: string;
  placeOfBaptism: string;
  priestName: string;
  remarks: string;
  confirmedOn: string;
  confirmedAt: string;
  dateOfMarriage: string;
  marriedTo: string;
  placeOfMarriage: string;
}

export interface Marriage extends BaseRecord {
  marriageNo: string;
  marriageDate: string;
  marriagePlace: string;
  groomName: string;
  groomSurname: string;
  groomFatherName: string;
  groomMotherName: string;
  groomDateOfBirth: string;
  groomAge: string;
  groomChurchOfBaptism: string;
  groomNationality: string;
  groomAddress: string;
  groomProfession: string;
  groomMaritalStatus: string;
  groomIfWidowerWhose: string;
  brideName: string;
  brideSurname: string;
  brideFatherName: string;
  brideMotherName: string;
  brideDateOfBirth: string;
  brideAge: string;
  brideChurchOfBaptism: string;
  brideNationality: string;
  brideAddress: string;
  brideProfession: string;
  brideMaritalStatus: string;
  brideIfWidowWhose: string;
  dateOfFirstBanns: string;
  dateOfSecondBanns: string;
  dispensation: string;
  firstWitnessName: string;
  firstWitnessSurname: string;
  firstWitnessAddress: string;
  secondWitnessName: string;
  secondWitnessSurname: string;
  secondWitnessAddress: string;
  minister: string;
  remarks: string;
}

export interface Confirmation extends BaseRecord {
  fullName: string;
  confirmationDate: string;
  officiatingMinister: string;
  sponsorName: string;
  churchName: string;
  churchAddress: string;
  churchContact: string;
}

export interface Burial extends BaseRecord {
  burialNo: string;
  dateOfBurial: string;
  fullName: string;
  surname: string;
  age: string;
  nationality: string;
  address: string;
  profession: string;
  relationship: string;
  causeOfDeath: string;
  lastSacraments: string;
  dateOfDeath: string;
  burialPlace: string;
  minister: string;
  remarks: string;
}

export interface Family extends BaseRecord {
  scc: string;
  familyId: string;
  registrationDate: string;
  salutation: string;
  firstName: string;
  middleName: string;
  surname: string;
  address1: string;
  address2: string;
  address3: string;
  pincode: string;
  res: string;
  office: string;
  mobile: string;
  fax: string;
  email: string;
  familyType: string;
  motherTongue: string;
  otherLanguages: string;
  stateOfOrigin: string;
  previousParish: string;
  sinceMonth: string;
  sinceYear: string;
  housingType: string;
  housingStatus: string;
  remarks: string;
}

export interface NoObjection extends BaseRecord {
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  reason: string;
  recipientDetails: string;
}

export interface Receipt extends BaseRecord {
  receiptNo: string;
  dateOfReceipt: string;
  receivedFrom: string;
  familyCardNo: string;
  amount: string;
  towards: string;
  details: string;
}

export interface Voucher extends BaseRecord {
  voucherNo: string;
  voucherDate: string;
  payTo: string;
  debitAccount: string;
  amount: string;
  tds: string;
  paymentMode: string;
  chequeNumber: string;
  details: string;
}

export interface ParishRequest extends BaseRecord {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pinCode: string;
  requestType: string;
  status: string;
  baptismFullName: string;
  baptismDateOfBirth: string;
  baptismDate: string;
  baptismParents: string;
  baptismGodparents: string;
  confirmationFullName: string;
  confirmationDate: string;
  marriageBrideName: string;
  marriageGroomName: string;
  marriageDate: string;
  marriageChurch: string;
  burialDeceasedName: string;
  burialDateOfDeath: string;
  burialDate: string;
  massType: string;
  massDateTimePreference: string;
  proposedWeddingDate: string;
  prepBrideName: string;
  prepGroomName: string;
  weddingLocation: string;
  coupleContact: string;
  noObjectionFullName: string;
  noObjectionDateOfBirth: string;
  noObjectionPlaceOfBirth: string;
  noObjectionReason: string;
  otherDetails: string;
  fee: string;
  paymentMode: string;
  paymentDetails: string;
  receivedBy: string;
  dateReceived: string;
  actionTaken: string;
  certificateIssuedDate: string;
  paymentReceived: string;
  amountReceived: string;
}

export interface MassIntention extends BaseRecord {
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  typeOfIntention: string;
  otherIntention: string;
  nameOfPersonForIntention: string;
  intentionDetails: string;
  slot1Date: string;
  slot1Status: string;
  slot2Date: string;
  slot2Status: string;
  slot3Date: string;
  slot3Status: string;
  slot4Date: string;
  slot4Status: string;
  preferredDateTime: string;
  offeringAmount: string;
  paymentStatus: string;
  paymentMode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  referenceNumber: string;
  specialNotes: string;
  status: string;
  receivedBy: string;
  receivedDate: string;
  confirmedDateTime: string;
  paymentReceived: string;
  receiptNo: string;
}

export interface Announcement extends BaseRecord {
  title: string;
  slug: string;
  description: string;
  category: string;
  liturgicalSeason: string;
  announcementDate: string;
  status: string;
  isRecurring: string;
}

// Search
export interface SearchResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface CountRow extends RowDataPacket {
  total: number;
}
