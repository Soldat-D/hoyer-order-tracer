// pages/EquipHandover/EquipHandover.js
// pages/EquipmentHandover/EquipmentHandover.js
const TANK_NO_CHECK = require('../../utils/tankNoCheck.js');
const BASE64 = require('../../utils/base64.js');
const QQMapWx = require('../../lib/qqmap-wx-jssdk.min.js');
const DEVICE_POSTION = ['前面', '左侧', '底部', '右侧', '顶部'];

var that, mobile, tankNumber, codeData = '',
    location = {
        'longitude': 0,
        'latitude': 0,
        'altitude': 0,
        'address': 'UNKNOW'
    };

Page({
    data: {
        errorTankNumber: true,
        showHandOverBtn: false,
        modalName: '',
        modalTips: '',
        loadModal: false,
        loadModalTips: '',
        tankNumber: '',
        stateTips: '',
        tabCur: 0,
        devicePostion: DEVICE_POSTION,
        currentItem: []
    },

    onLoad: function (options) {
        that = this;
        mobile = options.mobile;
        getLocation();
        console.log(deviceCheckPos[0]);
        that.setData({
            currentItem: deviceCheckPos[0]
        });
    },

    tabSelect(e) {
        that.setData({
            tabCur: e.currentTarget.dataset.id,
            currentItem: deviceCheckPos[e.currentTarget.dataset.id]
        });
    },

    showHandOverList() {
        that.setData({
            showHandOverBtn: false,
            errorTankNumber: false,
        });
        //清空数据
    },

    tankNumberInput: function (e) {
        let result = TANK_NO_CHECK.checkTankContainerCode(e.detail.value.toUpperCase());
        tankNumber = result.tankNumber;
        that.setData({
            tankNumber: result.tankNumber,
            // errorTankNumber:result.error,
            showHandOverBtn: !result.error,
            stateTips: result.desc
        });
    },

    cleanText: function () {
        tankNumber = '';
        that.setData({
            tankNumber: tankNumber,
            stateTips: '',
            showHandOverBtn: false
        });
    },

    radioChange(e) {
        console.log('Radio Change:');
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let currentItem = that.data.currentItem;
        let tabCur = that.data.tabCur;
        currentItem.checkItems[index].value = e.detail.value;
        deviceCheckPos[tabCur].checkItems[index].value = e.detail.value;
        that.setData({
            currentItem: currentItem
        });
        console.log('检查后的Item：');
        console.log(deviceCheckPos[tabCur]);
    },

    addPhotos() {
        wx.chooseImage({
            sourceType: ['camera'],
            sizeType: ['original'],
            success: function (res) {
                uploadImage(res.tempFilePaths);
            },
        });
    },

    previewImage() {
        let pics = that.data.currentItem.pics;
        if (pics == undefined || pics == null || pics.length == 0) {
            that.setData({
                modalName: 'tipsModal',
                modalTips: '请至少添加一张图片哦'
            });
        } else {
            wx.navigateTo({
                url: '/pages/ToolsPage/PreviewImage/PreviewImage?images=' + JSON.stringify(pics),
            });
        }
    },

    showUploadJobDataModal() {
        that.setData({
            modalName: 'uploadJobDataModal'
        });
    },

    submitData() {
        uploadData();
    },

    openSettings() {
        wx.openSetting({
            success: res => {
                console.log(res);
                wx.navigateBack({
                    delta: 1
                });
            }
        });
    },

    hideModal() {
        that.setData({
            modalName: null
        });
    },

    onUnload() {
        for (let i = 0; i < deviceCheckPos.length; i++) {
            deviceCheckPos[i].pics = [];
            for (let j = 0; j < deviceCheckPos[i].checkItems.length; j++) {
                deviceCheckPos[i].checkItems[j].value = 0;
            }
        }

        location = {
            'longitude': 0,
            'latitude': 0,
            'altitude': 0,
            'address': 'UNKNOW'
        };
    }
})

function getLocation() {
    that.setData({
        loadModal: true,
        loadModalTips: '定位中......'
    });
    let qqmapsdk = new QQMapWx({
        key: 'QZRBZ-QW43W-4HXRY-OMTY5-JJB5V-DGBCH'
    });
    wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: res => {
            console.log('当前位置经纬度：');
            console.log(res);
            location.longitude = res.longitude;
            location.latitude = res.latitude;
            location.altitude = res.altitude;

            qqmapsdk.reverseGeocoder({
                location: {
                    latitude: res.latitude,
                    longitude: res.longitude
                },
                success: function (res) {
                    console.log('当前位置：');
                    console.log(res.result.address);
                    location.address = res.result.address;
                    that.setData({
                        loadModal: false
                    });
                },
                fail: function (res) {
                    console.log(res);
                    that.setData({
                        loadModal: false,
                        modalName: 'tipsModal',
                        modalTips: '未知错误'
                    });
                }
            });

        },
        fail: res => {
            if (res.errMsg === 'getLocation:fail auth deny' || res.errMsg === 'getLocation:fail:auth denied') { //小程序定位授权失败
                that.setData({
                    loadModal: false,
                    modalName: 'openSettingsModal',
                    modalTips: '定位失败，请到设置去打开小程序定位开关'
                });
            } else if (res.errCode == -2 || res.errMsg === 'getLocation:fail:system permission denied') { //微信系统定位未授权
                that.setData({
                    loadModal: false,
                    modalName: 'tipsModal',
                    modalTips: '请先打开系统设置中微信的定位权限'
                });
            } else {
                that.setData({
                    loadModal: false,
                    modalName: 'tipsModal',
                    modalTips: '未知错误'
                });
            }
        },
    });
}


function uploadImage(filePaths) {
    let currentItem = that.data.currentItem;
    let photos = currentItem.pics;
    that.setData({
        loadModal: true,
        loadModalTips: '正在上传......'
    });
    wx.uploadFile({
        url: 'https://www.fastedi.cn/hot/imgUpload',
        filePath: filePaths[0],
        name: 'img_file',
        success: res => {
            if (res.statusCode == 200) {
                console.log('照片上传返回数据：');
                console.log(res.data);
                let imgUrls = JSON.parse(BASE64.base64_decode(res.data));
                console.log(imgUrls);
                if (imgUrls.imgUrl == undefined || imgUrls.imgUrl.length == 0) {
                    that.setData({
                        loadModal: false,
                        modalName: 'tipsModal',
                        modalTips: '图片上传失败',
                    });
                } else {
                    photos.push(imgUrls.imgUrl);
                    currentItem.pics = photos;
                    deviceCheckPos[that.data.tabCur].pics = photos;
                    that.setData({
                        currentItem: currentItem,
                        loadModal: false,
                        modalName: 'tipsModal',
                        modalTips: '图片上传成功'
                    });
                }
            } else {
                that.setData({
                    loadModal: false,
                    modalName: 'tipsModal',
                    modalTips: 'Error:' + res.statusCode
                });
            }
        }
    });
}

function loadJobData() {
    let jobData = {
        'mobile_num': mobile,
        'item_num': tankNumber,
        'code_data': codeData,
        'handovers': [{
            'ho_id': 0,
            'handover_ts': '',
            'handover_report': {
                'front': loadTankPosition(deviceCheckPos[0]),
                'left': loadTankPosition(deviceCheckPos[1]),
                'bottom': loadTankPosition(deviceCheckPos[2]),
                'right': loadTankPosition(deviceCheckPos[3]),
                'top': loadTankPosition(deviceCheckPos[4]),
                'rear': [],
                'other': []
            }
        }]
    };
    console.log('Job Data:');
    console.log(jobData);
    return BASE64.base64_encode(JSON.stringify(jobData));
}

function loadTankPosition(item) {
    let keyVaule = {};
    for (let i = 0; i < item.checkItems.length; i++) {
        keyVaule[item.checkItems[i].key] = item.checkItems[i].value;
    }
    let posItem = [keyVaule, item.pics, [location.longitude, location.latitude, location.altitude, location.address]];
    console.log('loadTankPostionData:');
    console.log(posItem);
    return posItem;
}

function uploadData() {
    that.setData({
        modalName: null,
        loadModal: true,
        loadModalTips: '正在上传......'
    });
    let jobData = loadJobData();
    wx.request({
        url: 'https://www.fastedi.cn/hot/handover?' + 'code_data=' + codeData + '&item_num=' + tankNumber + '&mobile_num=' + mobile + '&ho_data=' + jobData,
        data: {},
        header: {},
        method: 'POST',
        responseType: 'text',
        success: res => {
            console.log('上传设备交接单返回数据：');
            console.log(res.data);
            if (res.statusCode == 200) {
                if (res.data == 1) {
                    that.setData({
                        modalName: 'tipsModal',
                        modalTips: '上传成功',
                        loadModal: false
                    });
                } else {
                    that.setData({
                        modalName: 'tipsModal',
                        modalTips: '上传失败',
                        loadModal: false
                    });
                }
            } else {
                that.setData({
                    modalName: 'tipsModal',
                    modalTips: 'Error:' + res.statusCode,
                    loadModal: false
                });
            }
        },
    });
}

var deviceCheckPos = [{
    tabName: '前面',
    tabKey: 'front',
    pics: [],
    checkItems: [{
        content: '外观完好',
        value: 0,
        key: 'HO_OL_OK'
    }]
}, {
    tabName: '左侧',
    tabKey: 'left',
    pics: [],
    checkItems: [{
        content: '外观完好',
        value: 0,
        key: 'HO_OL_OK'
    }, {
        content: '雨水管完好',
        value: 0,
        key: 'HO_RP_OK'
    }]
}, {
    tabName: '底部',
    tabKey: 'bottom',
    pics: [],
    checkItems: [{
        content: '外观完好',
        value: 0,
        key: 'HO_OL_OK'
    }, {
        content: '底阀仓盖完好',
        value: 0,
        key: 'HO_VBC_OK'
    }, {
        content: '底部阀门完好',
        value: 0,
        key: 'HO_BV_OK'
    }, {
        content: '机械温度表完好',
        value: 0,
        key: 'HO_TM_OK'
    }, {
        content: '温度记录仪完好（仅加热箱）',
        value: 0,
        key: 'HO_TR_OK'
    }, {
        content: '爬梯完好',
        value: 0,
        key: 'HO_LD_OK'
    }]
}, {
    tabName: '右侧',
    tabKey: 'right',
    pics: [],
    checkItems: [{
        content: '外观完好',
        value: 0,
        key: 'HO_OL_OK'
    }, {
        content: '雨水管完好',
        value: 0,
        key: 'HO_RP_OK'
    }, {
        content: '紧急拉绳完好',
        value: 0,
        key: 'HO_ER_OK'
    }, {
        content: '文件桶完好',
        value: 0,
        key: 'HO_DB_OK'
    }, {
        content: '加热箱电缆线完好',
        value: 0,
        key: 'HO_PC_OK'
    }]
}, {
    tabName: '顶部',
    tabKey: 'top',
    pics: [],
    checkItems: [{
        content: '外观完好？',
        value: 0,
        key: 'HO_OL_OK'
    }, {
        content: '步道完整',
        value: 0,
        key: 'HO_WW_FULL'
    }, {
        content: '卸货阀仓干净',
        value: 0,
        key: 'HO_VB_CLEAN'
    }, {
        content: '卸货阀仓内液相阀关闭',
        value: 0,
        key: 'HO_LV_CLOSE'
    }, {
        content: '卸货阀仓内气相阀正常关闭，压力正常',
        value: 0,
        key: 'HO_GV_CLOSE'
    }, {
        content: '人孔阀仓干净',
        value: 0,
        key: 'HO_MHB_CLEAN'
    }, {
        content: '安全扶手正常',
        value: 0,
        key: 'HO_HR_OK'
    }]
}];