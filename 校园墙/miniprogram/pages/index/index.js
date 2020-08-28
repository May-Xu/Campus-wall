const app = getApp()
var db = wx.cloud.database()
var _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartoon:[],
    openid:"",
    page: 1,
    pageSize: 12,
    loading:true
  },
  showModal(e) {
    console.log(e)
    this.setData({
      modalName: e
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  bindGetUserInfo:function(e){//拉起授权按钮
    console.log(e)
    if(e.detail.userInfo){
      console.log("已授权")
      wx.navigateTo({
        url: '/pages/fabu/index',
      })
    }else{
      console.log("拒绝授权")
    }
  },
  //查询数据
  onQuery: function () {
    var pageNum = this.data.page;
    if (pageNum == 1) {
      this.queryPageOne();
    } else {
      this.queryByPage();
    }
  },
  queryPageOne(e){
    var that = this;
    var pageNum = that.data.page;
    var pageSize = that.data.pageSize;
    db.collection("community").limit(pageSize).orderBy('time','desc').get({
      success:res=>{
        console.log(res);
        that.setData({
          cartoon:that.data.cartoon.concat(res.data),
          page: pageNum + 1,
          loading:false
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },
  /*分页查询 不是第一页使用这个方法*/
  queryByPage: function () {
    var that = this;
    var pageNum = that.data.page;
    var pageSize = that.data.pageSize;
    db.collection('community').skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('time', 'desc').get({
      success: res => {
        that.setData({
          cartoon:that.data.cartoon.concat(res.data),
          page: pageNum + 1
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },
  getuser(e){
    var that = this
    var flag = e.currentTarget.dataset
    for(var i in flag){
      console.log(i);
    }
    wx.getSetting({//授权检测
      success(res) {
        console.log("开始判断有没有授权",res)
        if (!res.authSetting['scope.writePhotosAlbum', 'scope.userInfo']) {
          console.log("未授权")
          that.showModal("DialogModal1")
        } else{//已授权 则执行
          console.log("已授权")
          if(i == "nav"){
            wx.navigateTo({
              url: '/pages/fabu/index',
            })
          } else{
            var _id = e.currentTarget.dataset.aid
            var openid = that.data.openid
            console.log(_id)
            wx.navigateTo({
              url: '/pages/detail/index?_id='+_id+'&openid='+openid,
            })
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.cloud.callFunction({
      name:"login",
      success:res=>{
        console.log("我的openid",res.result.openid)
        that.setData({
          openid:res.result.openid
        })
      }
    })
    that.onQuery()
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
    this.setData({
      page:1,
      pageSize:12,
      cartoon:[]
    })
    this.onQuery()
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