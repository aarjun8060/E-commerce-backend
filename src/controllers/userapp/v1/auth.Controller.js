/**
 * auth.Controller.js
 * @description :: exports All authentication methods and controller for User
 */

import { USER_TYPES } from "../../../constants.js";
import { User } from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js"
import { validateParamsWithJoi } from "../../../utils/validateRequest.js";
import { schemaKeys } from "../../../utils/validation/userValidation.js";
import { dbServiceCreate } from "../../../db/dbServices.js"
import * as common from "../../../utils/common.js"
/**
 * 
 * @param {Object} req: request  for register and It have { phone,email,password}
 * @param {*} res : response for register and stored user's data in data with validation
 */
const register = asyncHandler(async(req,res) => {
    // Required Validation
    let {
        phone,
        email,
        password
    } = req.body;

    if(!(phone || email)){
        return res.badRequest({message:'Insufficient request parameters! email or phone  is required.'})
    }
    if(!password){
        return res.badRequest({message:'Insufficient request parameters! password is required.'})
    }

    // validation 
    let validateRequest = validateParamsWithJoi(
        req.body,
        schemaKeys
    )
    console.log("validateReds",validateRequest)
    if(!validateRequest.isValid) {
        return res.validationError({message:`Invalid values in parameters, ${validateRequest.message}`})
    }

    const data = new User({
        ...req.body,
        userType:USER_TYPES.User
    })
    console.log("data",data)
    // check data avaible in database or not
    if(req.body.email){
        let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['email'],data,'REGISTER');
        console.log("checkUnique",checkUniqueFields)
        if(checkUniqueFields.isDuplicate){
            return res.validationError({message:`${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`})
        }
    }else if(req.body.phone){
        let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['phone'],data,'REGISTER');
        if(checkUniqueFields.isDuplicate){
            return res.validationError({message:`${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`})
        }
    }
     
    // create  User
    const result = await  dbServiceCreate(User,data);

    // TODO: Send WELCOME REGISTE BY EMAIL  
    // if(req.body.email){
        
    // }

    return res.success({
        data: result,
        message:"register successfully"
    })
})

/**
 * @description : login with username and password
 * @param {Object} req : request for login 
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */

const login = asyncHandler(async() => {
    let {
        email,
        password,
    } = req.body;

    if(!email || !password){
        return res.badRequest({message:"Insufficient request parameters! email or password  is required."})
    }

    let roleAccess = false;

    // let result = await  
})

export {register}