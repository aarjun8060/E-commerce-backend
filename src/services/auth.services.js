

/**
 * @description : login user.
 * @param {string} username : username of user.
 * @param {string} password : password of user.
 * @param {string} platform : platform.
 * @param {boolean} roleAccess: a flag to request user`s role access
 * @return {Object} : returns authentication status. {flag, data}
 */

import dayjs from "dayjs";
import { LOGIN_ACCESS, LOGIN_REACTIVE_TIME, MAX_LOGIN_RETRY_LIMIT, PLATFORM,JWT, FORGOT_PASSWORD_WITH } from "../constants.js";
import { dbServiceCreate, dbServiceFindOne, dbServiceUpdateOne } from "../db/dbServices.js";
import { User } from "../models/user.model.js";
import { UserTokens } from "../models/userToken.model.js";
import { sendMail } from "./email.services.js";
import otpGenerator from "otp-generator"
import bcrypt from "bcrypt";

export const loginUser = async (username,password,platform,roleAccess) => {
    try {
        let where;
        if(Number(username)){
            where = {phone:username}
        }else{
            where= {email:username}
        }

        where.isActive = true;
        where.isDeleted = false;

        let user= await dbServiceFindOne(User,where)
        console.log("user",user)
        if(user){
            if(user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT){
                let now = dayjs();
                if(user.loginReactiveTime){
                    let limitTime = dayjs(user.loginReactiveTime)
                    if(limitTime > now){
                        let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute')
                        if(!(limitTime > expireTime)) { 
                            return {
                                flag:true,
                                data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, limitTime)}.`
                            }
                        }

                        await dbServiceUpdateOne(User,{_id:user.id},{
                            loginReactiveTime: expireTime.toISOString(),
                            loginRetryLimit: user.loginRetryLimit + 1
                        })

                        return {
                            flag: true,
                            data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                        }
                    }else{
                        user = await dbServiceUpdateOne(User,{_id:user.id},{
                            loginReactiveTime: '',
                            loginRetryLimit: 0
                        },{new:true})
                    }
                }else{
                    // send error
                    let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute')

                    await dbServiceUpdateOne(User,{
                        _id: user.id, isActive: true, isDeleted: false
                    },{
                        loginReactiveTime: expireTime.toISOString(),
                        loginRetryLimit: user.loginRetryLimit + 1
                    })

                    return {
                        flag: true,
                        data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                    };
                }
            }
        }
        if(password){
            const isPasswordMatch = await user.isPasswordMatch(password)
            console.log("is password",isPasswordMatch)
            if(!isPasswordMatch){
                await dbServiceUpdateOne(User,
                    { _id: user.id, isActive: true, isDeleted: false },
                    { loginRetryLimit: user.loginRetryLimit + 1 });
                return { flag: true, data: 'Incorrect Password' }
            }

            const userData = user.toJSON()
            console.log("userData",userData)
            let token;
            if(!user.userType){
                return { flag: true, data: 'You have not been assigned any role' }
            }
            if(platform == PLATFORM.USERAPP){
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.USERAPP)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                token = await user.generateAccessToken(JWT.USERAPP_SECRET)
            }else if(platform == PLATFORM.ADMIN){
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.ADMIN)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                token = await user.generateAccessToken(JWT.ADMIN_SECRET)
            }

            let expire = dayjs().add(JWT.EXPIRES_IN, 'second').toISOString();
            await dbServiceCreate(UserTokens, { userId: user.id, token: token, tokenExpiredTime: expire });

            let userToReturn = { ...userData, token };
            return { flag: false, data: userToReturn }

        }else{
            return { flag: true, data: 'User not exists' }
        }
        
    } catch (error) {
        return { flag: false, data: 'User not exists' }
        console.log("Error in auth services functions",error.message ? error.message : error)
    }
}


export const sendResetPasswordOTPNotification = async (user) => {
    try {
        console.log("enter sendResetPasswordOTPNotification")
        let resultOfEmail = false
        let where = {
            _id: user.id,
            isActive: true, 
            isDeleted: false,
        }
        let token = otpGenerator.generate(6, { digits:true,lowerCaseAlphabets:false ,upperCaseAlphabets: false, specialChars: false });
        console.log(token)
        let expires = dayjs();

        expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRE_TIME, "minute").toISOString();

        await dbServiceUpdateOne(User, where,{ resetPasswordLink: { code: token, expireTime: expires } });

        if (user.email) {
            let viewType = "/reset-password/";
        
            let mailObj = {
                subject: "Learning Backend Reset Password OTP",
                to: user.email,
                template: "/views/email/OTP/resetPasswordOtp",
                data: {
                    isWidth: true,
                    user: user || '-',
                    token:token
                }
            };
            try {
                await sendMail(mailObj);
                resultOfEmail = true;
            } catch (error) {
                console.log(error);
            }
        }
      
        return { resultOfEmail };
    } catch (error) {
        throw new Error(error.message);
    }
}

export const resetPasswordUser =async (user,newPassword) => {
    try {
        let where = {
            _id: user.id,
            isActive: true, 
            isDeleted: false,
        }
        const dbUser = await dbServiceFindOne(User, where);
        if (!dbUser) {
            return {
                flag: true,
                data: "User not found",
            };
        }
        newPassword = await bcrypt.hash(newPassword, 8);

        await dbServiceUpdateOne(User, where, {
            "password": newPassword,
            resetPasswordLink: {},
            loginRetryLimit: 0
        });
     
        return {
            flag: false,
            data: "Password reset successfully",
        };
    } catch (error) {
        throw new Error(error.message)
    }
}