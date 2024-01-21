

/**
 * @description : login user.
 * @param {string} username : username of user.
 * @param {string} password : password of user.
 * @param {string} platform : platform.
 * @param {boolean} roleAccess: a flag to request user`s role access
 * @return {Object} : returns authentication status. {flag, data}
 */

import dayjs from "dayjs";
import { LOGIN_REACTIVE_TIME, MAX_LOGIN_RETRY_LIMIT, PLATFORM } from "../constants";
import { dbServiceFindOne, dbServiceUpdateOne } from "../db/dbServices";

const loginUser = async (username,password,platform,roleAccess) => {
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

            if(!isPasswordMatch){
                await dbService.updateOne(User,
                    { _id: user.id, isActive: true, isDeleted: false },
                    { loginRetryLimit: user.loginRetryLimit + 1 });
                return { flag: true, data: 'Incorrect Password' }
            }

            const userData = user.toJSON()

            let token;
            if(!user.userType){
                return { flag: true, data: 'You have not been assigned any role' }
            }
            if(platform == PLATFORM.USERAPP){
                // if(!LOG)
            }else if(platform == PLATFORM.ADMIN){

            }
        }
        
    } catch (error) {
        console.log("Error in auth services functions",error.message ? error.message : error)
    }
}

export default {
    loginUser
}