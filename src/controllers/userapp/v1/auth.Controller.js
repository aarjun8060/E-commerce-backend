/**
 * auth.Controller.js
 * @description :: exports All authentication methods and controller for User
 */

import { USER_TYPES,PLATFORM } from "../../../constants.js";
import { User } from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validateFilterWithJoi, validateParamsWithJoi } from "../../../utils/validateRequest.js";
import { schemaKeys, updateAuthSchemaKeys } from "../../../utils/validation/userValidation.js";
import { dbServiceCreate, dbServiceFindOne, dbServiceUpdateOne } from "../../../db/dbServices.js";
import * as common from "../../../utils/common.js";
import { loginUser, resetPasswordUser, sendResetPasswordOTPNotification } from "../../../services/auth.services.js";
import { isValidObjectId } from "mongoose";
import dayjs from "dayjs";


/**
 *
 * @param {Object} req: request  for register and It have { phone,email,password}
 * @param {*} res : response for register and stored user's data in data with validation
 */
const register = asyncHandler(async (req, res) => {
  // Required Validation
  let { phone, email, password } = req.body;

  if (!(phone || email)) {
    return res.badRequest({
      message: "Insufficient request parameters! email or phone  is required.",
    });
  }
  if (!password) {
    return res.badRequest({
      message: "Insufficient request parameters! password is required.",
    });
  }

  // validation
  let validateRequest = validateParamsWithJoi(req.body, schemaKeys);
  console.log("validateReds", validateRequest);
  if (!validateRequest.isValid) {
    return res.validationError({
      message: `Invalid values in parameters, ${validateRequest.message}`,
    });
  }

  const data = new User({
    ...req.body,
    userType: USER_TYPES.User,
  });
  console.log("data", data);
  // check data avaible in database or not
  if (req.body.email) {
    let checkUniqueFields = await common.checkUniqueFieldsInDatabase(
      User,
      ["email"],
      data,
      "REGISTER"
    );
    console.log("checkUnique", checkUniqueFields);
    if (checkUniqueFields.isDuplicate) {
      return res.validationError({
        message: `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`,
      });
    }
  } else if (req.body.phone) {
    let checkUniqueFields = await common.checkUniqueFieldsInDatabase(
      User,
      ["phone"],
      data,
      "REGISTER"
    );
    if (checkUniqueFields.isDuplicate) {
      return res.validationError({
        message: `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`,
      });
    }
  }

  // create  User
  const result = await dbServiceCreate(User, data);

  // TODO: Send WELCOME REGISTE BY EMAIL(data anot found work left)
  // if(req.body.email){

  // }

  return res.success({
    data: result,
    message: "register successfully",
  });
});

/**
 * @description : login with username and password
 * @param {Object} req : request for login
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */

const login = asyncHandler(async (req,res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.badRequest({
      message:
        "Insufficient request parameters! email or password  is required.",
    });
  }

  let roleAccess = false;
  let result = await loginUser(
    email,
    password,
    PLATFORM.USERAPP,
    roleAccess
  );
  console.log("result",result)
  if (!result.flag) {
    return res.badRequest({ message: result.data });
  }
  return res.success({
    data: result.data,
    message: "Login Successful",
  });
});

/**
 * @description : logout user
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */

const logout = asyncHandler(async () => {
    try {
        let userToken = await dbServiceFindOne(userToken,{
            token: (req.headers.authorization).replace('Bearer ', '') ,
            userId:req.user.id
        })
        let updatedDocument = { isTokenExpired: true };

        await dbServiceUpdateOne(userToken,{_id:userToken.id},updatedDocument)
        return res.success({ message :'Logged Out Successfully' });
    } catch (error) {
        console.log("error in logout",error)
        return res.internalServerError({ data:error.message }); 
    }
})

/**
 * @description : find document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found User. {status, message, data}
 */
const getUser = asyncHandler(async(req,res) => {
  try {
    if(!req.params.id){
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    if(!isValidObjectId(req.params.id)){
      return res.validationError({message:"invalid object"})
    }
    let query = {
      _id :req.params.id
    }
    let options = {}

    let foundUser = await dbServiceFindOne(User,query,options)

    if(!foundUser){
      return res.internalServerError()
    }

    return res.success({data : foundUser})
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

/**
 * @description : update document of User with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated User.
 * @return {Object} : updated User. {status, message, data}
 */

const updateUser = asyncHandler(async(req,res) => {
  try {
    let dataToUpdate = { ...req.body}
    let query = {}

    if(!req.params.id){
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    if(!isValidObjectId(req.params.id)){
      return res.validationError({message:"invalid object"})
    }

    let validateRequest = validateFilterWithJoi(
      dataToUpdate,
      updateAuthSchemaKeys
    )
    if(!validateRequest.isValid){
      return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }

    query._id = req.params.id

    let updatedUser = await dbServiceUpdateOne(User,query,dataToUpdate)

    if(!updatedUser){
      return res.internalServerError()
    }

    return res.success({ data : updatedUser})
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

/**
 * @description : deactivate document of User from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of User.
 * @return {Object} : deactivated User. {status, message, data}
 */
const softDelete = asyncHandler(async(req,res) => {
  try {
    if(!req.params.id){
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    if(!isValidObjectId(req.params.id)){
      return res.validationError({message:"invalid object"})
    }
    let query = { _id : req.params.id }
    let updatedBody = {
      isDeleted : true,
      isActive : false,
    }
    let softDeletdUser = await dbServiceUpdateOne(User,query,updatedBody)
    if(!softDeletdUser){
      return res.recordNotFound()
    }
    return res.success( { data:softDeletdUser })
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

const sentResetPasswordOTP = asyncHandler(async (req,res) => {
  try {
    const params = req.body;
    console.log("params",params)
    if(!params.email){
      return res.badRequest({ message: 'Insufficient request parameters! email or phone is required.' });
    }
    let where;
    if(params.email){
      where = { email: params.email };
     where.isActive = true; 
     where.isDeleted = false; 
     params.email = params.email.toString().toLowerCase();
    }
    console.log("where",where)
    let foundUser = await dbServiceFindOne(User,where)
    console.log("user",foundUser)
    if (!foundUser) {
      return res.recordNotFound();
    }
    let {
      resultOfEmail
    } = await sendResetPasswordOTPNotification(foundUser);
    console.log("resultOfEmail",resultOfEmail)
    if (resultOfEmail) {
      return res.success({ message: 'otp successfully send to your email.' });
    }
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

const validateEmail = asyncHandler(async (req,res) => {
  try {
    const params = req.body;

    if(!params.otp){
      return res.badRequest({ message: 'Insufficient request parameters! otp is required.' });
    }

    const where = {
      'resetPasswordLink.code': params.otp,
      isActive: true,
      isDeleted: false,
    };

    let found = await dbServiceFindOne(User,where)
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: 'Invalid OTP' });
    }
    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({ message: 'Your reset password link is expired or invalid' });
    }

    let updateUser = await dbService.updateOne(User, {_id:found.id}, { resetPasswordLink: {} });
   console.log(updateUser)
    if(!updateUser){
      return res.recordNotFound()
    }
    return res.success({ message: 'OTP verified' });
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

const resetPassword = asyncHandler(async (req,res) => {
  try {
    const params = req.body;
    if (!params.code || !params.newPassword) {
      return res.badRequest({ message: 'Insufficient request parameters! code and newPassword is required.' });
    }
    const where = {
      'resetPasswordLink.code': params.code,
      isActive: true,
      isDeleted: false,
    };
    let found = await dbService.findOne(User, where);
    if (!found || !found.resetPasswordLink.expireTime) {
      return res.failure({ message: 'Invalid Code' });
    }

    if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
      return res.failure({ message: 'Your reset password link is expired or invalid' });
    }
    let response = await resetPasswordUser(found,params.newPassword)
    if (!response || response.flag) {
      return res.failure({ message: response.data });
    }
    return res.success({ message: response.data });
  } catch (error) {
    return res.internalServerError({message : error.message})
  }
})

export { 
    register,
    login,
    logout,
    getUser,
    softDelete,
    updateUser,
    sentResetPasswordOTP,
    validateEmail,
    resetPassword
};
