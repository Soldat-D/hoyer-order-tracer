/**
 * index.js 功能
 * 1.获取手机号，如果长度为0，从服务器获取，在小程序启动时也会进行判断，如果没有则提前进行登陆
 * 2.业务跟踪，先进行扫码，扫码完成后，从服务器获取的auth_type来判断进入哪一个界面，-1， 1， 2， 3
 * 3.进入页面需要进行数据传递，方便后面的页面直接使用已经获得的数据
 */
const BASE64 = require('../../utils/base64.js');
const MOBILE = require('../../utils/mobile.js');
var mPhoneNumber = '';
const TEST = 0;
// const ORDER_TRACE = 1;
// const EXCEPTION_REPORT = 2;
const INFO_QUERY = 3;
const BU_TRACE = 4;
const EXCE_REPO = 5;
const DEV_DELIVERY = 6;
const SCAN_QRCODE = 7;
const CERT_QUERY = '8';
const GPS_INFO = '9';
const G7_STATUS = '10';
const HIDE_INFO_QUERY_DIALOG = '11';
const RECENT_BU = '12';
const BIND_G7 = 13;

var that;

Page({
    data: {
        mobile: '',
        routers: [],
    },

    //页面启动
    onLoad: function() {
        that = this;
        mPhoneNumber = MOBILE.getPhoneNumber(); //获取手机号
        that.setData({
            mobile: mPhoneNumber,
        });

        that.setAllData();
        // unCompleteJob();
    },

    //进入设置界面
    enterSettings() {
        wx.navigateTo({
            url: '/pages/System/Settings/index',
        });
    },

    setAllData: function() {
        // console.log(zh_en);
        let routers = [{
                name: '信息查询',
                value: INFO_QUERY,
                icon: '/images/query.png',
                backgroundColor: '#039af4'
            },
            {
                name: '业务跟踪',
                value: BU_TRACE,
                icon: '/images/trace.png',
                backgroundColor: '#88c34a'
            },
            {
                name: '异常报告',
                value: EXCE_REPO,
                icon: '/images/exception.png',
                backgroundColor: '#ffc107'
            },
            {
                name: '设备交接',
                value: DEV_DELIVERY,
                icon: '/images/delivery.png',
                backgroundColor: '#5cadad'
            },
            {
                name: 'G7设备绑定',
                value: BIND_G7,
                icon: '/images/bind-g7.png',
                backgroundColor: '#eb2996'
            },
            // {
            //     name: '测试',
            //     value: TEST,
            //     icon: '/images/bind-g7.png',
            //     backgroundColor: '#757575'
            // }
        ];

        that.setData({
            routers: routers,
        });
    },

    /**
     * 功能选择--（九宫格）
     */
    functionSelect: function(e) {
        switch (e.currentTarget.dataset.value) {
            case TEST: //测试
                wx.navigateTo({
                    url: '/pages/Test/index',
                });
                break;
            case INFO_QUERY: //信息查询
                wx.showActionSheet({
                    itemList: ['箱证查询', 'GPS信息查询', '近期业务查询'],
                    itemColor: '#757575',
                    success(res) {
                        console.log(res.tapIndex);
                        switch (res.tapIndex) {
                            case 0:
                                wx.navigateTo({
                                    url: '/pages/InformationQuery/TankContainerCA/index?mobile=' + mPhoneNumber,
                                });
                                break;
                            case 1:
                                wx.navigateTo({
                                    url: '/pages/InformationQuery/GPSInformation/index?mobile=' + mPhoneNumber,
                                });
                                break;
                            case 2:
                                wx.navigateTo({
                                    url: '/pages/InformationQuery/RecentJob/index?mobile=' + mPhoneNumber,
                                });
                                break;
                        }
                    },
                    fail(res) {
                        console.log(res.errMsg)
                    }
                });
                break;
            case BU_TRACE: //业务跟踪
                that.recogQRCode(BU_TRACE);
                break;
            case EXCE_REPO: //异常报告
                that.recogQRCode(EXCE_REPO);
                break;
            case DEV_DELIVERY: //设备交接
                wx.navigateTo({
                    url: '/pages/EquipHandover/index?mobile=' + mPhoneNumber,
                });
                break;
            case BIND_G7:
                wx.navigateTo({
                    url: '/pages/DeviceBinding/G7Binding/index?mobile=' + mPhoneNumber,
                });
                break;
        }
    },

    /** 二维码识别  */
    recogQRCode: function(funcType) {
        wx.scanCode({
            success: res => {
                let result = res.result;
                wx.showLoading({
                    title: '正在识别'
                });
                wx.request({
                    url: 'https://www.fastedi.cn/hot/decrypt?code_data=' + result,
                    data: {},
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    method: 'POST',
                    dataType: 'json',
                    responseType: 'text',
                    success: res => {
                        console.log(res);
                        wx.hideLoading();
                        if (res.data == 0) { //服务器返回0 失败
                            wx.showModal({
                                title: '提示',
                                content: '无法识别的二维码',
                                showCancel: false,
                                confirmColor: '#e40012'
                            });
                        } else { //服务器返回json对象
                            switch (funcType) {
                                case BU_TRACE:
                                    that.userAuth(result);
                                    break;
                                case EXCE_REPO:
                                    wx.navigateTo({
                                        url: '/pages/AbnormalReport/index' +
                                            '?mobile=' + mPhoneNumber +
                                            '&code_data=' + JSON.stringify(res.data.da) +
                                            '&code_type=' + (res.data.ct),
                                    });
                                    break;
                            }
                        }
                    }
                });
            }
        });
    },

    /** 从服务器获取手机号 */
    getPhoneNumber: function(e) {
        console.log(e.detail.errMsg);
        // if (e.detail.errMsg == 'getPhoneNumber:fail user deny' || e.detail.errMsg == 'getPhoneNumber:user deny' || e.detail.errMsg == 'getPhoneNumber:user cancel' || e.detail.errMsg == 'getPhoneNumber:fail:user deny' || e.detail.errMsg.indexOf('fail') != -1) {
        if (e.detail.errMsg.indexOf('fail') != -1 || e.detail.errMsg.indexOf('deny') != -1 || e.detail.errMsg.indexOf('cancel') != -1 || e.detail.errMsg.indexOf('ok') == -1) {
            wx.showModal({
                title: '授权失败',
                content: '我们需要获取您的手机号用作小程序身份认证，如果您取消授权或者拒绝授权将无法使用小程序',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#e40012'
            });
            wx.hideLoading();
        } else {
            wx.showLoading({
                title: '获取手机号',
            });

            let iSessionKey = wx.getStorageSync('session_key');
            if (iSessionKey == -1) {
                wx.showModal({
                    title: '提示',
                    content: '获取失败,请退出重试',
                    showCancel: false,
                    confirmColor: '#e40012',
                    success: res => {
                        if (res.confirm) {
                            wx.navigateBack({
                                delta: -1
                            });
                        }
                    },
                });
            }
            let iIv = BASE64.base64_encode(e.detail.iv);
            let iEncryptedData = BASE64.base64_encode(e.detail.encryptedData);
            wx.request({
                url: 'https://www.fastedi.cn/app/decrypt?s_id=' + iSessionKey + '&iv=' + iIv + '&enc_data=' + iEncryptedData,
                data: {},
                header: {
                    'content-type': 'application/json'
                },
                method: 'POST',
                success: function(res) {
                    wx.hideLoading();
                    let iJson = res.data;
                    mPhoneNumber = iJson.purePhoneNumber;
                    wx.setStorage({
                        key: 'mobile',
                        data: mPhoneNumber == '18918470867' ? '16602193263' : mPhoneNumber,
                    });
                    that.setData({
                        mobile: mPhoneNumber
                    });
                }
            });
        }

    },

    /** 用户认证，进入哪一个界面 */
    userAuth: function(iCodeData) {
        wx.showLoading({
            title: '正在识别',
        });
        wx.request({
            url: 'https://www.fastedi.cn/hot/jobData?code_data=' + iCodeData + '&mobile_num=' + mPhoneNumber + '&job_data=&job_sync=&case_id=0',
            // url: 'https://www.fastedi.cn/hot/jobDataTest?code_data=' + iCodeData + '&mobile_num=' + mPhoneNumber + '&job_data=&job_sync=',
            data: {},
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            success: function(res) {
                console.log(res);
                if (res.statusCode != 200) {
                    wx.showModal({
                        title: '提示',
                        content: 'Error: ' + res.statusCode,
                        showCancel: false,
                        confirmColor: '#e40012'
                    });
                    wx.hideLoading();
                    return;
                }
                let iJson = JSON.parse(BASE64.base64_decode(res.data)); //解码为json对象
                let iAuthType = iJson.auth_type;
                // let iAuthType = 3;
                let iCaseID, iHsbRef, iCargoName;
                var iPlans = [];
                var iPlansDetailInfo = [];

                console.log(iJson);
                wx.hideLoading();
                if (iAuthType == 1 || iAuthType == 2 || iAuthType == 3) { //authType= 1:HOYER调度 2:车队调度 3:司机操作
                    //   iBasfno = iJson.data.job_info.basf_no;
                    iHsbRef = iJson.data.job_info.hsb_ref;
                    iCaseID = iJson.data.job_info.case_id;

                    wx.setStorageSync('codeData', iCodeData);

                    iCargoName = iJson.data.job_info.cargo_name;
                    if (iAuthType == 3) {
                        iPlans = JSON.stringify(iJson.data);
                    }
                    if (iAuthType == 2) {
                        iPlansDetailInfo = JSON.stringify(iJson.data.job_info);
                    }
                }

                var iJobData = '';
                if (iAuthType == 32 || iAuthType == 33) {
                    iJobData = JSON.stringify(iJson.data);
                }
                console.log(iJobData);
                switch (iAuthType) {
                    case 0:
                    case -1:
                        wx.showModal({
                            content: '您没有权限操作此业务',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case -2:
                        wx.showModal({
                            content: '该业务不存在',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case -3:
                        wx.showModal({
                            content: '操作超时',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case -31:
                        wx.showModal({
                            content: '操作顺序错误，请先扫描其他二维码',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case -99:
                        wx.showModal({
                            content: '无法识别的二维码',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case 1: //HOYER 调度 选择车队界面 -- 暂未上线
                        wx.showModal({
                            content: '即将上线',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case 2: //车队调度 选择司机和车辆
                        wx.navigateTo({
                            url: '/pages/JobTracing/VehicleDispatch/index?case_id=' + iCaseID +
                                '&hsbref=' + iHsbRef +
                                '&cargoname=' + iCargoName +
                                '&phone_number=' + mPhoneNumber +
                                '&auth_type=' + iAuthType +
                                '&detail_info=' + iPlansDetailInfo +
                                '&drivers_list=' + JSON.stringify(iJson.info)
                        });
                        break;
                    case 3: //当班司机 业务操作
                        wx.navigateTo({
                            url: '/pages/JobTracing/JobOperation/index?case_id=' + iCaseID +
                                '&phone_number=' + mPhoneNumber +
                                '&plans=' + iPlans +
                                '&auth_type=' + iAuthType,
                        });
                        break;
                    case 33: //气体业务司机
                        wx.showModal({
                            content: '即将上线',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    case 32: //气体业务调度
                        wx.showModal({
                            content: '即将上线',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                        break;
                    default:
                        wx.showModal({
                            content: '未知错误',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#e40012'
                        });
                }
            }
        });
    },

    preventTouchMove: function() {},

});

function unCompleteJob() {
    try {
        let codeData = wx.getStorageSync('codeData');
        if (codeData != null && codeData != undefined) {
            if (codeData.auth_type == 3) {
                wx.showModal({
                    title: '提示',
                    content: '业务' + codeData.hsb_ref + '还未完成是否继续？',
                    success: res => {
                        if (res.confirm) {
                            that.userAuth(codeData.code_data);
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
}