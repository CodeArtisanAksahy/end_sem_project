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
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const errors_1 = require("../utils/errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.User.findOne({ email: data.email });
    if (existingUser)
        throw (0, errors_1.createAuthError)('Email already exists');
    const user = yield user_model_1.User.create(Object.assign(Object.assign({}, data), { otp: '123456' })); // MOCK OTP FOR DEMO
    // TO DO: Dispatch email via BullMQ -> Nodemailer
    return { id: user._id, email: user.email, name: user.name };
});
exports.registerUser = registerUser;
const loginUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    const user = yield user_model_1.User.findOne({ email }).select('+password');
    if (!user || !(yield user.comparePassword(password))) {
        throw (0, errors_1.createAuthError)('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || 'r_secret', { expiresIn: '7d' });
    return { token, refreshToken, user: { id: user._id, email: user.email, role: user.role } };
});
exports.loginUser = loginUser;
