import imgPreview from './index.vue'

imgPreview.install = function (Vue) {
  const Constructor = Vue.extend(imgPreview)
  let instance

  Vue.prototype.$showImgPreview = (imgUrl) => {
    if (instance) {
      document.body.removeChild(instance.$el)
      instance = null
    }

    instance = new Constructor({
      el: document.createElement('div'),
      data () {
        return {
          visible: true,
          imgUrl
        }
      }
    })

    document.body.appendChild(instance.$el)
  }
}

export default imgPreview
