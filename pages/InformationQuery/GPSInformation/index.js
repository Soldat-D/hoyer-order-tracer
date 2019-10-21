// pages/InformationQuery/GPSInformation/index.js
const BASE64 = require('../../../utils/base64.js');

var mTel = '';
var that;
var mMarkers = [];

Page({
    data: {
        latitude: 31.23522976345486,
        longitude: 121.48308349609376,
        markers: [],
        // includePoints:[],
        mapDisplayHeight: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        that = this;
        mTel = options.mobile;
        that.getGPSInfoFromServer();
        that.calculateMapHeight();
    },


    getGPSInfoFromServer: function() {
        wx.showLoading({
            title: '正在刷新',
        });
        wx.request({
            url: 'https://www.fastedi.cn/hot/gpsData?mobile_num=' + mTel,
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            data: {},
            success: res => {
                wx.hideLoading();
                console.log(res);
                if (res.data == -1) {
                    wx.showModal({
                        title: '提示',
                        content: '未授权的手机号，无法查询',
                        confirmColor: '#03a9f4',
                        confirmText: ' 确定',
                        showCancel: false
                    });
                } else {
                    let result = JSON.parse(BASE64.base64_decode(res.data));
                    console.log(result);
                    that.reloadMarkers(result.data);
                }
            }
        });
    },

    reloadMarkers: function(originMarkers) {
        let markers = [];

        for (let i = 0; i < originMarkers.length; i++) {
            let iconPath;
            let bgColor;
            let content;
            let fontColor = '#ffffff';
            let boardColor = '#ffffff';

            if (originMarkers[i][1] == 1) { //savvy gps
                iconPath = '/images/savvy-gps.png';
                bgColor = '#88c34a';
                content = '时间：' + originMarkers[i][3] + '\n' + '地点：' + originMarkers[i][9] +
                    '\n' + '经度：' + originMarkers[i][5] + '\n' + '纬度：' + originMarkers[i][4] +
                    '\n' + '高度：' + originMarkers[i][6] + '\n' + '速度：' + originMarkers[i][7] +
                    '\n' + '方向：' + originMarkers[i][8] + '\n' + '传感器1：' + originMarkers[i][10] +
                    '\n' + '传感器2：' + originMarkers[i][11] + '\n' + '传感器3：' + originMarkers[i][12];
            }

            if (originMarkers[i][1] == 3) { //车辆GPS
                iconPath = '/images/truck-gps.png';
                bgColor = '#ffc107';
                fontColor = '#000000';
                boardColor = '#999999';
                content = '时间：' + originMarkers[i][3] + '\n' + '地点：' + originMarkers[i][9] +
                    '\n' + '经度：' + originMarkers[i][5] + '\n' + '纬度：' + originMarkers[i][4] +
                    '\n' + '速度：' + originMarkers[i][7] + '\n' + '方向：' + originMarkers[i][8] +
                    '\n' + '车队：' + originMarkers[i][15];
            }

            if (originMarkers[i][1] == 4) { //G7
                iconPath = '/images/g7-gps.png';
                bgColor = '#03a9f4';
                content = '时间：' + originMarkers[i][3] + '\n' + '地点：' + originMarkers[i][9] +
                    '\n' + '经度：' + originMarkers[i][5] + '\n' + '纬度：' + originMarkers[i][4] +
                    '\n' + '电量：' + originMarkers[i][13] + '%';
            }

            let marker = {
                'id': i,
                'latitude': originMarkers[i][4],
                'longitude': originMarkers[i][5],

                'iconPath': iconPath,
                'label': {
                    'content': originMarkers[i][2],
                    'bgColor': bgColor,
                    'color': fontColor,
                    'borderWidth': '4rpx',
                    'borderColor': boardColor,
                    'padding': '8rpx',
                    'borderRadius': '8rpx'
                },
                'callout': {
                    'content': content,
                    'bgColor': bgColor,
                    'color': fontColor,
                    'fontSize': '24rpx',
                    'borderWidth': '4rpx',
                    'borderColor': boardColor,
                    'padding': '8rpx',
                    'borderRadius': '8rpx'
                },
                'search': originMarkers[i][18]
            }
            markers.push(marker);
        }

        that.setData({
            markers: markers,
            // includePoints:markers
        });

        mMarkers = markers;
        console.log(markers);
    },

    searchGPSDevice: function(e) {
        let deviceNum = (e.detail.value).toUpperCase();
        // console.log(e);
        if (deviceNum != null && deviceNum != undefined && deviceNum.length != 0) {
            that.getSubMarkersByDeviceNum(deviceNum);
        } else {
            that.setData({
                markers: mMarkers,
                // includePoints:mMarkers
            });
        }
    },

    getSubMarkersByDeviceNum: function(deviceNum) {
        let markers = [];
        for (let i = 0; i < mMarkers.length; i++) {

            // console.log(value);
            if (mMarkers[i].search.indexOf(deviceNum) != -1) {
                markers.push(mMarkers[i]);
            }
        }

        // console.log(markers);
        that.setData({
            markers: markers,
            // includePoints:markers
        });
    },

    calculateMapHeight: function() {
        //hoyer-header 高度
        let myheight = 0;
        let imgheader = wx.createSelectorQuery();
        imgheader.select('.map-search').boundingClientRect();
        imgheader.exec(function(res) {
            console.log(res);
            myheight += res[0].height;
            //窗口总高度（不是屏幕高度）
            wx.getSystemInfo({
                success: function(res) {
                    console.log(res.windowHeight);
                    that.setData({
                        mapDisplayHeight: res.windowHeight - myheight
                    });
                },
            });
        });
    }

})