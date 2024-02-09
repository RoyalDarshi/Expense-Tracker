"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const premium_1 = __importDefault(require("../controller/premium"));
const premiumRouter = (0, express_1.Router)();
premiumRouter.get("/leaderboard", premium_1.default.leaderboard);
premiumRouter.get("/download", premium_1.default.downloadExpense);
premiumRouter.get("/prevDownload", premium_1.default.prevDownloads);
premiumRouter.post("/dailyReport", premium_1.default.dailyReport);
premiumRouter.post("/monthlyReport", premium_1.default.monthlyReport);
exports.default = premiumRouter;
