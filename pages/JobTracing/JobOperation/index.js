const BASE64 = require('../../../utils/base64.js');
const STRING = require('../../../utils/string.js');
var caseid;
var mobilePhone;
var plan;
var latitude, longitude, altitude;
var locateDeny = false;
var that;
var authType;
var mIs1369 = false;
var events;


const ANY_PIC = '1';
const RECEIPT = '2';
const UNLOAD_CHECK = '3';
const WEIGHT_FORM = '4';
const TEMP_REC_FORM = '5';

Page({
    /**
     * 页面的初始数据
     */
    data: {
        imageWidth: 0,
        nodes: [],
        scrollview_height: 0,
        is1369: false,
        receipt_img: '/images/icon_add.png',
        unload_check_img: '/images/icon_add.png',
        weight_img: '/images/icon_add.png',
        temp_rec_img: '/images/icon_add.png',
        hsb_ref: '',
        cargo_name: '',
        // basf_no: '',
        load_add: '',
        unload_add: '',
        driver_name: '',
        driver_no: '',
        plate_no: '',
        trucker_name: '',

        isFold: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that = this;
        events = {
            'start_load': '到达装货点',
            'end_load': '装货完成',
            'start_unload': '到达卸货点',
            'end_unload': '卸货完成'
        }

        caseid = options.case_id;
        authType = options.auth_type;
        plan = JSON.parse(options.plans);
        mobilePhone = options.phone_number;
        that.calculateScrollViewHeight();
        that.setBaseInfo();
        that.getLocation();
        that.setImageWidth();
        that.setData({
            is1369: plan.customer_id == 1369?true:false
        });
    },

    /**
     * 上传数据
     */
    submitData: function (e) {
        let index = e.currentTarget.dataset.index;
        let myNodes = that.data.nodes;
        let loadData = that.loadJobData(myNodes[index].node_name, myNodes[index].pics);
        let jobData = loadData.job_data;
        let actualTime = loadData.actual_time;
        let codeData = wx.getStorageSync('codeData');
        console.log(codeData);
        if (myNodes[index].node_name == 'end_unload' && myNodes[index].pics.length == 0) {
            wx.showModal({
                title: '提示',
                content: '卸货完成必须对磅单进行拍照上传!请至少添加一张照片',
                showCancel: false,
                confirmColor: '#88c34a'
            });
            return;
        }

        if (mIs1369 && myNodes[index].node_name == 'end_unload' && myNodes[index].pics.length != 4) {
            wx.showModal({
                title: '提示',
                content: '请将所有照片拍摄完成后再上传数据',
                showCancel: false,
                confirmColor: '#88c34a'
            });
            return;
        }
        wx.showModal({
            title: '提示',
            content: '该操作将会上传数据，并不可撤销，确认上传吗？',
            confirmColor: '#88c34a',
            cancelText: '取消',
            success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在上传',
                    });
                    console.log('codeData:');
                    console.log(codeData);
                    wx.request({
                        // url: 'https://www.fastedi.cn/hot/jobData?case_id=' + caseid + '&mobile_num=' + mobilePhone + '&job_data=' + jobData + '&job_sync=' + authType,

                        url: 'https://www.fastedi.cn/hot/jobData?code_data=' + codeData + '&mobile_num=' + mobilePhone + '&job_data=' + jobData + '&job_sync=' + authType,

                        data: {},
                        header: {},
                        method: 'POST',
                        responseType: 'text',
                        success: res => {
                            console.log(res);
                            wx.hideLoading();
                            if (res.statusCode == 200) {
                                let result = JSON.parse(BASE64.base64_decode(res.data));
                                if (result.data == 1) { //上传成功
                                    wx.showToast({
                                        title: '上传成功',
                                    });

                                    myNodes[index].show_buttons = false;
                                    myNodes[index].show_pics = false;
                                    if (myNodes[index].pics.length > 0) {
                                        myNodes[index].show_pics_btn = true;
                                    } else {
                                        myNodes[index].show_pics_btn = false;
                                    }
                                    myNodes[index].actual_time = actualTime;
                                    that.setData({
                                        nodes: myNodes
                                    });
                                    
                                    // if (myNodes[index].node_name == 'end_unload'){
                                    //     wx.setStorageSync("codeData", null);
                                    // }

                                } else {
                                    wx.showToast({
                                        title: '上传失败',
                                        icon: 'none'
                                    });
                                }
                            } else {
                                wx.showModal({
                                    title: '上传失败',
                                    content: 'Error：' + res.statusCode,
                                    showCancel: false,
                                    confirmColor: '#88c34a'
                                });
                            }
                        }
                    });
                }
            }
        });

    },

    /**
     * 打开相机拍照并上传照片--最多添加6张照片
     */
    selectPicture: function (e) {
        let value = e.currentTarget.dataset.value;
        let index = e.currentTarget.dataset.index;
        let myNodes = that.data.nodes;
        let pics = myNodes[index].pics;
        let position = 0;
        switch (value) {
            case ANY_PIC:
                if (pics.length >= 8) {
                    wx.showModal({
                        title: '提示',
                        content: '最多可添加8张照片',
                        showCancel: false,
                        confirmColor: '#88c34a'
                    });
                    return;
                }
                wx.chooseImage({
                    count: 1,
                    sourceType: ['camera'],
                    sizeType: ['original'],
                    success: function (res) {
                        let t = res.tempFilePaths;
                        console.log(t);
                        wx.showLoading({
                            title: '图片上传中',
                        });
                        wx.uploadFile({
                            url: 'https://www.fastedi.cn/hot/imgUpload',
                            filePath: t[0],
                            name: 'img_file',
                            success: res => {
                                let imgUrl = JSON.parse(BASE64.base64_decode(res.data)).imgUrl;
                                pics.push(imgUrl);
                                myNodes[index].pics = pics;
                                myNodes[index].show_pics = true;
                                that.setData({
                                    nodes: myNodes
                                });
                                console.log(pics);
                                wx.hideLoading();
                            }
                        });
                    },
                });
                return;
            case RECEIPT:
                position = 0;
                break;
            case UNLOAD_CHECK:
                position = 1;
                break;
            case WEIGHT_FORM:
                position = 2;
                break;
            case TEMP_REC_FORM:
                position = 3;
                break;
        }

        wx.chooseImage({
            count: 1,
            sourceType: ['camera'],
            sizeType: ['original'],
            success: function (res) {
                let t = res.tempFilePaths;
                console.log(t);
                wx.showLoading({
                    title: 'imgUploading',
                });
                wx.uploadFile({
                    url: 'https://www.fastedi.cn/hot/imgUpload',
                    filePath: t[0],
                    name: 'img_file',
                    success: res => {

                        let imgUrl = JSON.parse(BASE64.base64_decode(res.data)).imgUrl;
                        // pics.push(imgUrl);
                        // pics.splice(position, 1, imgUrl);
                        pics[position] = imgUrl;
                        myNodes[index].pics = pics;
                        switch (position) {
                            case 0:
                                that.setData({
                                    receipt_img: imgUrl
                                });
                                break;
                            case 1:
                                that.setData({
                                    unload_check_img: imgUrl
                                });
                                break;
                            case 2:
                                that.setData({
                                    weight_img: imgUrl
                                });
                                break;
                            case 3:
                                that.setData({
                                    temp_rec_img: imgUrl
                                });
                                break;

                        }
                        // myNodes[index].show_pics = true;
                        that.setData({
                            nodes: myNodes
                        });
                        console.log(pics);
                        wx.hideLoading();
                    }
                });
            },
        });
    },

    /**
     * 解析plan数据并显示
     */
    dePlanInfo: function () {

        let milestones = ['start_load', 'end_load', 'start_unload', 'end_unload'];
        let tripIndex = plan.trips.length - 1;
        if (plan.trips[tripIndex].milestones != null && plan.trips[tripIndex].milestones != undefined && plan.trips[tripIndex].milestones.length > 0) {
            milestones = plan.trips[tripIndex].milestones;
        }
        console.log("PlanMileStones:" + plan.trips[tripIndex].milestones);
        console.log("mileStones:" + milestones);
        let nodes = [];
        let myNodes = [];
        for (let i = 0; i < milestones.length; i++) {
            let nodeName = milestones[i];
            nodes.push(plan.nodes[nodeName]);
        }

        let node = {};

        for (let i = 0; i < nodes.length; i++) {

            if (nodes[i].actual_time.length == 0) {
                //当前任务
                node = {
                    'event': events[milestones[i]],
                    'node_name': milestones[i],
                    'plan_time': nodes[i].plan_time,
                    'actual_time': nodes[i].actual_time,
                    'show_pics': false,
                    'show_pics_btn': false,
                    'show_buttons': true,
                    'pics': []
                };
                myNodes.unshift(node);
                break;
            }

            node = {
                'event': events[milestones[i]],
                'node_name': milestones[i],
                'plan_time': nodes[i].plan_time,
                'actual_time': nodes[i].actual_time,
                'show_pics': false,
                'show_pics_btn': nodes[i].file.length > 0,
                'show_buttons': false,
                'pics': nodes[i].file
            };
            myNodes.unshift(node);
        }
        that.setData({
            nodes: myNodes
        });
    },

    showPictures: function (e) {
        let index = e.currentTarget.dataset.index;
        let nodes = that.data.nodes;
        let node = nodes[index];
        console.log(node);
        node["show_pics"] = !node["show_pics"];
        that.setData({
            nodes: nodes
        });
    },

    /**
     * 获取定位
     */
    getLocation: function () {
        wx.showLoading({
            title: '定位中',
        });
        wx.getLocation({
            type: 'gcj02',
            altitude: true,
            success: res => {
                console.log(res);
                latitude = res.latitude;
                longitude = res.longitude;
                altitude = res.altitude;
                wx.hideLoading();
                that.dePlanInfo(); //定位成功，解析数据
            },
            fail: res => {
                // console.log(res);
                wx.hideLoading();
                if (res.errMsg === 'getLocation:fail auth deny' || res.errMsg === 'getLocation:fail:auth denied') { //小程序定位授权失败
                    wx.showModal({
                        title: '定位失败',
                        content: '请打开小程序定位开关',
                        confirmColor: '#88c34a',
                        confirmText: '去设置',
                        cancelText: '取消',
                        success: res => {
                            if (res.confirm) {
                                wx.openSetting({
                                    success: res => {
                                        console.log(res);
                                        // that.getLocation();
                                        wx.navigateBack({
                                            delta: 1
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
                if (res.errCode == -2 || res.errMsg === 'getLocation:fail:system permission denied') { //微信系统定位未授权
                    wx.showModal({
                        title: '授权失败',
                        content: '请先打开系统设置中微信的定位权限',
                        showCancel: false,
                        confirmColor: '#88c34a'
                    });
                }
            },
        });
    },

    /**
     * Set Detail Info in head pannel
     */
    setBaseInfo: function () {
        that.setData({
            hsb_ref: plan.job_info.hsb_ref,
            cargo_name: plan.job_info.cargo_name,
            // basf_no: plan.job_info.basf_no,
            load_add: plan.job_info.load_add,
            unload_add: plan.job_info.unload_add,
            driver_name: plan.job_info.driver_name,
            driver_no: plan.job_info.driver_no,
            plate_no: plan.job_info.plate_no,
            trucker_name: plan.job_info.trucker_name,
        });
    },

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
                //窗口总高度（不是屏幕高度）
                wx.getSystemInfo({
                    success: function (res) {
                        console.log(res.windowHeight);
                        that.setData({
                            scrollview_height: res.windowHeight - myheight
                        });
                    },
                });
            });
        });
    },

    setImageWidth: function () {
        let width = wx.getSystemInfoSync().windowWidth;
        that.setData({
            imageWidth: width / 4 - 25
        });
    },

    /**
     * 显示更多信息
     */
    showAll: function (e) {
        that.setData({
            isFold: !that.data.isFold,
        });
    },

    loadJobData: function (nodeName, files) {
        let actualTime = STRING.formatTime(new Date());
        let jobData = {
            'node_name': nodeName,
            data: {
                'actual_time': actualTime,
                'lat': latitude,
                'lon': longitude,
                'alt': altitude,
                'file': files
            }
        };
        console.log(jobData);
        console.log(JSON.stringify(jobData));
        return {
            'job_data': BASE64.base64_encode(JSON.stringify(jobData)),
            'actual_time': actualTime
        };
    }
});