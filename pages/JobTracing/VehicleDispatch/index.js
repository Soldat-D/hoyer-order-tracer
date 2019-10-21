// pages/JobTracing/VehicleDispatch/index.js
// pages/cars/cars.js
const BASE64 = require('../../../utils/base64.js');
const MOBILE = require('../../../utils/mobile.js');
var mCaseID;
var mPhoneNumber = '';
var mCarNo = '';
var mDriverName = '';
var mDriverPhone = '';
var mDriverID = '';
var mAuthType = -1;
var mDetailInfo = [];
var mTripSeq;
// var mGPSDev;
var mBoardNo = '';

var mSupercargoName = '';
var mSupercargoTel = '';
var mSupercargoID = '';

var mDrivers = [];
var mTrucks = [];
var mSupercargos = [];
var that;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showSupercargoPanel: false,
        mainScrollViewHeight: 0,

        hsb_ref: '',
        load_add: '',
        unload_add: '',
        cargo_name: '',
        driver_name: '',
        driver_no: '',
        driver_id: '',
        driver_name_1: '',
        driver_no_1: '',
        driver_id_1: '',
        plate_no: '',
        plate_no_1: '',
        trucker_name: '',
        isFold: true, //折叠信息面板
        errorPlateNoTips: '',
        errorDriverTips: '',
        errorPhoneNumTips: '',
        errorDriverIDTip: '',
        errorSupercargoIDTip: '',

        supercargo_name: '',
        supercargo_tel: '',
        supercargo_id: '',

        board_no: '',

        drivers: [],
        trucks: [],
        supercargos: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that = this;
        mCaseID = options.case_id;
        mPhoneNumber = options.phone_number;
        mAuthType = options.auth_type;
        console.log(options);
        mDetailInfo = JSON.parse(options.detail_info);

        // mGPSDev = mDetailInfo.gps_device_no;
        mCarNo = mDetailInfo.plate_no;
        mTripSeq = mDetailInfo.trip_seq;
        mDriverName = mDetailInfo.driver_name;
        mDriverPhone = mDetailInfo.driver_no;
        mDriverID = mDetailInfo.driver_id_no;
        mSupercargoName = mDetailInfo.guard_name;
        mSupercargoID = mDetailInfo.guard_id_no;
        mSupercargoTel = mDetailInfo.guard_no;
        mBoardNo = mDetailInfo.trailer_no;
        if (mBoardNo == '未指定车辆') mBoardNo = '';
        if (mDriverName == '未指定联系人') {
            mDriverName = '';
            mDriverID = '';
            mDriverPhone = '';
        }

        if (mCarNo == '未指定车辆') mCarNo = '';

        if (mSupercargoName == '未指定联系人') {
            mSupercargoName = '';
            mSupercargoID = '';
            mSupercargoTel = '';
        }

        that.setData({
            hsb_ref: options.hsbref,
            cargo_name: options.cargoname,
            driver_name_1: mDriverName,
            driver_no_1: mDriverPhone,
            driver_id_1: mDriverID,
            plate_no_1: mCarNo,
            board_no: mBoardNo,

            supercargo_name: mSupercargoName,
            supercargo_id: mSupercargoID,
            supercargo_tel: mSupercargoTel,
        });
        that.setDetailInfo(that);
        that.calculateScrollViewHeight();
        that.getDriverInfo(JSON.parse(options.drivers_list));
    },
    
    /** 是否显示押运员信息面板 */
    showSupercargoPanel: function () {
        that.setData({
            showSupercargoPanel: !that.data.showSupercargoPanel
        });
    },

    closeSupercargoPanel: function () {
        wx.showModal({
            title: '提示',
            content: '确定不填写押运员信息？',
            confirmColor: '#88c34a',
            cancelText: '取消',
            confirmText: '确定',
            success: res => {
                if (res.confirm) {
                    that.setData({
                        showSupercargoPanel: false,
                        supercargo_name: '',
                        supercargo_id: '',
                        supercargo_tel: ''
                    });
                    mSupercargoID = '';
                    mSupercargoName = '';
                    mSupercargoTel = '';
                }
            }
        });
    },

    /** 输入车牌号 */
    inputCarNo: function (e) {
        mCarNo = e.detail.value;
        if (mCarNo.length == 0) {
            that.setData({
                errorPlateNoTips: '请输入车牌号',
            });
        } else {
            that.setData({
                errorPlateNoTips: ''
            });

            let trucks = [];
            let i = 0;
            for (; i < mTrucks.length; i++) {
                if (mTrucks[i].value.indexOf(mCarNo) != -1) {
                    trucks.push(mTrucks[i]);
                }
            }
            that.setData({
                trucks: trucks
            });
        }
    },

    /** 输入挂板号 */
    inputBoardNo: function (e) { //输入挂板号
        mBoardNo = e.detail.value;
    },


    /** 是否显示业务详细信息 */
    showAll: function (e) {
        this.setData({
            isFold: !this.data.isFold,
        });
    },

    /** 从下拉框选择司机 */
    selectDriver: function (e) {
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let driver = that.data.drivers;
        that.setData({
            driver_no_1: driver[index].tel,
            driver_name_1: driver[index].name,
            driver_id_1: driver[index].id_no,
            drivers: [],
            errorDriverTips: '',
            errorDriverIDTip: '',
            errorPhoneNumTips: ''
        });

        mDriverPhone = driver[index].tel;
        mDriverName = driver[index].name;
        mDriverID = driver[index].id_no;
    },

    /** 从下拉框选择押运员 */
    selectSupercargo: function (e) {
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let supercargos = that.data.supercargos;
        that.setData({
            supercargo_tel: supercargos[index].tel,
            supercargo_name: supercargos[index].name,
            supercargo_id: supercargos[index].id_no,
            supercargos: [],
        });

        mSupercargoTel = supercargos[index].tel;
        mSupercargoName = supercargos[index].name;
        mSupercargoID = supercargos[index].id_no;
    },

    /** 从下拉框选择车牌号 */
    selectPlateNo: function (e) {
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let trucks = that.data.trucks;
        that.setData({
            plate_no_1: trucks[index].value,
            trucks: [],
            errorPlateNoTips: ''
        });

        mCarNo = trucks[index].value;
    },

    /** 输入驾驶员姓名 */
    inputDriverName: function (e) { //输入驾驶员姓名
        mDriverName = e.detail.value;
        console.log(mDriverName);
        if (mDriverName.length == 0) {
            that.setData({
                errorDriverTips: '请输入驾驶员姓名'
            });
        } else {
            that.setData({
                errorDriverTips: ''
            });
            let drivers = [];
            let i = 0;
            for (; i < mDrivers.length; i++) {
                if (mDrivers[i].name.indexOf(mDriverName) != -1) {
                    drivers.push(mDrivers[i]);
                }
            }
            // if(i==mDrivers.length) drivers = [];
            that.setData({
                drivers: drivers
            });
        }
    },

    inputDriverTel: function (e) { //输入驾驶员电话
        mDriverPhone = e.detail.value;
        if (mDriverPhone.length == 0) {
            that.setData({
                errorPhoneNumTips: '请输入驾驶员手机号',
            });
        } else {
            if (!MOBILE.checkPhoneNumber(mDriverPhone)) {
                that.setData({
                    errorPhoneNumTips: '手机号格式错误'
                });
            } else {
                that.setData({
                    errorPhoneNumTips: ''
                });
            }
        }
    },

    inputDriverID: function (e) { //可以为空
        mDriverID = e.detail.value;
        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (mDriverID.length != 0 && !reg.test(mDriverID)) {
            that.setData({
                errorDriverIDTip: '身份证格式错误'
            });
        } else {
            that.setData({
                errorDriverIDTip: ''
            });
        }
    },

    inputSupercargoName: function (e) {
        mSupercargoName = e.detail.value;

        let supercargos = [];
        let i = 0;
        for (; i < mSupercargos.length; i++) {
            if (mSupercargos[i].name.indexOf(mSupercargoName) != -1) {
                supercargos.push(mSupercargos[i]);
            }
        }
        // if(i==mDrivers.length) drivers = [];
        that.setData({
            supercargos: supercargos
        });
    },
    inputSupercargoTel: function (e) {
        mSupercargoTel = e.detail.value;
    },
    inputSupercargoID: function (e) {
        mSupercargoID = e.detail.value;
        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (mDriverID.length != 0 && !reg.test(mSupercargoID)) {
            that.setData({
                errorSupercargoIDTip: '身份证格式错误'
            });
        } else {
            that.setData({
                errorSupercargoIDTip: ''
            });
        }
    },
    setDetailInfo: function (that) {
        that.setData({
            // case_id: mDetailInfo.case_id,
            hsb_ref: mDetailInfo.hsb_ref,
            //   basf_no: mDetailInfo.basf_no,
            load_add: mDetailInfo.load_add,
            unload_add: mDetailInfo.unload_add,
            cargo_name: mDetailInfo.cargo_name,
            driver_name: mDetailInfo.driver_name,
            driver_no: mDetailInfo.driver_no,
            plate_no: mDetailInfo.plate_no,
            trucker_name: mDetailInfo.trucker_name,
        });
    },

    bindGPSDevice: function () {
        var iJobData = that.getJobData(that);
        if (that.checkInfo(that)) {
            wx.showModal({
                title: '提示',
                content: '确定派车？',
                confirmColor: '#88c34a',
                cancelText: '取消',
                confirmText: '确定',
                success: res => {
                    if (res.confirm) {
                        that.submitData(iJobData);
                    }
                }
            });
        }
    },

    /**
     * 提交数据到服务器
     */
    submitData: function (iJobData) {
        let codeData = wx.getStorageSync('codeData');
        wx.showLoading({
            title: '正在上传',
        });
        wx.request({
            url: 'https://www.fastedi.cn/hot/jobData?code_data=' + codeData + '&mobile_num=' + mPhoneNumber + '&job_data=' + iJobData + '&job_sync=' + mAuthType,
            header: {
                // 'content-type': 'application/json' // 默认值
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            data: {},
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
                wx.hideLoading();
                if (res.statusCode == 200) {
                    var iResult = BASE64.base64_decode(res.data);
                    var iJson = JSON.parse(iResult);
                    console.log('上传司机信息返回数据：' + iResult);

                    if (iJson.data == 1) {
                        wx.showToast({
                            title: '上传成功',
                        });
                    } else if (res.data == -4 || iJson.data == -4 || iJobData.auth_type == -4) {
                        wx.showModal({
                            title: '提示',
                            content: '未获取指定车辆在过去24小时内的任何GPS数据，请将车辆通电检查后再尝试派车。',
                            showCancel: false
                        });
                    } else {
                        wx.showToast({
                            title: '上传失败',
                            icon: 'none'
                        });
                    }

                } else {
                    wx.showModal({
                        title: '提示',
                        content: 'Error' + res.statusCode,
                        confirmColor: '#88c34a',
                        confirmText: '确定',
                        showCancel: false
                    });
                }
            },
            fail: function (res) {
                wx.showToast({
                    title: '未知错误',
                    icon: 'none'
                })
            },
        });
    },

    getDriverInfo: function (list) {
        for (let i = 0; i < list.drivers.length; i++) {
            let data = {
                'id': list.drivers[i][0],
                'name': list.drivers[i][1],
                'tel': list.drivers[i][2],
                'id_no': list.drivers[i][3]
            }
            mDrivers.push(data);
            mSupercargos.push(data);
        }

        for (let i = 0; i < list.trucks.length; i++) {
            let data = {
                'id': list.trucks[i][0],
                'value': list.trucks[i][1]
            }

            mTrucks.push(data);
        }
    },

    /**
     * 检查输入信息
     */
    checkInfo: function (that) {
        if (mCarNo.length <= 0) {
            that.setData({
                errorPlateNoTips: '请输入车牌号'
            });
            return false;
        }

        if (mDriverName.length <= 0) {

            that.setData({
                errorDriverTips: '请输入驾驶员姓名'
            });
            return false;
        }

        if (mDriverPhone.length <= 0) {

            that.setData({
                errorPhoneNumTips: '请输入驾驶员手机号'
            });
            return false;

        } else if (!(MOBILE.checkPhoneNumber(mDriverPhone))) {
            that.setData({
                errorPhoneNumTips: '手机号格式错误'
            });
            return false;
        }
        return true;
    },

    /** 封装job_data */
    getJobData: function (that) {

        var iJobData = {
            'job_info': {
                'plate_no': encodeURI(mCarNo),
                'driver_name': encodeURI(mDriverName),
                'driver_no': mDriverPhone,
                'driver_id_no': mDriverID,
                'guard_name': encodeURI(mSupercargoName),
                'guard_no': mSupercargoTel,
                'guard_id_no': mSupercargoID,
                'trailer_no': encodeURI(mBoardNo)
            }
        }

        console.log(iJobData);
        var iJobDataStr = JSON.stringify(iJobData);
        return BASE64.base64_encode(iJobDataStr);
    },

    preventTouchMove: function () { },

    /**
     * 计算scroll View高度 异步
     * 窗口可用高度-已经使用的高度
     */
    calculateScrollViewHeight: function () {
        //hoyer-header 高度
        let myheight = 0;
        let imgheader = wx.createSelectorQuery();
        imgheader.select('.header-container').boundingClientRect();
        imgheader.exec(function (res) {
            console.log(res);
            myheight += res[0].height;

            //业务基础信息高度
            let baseinfo = wx.createSelectorQuery();
            baseinfo.select('.plan-base-info').boundingClientRect();
            baseinfo.exec(function (res1) {
                console.log(res1);
                myheight += res1[0].height;

                let button = wx.createSelectorQuery();
                button.select('.button').boundingClientRect();
                button.exec(function (res2) {

                    console.log(res2);
                    myheight += res2[0].height;

                    //窗口总高度（不是屏幕高度）
                    wx.getSystemInfo({
                        success: function (res) {
                            console.log(res.windowHeight);
                            that.setData({
                                mainScrollViewHeight: res.windowHeight - myheight - 13
                            });
                        },
                    });
                });
            });
        });
    },


})


function searchJobsByKey(key) {
    if (keys != undefined && keys != null && key.length != 0) {
        let keys = key.split(' ');
        console.log('关键词：');
        console.log(keys);
        let jobList = jobListAll;
        for (let i = 0; i < keys.length; i++) {
            let newJobList = [];
            for (let j = 0; j < jobList.length; j++) {
                if (jobList[j].search.indexOf(keys[i].toUpperCase())) {
                    newJobList.push(jobList[j]);
                }
            }

            jobList = newJobList;
        }

        that.setData({
            jobList: jobList
        });
    }
}