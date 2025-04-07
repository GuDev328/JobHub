import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import db from '~/services/databaseServices';

export const getListAccountController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { page, limit, email, name, phone_number, status, role } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const matchConditions: any = {};

  if (email) {
    matchConditions.email = { $regex: email, $options: 'i' };
  }
  if (role) {
    matchConditions.role = parseInt(role as string);
  }
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
