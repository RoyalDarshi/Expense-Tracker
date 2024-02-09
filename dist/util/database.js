"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Db = new sequelize_1.Sequelize(process.env.DATABASE_SCHEMA, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    dialect: "mysql",
    host: process.env.HOST_NAME
});
exports.default = Db;
