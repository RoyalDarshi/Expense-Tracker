import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// @ts-ignore
import SibApiV3Sdk from 'sib-api-v3-sdk';
import {v4} from "uuid";

import path from "path";

import rootDir from "../util/path";
import User from "../model/user";
import Expense from "../model/expense";
import sequelize from "../util/database";
import ForgotPassword from "../model/forgotPasswordRequest";
import {Op} from "sequelize";

function createToken(id: string){
    return jwt.sign(id,process.env.TOKEN_SECRET_KEY as string)
}

function decodeToken(token:string){
    return jwt.decode(token);
}

const sendFile=(req: any, res: { sendFile: (arg0: string) => void; })=>{
    res.sendFile(path.join(rootDir,"view","index.html"))
}

const createUser=async (req: { body: { name: any; email: any; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; })=>{
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    bcrypt.hash(password,10,async (err: any, hash: string)=>{
        await User.create({name:name,email:email,password:hash,isPremiumUser:false}).then((data: { dataValues: { message: string; }; })=>{
            res.status(201).json(data.dataValues);
        }).catch(()=>{
            res.status(201).json({message:"User already exist"});
        })
    })

}

const loginUser=async (req: { body: { email: string; password: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): any; new(): any; }; }; })=>{
    const email=req.body.email;
    const password=req.body.password;
    await User.findOne({where:{email:email}}).then((data)=>{
        if(!data){
            return res.status(404).json("User not found");
        }
        bcrypt.compare(password,data.dataValues.password,(err: any, value: any)=>{
            if(value){
                return res.status(201).json({id:createToken(data.dataValues.id)});
            }
            else {
                return res.status(401).json("Wrong Password");
            }
        })

    }).catch((err: any)=>{
        console.log(err)
    })
}

const forgotPassword=async (req: { body: { email: string; userId: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; })=>{
    const email=req.body.email;
    const userId=decodeToken(req.body.userId);
    const defaultClient = SibApiV3Sdk.ApiClient.instance
    const resetToken = v4();
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    await ForgotPassword.create({id:resetToken,isActive:true,userId:userId}).then(()=>{
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sender = {
            email: process.env.SENDER_EMAIL,
            name: process.env.SENDER_NAME,
        }

        const receivers = [
            {
                email: email,
            },
        ]
        const sendTransacSms = {
            sender,
            to:receivers,
            recipient:"+9187200011654",
            subject: "Forgot Password",
            content:"Reset your password",
            message:"forgot password",
            htmlContent: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #333;
        }

        p {
            color: #666;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Forgot Password</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <p><a href=${resetLink} class="btn">Reset Password</a></p>
    <p>If the button above does not work, you can copy and paste the following link into your browser:</p>
    <p>${resetLink}</p>
    <p>This link will expire in 10 Min.</p>
    <p>If you have any questions, please contact support at priyadarshiroy92@gmail.com.</p>
    <p>Best regards,<br>Your Application Team</p>
</div>

</body>
</html>

        `
        };

        apiInstance.sendTransacEmail(sendTransacSms).then(function(data: any) {
            res.status(201).json(data);
        }, function(error: { status: number; }) {
            console.error(error);
            res.status(error.status).json(error)
        });
    })

}

const getResetPassword=async (req: { params: { resetToken: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { err: string; }): any; new(): any; }; }; sendFile: (arg0: string) => void; })=>{
    const resetToken=req.params.resetToken;
    await ForgotPassword.findOne({where:{id:resetToken}}).then((data)=>{
        if(!data){
           return res.status(404).json({err:"Unable to find Req"});
        }
        else if(!data.dataValues.isActive){
           return res.status(400).json({err:"Req has been disclosed please send another req"});
        }
        res.sendFile(path.join(rootDir,"public/html","resetPassword.html"));
    })
}
const postResetPassword=async (req: { body: { userId: string; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { msg?: string; err?: any; }): void; new(): any; }; }; })=>{
    const id=decodeToken(req.body.userId);
    const trans=await sequelize.transaction()
    const password=req.body.password
    bcrypt.hash(password,10,async(err,data)=>{
        // @ts-ignore
        await User.update({password:data},{where:{id:id}},{transaction:trans}).then(async ()=>{
            await ForgotPassword.update({isActive:false},{where:{userId:id}})
        }).then(async ()=>{
            await trans.commit()
            res.status(201).json({msg:"User password updated successfully"});
        }).catch(async (err: any)=>{
            await trans.rollback();
            res.status(400).json({err:err});
        })
    })
}

const isPremiumUser=async (req: { headers: { authorization: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { isPremiumUser: any; }): void; new(): any; }; }; })=>{
    const userId=decodeToken(req.headers.authorization);
    await User.findOne({where:{id:userId}}).then((data)=>{
        res.status(201).json({isPremiumUser:data?.dataValues.isPremiumUser})
    }).catch((err: any)=>{
        console.log(err)
    })
}

const createExpense=async (req: { body: { money: number; category: string; description: string; userId: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { products: any[]; currentPage: number; pageChanged: boolean; hasNextPage: boolean; nextPage: number; hasPreviousPage: boolean; previousPage: number; lastPage: number; }): void; new(): any; }; }; })=>{
    const money=req.body.money;
    const category=req.body.category;
    const desc=req.body.description;
    const userId=decodeToken(req.body.userId);
    const trans=await sequelize.transaction();
    User.findOne({where:{id:userId}}).then((data)=>{
        const prevExpense=data?.dataValues.totalExpense||0;
        // @ts-ignore
        User.update({totalExpense:prevExpense+ +money},{where:{id:userId}},{transaction:trans}).then(async ()=>{
            Expense.create({expense:money,category:category,description:desc,userId:userId},
                {transaction:trans}).then(async (data: any)=>{
                await trans.commit()
                const page=Math.ceil((++count)/ITEM_PER_PAGE)
                const pageChanged=count%ITEM_PER_PAGE===1;
                res.status(201).json({
                    products:[data],
                    currentPage:page,
                    pageChanged:pageChanged,
                    hasNextPage:ITEM_PER_PAGE*page<count,
                    nextPage:page+1,
                    hasPreviousPage:page>1,
                    previousPage:page-1,
                    lastPage:Math.ceil(count/ITEM_PER_PAGE)
                });
            })
        })
    }).catch(async (err: any)=>{
        await trans.rollback();
        console.log(err)
    })
}

let ITEM_PER_PAGE=5;
let count=1;

const getAllExpenses=async (req: { params: { userId: string; }; headers: { authorization: string; }; query: { page: number; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { products: any; currentPage: number; pageChanged: boolean; hasNextPage: boolean; nextPage: number; hasPreviousPage: boolean; previousPage: number; lastPage: number; }): void; new(): any; }; }; })=>{
    const userId=req.params.userId;
    ITEM_PER_PAGE=Number(req.headers.authorization);
    const page=Number(req.query.page)||1;
    count=await Expense.count({where:{userId:decodeToken(userId)}});
    Expense.findAll({
            where:{userId:decodeToken(userId)},
            limit:ITEM_PER_PAGE,
            offset:(page-1)*ITEM_PER_PAGE},
        ).then((data: any)=>{
        res.status(201).json({
            products:data,
            currentPage:page,
            pageChanged:false,
            hasNextPage:ITEM_PER_PAGE*page<count,
            nextPage:page+1,
            hasPreviousPage:page>1,
            previousPage:page-1,
            lastPage:Math.ceil(count/ITEM_PER_PAGE)
        })
    }).catch((err: any)=>{
        console.log(err)
    })
}

const weeklyExpense=async (req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; })=>{
    const currentDate = new Date();

// Calculate the start of the current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

// Query to get weekly expenses
    Expense.findAll({
        attributes: [
            [sequelize.fn('WEEK', sequelize.col('createdAt')), 'week'],
            [sequelize.fn('SUM', sequelize.col('expense')), 'totalAmount'],
        ],
        where: {
            createdAt: {
                [Op.gte]: startOfWeek,
            },
        },
        group: [sequelize.fn('WEEK', sequelize.col('createdAt'))],
    }).then((weeklyExpenses: any) => {
        res.status(201).json(weeklyExpenses)
    });
}

const deleteExpense=async (req: { params: { id: any; }; body: { userId: string; money: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { removePage: boolean; currentPage: number; pageChanged: boolean; hasNextPage: boolean; nextPage: number; hasPreviousPage: boolean; previousPage: number; lastPage: number; }): void; new(): any; }; }; })=>{
    const id=req.params.id;
    const userId=decodeToken(req.body.userId);
    const trans=await sequelize.transaction();
    const money=req.body.money;
    User.findOne({where:{id:userId}}).then((data)=>{
        User.update({totalExpense:data?.dataValues.totalExpense-money}
            // @ts-ignore
            ,{where:{id:userId}},{transaction:trans}).then(async ()=>{
            // @ts-ignore
            Expense.destroy({where:{id:id}},{transaction:trans}).then(async ()=>{
                await trans.commit()
                const removePage=count--%ITEM_PER_PAGE===1;
                const page=Math.ceil(count/ITEM_PER_PAGE);
                res.status(201).json({
                    removePage:removePage,
                    currentPage:page,
                    pageChanged:false,
                    hasNextPage:ITEM_PER_PAGE*page<count,
                    nextPage:page+1,
                    hasPreviousPage:page>1,
                    previousPage:page-1,
                    lastPage:Math.ceil(count/ITEM_PER_PAGE)
                });
            })
        })
    }).catch(async (err: any)=>{
        await trans.rollback()
        console.log(err)
    })
}

const adminController={
    getAllExpenses,
    deleteExpense,
    forgotPassword,
    loginUser,
    createUser,
    createExpense,
    sendFile,
    getResetPassword,
    isPremiumUser,
    postResetPassword,
    weeklyExpense,
    decodeToken
}

export default adminController;