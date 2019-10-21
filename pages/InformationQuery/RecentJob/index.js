// pages/InformationQuery/RecentJob/index.js
var myTel = '';
var that;
var allData;
var searchData;
var searchValues = {
    'searchValue': [],
    'date': '',
    'complete': 2,
    'truck': 2
};

Page({
    data: {
        scrollViewHeight: 0,
        businessList: [],
        customer: [],
        searchValue: '',
        jobCompSelector: ['未完成', '已完成', '全部'],
        truckSelector: ['未派车', '已派车', '全部'],
        jobCompleteSelected: '完成情况>>',
        truckSelected: '派车情况>>',
        date: '装货日期>>',
        cleanIconShow: false
    },

    onLoad: function(options) {
        that = this;
        myTel = options.mobile;
        calculateClassesHeight(0, ['.header-container', '.map-search', '.picker-container']);
        that.getBusinessData();
    },

    cleanKeys: function() { //清除筛选条件--恢复默认
        that.setData({
            searchValue: '',
            date: '装货日期>>',
            jobCompleteSelected: '完成情况>>',
            truckSelected: '派车情况>>',
            cleanIconShow: false
        });

        searchValues = {
            'searchValue': [],
            'date': '',
            'complete': 2,
            'truck': 2
        }

        that.setData({
            businessList: allData
        });
    },

    searchJobNo: function(e) { //关键字搜索，所有小写字母都转换成大写字母进行比较
        let value = e.detail.value.toUpperCase();
        if (value.length != 0) {
            that.setData({
                cleanIconShow: true
            });
        }
        let values = value.split(' ');
        searchValues.searchValue = values;
        searchAll();
    },

    datePickerChange: function(e) { //日期选择器
        searchValues.date = e.detail.value;
        that.setData({
            date: e.detail.value,
            cleanIconShow: true,
        });
        searchAll();
    },

    jobCompPickerChange: function(e) { //业务完成情况选择器
        searchValues.complete = e.detail.value;
        that.setData({
            jobCompleteSelected: e.detail.value == 2 ? '完成情况>>' : that.data.jobCompSelector[e.detail.value],
            cleanIconShow: true
        });
        searchAll();
    },

    truckPickerChange: function(e) { //派车情况选择器
        searchValues.truck = e.detail.value;
        that.setData({
            truckSelected: e.detail.value == 2 ? '派车>>' : that.data.truckSelector[e.detail.value],
            cleanIconShow: true
        });
        searchAll();
    },

    getBusinessData: function() { //获取业务数据
        wx.showLoading({
            title: '加载中...'
        });
        wx.request({
            url: 'https://www.fastedi.cn/hot/jobReport?mobile_num=' + myTel,
            data: {},
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            success: res => {
                console.log(res);
                if (res.statusCode == 200) {
                    // console.log(res.data);
                    if (res.data == -1) {
                        wx.showModal({
                            title: '提示',
                            content: '无权限获取业务信息',
                            showCancel: false,
                            confirmText: '确定',
                            confirmColor: '#039af4'
                        });
                        wx.hideLoading();
                    } else {
                        //解析数据
                        let businessList = res.data;
                        console.log('近期业务查询：');
                        console.log(businessList);
                        reloadBusinessList(businessList.data);
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: 'Error：' + res.statusCode,
                        showCancel: false,
                        confirmText: '确定',
                        confirmColor: '#039af4'
                    });

                    wx.hideLoading();
                }
            },
        });
    },

    itemSelected: function(e) { //选择的业务
        let index = e.currentTarget.dataset.index;
        let item = that.data.businessList[index];

        wx.navigateTo({
            url: 'JobDetail/index?item=' + JSON.stringify(item),
        });
    },

    onHide: function() { //视图隐藏后重新设置滚动视图的高度
        mScrollViewHeight = 0;
    }
})

function reloadBusinessList(businessList) { //将数据重新封装成JSON数据
    let buList = [];
    for (let i = 0; i < businessList.length; i++) {
        let business = {
            'hsb_ref': businessList[i][0],
            'cargo_name': businessList[i][1],
            'tank_number': businessList[i][2],
            'customer_info': businessList[i][3],
            'load_addr': businessList[i][4],
            'unload_addr': businessList[i][5],
            'fleet': businessList[i][6],
            'plate_no': businessList[i][7],
            'start_load': businessList[i][8],
            'end_load': businessList[i][9],
            'start_unload': businessList[i][10],
            'end_unload': businessList[i][11],
            'search': businessList[i][businessList[i].length - 1]
        };
        buList.push(business);
    }
    that.setData({
        businessList: buList
    });
    allData = buList;
    searchData = buList;

    wx.hideLoading();
}

function searchAll() { //根据筛选条件进行筛选
    //keys 关键字搜索
    let newJobData = allData;
    for (let i = 0; i < searchValues.searchValue.length; i++) {
        let newData = [];
        console.log(searchValues.searchValue[i]);
        for (let j = 0; j < newJobData.length; j++) {
            if (newJobData[j].search.toUpperCase().indexOf(searchValues.searchValue[i]) != -1) {
                newData.push(newJobData[j]);
                console.log(newJobData[j]);
            }
        }
        newJobData = newData;
    }

    //date 日期
    if (searchValues.date.length != 0) {
        let newData = [];
        for (let i = 0; i < newJobData.length; i++) {
            if (newJobData[i].start_load.plan_time.indexOf(searchValues.date) != -1) {
                newData.push(newJobData[i]);
            }
        }
        newJobData = newData;
    }

    //complete 完成情况
    if (searchValues.complete == 1) {
        let newData = [];
        for (let i = 0; i < newJobData.length; i++) {
            if (newJobData[i].end_unload.actual_time != null && newJobData[i].end_unload.actual_time.length != 0) {
                newData.push(newJobData[i]);
            }
        }
        newJobData = newData;
    }

    if (searchValues.complete == 0) {
        let newData = [];
        for (let i = 0; i < newJobData.length; i++) {
            if (newJobData[i].end_unload.actual_time == null || newJobData[i].end_unload.actual_time.length == 0) {
                newData.push(newJobData[i]);
            }
        }
        newJobData = newData;
    }

    //truck 派车情况
    if (searchValues.truck == 0) {
        let newJob = [];
        for (let i = 0; i < newJobData.length; i++) {
            if (newJobData[i].end_unload.actual_time == null && newJobData[i].plate_no.length == 0) {
                newJob.push(newJobData[i]);
            }
        }
        newJobData = newJob;
    }
    if (searchValues.truck == 1) {
        let newJob = [];
        for (let i = 0; i < newJobData.length; i++) {
            if (newJobData[i].plate_no.length != 0) {
                newJob.push(newJobData[i]);
            }
        }
        newJobData = newJob;
    }

    that.setData({
        businessList: newJobData
    });
}

/**
 * 用递归方式计算ScrollView的高度(所有页面通用)
 * position:css数组中要计算高度的类名的位置
 * classes:css数组名称['class1','class2','class3']
 */
var mScrollViewHeight = 0;

function calculateClassesHeight(position, classes) {
    let selectorQuery = wx.createSelectorQuery();
    selectorQuery.select(classes[position]).boundingClientRect();
    console.log(classes[position]);
    selectorQuery.exec(function(res) {
        mScrollViewHeight += res[0].height;
        if (++position < classes.length) {
            calculateClassesHeight(position, classes);
        } else {
            wx.getSystemInfo({
                success: function(res) {
                    console.log(res.windowHeight);
                    that.setData({
                        scrollViewHeight: res.windowHeight - mScrollViewHeight
                    });
                    mScrollViewHeight = 0;
                    console.log("ScrollView Height02:");
                    console.log(res.windowHeight - mScrollViewHeight);
                },
            })
        }
    });
}