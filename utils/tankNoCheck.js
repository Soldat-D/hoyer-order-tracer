var boxDict = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'A': 10,
    'B': 12,
    'C': 13,
    'D': 14,
    'E': 15,
    'F': 16,
    'G': 17,
    'H': 18,
    'I': 19,
    'J': 20,
    'K': 21,
    'L': 23,
    'M': 24,
    'N': 25,
    'O': 26,
    'P': 27,
    'Q': 28,
    'R': 29,
    'S': 30,
    'T': 31,
    'U': 32,
    'V': 34,
    'W': 35,
    'X': 36,
    'Y': 37,
    'Z': 38
};
var posNums = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
/**
 * 箱号验证
 *  返回
 * -1 不够11位，
 * 10 前四位不是字母，
 * 11 后7位不是数字, 
 * 12 非法箱号， 验证码不匹配
 * true 正确的箱号, 
 * false 未知错误
 */
function checkTankContainerCode(tankNumber) {
    // var boxNo = box_no;
    if (tankNumber.indexOf('-') > -1) {
        tankNumber = tankNumber.replace('-', '');
    }
    // boxNo = boxNo.toUpperCase();
    if (tankNumber.length == 11) {
        let letters = tankNumber.substr(0, 4);
        let numbers = tankNumber.substr(4, 11);

        for (let i = 0; i < letters.length; i++) {
            if (letters.charAt(i) < 'A' || letters.charAt(i) > 'Z') {
                return { 'tankNumber': tankNumber, 'error': true, 'desc': '前四位必须是字母' };
            }
        }
        for (let i = 0; i < numbers.length; i++) {
            if (numbers.charAt(i) < '0' || numbers.charAt(i) > '9') {
                return { 'tankNumber': tankNumber, 'error': true, 'desc': '后7位只能是数字' };
            }
        }
        let ex10 = tankNumber.substr(0, 10);
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            let boxDictValue = boxDict[tankNumber.charAt(i)];
            sum += boxDictValue * posNums[i];
        }
        let checkCode = (sum % 11).toString();
        if (checkCode == '10') {
            checkCode = '0';
        }

        if (tankNumber.substr(10, 1) != checkCode) {
            return { 'tankNumber': tankNumber, 'error': true, 'desc': '非法箱号' };
        }

        tankNumber = ex10 + '-' + checkCode;
        return { 'tankNumber': tankNumber, 'error': false, 'desc': '' };

    } else {
        return { 'tankNumber': tankNumber, 'error': true, 'desc': '请输入11位箱号' };
    }
    return { 'tankNumber': tankNumber, 'error': true, 'desc': '未知错误' };;
}

module.exports = {
    checkTankContainerCode: checkTankContainerCode
}