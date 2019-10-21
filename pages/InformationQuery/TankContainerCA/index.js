// pages/InformationQuery/TankContainerCA/index.js
const BASE64 = require('../../../utils/base64.js');
const TankNoCheck = require('../../../utils/tank-no-check.js');
var phoneNumber = '';
var boxNo = '';
var files = [37];

Page({

    /**
     * 页面的初始数据
     */
    data: {
        checkboxes: [],
        disabled: true,
        box_no: '',
        errorTips: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        phoneNumber = options.mobile;
        _this._getPhoneNum(_this);
        this.setWXMLData();
    },

    setWXMLData: function () {
        let checkBoxes = [{
            name: 37,
            value: '检验证书',
            checked: 'true'
        },
        {
            name: 40,
            value: '清洁证书'
        },
        {
            name: 42,
            value: '露点报告'
        }
        ];

        this.setData({
            checkboxes: checkBoxes,
        });
    },

    _getPhoneNum: function (_this) { //获取手机号--从本地缓存
        wx.getStorage({
            key: 'phone_number',
            success: function (res) {
                phoneNumber = res.data;
            },
        })
    },

    _inputBoxNo: function (e) {
        boxNo = e.detail.value;
        var _this = this;
        boxNo = boxNo.toUpperCase();
        _this.setData({
            box_no: boxNo
        });

        if (_this._checkBoxNo(_this)) {
            _this.setData({
                disabled: false,
                box_no: boxNo
            });
        } else {
            _this.setData({
                disabled: true
            })
        }
    },

    _checkBoxNo: function (iThis) { //箱号验证
        var check = TankNoCheck.calculateBoxCheckCode(boxNo);

        switch (check) {
            case -1:
                iThis.setData({
                    errorTips: '请输入11位箱号'
                });

                return false;
            case 10:
                iThis.setData({
                    errorTips: '前四位必须为字母'
                });
                return false;
            case 11:
                iThis.setData({
                    errorTips: '后7位必须为数字'
                });
                return false;
            case 12:
                iThis.setData({
                    errorTips: '非法箱号'
                });
                return false;
            case false:
                iThis.setData({
                    errorTips: '未知错误'
                });
                return false;
            default:
                {
                    iThis.setData({
                        errorTips: ''
                    });
                    boxNo = check.box;
                    return true;
                }
        }


    },

    _sendBoxCert: function (e) {
        var _this = this;
        if (boxNo.length == 0) {
            wx.showToast({
                title: '请输入箱号',
                icon: 'none'
            });
        } else if (files.length == 0) {
            wx.showModal({
                title: '提示',
                content: '请至少选择一项要发送的内容',
                showCancel: false,
                confirmText: '确定',
                confirmColor: '#039af4'
            })
        } else {

            var info_data = _this.setInfoData(_this);
            wx.showLoading({
                title: '正在发送',
            })

            wx.request({
                url: 'https://www.fastedi.cn/info/search?mobile_num=' + phoneNumber + '&info_data=' + info_data,
                data: {},
                header: {
                    'content-type': 'application/json' // 默认值
                },
                method: 'POST',
                dataType: 'json',
                responseType: 'text',
                success: function (res) {
                    wx.hideLoading();
                    var result = res.data;
                    console.log(result);
                    if (result == 1) {
                        wx.showModal({
                            title: '发送成功',
                            content: '相关证书和报告稍后将发送至邮箱',
                            showCancel: false,
                            confirmText: '确定',
                            confirmColor: '#039af4'
                        });
                    }
                    if (result == 0) {
                        wx.showToast({
                            title: '无查询权限',
                            icon: 'none'
                        })
                    }
                    if (result == -1) {
                        wx.showToast({
                            title: '发送失败',
                            icon: 'none'
                        })
                    }
                }
            })
        }
    },

    toggleTodoHandle: function (e) {
        var index = e.currentTarget.dataset.index;
        var boxes = this.data.checkboxes;
        boxes[index].checked = !boxes[index].checked;
        this.setData({
            checkboxes: boxes
        });
        files = [];
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].checked) {
                files.push(boxes[i].name);
            }
        }
        console.log(files);
    },


    setInfoData: function (_this) {

        console.log('Unit Num:' + boxNo);
        var info_data = {
            'info_type': 1,
            'info_data': {
                'unit_num': boxNo,
                'doc_type': files
            }
        };

        var info_data_str = JSON.stringify(info_data);
        console.log(info_data_str);
        return BASE64.base64_encode(info_data_str);
    },
})