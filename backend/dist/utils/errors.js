"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthError = void 0;
const createAuthError = (message) => {
    const error = new Error(message);
    error.statusCode = 401;
    return error;
};
exports.createAuthError = createAuthError;
