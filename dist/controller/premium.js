"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const expense_1 = __importDefault(require("../model/expense"));
const user_1 = __importDefault(require("../model/user"));
const fileUrl_1 = __importDefault(require("../model/fileUrl"));
const sequelize_1 = require("sequelize");
const admin_1 = __importDefault(require("./admin"));
const database_1 = __importDefault(require("../util/database"));
const leaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findAll({
        attributes: ["name", "totalExpense"],
        order: [["totalExpense", "DESC"]]
    }).catch(err => {
        console.log(err);
    });
    res.status(201).json(user);
});
const downloadExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = jsonwebtoken_1.default.decode(req.headers.authorization);
    const expenses = yield expense_1.default.findAll({ where: { userId: userId } });
    const stringifyExpense = JSON.stringify(expenses);
    const fileName = `Expense${userId}/${new Date()}.txt`;
    const fileUrl = yield uploadToS3(fileName, stringifyExpense);
    yield fileUrl_1.default.create({ url: fileUrl, name: fileName, userId: userId });
    res.status(201).json({ url: fileUrl, success: true });
});
function uploadToS3(fileName, data) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const USER_KEY = process.env.IAM_USER_KEY;
    const USER_SECRET_KEY = process.env.IAM_USER_SECRET_KEY;
    const s3Bucket = new aws_sdk_1.default.S3({
        accessKeyId: USER_KEY,
        secretAccessKey: USER_SECRET_KEY,
    });
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: "public-read"
    };
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.Location);
            }
        });
    });
}
const dailyReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dateWithTime = new Date(req.body.date); // Current date and time
    console.log(dateWithTime);
    let date = dateWithTime.getFullYear() + "-";
    if (dateWithTime.getMonth() < 10) {
        date += 0;
    }
    date += (dateWithTime.getMonth() + 1) + "-";
    console.log(dateWithTime.getDate());
    if (dateWithTime.getDate() < 10) {
        date += 0;
    }
    date += dateWithTime.getDate();
    const id = admin_1.default.decodeToken(req.body.id);
    const expense = yield expense_1.default.findAll({
        where: {
            userId: id,
            createdAt: {
                [sequelize_1.Op.startsWith]: date
            }
        }
    });
    res.status(201).json(expense);
});
const monthlyReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = admin_1.default.decodeToken(req.body.id);
    const desiredMonth = req.body.month; // Example: July
    console.log(desiredMonth);
    yield expense_1.default.findAll({
        where: {
            userId: id, // Check for specific userId
            createdAt: database_1.default.where(database_1.default.fn('MONTH', database_1.default.col('createdAt')), desiredMonth)
        }
    }).then(data => {
        res.status(201).json(data);
    });
});
const prevDownloads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = jsonwebtoken_1.default.decode(req.headers.authorization);
    yield fileUrl_1.default.findAll({ where: { userId: userId } }).then(data => {
        res.status(201).json(data);
    });
});
const premiumController = {
    prevDownloads,
    leaderboard,
    downloadExpense,
    dailyReport,
    monthlyReport
};
exports.default = premiumController;
