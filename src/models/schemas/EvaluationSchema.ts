import { ObjectId } from 'mongodb';
import { MediaType } from '~/constants/enum';

interface EvaluationType {
  _id?: ObjectId;
  employer_id: ObjectId;
  candidate_id: ObjectId;
  rate: number;
  content: string;
}

export class Evaluation {
  _id: ObjectId;
  employer_id: ObjectId;
  candidate_id: ObjectId;
  rate: number;
  content: string;

  constructor(evaluation: EvaluationType) {
    this._id = evaluation._id || new ObjectId();
    this.employer_id = evaluation.employer_id || new ObjectId();
    this.candidate_id = evaluation.candidate_id || new ObjectId();
    this.rate = evaluation.rate || 5;
    this.content = evaluation.content || '';
  }
}
