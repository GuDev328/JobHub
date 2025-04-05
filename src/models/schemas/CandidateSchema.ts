import { ObjectId } from 'mongodb';

interface CandidateType {
  _id?: ObjectId;
  name: string;
  description?: string;
  avatar?: string;
  cover_photo?: string;
  phone_number?: string;
  address?: string;
  pre_apply_info?: {
    email?: string;
    phone_number?: string;
    content?: string;
    cv?: string;
  };
  cv?: string[];
}

export class Candidate {
  _id: ObjectId;
  name: string;
  description: string;
  avatar: string;
  cover_photo: string;
  phone_number: string;
  address: string;
  pre_apply_info: {
    email?: string;
    phone_number?: string;
    content?: string;
    cv?: string;
  };
  cv: string[];

  constructor(candidate: CandidateType) {
    this._id = candidate._id || new ObjectId();
    this.name = candidate.name || '';
    this.description = candidate.description || '';
    this.avatar = candidate.avatar || '';
    this.cover_photo = candidate.cover_photo || '';
    this.phone_number = candidate.phone_number || '';
    this.address = candidate.address || '';
    this.pre_apply_info = candidate.pre_apply_info || {
      email: '',
      phone_number: '',
      content: '',
      cv: ''
    };
    this.cv = candidate.cv || [];
  }
}
