"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const ForgotPassword = database_1.default.define("forgotPasswordRequest", {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: sequelize_1.default.BOOLEAN
    }
});
exports.default = ForgotPassword;
