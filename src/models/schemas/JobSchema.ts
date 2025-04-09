import { ObjectId } from 'mongodb';
import { GenderType, JobStatus, LevelType, EducationType, TypeWorkType, YearExperienceType } from '~/constants/enum';

interface JobType {
  _id?: ObjectId;
  employer_id: ObjectId;
  name: string;
  description: string;
  level: LevelType;
  education: EducationType;
  type_work: TypeWorkType | TypeWorkType[];
  year_experience: YearExperienceType;
  num_of_employees: number | number[];
  gender: GenderType;
  fields: ObjectId[];
  skills: ObjectId[];
  salary: number | number[];
  status?: JobStatus;
  city: number;
  deadline:Date | null

}

export class Job {
  _id: ObjectId;
  employer_id: ObjectId;
  name: string;
  description: string;
  level: LevelType;
  education: EducationType;
  type_work: TypeWorkType | TypeWorkType[];
  year_experience: YearExperienceType;
  num_of_employees: number | number[];
  gender: GenderType;
  fields: ObjectId[];
  skills: ObjectId[];
  salary: number | number[];
  status: JobStatus;
  city: number;
  deadline: Date | null;
  createdAt: Date;

  constructor(job: JobType) {
    this._id = job._id || new ObjectId();
    this.employer_id = job.employer_id || new ObjectId();
    this.name = job.name || '';
    this.description = job.description || '';
    this.level = job.level || LevelType.Intern;
    this.education = job.education || EducationType.HighSchool;
    this.type_work = job.type_work || TypeWorkType.FullTime;
    this.year_experience = job.year_experience || YearExperienceType.LessThan1Year;
    this.num_of_employees = job.num_of_employees || 0;
    this.gender = job.gender || GenderType.Other;
    this.fields = job.fields || [];
    this.skills = job.skills || [];
    this.salary = job.salary || 0;
    this.status = JobStatus.Created;
    this.city = job.city;
    this.deadline = job.deadline;
    this.createdAt = new Date();
  }
}
