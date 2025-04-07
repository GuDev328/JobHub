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
