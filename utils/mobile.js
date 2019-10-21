/**
 * 验证手机号格式--用正则表达式判断手机号格式是否正确
 */
function checkPhoneNumber(phoneNum){
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(phoneNum);
}

/**
 * 获取Storage中WX的手机号
 */
function getPhoneNumber(){
  try {
    let mp = wx.getStorageSync('mobile');
    if (!checkPhoneNumber(mp)) {
      return '';
    }
    console.log('手机号：'+mp);
    return mp;
  } catch (err) {
    console.log('获取storage中手机号发生异常');
    return '';
  }

  return '';
}

/**
 * 获取Storage中WX的手机号
 */
function getWxPhoneNumber() {
  try {
    let mp = wx.getStorageSync('mobile');
    if (!checkPhoneNumber(mp)) {
      return '';
    }
    console.log('手机号：' + mp);
    return mp;
  } catch (err) {
    console.log('获取storage中wx手机号发生异常');
    return '';
  }

  return '';
}

/**
 * 通过Key获取手机号
 */
function getPhoneNumberByKey(phoneKey) {
  try {
    let mp = wx.getStorageSync(phoneKey);
    if (!checkPhoneNumber(mp)) {
      return '';
    }
    console.log('手机号：' + mp);
    return mp;
  } catch (err) {
    console.log('获取storage中手机号发生异常');
    return '';
  }

  return '';
}

/**
 * 保存手机号到Key
 */
function savePhoneNumber(phoneKey, phoneNumber){
  wx.setStorage({
    key: phoneKey,
    data: mPhoneNumber,
  });
}

/**
 * 保存WX手机号到Storage
 */
function saveWxPhoneNumber(phoneNumber){
  wx.setStorage({
    key: 'mobile',
    data: mPhoneNumber,
  });
}


module.exports = {
  checkPhoneNumber: checkPhoneNumber,
  getPhoneNumber: getPhoneNumber,
  getWxPhoneNumber: getWxPhoneNumber,
  getPhoneNumberByKey: getPhoneNumberByKey,
  savePhoneNumber: savePhoneNumber,
  saveWxPhoneNumber: saveWxPhoneNumber
}