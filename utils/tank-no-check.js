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
function calculateBoxCheckCode(box_no) {
    var boxNo = box_no;
    if (box_no.indexOf('-') > -1) {
        boxNo = box_no.replace('-', '');
    }
    boxNo = boxNo.toUpperCase();
    if (boxNo.length == 11) {
        var letters = boxNo.substr(0, 4).toUpperCase();
       
        var numbers = boxNo.substr(4, 11);
       
        for (var i = 0; i < letters.length; i++) {
            if (letters.charAt(i) < 'A' || letters.charAt(i) > 'Z') {
                return 10;
            }
        }
        for (var i = 0; i < numbers.length; i++) {
            if (numbers.charAt(i) < '0' || numbers.charAt(i) > '9') {
                return 11;
            }
        }
        var ex10 = boxNo.substr(0, 10);
        var sum = 0;
        for (var i = 0; i < 10; i++) {
            var boxDictValue = boxDict[boxNo.charAt(i)];
            sum += boxDictValue * posNums[i];
        }
        var checkCode = (sum % 11).toString();
        if(checkCode == '10'){
          checkCode = '0';
        }

        if (boxNo.substr(10, 1) != checkCode) {
            return 12;
        }
        var box = ex10+'-'+checkCode;
        var boxx = { 'check': true, 'box': box };
        return boxx;
    } else {
        return -1;
    }
    return false;
}

module.exports = {
    calculateBoxCheckCode: calculateBoxCheckCode
}