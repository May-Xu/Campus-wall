var app = getApp()
const manageImg = require('../../utils/upImg');
const util = require('../../utils/util.js');
var db = wx.cloud.database()
var _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    modalName: null,
    textareaBValue: '',
    imgList: [],
    userInfo: {},
    img_path:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
      console.log("更新数据")
      console.log(that.data.userInfo)
    })
  },
  textareaBInput(e) {
    this.setData({
      textareaBValue: e.detail.value
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    this.data.imgList.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      imgList: this.data.imgList
    })
  },
  submindata(e){
    var img_path = e
    var username = this.data.userInfo['nickName']
    var avatar = this.data.userInfo['avatarUrl']
    var text = this.data.textareaBValue
    var time = util.formatTime(new Date());
    db.collection("community").add({
      data:{
        image:img_path,
        username:username,
        avatar:avatar,
        content:text,
        time:time
      },success:res=>{
        console.log("发布成功")
        console.log(res)
        wx.hideLoading({
          complete: (res) => {
            wx.showToast({
              title: '发布成功请刷新',
            })
          },
        })
      },fail:err=>{
        console.log("发布失败")
        console.log(err)
        wx.hideLoading({
          complete: (res) => {
            wx.showToast({
              title: '发布失败',
            })
          },
        })
      }
    })
    wx.navigateBack({
      delta:1
    })
  },
  submit(e){
    var that = this;
    if(that.data.textareaBValue != ""){//判断帖子内容是否为空
      wx.showLoading({
        title: '发布中',
      })
      if(that.data.imgList.length>0){//判断是否有图片
        console.log("有图片")
        manageImg.upImg({upSrc:this.data.imgList,fileSrc:'community/'})
        .then(res=>{
          console.log(res)
          console.log("图片地址：",res.data[0])
          that.setData({
            img_path:res.data[0]
          })
          that.submindata(res.data[0])
        })
        .catch();
      } else{
        console.log("无图片")
        that.setData({
          img_path:"https://686a-hjt-dgvie-1302885895.tcb.qcloud.la/time.jpg"
        })
        that.submindata("https://686a-hjt-dgvie-1302885895.tcb.qcloud.la/time.jpg")
      }
    } else{
      wx.showToast({
        title: '请输入帖子内容',
        icon:"none"
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})