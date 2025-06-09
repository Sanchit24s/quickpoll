const validator = require("validator");

const validateRequiredFields = (body, fields) => {
    return fields.filter((field) => !body[field]);
};

const validateEmail = (email) => {
    return validator.isEmail(email);
};

module.exports = {
    validateRequiredFields,
    validateEmail,
};