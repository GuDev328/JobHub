import { ObjectId } from 'mongodb';
import { ApplyStatus } from '~/constants/enum';

interface ApplyType {
  _id?: ObjectId;
  job_id: ObjectId;
  candidate_id: ObjectId;
  email: string;
  phone_number: string;
  content: string;
  cv: string;
  status: ApplyStatus;
}

export class Apply {
  _id: ObjectId;
  job_id: ObjectId;
  candidate_id: ObjectId;
  email: string;
  phone_number: string;
  content: string;
  cv: string;
  status: ApplyStatus;

  constructor(apply: ApplyType) {
    this._id = apply._id || new ObjectId();
    this.job_id = apply.job_id || new ObjectId();
    this.candidate_id = apply.candidate_id || new ObjectId();
    this.email = apply.email || '';
    this.phone_number = apply.phone_number || '';
    this.content = apply.content || '';
    this.cv = apply.cv || '';
    this.status = apply.status || ApplyStatus.Pending;
  }
}
