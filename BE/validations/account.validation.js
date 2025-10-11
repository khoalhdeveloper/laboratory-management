
const Joi = require('joi');


const registerAccountValidation = Joi.object({
  userid: Joi.string().required(),
  image: Joi.string().uri().optional(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  fullName: Joi.string().required(),
  identifyNumber: Joi.string().required(),
  age: Joi.number().required(),
  address: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  role: Joi.string().valid('user', 'admin').required(),
  isActive: Joi.boolean().default(false)
});

module.exports = {
  registerAccountValidation: (body) => registerAccountValidation.validate(body)
};
