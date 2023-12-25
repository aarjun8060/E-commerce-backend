/**
 * auth.Controller.js
 * @description :: exports All authentication methods and controller for User
 */

import { USER_TYPES } from "../../../constants.js";
import { User } from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js"
import { validateParamsWithJoi } from "../../../utils/validateRequest.js";
import { schemaKeys } from "../../../utils/validation/userValidation.js";
import dbServices from "../../../db/dbServices.js"
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

    // check data avaible in database or not
    if(req.body.email){
        // let checkUniqueFields = await 
    }else if(req.body.phone){

    }
     
    // create  User
    const result = await dbServices.create(User,data);
    return res.success({
        data: result,
        message:"register successfully"
    })
})

export {register}