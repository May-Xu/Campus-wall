const db = wx.cloud.database()
const _ = db.command
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:"",
    comment:[],
    pinglun:true,
  },
  nav(e){
    var _id = e.currentTarget.dataset.flag_id
    var openid = this.data.openid
    console.log(_id);
    wx.navigateTo({
      url: '/pages/detail/index?_id='+_id+'&openid='+openid,
    })
  },
  remove(e){
    var _id = e.currentTarget.dataset._id
    console.log(_id)
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success:res=>{
        if(res.confirm){
          wx.showLoading({
            title: '删除中',
          })
          db.collection("comment").doc(_id).remove({
            success:res=>{
              wx.hideLoading()
              wx.showToast({
                title: '删除成功请刷新',
              })
            },fail:err=>{
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                image: '/images/fail.png',
              })
            }
          })
        } else if(res.cancel) {
          console.log("点击取消");
        }
      }
    })
  },
  query_cartoon(e){
    var that = this;
    var openid = that.data.openid
    console.log("openid：",openid)
    db.collection("comment").orderBy('time','desc').where({
      _openid:openid
    }).get({
      success:res=>{
        console.log(res)
        wx.hideLoading()
        if(res.data.length>0){
          that.setData({
            comment:res.data,
            pinglun:false
          })
        } else{
          that.setData({
            comment:[],
            pinglun:true
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      openid:options.openid
    })
    this.query_cartoon()
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
    this.query_cartoon()
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