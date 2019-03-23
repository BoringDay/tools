/**
 * @des 将图片地址转成base64
*/
export function getBase64 (imgUrl, callback) {
  window.URL = window.URL || window.webkitURL
  var xhr = new XMLHttpRequest()
  xhr.open('get', imgUrl, true)
  // 至关重要
  xhr.responseType = 'blob'
  xhr.onload = function () {
    if (this.status == 200) {
      // 得到一个blob对象
      var blob = this.response
      //  至关重要
      let oFileReader = new FileReader()
      oFileReader.onloadend = function (e) {
        let base64 = e.target.result

        callback && callback(base64)
      }
      oFileReader.readAsDataURL(blob)
    }
  }
  xhr.send()
}

/**
 * @des 图片懒加载
 * @param {el} wrap 图片容器
 * @param {HTMLCollection} imageArr 图片列表
 * @param {String} derection 整体列表滑动方向['down','up']
 * @param {Number} lastShowImageIndex 上次展示图片的索引
 */
export function lazyloadImage ({ wrap, imageArr, derection = 'down', lastShowImageIndex = 0 }) {
  let imageLen = imageArr.length
  let listScrollTop = wrap.scrollTop
  let listClientHeight = wrap.clientHeight

  switch (derection) {
    case 'down':
      for (let i = lastShowImageIndex; i < imageLen; i++) {
        let item = imageArr[i]
        let originUrl = item.getAttribute('originurl')
        let url = item.getAttribute('src')

        if (item.offsetTop - listScrollTop <= listClientHeight) {
          if (originUrl && originUrl != url) item.setAttribute('src', originUrl)
        } else {
          return i >= 1 ? i - 1 : 0
        }
      }
      break
    case 'up':
      listClientHeight += 100
      for (let i = imageLen - 1; i >= 0; i--) {
        let item = imageArr[i]
        let originUrl = item.getAttribute('originurl')
        let url = item.getAttribute('src')
        let top = item.getBoundingClientRect().top

        if (top >= 0 && top <= listClientHeight) {
          if (originUrl && originUrl != url) item.setAttribute('src', originUrl)
        }
      }
      break
  }
}
