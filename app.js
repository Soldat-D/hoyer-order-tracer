App({
  onLaunch: function() {
    //强制更新到新版本
    const mUpdateManager = wx.getUpdateManager();
    mUpdateManager.onCheckForUpdate(function(res) {
      console.log(res.hasUpdate);
    });
    mUpdateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，请重启应用',
        showCancel: false,
        confirmColor: '#e40012',
        success: function(res) {
          if (res.confirm) {
            mUpdateManager.applyUpdate();
          }
        }
      })
    });

    mUpdateManager.onUpdateFailed(function() {}); //新版本下载失败

    var iThis = this;
    //如果有手机号则直接进入小程序，如果没有则进行登陆，方便在后面的页面中获取手机号

    try {
      var iPhoneNum = wx.getStorageSync('mobile');
      if (iPhoneNum == undefined || iPhoneNum == '<N/A>' || iPhoneNum == null) {
        iThis.login(iThis);
      } else if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(iPhoneNum)) { //判断是不是正常的11位手机号吗
        console.log(res.data);
        iThis.login(iThis);
      }

    } catch (err) {
      console.log('获取storage中手机号发生异常');
      iThis.login(iThis);
    }
  },

  login: function(iThis) {
    wx.login({
      success: res => {
        console.log(res);
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://www.fastedi.cn/app/wxlogin?js_code=' + res.code,
            success: res => {
              console.log(res.data);
              if (res.data == '0') {
                console.log('登录失败！' + res.errMsg)
                try {
                  wx.setStorageSync('session_key', -1);
                } catch (e) {
                  console.log(e);
                }
              } else {
                console.log('登录成功！' + res.errMsg)
                try {
                  if (res.data != 'wxError') {
                    wx.setStorageSync('session_key', res.data);
                  } else {
                    console.log('登录失败！' + res.errMsg)
                    wx.setStorageSync('session_key', -1);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            },
            fail: res => {
              console.log('登录失败！网络错误' + res.errMsg)
              try {
                wx.setStorageSync('session_key', -1);
              } catch (e) {
                console.log(e);
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg);
          try {
            wx.setStorageSync('session_key', -1);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }
})