const STRING = require('../../../utils/string.js');
const QQMapWx = require('../../../lib/qqmap-wx-jssdk.min.js');
const MOBILE = require('../../../utils/mobile.js');

var that;

Page({

    data: {
        myInfo: [],
        gpsInfo: [],
        systemInfo: [],
        time: '',
        alert: '',
    },

    onLoad: function(options) {
        that = this;
        that.setData({
            time: STRING.formatTime(new Date())
        });
        getMyInfo();
        getSystemInfo();
        getGPSInfo();
    },
});

function getSystemInfo() {
    let systemInfoRes = wx.getSystemInfoSync();
    let systemInfo = [{
            name: '手机品牌',
            value: systemInfoRes.brand
        },
        {
            name: '手机型号',
            value: systemInfoRes.model
        },
        {
            name: '微信版本',
            value: systemInfoRes.version
        },
        {
            name: '操作系统版本',
            value: systemInfoRes.system
        },
        {
            name: '操作系统',
            value: systemInfoRes.platform
        },
        {
            name: '系统GPS开关',
            value: systemInfoRes.locationEnabled
        }
    ];

    that.setData({
        systemInfo: systemInfo
    });
}

function getMyInfo() {
    let myInfo = [{
        name: '手机号',
        value: MOBILE.getPhoneNumber()
    }];
    that.setData({
        myInfo: myInfo
    });
}

function getGPSInfo() {
    let qqmapsdk = new QQMapWx({
        key: 'QZRBZ-QW43W-4HXRY-OMTY5-JJB5V-DGBCH'
    });
    let gpsInfo = [];
    wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: res => {
            console.log('当前位置经纬度：');
            console.log(res);

            gpsInfo.push({
                name: '经度',
                value: res.longitude
            });
            gpsInfo.push({
                name: '纬度',
                value: res.latitude
            });
            gpsInfo.push({
                name: '高度',
                value: res.altitude
            });
            gpsInfo.push({
                name: '速度',
                value: res.speed
            });
            gpsInfo.push({
                name: '精度',
                value: res.accuracy
            });
            that.setData({
                gpsInfo: gpsInfo
            });
            qqmapsdk.reverseGeocoder({
                location: {
                    latitude: res.latitude,
                    longitude: res.longitude
                },
                success: function(res) {
                    console.log('当前位置：');
                    console.log(res.result.address);

                    gpsInfo.push({
                        name: '当前位置',
                        value: res.result.address
                    });
                    that.setData({
                        gpsInfo: gpsInfo
                    });
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        },
        fail: res => {
            if (res.errMsg === 'getLocation:fail auth deny' || res.errMsg === 'getLocation:fail:auth denied') { //小程序定位授权失败
                that.setData({
                    alert: '小程序定位未授权'
                });
            } else if (res.errCode == -2 || res.errMsg === 'getLocation:fail:system permission denied') { //微信系统定位未授权
                that.setData({
                    alert: '微信GPS未授权'
                });
            } else { //一般情况为未打开系统的GPS定位
                that.setData({
                    alert: 'GPS未知错误'
                });
            }
        },
    });
}