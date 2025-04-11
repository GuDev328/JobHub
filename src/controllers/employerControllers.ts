import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { VerifyEmployer } from '~/models/schemas/VerifySchema';
import db from '~/services/databaseServices';

export const verifyEmployerController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { business_document } = req.body;
  const employerId = new ObjectId(req.body.decodeAuthorization.payload.userId);

  const existingVerification = await db.verifyEmployers.findOne({ employer_id: employerId });

  if (!existingVerification) {
    await db.verifyEmployers.insertOne(
      new VerifyEmployer({
        employer_id: employerId,
        business_document,
        status: 'PENDING'
      })
    );
    return res.status(200).json({
      message: 'Gửi đơn xác thực thành công'
    });
  } else {
    if (existingVerification.status === 'REJECT' || existingVerification.status === 'PENDING') {
      await db.verifyEmployers.updateOne(
        { employer_id: employerId },
        { $set: { business_document, status: 'PENDING' } }
      );
      return res.status(200).json({
        message: 'Cập nhật đơn xác thực thành công'
      });
    } else if (existingVerification.status === 'APPROVE') {
      return res.status(400).json({
        message: 'Lỗi: Tài khoản này đã được xác thực'
      });
    }
  }

  return res.status(200).json({
    message: 'Đơn xác thực đang được xử lý'
  });
};


export const getListCandicateController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { page, limit, email, name, phone_number, status, role } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const matchConditions: any = {};

  if (email) {
    matchConditions.email = { $regex: email, $options: 'i' };
  }
    matchConditions.role = 1;
  if (status) {
    matchConditions.status = parseInt(status as string);
  }

  const totalRecords = await db.accounts
    .aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'Employers',
          localField: 'user_id',
          foreignField: '_id',
          as: 'employer_info'
        }
      },
      {
        $lookup: {
          from: 'Candidates',
          localField: 'user_id',
          foreignField: '_id',
          as: 'candidate_info'
        }
      },
      {
        $unwind: {
          path: '$employer_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$candidate_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $and: [
            name
              ? {
                  $or: [
                    { 'employer_info.name': { $regex: name, $options: 'i' } },
                    { 'candidate_info.feature_job_position': { $regex: name, $options: 'i' } },
                    { 'candidate_info.name': { $regex: name, $options: 'i' } },
                  ]
                }
              : {},
            phone_number
              ? {
                  $or: [
                    { 'employer_info.phone_number': { $regex: phone_number } },
                    { 'candidate_info.phone_number': { $regex: phone_number } }
                  ]
                }
              : {}
          ]
        }
      },
      {
        $count: 'total'
      }
    ])
    .toArray();
  const total_records = totalRecords.length > 0 ? totalRecords[0].total : 0;
  const total_pages = Math.ceil(total_records / limitNum);
  const accounts = await db.accounts
    .aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'Employers',
          localField: 'user_id',
          foreignField: '_id',
          as: 'employer_info'
        }
      },
      {
        $lookup: {
          from: 'Candidates',
          localField: 'user_id',
          foreignField: '_id',
          as: 'candidate_info'
        }
      },
      {
        $lookup: {
          from: 'Skills',
          localField: 'candidate_info.skills',
          foreignField: '_id',
          as: 'skills_info'
        }
      },
      {
        $lookup: {
          from: 'Fields',
          localField: 'candidate_info.fields',
          foreignField: '_id',
          as: 'fields_info'
        }
      },
      {
        $unwind: {
          path: '$employer_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$candidate_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $and: [
            name
              ? {
                  $or: [
                    { 'employer_info.name': { $regex: name, $options: 'i' } },
                    { 'candidate_info.name': { $regex: name, $options: 'i' } }
                  ]
                }
              : {},
            phone_number
              ? {
                  $or: [
                    { 'employer_info.phone_number': { $regex: phone_number } },
                    { 'candidate_info.phone_number': { $regex: phone_number } }
                  ]
                }
              : {}
          ]
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          candidate_info:1,
          skills_info:1,
          fields_info:1
        }
      },
      { $skip: skipNum },
      { $limit: limitNum }
    ])
    .toArray();

  res.status(200).json({
    result: accounts,
    message: 'Lấy danh sách tài khoản thành công',
    pagination: {
      page: pageNum,
      limit: limitNum,
      total_pages,
      total_records
    }
  });
};