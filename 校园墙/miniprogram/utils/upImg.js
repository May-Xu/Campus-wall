/**
 * 图片上传云存储
 *  
 * 参数：{    二选一  必填参数  
 *       upSrc：[] 上传图片数组 （值必须为数组） 
 *       delSrc:[] 删除图片数组  (值必须为数组)
 *       fileSrc:'' 存储图片路径  非必填  不填则默认储存在根目录下
 *       }
 *   const manageImg = require('upImg');// 引入 js 路径地址
 * 
 *   manageImg.upImg({ delSrc:[],upSrc:[]}).then(res=>{console.log(res)}).catch();  
 *   在需要上传的地方引用这个方法
 * 
 *    { msg  错误信息  statusCode： 错误吗 }
 *          执行成功的状态码统一为零
 *  
 *  状态码：1003   上传失败，自动删除之前上传成功图片
 *         1002   已上传图片删除失败
 *         1001   删除图片失败
 * 
 *     
 */


// 带时间戳文件名字符串
function vcode() {
  let date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return year + '_' + month + '_' + day + '_' + hour + '_' + minute + '_' + second;

}

//图片管理入口函数
function upImg(e) {
  return new Promise(function(resolve, reject) {
    if (e == undefined) { //判断参数是否为空
      resolve('参数不能为空')
      return
    }
    if (!Array.isArray(e.upSrc) && e.delSrc == undefined) { //判断上传图片参数是否未数组
      resolve('上传图片路径类型必须是数组')
      return
    }
    if (!Array.isArray(e.delSrc) && e.delSrc != undefined) { //判断删除图片参数是否为数组
      resolve('删除图片路径类型必须是数组')
      return
    }
    if (Array.isArray(e.delSrc) && Array.isArray(e.upSrc)) { //判断是否同时执行上传新图片并删除旧图片
      Promise.all([delImg(e.delSrc), updataImgSet(e.upSrc, e.fileSrc)]).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    } else if (Array.isArray(e.upSrc)) { //判断只执行上传新图片
      updataImgSet(e.upSrc, e.fileSrc).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    } else if (Array.isArray(e.delSrc)) { //判断只执行删除旧图片
      delImg(e.delSrc).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    }
  })
}

// 执行上传图片函数
/**
 * 因为微信原生api每次上传只能上传一张。多张上传只能重复执行上传操作
 */
function updataImgSet(upSrc, fileSrc) {
  return new Promise(function(resolve, reject) {
    let upImgArr = []; //定义返回云链接数组
    let num = 0;
    let updataImg = function(i) {
      wx.cloud.uploadFile({ //调用微信原生api上传
        cloudPath: (fileSrc || '') + vcode() + '-' + i + '.png', //命名文件名称
        filePath: upSrc[i], //图片文件地址
        success: res => {
          upImgArr[num] = res.fileID; //上传成功储存在数组内
          num++;
          if (num < upSrc.length) { //判断是否执行多次上传
            updataImg(num);
          } else if (num == upSrc.length) { //判断是否上传完成，并返回结果
            resolve({
              data: upImgArr,
              msg: '上传成功',
              statusCode: 0
              }); //抛出结果
          }
        },
        fail: err => {
          upImgArr[10]+= '112233445566'
          delImg(upImgArr).then(res => {
            reject({msg:"上传失败，自动删除之前上传成功图片",data:res.data,statusCode:1003})
          }).catch(err => {
            reject({
              err: err,
              msg: '已上传图片删除失败',
              statusCode: 1002
            })
          })
        }
      })
    }
    updataImg(num); //首次调用上传   
  })
}

// 删除云端图片
function delImg(delSrc) {
  let delObj = {};
  return new Promise(function(resolve, reject) {
    wx.cloud.deleteFile({
      fileList: delSrc
    }).then(del => {
      delObj = ondelStatus(del.fileList);
      resolve({
        data: delObj,
        msg: '图片删除成功',
        statusCode: 0
        }); //抛出删除结果
    }).catch(delErr => {
      reject({//抛出删除失败结果
        data: delErr,
        msg: '删除图片失败',
        statusCode: 1001
      });
    })
  })
}


// 检索批量删除图片

function ondelStatus(e) {
  let suc = {};
  let fail = {};
  suc.sucNumber = 0;
  suc.fileArr = [];
  fail.failNumber = 0;
  fail.fileArr = [];
  e.forEach(function(e) {
    if (e.status == 1) {
      fail.failNumber++;
      fail.fileArr.push(e)
    } else if (e.status == 0) {
      suc.sucNumber++;
      suc.fileArr.push(e)
    }
  })
  return {
    success: suc,
    fail: fail
  }
}

module.exports = {
  upImg: upImg
}