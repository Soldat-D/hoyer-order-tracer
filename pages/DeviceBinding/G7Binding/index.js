// pages/DeviceBinding/G7Binding/index.js
const BASE64 = require('../../../utils/base64.js');
var mTel;
var that;
var mCaseID;
var mG7;
var mOriginG7;
var tripSeq = 0;

Page({
    data: {
        showInfoPanel: false,
        containerHeight: 0,
        forceBinding: 0,
        business_number: '',
        product: '',
        address: '',
        driver_name: '',
        driver_phone: '',
        plate_no: '',

        g7_number: '',
    },

    onLoad: function (options) {
        mTel = options.mobile;
        that = this;
        tripSeq = options.trip_seq;
        setContainerHeight();
    },

    scanBusinessQRCode: function () {
        wx.scanCode({
            success: res => {
                getTripSeq(res.result);
                getBusinessData(res.result);
            }
        });
    },

    scanG7Code: function () {
        wx.scanCode({
            success: res => {
                that.setData({
                    g7_number: res.result
                });
                mG7 = res.result;
            }
        });
    },

    inputG7Code: function (e) {
        mG7 = e.detail.value;
        that.setData({
            g7_number: e.detail.value
        });
    },

    forceBindDevice: function (e) {
        that.setData({
            forceBinding: that.data.forceBinding == 0 ? 1 : 0
        });
    },

    bindG7: function () {
        if (mG7.length != 0) {
            if (mOriginG7 != mG7) {
                bindG7WithBusiness();
            } else {
                wx.showModal({
                    title: '提示',
                    content: '该设备已与此业务绑定',
                    showCancel: false,
                    confirmText: '确定',
                });
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '请扫码或手动输入G7的编号',
                showCancel: false,
                confirmText: '确定',
            });
        }
    }

});

function bindG7WithBusiness() {
    wx.showLoading({
        title: 'G7绑定中'
    });

    wx.request({
        url: 'https://www.fastedi.cn/hot/sevenBinding?case_id=' + mCaseID + '&device_no=' + mG7 + '&trip_seq=' + tripSeq + '&force_binding=' + that.data.forceBinding, //job data trip编号
        header: {
            'content-type': 'application/json' // 默认值
        },
        data: {},
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: res => {
            wx.hideLoading();
            console.log('绑定GPS返回数据：' + res.data);
            if (res.statusCode == 200) {
                let tips = '';
                let success = false;
                switch (res.data) {
                    case 2:
                        success = true;
                        break;
                    case 1:
                        success = true;
                        break;
                    case 0: //---以下均为绑定失败---
                        tips = '信息缺失，无case id或无device no';
                        success = false;
                        break;
                    case -1:
                        tips = '业务模式不支持绑定G7设备';
                        success = false;
                        break;
                    case -2:
                        tips = '不可识别的G7设备';
                        success = false;
                        break;
                    case -3:
                        tips = 'G7设备电量过低';
                        success = false;
                        break;
                    case -4:
                        tips = 'G7设备长时间无数据更新，建议开机3小时后再使用';
                        success = false;
                        break;
                }
                if (success) {
                    if (res.data == 1) { // 1: 绑定成功。
                        wx.showModal({
                            title: '提示',
                            content: 'G7设备绑定成功',
                            showCancel: false,
                            confirmText: '确定',
                        });
                    }
                    if (res.data == 2) { //2:  绑定成功，但是需要显示警告：该G7设备较长时间无数据更新，可能是关机所致。但如之前未关机，建议更换设备重新绑定。
                        wx.showModal({
                            title: '警告',
                            content: '该G7设备较长时间无数据更新，可能是关机所致。但如之前未关机，建议更换设备重新绑定',
                            showCancel: false,
                            confirmText: '确定',
                        });

                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: tips,
                        showCancel: false,
                        confirmText: '确定',
                    });
                }
            } else {
                wx.showModal({
                    title: '提示',
                    content: 'Error' + res.statusCode,
                    confirmText: '确定',
                    showCancel: false
                });
            }
        }
    });
}

function getTripSeq(jobQRCode) {
    wx.request({
        url: 'https://www.fastedi.cn/hot/decrypt?code_data=' + jobQRCode,
        data: {},
        header: {
            'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: res => {
            console.log(res.data);
            tripSeq = res.data.da.tr;

            if (tripSeq == undefined || tripSeq == null) {
                tripSeq = 0;
            }

            console.log('tripSeq:' + tripSeq);
        }
    });
}

function getBusinessData(businessNumber) {
    wx.showLoading({
        title: '获取业务数据',
    });
    wx.request({
        url: 'https://www.fastedi.cn/hot/jobData?code_data=' + businessNumber + '&mobile_num=' + mTel + '&job_data=&job_sync=&case_id=0',
        data: {},
        header: {
            'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: res => {
            if (res.statusCode == 200) {
                let result = JSON.parse(BASE64.base64_decode(res.data)); //解码为json对象
                console.log(result);
                if (result.auth_type == 2) {
                    let gps_type = result.data.job_info.gps_device_type;
                    // gps_type = 4;
                    if (gps_type != null && gps_type != undefined && (gps_type == 0 || gps_type == 4)) {
                        mCaseID = result.data.job_info.case_id;
                        mOriginG7 = result.data.job_info.gps_device_no;
                        that.setData({
                            showInfoPanel: true,
                            business_number: result.data.job_info.hsb_ref,
                            product: result.data.job_info.cargo_name,
                            address: result.data.job_info.unload_add,
                            driver_name: result.data.job_info.driver_name,
                            driver_phone: result.data.job_info.driver_no,
                            plate_no: result.data.job_info.plate_no,
                            g7_number: mOriginG7
                        });
                        mG7 = mOriginG7;
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '该业务不需要绑定G7设备',
                            showCancel: false,
                            confirmText: '确定',
                        });
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '您暂时无法使用该功能',
                        showCancel: false,
                        confirmText: '确定',
                    });
                }
            } else {
                wx.showModal({
                    title: '提示',
                    content: 'Error:' + res.statusCode,
                    showCancel: false,
                    confirmText: '确定',
                });
            }
            wx.hideLoading();
        }
    });
}

function setContainerHeight() {
    //hoyer-header 高度
    let myheight = 0;
    let imgheader = wx.createSelectorQuery();
    imgheader.select('.header-container').boundingClientRect();
    imgheader.exec(function (res) {
        console.log(res);
        myheight += res[0].height;

        wx.getSystemInfo({
            success: function (res) {
                console.log(res.windowHeight);
                that.setData({
                    containerHeight: res.windowHeight - myheight
                });
            },
        });
    });
}