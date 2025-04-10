import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import conversationsService from '~/services/conversationsServices';
import db from '~/services/databaseServices';
import { Job } from '~/models/schemas/JobSchema';
import { Field } from '~/models/schemas/FieldSchema';
import { Skill } from '~/models/schemas/SkillSchema';
import { provinces } from '~/constants/const';
import { ApplyStatus, JobStatus } from '~/constants/enum';

export const createJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const {
    name,
    description,
    level,
    education,
    type_work,
    year_experience,
    num_of_employees,
    gender,
    fields,
    skills,
    salary,
    city,
    deadline
  } = req.body;
  const fieldsFinds = await Promise.all(
    fields.map(async (field: string) => {
      const fieldFind = await db.fields.findOne({ name: field });
      if (!fieldFind) {
        const init = await db.fields.insertOne(new Field({ name: field }));
        return new ObjectId(init.insertedId);
      } else {
        return fieldFind._id;
      }
    })
  );
  const skillsFinds = await Promise.all(
    skills.map(async (skill: string) => {
      const techFind = await db.skills.findOne({ name: skill });
      if (!techFind) {
        fieldsFinds.map(async (fieldId: ObjectId) => {
          const init = await db.skills.insertOne(new Skill({ name: skill, field_id: fieldId }));
          return new ObjectId(init.insertedId);
        });
      } else {
        return new ObjectId(techFind._id);
      }
    })
  );
  await db.jobs.insertOne(
    new Job({
      employer_id: new ObjectId(req.body.decodeAuthorization.payload.userId),
      name,
      description,
      level,
      education,
      type_work,
      year_experience,
      num_of_employees,
      gender,
      fields: fieldsFinds,
      skills: skillsFinds,
      salary,
      city,
      deadline:new Date(deadline)
    })
  );
  res.status(200).json({
    message: 'Tạo công việc thành công'
  });
};

export const updateJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id: jobId } = req.params;
  const {
    name,
    description,
    level,
    education,
    type_work,
    year_experience,
    num_of_employees,
    gender,
    fields,
    skills,
    salary,
    deadline
  } = req.body;
  const fieldsFinds = await Promise.all(
    fields.map(async (field: string) => {
      const fieldFind = await db.fields.findOne({ name: field });
      if (!fieldFind) {
        const init = await db.fields.insertOne(new Field({ name: field }));
        return new ObjectId(init.insertedId);
      } else {
        return fieldFind._id;
      }
    })
  );
  const skillsFinds = await Promise.all(
    skills.map(async (skill: string) => {
      const techFind = await db.skills.findOne({ name: skill });
      if (!techFind) {
        fieldsFinds.map(async (fieldId: ObjectId) => {
          const init = await db.skills.insertOne(new Skill({ name: skill, field_id: fieldId }));
          return new ObjectId(init.insertedId);
        });
      } else {
        return new ObjectId(techFind._id);
      }
    })
  );
  await db.jobs.updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        name,
        description,
        level,
        education,
        type_work,
        year_experience,
        num_of_employees,
        gender,
        fields: fieldsFinds,
        skills: skillsFinds,
        salary,
        deadline
      }
    }
  );

  res.status(200).json({
    message: 'Cập nhật công việc thành công'
  });
};

export const getJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  const job = await db.jobs
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'Accounts',
          localField: 'employer_id',
          foreignField: '_id',
          as: 'employer_account'
        }
      },
      {
        $unwind: '$employer_account'
      },
      {
        $lookup: {
          from: 'Employers',
          localField: 'employer_account.user_id',
          foreignField: '_id',
          as: 'employer_info'
        }
      },
      {
        $unwind: '$employer_info'
      },
      {
        $lookup: {
          from: 'Skills',
          localField: 'skills',
          foreignField: '_id',
          as: 'skills_info'
        }
      },
      {
        $lookup: {
          from: 'Fields',
          localField: 'fields',
          foreignField: '_id',
          as: 'fields_info'
        }
      }
    ])
    .toArray();

  if (!job[0]) {
    return res.status(404).json({
      message: 'Công việc không tồn tại'
    });
  }
  const cityInfo = provinces.find((city: any) => city._id === job[0].city);
  res.status(200).json({
    result: { ...job[0], city_info: cityInfo },
    message: 'Lấy công việc thành công'
  });
};

export const deleteJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.jobs.deleteOne({ _id: new ObjectId(id) });
  res.status(200).json({
    message: 'Xóa công việc thành công'
  });
};

export const getListJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const {
    page,
    limit,
    key,
    level,
    education,
    type_work,
    year_experience,
    gender,
    fields,
    skills,
    salary_min,
    salary_max,
    status,
    deadline,
    createdAt,
    city
  } = req.query;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const filter: any = {
    employer_id: new ObjectId(req.body.decodeAuthorization.payload.userId)
  };

  if (key) {
    filter.name = { $regex: key as string, $options: 'i' };
  }
  if (Array.isArray(deadline) && deadline.length === 2) {
    const [from, to] = deadline as [string, string];
    const deadlineFilter: any = {};
  
    if (from) deadlineFilter.$gte = new Date(from);
    if (to) deadlineFilter.$lte = new Date(to);
  
    if (Object.keys(deadlineFilter).length > 0) {
      filter.deadline = deadlineFilter;
    }
  }
  
  if (Array.isArray(createdAt) && createdAt.length === 2) {
    const [from, to] = createdAt as [string, string];
    const createdAtFilter: any = {};
  
    if (from) createdAtFilter.$gte = new Date(from);
    if (to) createdAtFilter.$lte = new Date(to);
  
    if (Object.keys(createdAtFilter).length > 0) {
      filter.createdAt = createdAtFilter;
    }
  }
  if (level) {
    filter.level = { $in: JSON.parse(level as string).map(Number) };
  }

  if (education) {
    filter.education = Number(education);
  }

  if (type_work) {
    filter.type_work = { $in: JSON.parse(type_work as string).map(Number) };
  }

  if (year_experience) {
    filter.year_experience ={ $in: JSON.parse(year_experience as string).map(Number) } ;
  }

  if (gender) {
    filter.gender = Number(gender);
  }

  if (fields) {
    filter.fields = { $in: JSON.parse(fields as string).map((field: string) => new ObjectId(field)) };
  }

  if (skills) {
    filter.skills = { $in: JSON.parse(skills as string).map((skill: string) => new ObjectId(skill)) };
  }

  if (salary_min || salary_max) {
    const min = Number(salary_min);
    const max = Number(salary_max);
    if (!isNaN(min) && !isNaN(max)) {
      filter.$or = [
        { salary: { $gte: min, $lte: max } },
        { $and: [{ 'salary.0': { $lte: min } }, { 'salary.1': { $gte: max } }] }
      ];
    } else if (!isNaN(min)) {
      filter.$or = [{ salary: { $gte: min } }, { 'salary.0': { $lte: min } }];
    } else if (!isNaN(max)) {
      filter.$or = [{ salary: { $lte: max } }, { 'salary.1': { $gte: max } }];
    }
  }
  if (status) {
    filter.status = Number(status);
  }
  if (city) {
    filter.city ={ $in: JSON.parse(city as string).map(Number) } ;
  }
  console.log(filter);
  let [jobs, totalJobs] = await Promise.all([
    db.jobs
      .aggregate([
        {
          $match: filter
        },
        {
          $skip: skip
        },
        {
          $limit: limitNumber
        },
        {
          $lookup: {
            from: 'Accounts',
            localField: 'employer_id',
            foreignField: '_id',
            as: 'employer_account'
          }
        },
        {
          $unwind: '$employer_account'
        },
        {
          $lookup: {
            from: 'Employers',
            localField: 'employer_account.user_id',
            foreignField: '_id',
            as: 'employer_info'
          }
        },
        {
          $unwind: '$employer_info'
        },
        {
          $lookup: {
            from: 'Skills',
            localField: 'skills',
            foreignField: '_id',
            as: 'skills_info'
          }
        },
        {
          $lookup: {
            from: 'Fields',
            localField: 'fields',
            foreignField: '_id',
            as: 'fields_info'
          }
        }
      ])
      .toArray(),
    db.jobs.countDocuments(filter)
  ]);
  totalJobs = totalJobs + 0;
  jobs = jobs.map((job: any) => {
    job.city_info = provinces.find((city: any) => city._id === job.city);
    return job;
  });
  const totalPages = Math.ceil(totalJobs / limitNumber);

  const result = {
    jobs,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total_pages: totalPages,
      total_records: totalJobs
    }
  };
  res.status(200).json({
    result,
    message: 'Lấy danh sách công việc thành công'
  });
};

export const recruitmentJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.jobs.updateOne({ _id: new ObjectId(id) }, { $set: { status: JobStatus.Recuriting } });
  res.status(200).json({
    message: 'Đã đăng tin tuyển dụng công việc thành công'
  });
};

export const getListCandidateApplyJobController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const candidates = await db.apply
    .aggregate([
      {
        $match: {
          job_id: new ObjectId(id)
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'Accounts',
          localField: 'candidate_id',
          foreignField: '_id',
          as: 'candidate_account'
        }
      },
      {
        $unwind: '$candidate_account'
      },
      {
        $lookup: {
          from: 'Candidates',
          localField: 'candidate_account.user_id',
          foreignField: '_id',
          as: 'candidate_info'
        }
      },
      {
        $unwind: '$candidate_info'
      }
    ])
    .toArray();
  const totalCandidates = await db.apply.countDocuments({ job_id: new ObjectId(id) });
  const totalPages = Math.ceil(totalCandidates / limit);
  res.status(200).json({
    result: candidates,
    pagination: {
      page,
      limit,
      total_pages: totalPages,
      total_records: totalCandidates
    }
  });
};

export const approveCandidateController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.apply.updateOne({ _id: new ObjectId(id) }, { $set: { status: ApplyStatus.Approved } });
  res.status(200).json({
    message: 'Phê duyệt ứng viên thành công'
  });
};

export const rejectCandidateController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.apply.updateOne({ _id: new ObjectId(id) }, { $set: { status: ApplyStatus.Rejected } });
  res.status(200).json({
    message: 'Từ chối ứng viên thành công'
  });
};

export const makeInterviewController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.apply.updateOne({ _id: new ObjectId(id) }, { $set: { status: ApplyStatus.Interview } });
  res.status(200).json({
    message: 'Mời phỏng vấn thành công'
  });
};

export const makePassController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.apply.updateOne({ _id: new ObjectId(id) }, { $set: { status: ApplyStatus.Passed } });
  res.status(200).json({
    message: 'Phỏng vấn Passed ứng viên thành công'
  });
};

export const makeFailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { id } = req.params;
  await db.apply.updateOne({ _id: new ObjectId(id) }, { $set: { status: ApplyStatus.Failed } });
  res.status(200).json({
    message: 'Phỏng vấn Failed ứng viên thành công'
  });
};
