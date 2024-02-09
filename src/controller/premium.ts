import jwt from "jsonwebtoken";
import AWS from "aws-sdk";

import Expense from "../model/expense";
import User from "../model/user";
import FileUrl from "../model/fileUrl";
import {Model, Op} from "sequelize";
import adminController from "./admin";
import Db from "../util/database"

const leaderboard = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: void | Model<any, any>[]): void; new(): any; }; }; })=>{
    const user=await User.findAll({
        attributes:["name","totalExpense"],
        order:[["totalExpense","DESC"]]
        }
    ).catch(err=>{
        console.log(err)
    })
    res.status(201).json(user);
}

const downloadExpense=async (req: { headers: { authorization: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { url: unknown; success: boolean; }): void; new(): any; }; }; })=>{
    const userId=jwt.decode(req.headers.authorization);
    const expenses=await Expense.findAll({where:{userId:userId}})
    const stringifyExpense=JSON.stringify(expenses);
    const fileName=`Expense${userId}/${new Date()}.txt`;
    const fileUrl=await uploadToS3(fileName,stringifyExpense)
    await FileUrl.create({url:fileUrl,name:fileName,userId:userId})
    res.status(201).json({url: fileUrl,success:true});
}
function uploadToS3(fileName: string, data: string){
    const BUCKET_NAME=process.env.BUCKET_NAME;
    const USER_KEY=process.env.IAM_USER_KEY;
    const USER_SECRET_KEY=process.env.IAM_USER_SECRET_KEY;
    const s3Bucket=new AWS.S3({
        accessKeyId:USER_KEY,
        secretAccessKey:USER_SECRET_KEY,
    })
        const params={
            Bucket:BUCKET_NAME,
            Key:fileName,
            Body:data,
            ACL:"public-read"
        }
        return new Promise((resolve,reject)=>{
            s3Bucket.upload(params as any,(err: any, data: { Location: unknown; })=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data.Location)
                }
            })
        })
}

const dailyReport=async (req:any,res:any)=>{
    const dateWithTime = new Date(req.body.date); // Current date and time
    console.log(dateWithTime)
    let date = dateWithTime.getFullYear()+"-";
    if(dateWithTime.getMonth()<10){
        date+=0;
    }
    date+= (dateWithTime.getMonth()+1)+"-"
    console.log(dateWithTime.getDate())
    if( dateWithTime.getDate()<10){
        date+= 0;
    }
    date+=dateWithTime.getDate()
    const id=adminController.decodeToken(req.body.id);
    const expense = await Expense.findAll({
        where: {
            userId:id,
            createdAt: {
                [Op.startsWith]: date
            }
        }
    });
    res.status(201).json(expense);
}

const monthlyReport=async (req:any,res:any)=>{
    const id=adminController.decodeToken(req.body.id)
    const desiredMonth = req.body.month; // Example: July
    console.log(desiredMonth)
    await Expense.findAll({
        where: {
            userId: id, // Check for specific userId
            createdAt: Db.where(Db.fn('MONTH', Db.col('createdAt')), desiredMonth)
        }
    }).then(data=>{
        res.status(201).json(data)
    });

}

const prevDownloads=async (req: { headers: { authorization: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: Model<any, any>[]): void; new(): any; }; }; })=>{
    const userId=jwt.decode(req.headers.authorization)
    await FileUrl.findAll({where:{userId:userId}}).then(data=>{
        res.status(201).json(data);
    })

}
const premiumController={
    prevDownloads,
    leaderboard,
    downloadExpense,
    dailyReport,
    monthlyReport
}
export default premiumController;