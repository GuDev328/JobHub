import { ObjectId } from 'mongodb';
import { AddressInfo, PhoneInfo } from '~/constants/enum';

interface EmployerType {
  _id?: ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  cover_photo?: string;
  employer_size?: number;
  phone_number?: PhoneInfo[];
  address?: AddressInfo[];
  fields?: ObjectId[];
  status?: number;
}

export class Employer {
  _id: ObjectId;
  name: string;
  description: string;
  avatar: string;
  cover_photo: string;
  employer_size: number;
  phone_number: PhoneInfo[];
  address: AddressInfo[];
  fields: ObjectId[];
  status: number;

  constructor(employer: EmployerType) {
    this._id = employer._id || new ObjectId();
    this.name = employer.name || '';
    this.description = employer.description || '';
    this.avatar = employer.avatar || '';
    this.cover_photo = employer.cover_photo || '';
    this.employer_size = employer.employer_size || 0;
    this.phone_number = employer.phone_number || [];
    this.address = employer.address || [];
    this.fields = employer.fields || [];
    this.status = employer.status || 0;
  }
}
