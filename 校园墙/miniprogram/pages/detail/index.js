const db = wx.cloud.database()
const _ = db.command
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    details:[],
    InputBottom: 0,
    text : "",
    userInfo: {},
    pinglun:[],
    pinglun_num:0,
    _id:"",
    openid:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var _id = options._id
    var openid = options.openid
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      openid:openid
    })
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        _id:_id,
      })
      console.log(that.data.userInfo)
    })
    this.query(_id)
    this.query_comment(_id)
  },
  query(_id){
    console.log(_id)
    var that = this;
    db.collection('community').where({
      _id:_id
    }).get({
      success:res=>{
        res.data[0].time = res.data[0].time.substring(0,4)+"年"+res.data[0].time.substring(5,7)+"月"+res.data[0].time.substring(8,10)+"日"+res.data[0].time.substring(10,16)
        that.setData({
          details:res.data[0]
        })
        console.log(res.data[0])
        wx.hideLoading()
      }
    })
  },
  /******查询评论*****/
  query_comment(e){
    var that = this
    var flag_id = e
    console.log("我的openID：",that.data.openid)
    console.log("flag_id:",flag_id)
    db.collection("comment").where({
      flag_id:flag_id
    }).orderBy('time','asc').get({
      success:res=>{
        console.log("查询到的评论",res.data)
        for(var i=0;i<res.data.length;i++){
          if(res.data[i]._openid==that.data.openid){
            console.log("本人")
            res.data[i].del_flag = true
          }else{
            console.log("不是本人")
          }
        }
        that.setData({
          pinglun:res.data,
          pinglun_num:res.data.length
        })
      }
    })
  },
  /*********删除评论**********/
  del_comment(e){
    var that = this;
    var _id = e.currentTarget.dataset.aid
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success:res=>{
        if(res.confirm){
          db.collection("comment").doc(_id).remove({
            success:res=>{
              wx.showToast({
                title: '删除成功',
              })
              that.query_comment(that.data._id)
            },fail:err=>{
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
  bindinput(e){
    console.log(e.detail.value)
    this.setData({
      text:e.detail.value
    })
  },
  InputFocus(e) {
    this.setData({
      InputBottom: e.detail.height
    })
    console.log("当前高度：",this.data.InputBottom)
  },
  InputBlur(e) {
    this.setData({
      InputBottom: 0
    })
    console.log("当前高度：", this.data.InputBottom)
  },
  ViewImage(e){
    console.log(this.data.details.image)
    var arr = [this.data.details.image]
    wx.previewImage({
      urls: arr,
      current: e.currentTarget.dataset.url
    });
  },
  comment(e){
    var that = this;
    var text = that.data.text
    var time = util.formatTime(new Date());
    console.log("评论是：",text)
    console.log("时间是:",time)
    if(text == ""){
      wx.showToast({
        title: '评论不能为空',
        icon:"none"
      })
    } else{
      console.log(that.data.userInfo)
      wx.showLoading({
        title: '评论中',
      })
      db.collection("comment").add({
        data:{
          flag_id:that.data.details._id,
          text:text,
          username:that.data.userInfo.nickName,
          avatar:that.data.userInfo.avatarUrl,
          time:time,
        },success:res=>{
          wx.hideLoading()
          wx.showToast({
            title: '评论成功',
          })
          that.setData({
            text:""
          })
          that.query_comment(that.data._id)
        },fail:err=>{
          wx.hideLoading()
          wx.showToast({
            title: '评论失败',
            image: '/images/fail.png',
          })
        }
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