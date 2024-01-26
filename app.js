const path=require("path");
const fs=require("fs");

const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");
require("dotenv").config()
const helmet=require("helmet")
const morgan=require("morgan")

const db=require("./util/database");
const adminRouter=require("./routes/admin");
const purchaseRouter=require("./routes/purchase");
const premiumRouter=require("./routes/premium")
const errorController=require("./controller/error");
const User=require("./model/user");
const Expense=require("./model/expense");
const Order=require("./model/order");
const ForgotPassword=require("./model/forgotPasswordRequest");
const FileUrl=require("./model/fileUrl");

const app=express();

const accessLogStream=fs.createWriteStream(path.join(
    __dirname,'access.log'),{flags:'a'});

app.use(cors());

app.use(helmet({contentSecurityPolicy: false,}));

app.use(morgan("combined",{stream:accessLogStream}))

app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({extend:true}))

app.use(express.static(path.join(__dirname,"public")));

app.use(adminRouter);

app.use("/purchase",purchaseRouter);

app.use("/premium",premiumRouter);

app.use(errorController.pageNotFound);

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