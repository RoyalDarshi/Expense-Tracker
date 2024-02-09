"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageNotFound = void 0;
const path_1 = __importDefault(require("path"));
const path_2 = __importDefault(require("../util/path"));
const pageNotFound = (req, res, next) => {
    res.sendFile(path_1.default.join(path_2.default, "view", "pageNotFound.html"));
};
exports.pageNotFound = pageNotFound;
