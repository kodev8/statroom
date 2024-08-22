// success
const success = 200;
const created = 201;
const noContent = 204;

// client errors
const badRequest = 400;
const unauthorized = 401;
const forbidden = 403;
const notFound = 404;
const userAlreadyExists = 409;
const fileTooLarge = 413;
const invalidFileType = 415;
const tooManyRequests = 429;

// server errors
const serverError = 500;
const badGateway = 502;

export default {
    success,
    created,
    noContent,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    userAlreadyExists,
    fileTooLarge,
    invalidFileType,
    tooManyRequests,
    serverError,
    badGateway,
};
