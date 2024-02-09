"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const Order = database_1.default.define("order", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentId: {
        type: sequelize_1.default.STRING
    },
    orderId: {
        type: sequelize_1.default.STRING
    },
    status: {
        type: sequelize_1.default.STRING
    }
});
exports.default = Order;
