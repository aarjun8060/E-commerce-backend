
/**
 * convertObjectToEnum : converts object to enum
 * @param {Object} obj : object to be converted
 * @return {Array} : converted Array
 */
export const convertObjectToEnum = (obj) => {
    const enumArr = [];
    Object.values(obj).map((val) => enumArr.push(val));
    return enumArr;
}