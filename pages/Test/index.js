// pages/test/test.js
var that;

Page({
    data: {
        curTab:0
    },

    onLoad: function(options) {
        that = this;
    },

    tabSelect(e) {
        that.setData({
            curTab: e.currentTarget.dataset.id
        });
    }
})