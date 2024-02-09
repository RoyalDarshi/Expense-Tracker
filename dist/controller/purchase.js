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
const razorpay_1 = __importDefault(require("razorpay"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../model/user"));
const order_1 = __importDefault(require("../model/order"));
const database_1 = __importDefault(require("../util/database"));
const purchasePremium = (req, res) => {
    const razorpay = new razorpay_1.default({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const amount = process.env.PURCHASE_AMOUNT;
    const userId = jsonwebtoken_1.default.decode(req.headers.authorization);
    razorpay.orders.create({ amount, currency: "INR" }, (err, data) => {
        if (err) {
            throw new Error(JSON.stringify(err));
        }
        order_1.default.create({ orderId: data.id, status: "PENDING", userId: userId }).then(() => {
            return res.status(201).json({ id: data.id, key_id: process.env.RAZORPAY_KEY_ID });
        });
    });
};
const updatePaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.body.orderId;
    const paymentId = req.body.paymentId;
    const userId = jsonwebtoken_1.default.decode(req.headers.authorization);
    const trans = yield database_1.default.transaction();
    // @ts-ignore
    yield order_1.default.update({ status: "SUCCESS", paymentId: paymentId }, { where: { orderId: orderId } }, { transaction: trans }).then(() => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        yield user_1.default.update({ isPremiumUser: true }, { where: { id: userId } }, { transaction: trans }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
            yield trans.commit();
            res.status(201).json(data);
        }));
    })).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
        yield trans.rollback();
        console.log(err);
    }));
});
const paymentFailed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.body.orderId;
    const status = req.body.status;
    yield order_1.default.update({ status: status }, { where: { orderId: orderId } }).catch(err => {
        console.log(err);
    });
    res.status(201).json({ msg: "Payment Failed" });
});
const purchaseController = {
    purchasePremium,
    paymentFailed,
    updatePaymentStatus
};
exports.default = purchaseController;
