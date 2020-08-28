const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    openid:"",
  },
  refresh_info:function(){
    var that = this
    wx.getSetting({//授权检测
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum', 'scope.userInfo']) {
          console.log("开始判断有没有授权",res)
          let flag = {avatarUrl:"/images/avatarurl.png"}
          console.log(flag)
          wx.hideLoading()
          that.setData({userInfo:flag})
        } else{//已授权 则执行
          wx.hideLoading()
        }
      }
    })
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
      console.log("更新用户信息")
      console.log(that.data.userInfo)
    })
  },
  wdfb(e){
    var openid = this.data.openid
    wx.navigateTo({
      url: '/pages/wdfb/index?openid='+openid,
    })
  },
  wdpl(e){
    var openid = this.data.openid
    wx.navigateTo({
      url: '/pages/wdpl/index?openid='+openid,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'openid',
      success(res){
        console.log("读取缓存成功",res.data)
        that.setData({
          openid:res.data
        })
      },fail(err){
        console.log("缓存读取失败",err)
        wx.cloud.callFunction({
          name:"login",
          success:res=>{
            wx.setStorage({
              data: res.result.openid,
              key: 'openid',
            })
            that.setData({
              openid:res.result.openid
            })
          }
        })
      }
    })
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
    this.refresh_info()
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