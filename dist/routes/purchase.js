"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchase_1 = __importDefault(require("../controller/purchase"));
const purchaseRouter = (0, express_1.Router)();
purchaseRouter.get("/purchase-premium", purchase_1.default.purchasePremium);
purchaseRouter.post("/update-payment-status", purchase_1.default.updatePaymentStatus);
purchaseRouter.post("/payment-failed", purchase_1.default.paymentFailed);
exports.default = purchaseRouter;
