<template>
  <transition name="msgbox-fade">
    <div class="preview-wrap" v-if="visible">
      <div class="preview-mask" @click="visible = false" ref="mask"></div>
      <i class="el-icon-close" @click.stop="visible = false"></i>
        <img class="img" :src="imgUrl" alt="" ref="image"
            :style="{transform:`translate(${picLeft}px,${picTop}px) scale(${picScale})`}" @click="handleClickPC">
         <a :href="base64Url" :download="base64Stamp" class="icon-download"><i class="el-icon-download"></i></a>
    </div>
  </transition>
</template>

<script>
import { isMobile, getBase64 } from '@/util/util'
import Hammer from 'hammerjs'

export default {
  name: 'imgPreview',
  data () {
    return {
      isPcClick: false, // 用作识别pc点击和拖拽
      isMobile: isMobile(),
      picW: 0, // 图片宽
      picH: 0, // 图片高
      curPicW: 0, // 实际展示宽高
      curPicH: 0, // 实际展示宽高
      picScale: 1, // 缩放比例
      picScaleMid: 1, // 缩放比例
      picInitTop: 0, // 最初top
      picInitLeft: 0, // 最初left
      picTop: 0,
      picLeft: 0,
      image: null, // target图
      disX: 0,
      disY: 0,
      base64Url: '',
      base64Stamp: 'meechat_' + (new Date()).getTime()
    }
  },
  methods: {
    initEvent () {
      if (this.isMobile) {
        this.handleH5()
      } else {
        this.handleDragPC()
        this.handleScalePC()

        this.$refs.mask.addEventListener('contextmenu', e => e.preventDefault())
      }
    },
    handleClickPC () {
      if (!this.isMobile && this.isPcClick) this.visible = false
    },
    // pc拖拽
    handleDragPC () {
      this.image.onmousedown = (ev) => {
        this.isPcClick = true
        this.dragStart(ev)

        if (this.image.setCapture) this.image.setCapture()
        document.addEventListener('mousemove', this.drag)
        document.addEventListener('mouseup', this.dragAfter)
        return false
      }
    },
    // pc缩放
    handleScalePC () {
      document.body.addEventListener('mousewheel', this.scale)
    },
    // h5拖拽、缩放
    handleH5 () {
      const mc = new Hammer.Manager(this.image)
      const tap = new Hammer.Tap({ pointers: 1 })
      const pan = new Hammer.Pan({ pointers: 1 })
      const pinch = new Hammer.Pinch({ pointers: 2 })
      mc.add([tap, pan, pinch])

      // 监听-tab
      mc.on(`tap`, (ev) => {
        // ev.preventDefault()
        this.visible = false
      })

      // 监听-拖拽
      mc.on(`panstart panmove panend tap, multitap`, (ev) => {
        // ev.preventDefault()
        if (ev.type == 'panstart') this.dragStart(ev)
        else if (ev.type == 'panmove') this.drag(ev)
        else if (ev.type == 'panend') this.dragAfter(ev)
      })

      // 监听-缩放
      mc.on(`pinchmove pinchin pinchout pinchend`, (ev) => {
        // ev.preventDefault()

        this.picScale = (this.picScaleMid * ev.scale).toFixed(2)
        if (ev.type == 'pinchend') {
          if (this.picScale < 1) this.picScale = 1
          this.picScaleMid = this.picScale
        }
      })
    },
    dragStart (ev) {
      let type = this.isMobile ? 'delta' : 'client'

      this.disY = ev[`${type}Y`] - this.picTop
      this.disX = ev[`${type}X`] - this.picLeft

      // 计算当前图片尺寸
      this.curPicW = this.picW * this.picScale
      this.curPicH = this.picH * this.picScale
    },
    // 拖拽
    drag (ev) {
      let type = this.isMobile ? 'delta' : 'client'

      this.isPcClick = false
      this.picTop = ev[`${type}Y`] - this.disY
      this.picLeft = ev[`${type}X`] - this.disX
    },
    dragAfter () {
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('mouseup', this.dragAfter)
      if (this.image.releaseCapture) {
        this.image.releaseCapture()
      }

      if (this.picScale <= 1 || this.curPicW <= this.winW) {
        // 图片小于窗口-位置还原
        this.picTop = this.picInitTop
        this.picLeft = this.picInitLeft
      } else if (this.picScale > 1) {
        // 边缘检测
        let winW = window.innerWidth
        let winH = window.innerHeight
        let posX = (this.curPicW - winW) / 2
        let posY = (this.curPicH - winH) / 2

        if (this.picLeft < -posX) this.picLeft = -posX // 右边缘
        if (this.picLeft > posX) this.picLeft = posX // 左边缘
        if (this.picTop < -posY) this.picTop = -posY // 下边缘
        if (this.picTop > posY) this.picTop = posY // 上边缘

        if (posX < 0) this.picLeft = 0
        if (posY < 0) this.picTop = 0
      }
    },
    // 缩放
    scale (ev) {
      let picScale = this.picScale

      ev = ev || window.event
      if (ev.deltaY > 0) {
        this.picScale = picScale > 0.2 ? picScale - 0.1 : picScale
      } else {
        this.picScale += 0.1
      }

      if (this.picW * this.picScale - window.innerWidth < 0) this.picLeft = 0
      if (this.picH * this.picScale - window.innerHeight < 0) this.picTop = 0
    }
  },
  mounted () {
    this.image = this.$refs.image

    let img = new Image()
    img.src = this.imgUrl
    img.onload = () => {
      let winW = window.innerWidth
      let imgW = img.width
      let imgH = img.height

      this.picW = imgW > winW ? winW : imgW
      this.picH = imgW > winW ? winW * imgH / imgW : imgW
      this.initEvent()
    }

    getBase64(this.imgUrl, (data) => {
      this.base64Url = data
    })
  },
  destroyed () {
  }
}
</script>

<style lang="scss" scoped>
.preview-wrap{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba($color: #000000, $alpha: .8);
  text-align: center;
  overflow: hidden;
  &::after{
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
}
.preview-mask{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.img{
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
}
.el-icon-close,.icon-download{
  position: absolute;
  right: 6px;
  top: 6px;
  font-size: 30px;
  cursor: pointer;
  z-index: 1000;
  color: #ffffff;
}

.icon-download{
  top: auto;
  bottom: 6px;
}
.h5-wrap {
  .preview-mask{
    background-color: #000000;
  }
}
</style>
