import path from "path";
import fs from "fs";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
require("dotenv").config()
import helmet from "helmet";
import morgan from "morgan";

import db from "./util/database";
import adminRouter from "./routes/admin";
import purchaseRouter from "./routes/purchase";
import premiumRouter from "./routes/premium";
import {pageNotFound} from "./controller/error";
import User from "./model/user";
import Expense from "./model/expense";
import Order from "./model/order";
import ForgotPassword from "./model/forgotPasswordRequest";
import FileUrl from "./model/fileUrl";

const app=express();

const accessLogStream=fs.createWriteStream(path.join(
    __dirname,'access.log'),{flags:'a'});

app.use(cors());

app.use(helmet({contentSecurityPolicy: false,}));

app.use(morgan("combined",{stream:accessLogStream}))

app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({extend:true}))

app.use(express.static(path.join(__dirname,"../public")));

app.use(adminRouter);

app.use("/purchase",purchaseRouter);

app.use("/premium",premiumRouter);

app.use(pageNotFound);

Expense.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(Expense);

Order.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(Order);

ForgotPassword.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(ForgotPassword);

FileUrl.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(FileUrl);

db.sync().then(()=>{
    app.listen(process.env.PORT_NUMBER);
})