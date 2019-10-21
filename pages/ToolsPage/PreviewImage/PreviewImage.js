// pages/ToolsPage/PreviewImage/PreviewImage.js
var that;
Page({
    data: {
        images:[]
    },

    onLoad: function (options) {
        that = this;
        let images = JSON.parse(options.images);
        console.log(images);
        reLoadImages(images);
    },

    previewImage(e){
        let imgUrl = [e.currentTarget.dataset.value];
        wx.previewImage({
            urls: imgUrl,
        });
    }
})

function reLoadImages(images){
    let imgs = [];
    for(let i=0; i<images.length; i++){
        let image = {
            'imgUrl':images[i].indexOf('thumb.jpg')==-1?images[i]:images[i].replace('thumb.jpg','.jpg'),
            'imgThumbUrl': images[i].indexOf('thumb.jpg') != -1 ? images[i] : images[i].replace('.jpg', 'thumb.jpg'),
            'imgName':'图片'+(i+1)
        }

        imgs.push(image);
    }
    console.log('图片预览：');
    console.log(imgs);

    that.setData({
        images:imgs
    });
}