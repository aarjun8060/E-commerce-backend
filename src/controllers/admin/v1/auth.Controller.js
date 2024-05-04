import { PLATFORM, USER_TYPES } from "../../../constants.js";
import { User } from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validateParamsWithJoi } from "../../../utils/validateRequest.js";
import { schemaKeys } from "../../../utils/validation/userValidation.js";
import * as common from "../../../utils/common.js";
import { dbServiceCreate, dbServiceFindOne, dbServiceUpdateOne } from "../../../db/dbServices.js";
import { loginUser } from "../../../services/auth.services.js";

/**
 * @description : user registration 
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
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
      userType: USER_TYPES.Admin,
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
  
    // TODO: Send WELCOME REGISTE BY EMAIL
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
      PLATFORM.ADMIN,
      roleAccess
    );
    console.log("result",result)
    if (result.flag) {
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
  export {
    register,
    login
  }