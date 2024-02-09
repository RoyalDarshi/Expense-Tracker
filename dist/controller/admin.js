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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// @ts-ignore
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const path_2 = __importDefault(require("../util/path"));
const user_1 = __importDefault(require("../model/user"));
const expense_1 = __importDefault(require("../model/expense"));
const database_1 = __importDefault(require("../util/database"));
const forgotPasswordRequest_1 = __importDefault(require("../model/forgotPasswordRequest"));
const sequelize_1 = require("sequelize");
function createToken(id) {
    return jsonwebtoken_1.default.sign(id, process.env.TOKEN_SECRET_KEY);
}
function decodeToken(token) {
    return jsonwebtoken_1.default.decode(token);
}
const sendFile = (req, res) => {
    res.sendFile(path_1.default.join(path_2.default, "view", "index.html"));
};
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt_1.default.hash(password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.default.create({ name: name, email: email, password: hash, isPremiumUser: false }).then((data) => {
            res.status(201).json(data.dataValues);
        }).catch(() => {
            res.status(201).json({ message: "User already exist" });
        });
    }));
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    yield user_1.default.findOne({ where: { email: email } }).then((data) => {
        if (!data) {
            return res.status(404).json("User not found");
        }
        bcrypt_1.default.compare(password, data.dataValues.password, (err, value) => {
            if (value) {
                return res.status(201).json({ id: createToken(data.dataValues.id) });
            }
            else {
                return res.status(401).json("Wrong Password");
            }
        });
    }).catch((err) => {
        console.log(err);
    });
});
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const userId = decodeToken(req.body.userId);
    const defaultClient = sib_api_v3_sdk_1.default.ApiClient.instance;
    const resetToken = (0, uuid_1.v4)();
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    yield forgotPasswordRequest_1.default.create({ id: resetToken, isActive: true, userId: userId }).then(() => {
        let apiInstance = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
        const sender = {
            email: process.env.SENDER_EMAIL,
            name: process.env.SENDER_NAME,
        };
        const receivers = [
            {
                email: email,
            },
        ];
        const sendTransacSms = {
            sender,
            to: receivers,
            recipient: "+9187200011654",
            subject: "Forgot Password",
            content: "Reset your password",
            message: "forgot password",
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
        apiInstance.sendTransacEmail(sendTransacSms).then(function (data) {
            res.status(201).json(data);
        }, function (error) {
            console.error(error);
            res.status(error.status).json(error);
        });
    });
});
const getResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resetToken = req.params.resetToken;
    yield forgotPasswordRequest_1.default.findOne({ where: { id: resetToken } }).then((data) => {
        if (!data) {
            return res.status(404).json({ err: "Unable to find Req" });
        }
        else if (!data.dataValues.isActive) {
            return res.status(400).json({ err: "Req has been disclosed please send another req" });
        }
        res.sendFile(path_1.default.join(path_2.default, "public/html", "resetPassword.html"));
    });
});
const postResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = decodeToken(req.body.userId);
    const trans = yield database_1.default.transaction();
    const password = req.body.password;
    bcrypt_1.default.hash(password, 10, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        yield user_1.default.update({ password: data }, { where: { id: id } }, { transaction: trans }).then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield forgotPasswordRequest_1.default.update({ isActive: false }, { where: { userId: id } });
        })).then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield trans.commit();
            res.status(201).json({ msg: "User password updated successfully" });
        })).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
            yield trans.rollback();
            res.status(400).json({ err: err });
        }));
    }));
});
const isPremiumUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = decodeToken(req.headers.authorization);
    yield user_1.default.findOne({ where: { id: userId } }).then((data) => {
        res.status(201).json({ isPremiumUser: data === null || data === void 0 ? void 0 : data.dataValues.isPremiumUser });
    }).catch((err) => {
        console.log(err);
    });
});
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const money = req.body.money;
    const category = req.body.category;
    const desc = req.body.description;
    const userId = decodeToken(req.body.userId);
    const trans = yield database_1.default.transaction();
    user_1.default.findOne({ where: { id: userId } }).then((data) => {
        const prevExpense = (data === null || data === void 0 ? void 0 : data.dataValues.totalExpense) || 0;
        // @ts-ignore
        user_1.default.update({ totalExpense: prevExpense + +money }, { where: { id: userId } }, { transaction: trans }).then(() => __awaiter(void 0, void 0, void 0, function* () {
            expense_1.default.create({ expense: money, category: category, description: desc, userId: userId }, { transaction: trans }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
                yield trans.commit();
                const page = Math.ceil((++count) / ITEM_PER_PAGE);
                const pageChanged = count % ITEM_PER_PAGE === 1;
                res.status(201).json({
                    products: [data],
                    currentPage: page,
                    pageChanged: pageChanged,
                    hasNextPage: ITEM_PER_PAGE * page < count,
                    nextPage: page + 1,
                    hasPreviousPage: page > 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(count / ITEM_PER_PAGE)
                });
            }));
        }));
    }).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
        yield trans.rollback();
        console.log(err);
    }));
});
let ITEM_PER_PAGE = 5;
let count = 1;
const getAllExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    ITEM_PER_PAGE = Number(req.headers.authorization);
    const page = Number(req.query.page) || 1;
    count = yield expense_1.default.count({ where: { userId: decodeToken(userId) } });
    expense_1.default.findAll({
        where: { userId: decodeToken(userId) },
        limit: ITEM_PER_PAGE,
        offset: (page - 1) * ITEM_PER_PAGE
    }).then((data) => {
        res.status(201).json({
            products: data,
            currentPage: page,
            pageChanged: false,
            hasNextPage: ITEM_PER_PAGE * page < count,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(count / ITEM_PER_PAGE)
        });
    }).catch((err) => {
        console.log(err);
    });
});
const weeklyExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    // Calculate the start of the current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    // Query to get weekly expenses
    expense_1.default.findAll({
        attributes: [
            [database_1.default.fn('WEEK', database_1.default.col('createdAt')), 'week'],
            [database_1.default.fn('SUM', database_1.default.col('expense')), 'totalAmount'],
        ],
        where: {
            createdAt: {
                [sequelize_1.Op.gte]: startOfWeek,
            },
        },
        group: [database_1.default.fn('WEEK', database_1.default.col('createdAt'))],
    }).then((weeklyExpenses) => {
        res.status(201).json(weeklyExpenses);
    });
});
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = decodeToken(req.body.userId);
    const trans = yield database_1.default.transaction();
    const money = req.body.money;
    user_1.default.findOne({ where: { id: userId } }).then((data) => {
        user_1.default.update({ totalExpense: (data === null || data === void 0 ? void 0 : data.dataValues.totalExpense) - money }
        // @ts-ignore
        , { where: { id: userId } }, { transaction: trans }).then(() => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-ignore
            expense_1.default.destroy({ where: { id: id } }, { transaction: trans }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                yield trans.commit();
                const removePage = count-- % ITEM_PER_PAGE === 1;
                const page = Math.ceil(count / ITEM_PER_PAGE);
                res.status(201).json({
                    removePage: removePage,
                    currentPage: page,
                    pageChanged: false,
                    hasNextPage: ITEM_PER_PAGE * page < count,
                    nextPage: page + 1,
                    hasPreviousPage: page > 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(count / ITEM_PER_PAGE)
                });
            }));
        }));
    }).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
        yield trans.rollback();
        console.log(err);
    }));
});
const adminController = {
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
};
exports.default = adminController;
