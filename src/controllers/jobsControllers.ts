import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import conversationsService from '~/services/conversationsServices';
import db from '~/services/databaseServices';
import { Job } from '~/models/schemas/JobSchema';
import { Field } from '~/models/schemas/FieldSchema';
import { Skill } from '~/models/schemas/SkillSchema';

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
    salary
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
      salary
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
    salary
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
        salary
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
  res.status(200).json({
    result: job[0],
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
    status
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

  if (level) {
    filter.level = Number(level);
  }

  if (education) {
    filter.education = Number(education);
  }

  if (type_work) {
    filter.type_work = Number(type_work);
  }

  if (year_experience) {
    filter.year_experience = Number(year_experience);
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
  console.log(filter);
  const [jobs, totalJobs] = await Promise.all([
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
