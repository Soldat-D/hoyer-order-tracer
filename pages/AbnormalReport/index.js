// pages/AbnormalReport/index.js
// pages/exceptions/exceptions.js
const BASE64 = require('../../utils/base64.js');
var that;
var myPhone = '';
var codeData = '';
var discription = '';
var codeType;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        imageWidth: 0,
        images: [],
        ei: 0,
        em_type: 0,
        exceptions: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        that = this;
        that.setImageWidth();
        that.setWXMLData();
        myPhone = options.mobile;
        codeData = options.code_data;
        codeType = options.code_type;
    },

    setWXMLData: function() {
        let exceptions = [{
            isSelected: true,
            name: '业务',
            detail: [{
                isSelected: false,
                name: '环境原因',
                value: 1
            }, {
                isSelected: false,
                name: '设备原因',
                value: 21
            }, {
                isSelected: false,
                name: '车队原因',
                value: 51
            }, {
                isSelected: false,
                name: '管理原因',
                value: 81
            }, ]
        }, {
            isSelected: false,
            name: '车辆',
            detail: [{
                isSelected: false,
                name: '损坏',
                value: 1
            }, {
                isSelected: false,
                name: '故障',
                value: 21
            }, {
                isSelected: false,
                name: '不当操作',
                value: 41
            }, {
                isSelected: false,
                name: '管理原因',
                value: 61
            }, ]
        }, {
            isSelected: false,
            name: '设备',
            detail: [{
                isSelected: false,
                name: '损坏',
                value: 1
            }, {
                isSelected: false,
                name: '故障',
                value: 21
            }, {
                isSelected: false,
                name: '不当操作',
                value: 41
            }, {
                isSelected: false,
                name: '管理原因',
                value: 61
            }]
        }];

        that.setData({
            exceptions: exceptions,
        });
    },

    setImageWidth: function() {
        let width = wx.getSystemInfoSync().windowWidth;
        that.setData({
            imageWidth: width / 4 - 25
        });
    },

    previewImage: function(e) {
        // 预览图集
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let imgs = [that.data.images[index]];
        wx.previewImage({
            urls: imgs
        });
    },

    chooseImage: function() {
        // 选择图片
        wx.chooseImage({
            count: 1,
            sourceType: ['camera'],
            sizeType: ['original'],
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                console.log(tempFilePaths);
                that.uploadImg(res.tempFilePaths);
            }
        })
    },

    uploadImg: function(filePaths) {
        console.log(filePaths);
        let iPics = that.data.images;
        wx.showToast({
            title: '图片上传中',
            icon: 'loading',
            duration: 10000
        });
        wx.uploadFile({
            url: 'https://www.fastedi.cn/hot/imgUpload',
            filePath: filePaths[0],
            name: 'img_file',
            success: res => {
                console.log(res.data);

                let imgurl = JSON.parse(BASE64.base64_decode(res.data)).imgUrl;
                console.log('图片上传返回数据：');
                console.log(res.data);
                iPics.push(imgurl);
                that.setData({
                    images: iPics
                });
                wx.showToast({
                    title: '上传成功',
                    icon: 'success',
                    duration: 2000
                });
                wx.hideToast();
            },
        });
    },

    inputDisc: function(e) {
        discription = e.detail.value;
    },

    selectBigExceType: function(e) { //主菜单
        let index = e.currentTarget.dataset.index;
        console.log(index);
        let exces = that.data.exceptions;
        for (let i = 0; i < exces.length; i++) {
            if (i == index) {
                exces[i].isSelected = true;
            } else {
                exces[i].isSelected = false;
            }
        }

        that.setData({
            exceptions: exces,
            ei: index
        });
    },

    selectDetailExceType: function(e) { //子菜单
        console.log(e);
        let index = e.currentTarget.dataset.index;
        let exces = that.data.exceptions;
        let ei = that.data.ei;
        let emType = that.data.em_type;

        for (let i = 0; i < exces.length; i++) {
            for (let j = 0; j < exces[i].detail.length; j++) {
                if (i == ei && j == index) {
                    exces[ei].detail[j].isSelected = true;
                    emType = exces[ei].detail[j].value;
                } else {
                    exces[i].detail[j].isSelected = false;
                }
            }
        }

        that.setData({
            exceptions: exces,
            em_type: emType
        });
    },

    submit: function() {
        let images = that.data.images;
        let emType = that.data.em_type;
        if (images.length == 0) {
            //必须添加照片
            wx.showModal({
                title: '提示',
                content: '请至少添加一张照片',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#ffc107'
            });
            return;
        }

        if (emType == 0) {
            //必须选择异常类型
            wx.showModal({
                title: '提示',
                content: '请选则要上报的异常类型',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#ffc107'
            });
            return;
        }

        let codedata = BASE64.base64_encode(codeData);
        let emData = BASE64.base64_encode(that.packEmData(emType));
        wx.showLoading({
            title: '正在上传',
        });
        wx.request({
            url: 'https://www.fastedi.cn/hot/emReport' +
                '?code_type=' + codeType +
                '&code_data=' + codedata +
                '&mobile_num=' + myPhone +
                '&em_data=' + emData,
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
                wx.showToast({
                    title: '上传成功',
                });
            }
        });
    },

    packEmData: function(emType) { //封装数据
        let emdata = {
            'em_type': emType,
            'note': BASE64.utf8_encode(discription),
            'photos': that.data.images
        }
        console.log('emdata:');
        console.log(emdata);
        return JSON.stringify(emdata);
    }
});