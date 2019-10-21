// pages/InformationQuery/RecentJob/JobDetail/index.js
var that;
var business;
var events;

Page({
    data: {
        imageWidth: 0,
        nodes: [],
        scrollview_height: 0,

        hsb_ref: '',
        cargo_name: '',
        // basf_no: '',
        load_add: '',
        unload_add: '',
        driver_name: '',
        driver_no: '',
        plate_no: '',
        trucker_name: '',
        customer: [],

        isFold: true
    },

    onLoad: function (options) {
        that = this;
        events = {
            'start_load': '到达装货点',
            'end_load': '装货完成',
            'start_unload': '到达卸货点',
            'end_unload': '卸货完成'
        }

        console.log(options.item);
        business = JSON.parse(options.item);
        wx.setNavigationBarTitle({
            title: business.hsb_ref,
        });

        that.calculateScrollViewHeight();
        that.setBaseInfo();
        that.setImageWidth();
        that.dePlanInfo();
    },

    /**
     * 解析数据并显示
     */
    dePlanInfo: function () {
        let milestones = ['start_load', 'end_load', 'start_unload', 'end_unload'];

        let nodes = [];
        let myNodes = [];
        for (let i = 0; i < milestones.length; i++) {
            let nodeName = milestones[i];
            nodes.push(business[nodeName]);
        }
        console.log(nodes);
        let node = {};
        for (let i = 0; i < nodes.length; i++) {
            let showPicsBtn = false;
            let pics = [];
            let complete = false;
            if (nodes[i].actual_time != null && nodes[i].actual_time.length != 0) {
                showPicsBtn = nodes[i].file.length > 0;
                pics = nodes[i].file;
                complete = true;
            }

            node = {
                'event': events[milestones[i]],
                'node_name': milestones[i],
                'plan_time': nodes[i].plan_time,
                'actual_time': nodes[i].actual_time,
                'show_pics': false,
                'show_pics_btn': showPicsBtn,
                'driver_no': nodes[i].driver_no,
                'driver_name': nodes[i].driver_name,
                'pics': getThumbImg(pics),
                'is_complete': complete
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

    previewImage: function (e) {
        let imgUrl = e.currentTarget.dataset.imgindex;
        wx.previewImage({
            current: imgUrl,
            urls: [imgUrl],
        });
    },

    /**
     * Set Detail Info in head pannel
     */
    setBaseInfo: function () {
        that.setData({
            hsb_ref: business.hsb_ref,
            cargo_name: business.cargo_name,
            //   basf_no: business.job_info.basf_no,
            load_add: business.load_addr,
            unload_add: business.unload_addr,
            customer: business.customer_info,
            trucker_name: business.fleet,
            plate_no: business.plate_no,
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
            baseinfo.select('.plan-base-info-blue').boundingClientRect();
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
})

function getThumbImg(pics) {
    // let pictures = [];

    for (let i = 0; i < pics.length; i++) {
        console.log('图片URL：');
        console.log(pics[i]);
        if (pics[i].indexOf('thumb') == -1) {
            pics[i] = pics[i].replace('.jpg', 'thumb.jpg');
        }
        console.log('缩略图URL：');
        console.log(pics[i]);
    }
    return pics;
}