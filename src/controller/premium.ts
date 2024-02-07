import jwt from "jsonwebtoken";
import AWS from "aws-sdk";

import Expense from "../model/expense";
import User from "../model/user";
import FileUrl from "../model/fileUrl";
import { Model } from "sequelize";

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
}
export default premiumController;