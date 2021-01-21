<template>
  <div class="yhq-emoji-new-wrap">
    <quill-editor v-model="content" ref="yhqQuillEditor" @change="editorChange($event)" @focus="onFocus($event)" :options="options" :style="style"></quill-editor>
    <div class="face-entry" @click="faceFlag=true" :style="faceStyle"></div>
    <div class="expression" v-if="faceFlag" :style="faceListStyle">
      <ul class="exp_hd">
        <li class="exp_hd_item" :class="{'active': index == 1}" @click="index = 1;">
          <a href="javascript:;">QQ表情</a>
        </li>
        <li class="exp_hd_item " :class="{'active': index == 2}" @click="index = 2;">
          <a href="javascript:;">符号表情</a>
        </li>
      </ul>
      <div class="face-list">
        <div class="qq_cont" v-show="index==1">
          <ul class="qq-face">
            <li class="face-item" v-for="(item, index) in qqImg" :key="index" @click="addFace(item, index, 1)">
              <img :src="item" alt="">
            </li>
          </ul>
        </div>
        <div class="symbol_cont" v-show="index==2">
          <ul class="symbol-face">
            <li class="face-item" v-for="(item, index) in symbolImg" :key="index" @click="addFace(item, index, 2)">
              <img :src="item" alt="">
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--<button @click="insertBlot()">insertBlot</button>-->
  </div>
</template>

<script>
import myData from './data'
import Quill from "quill"
export default {
  name: "YhqEmoji",
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [Object, String],
      default: () => ('')
    },
    yhqOptions: {
      type: [Object, String],
      default: () => ("")
    },
    yhqContent: {
      type: String,
      default: () => ("")
    },
    yhqStyle: {
      type: [Object, String],
      required: false,
      default: () => ("")
    },
    yhqFaceStyle: {
      type: [Object, String],
      required: false,
      default: () => ("")
    },
    yhqFaceListStyle: {
      type: [Object, String],
      required: false,
      default: () => ("")
    }
  },
  watch: {
    content (value) {
      let val = this.encoding(value)
      // console.log("content-----set：", val)
      this.$emit('change', val)
    }
  },
  computed: {
    options () {
      const options = { placeholder: '请输入内容', modules: { toolbar: '' } }
      return Object.assign(options, this.yhqOptions)
    },
    style () {
      const style = { height: '240px' }
      return Object.assign(style, this.yhqStyle)
    },
    faceStyle () {
      const yhqFaceStyle = {}
      return Object.assign(yhqFaceStyle, this.yhqFaceStyle)
    },
    faceListStyle () {
      const yhqFaceListStyle = {}
      return Object.assign(yhqFaceListStyle, this.yhqFaceListStyle)
    }
  },
  data: function () {
    return {
      newPlug: false, // 是否是新版本。新版本使用v-model绑定数据。默认是老版本
      content: "",
      index: 1,
      faceFlag: false
    }
  },
  created () {
    this.qqCode = myData.qqCode;
    this.symbolCode = myData.symbolCode
    this.qqImg = myData.qqImg;
    this.symbolImg = myData.symbolImg;
    this.initContent()
    if (this.$listeners &&
      this.$listeners.change &&
      this.$listeners.change.fns &&
      this.$listeners.change.fns.name &&
      this.$listeners.change.fns.name === "callback" ) {
      this.newPlug = true
    }
  },
  mounted () {
    this.registerNewBlot()
    // this.insertBlot()
  },
  methods: {
    initContent () {
      // console.log("initContent：", val)
      if (this.yhqContent) {
        this.content = this.yhqContent
      } else {
        let val = this.deCoding(this.value)
        if (val.includes('data-blot="YhqInlineBlot"')) {
          this.$nextTick(() => {
            let quill = this.getEditor()
            quill.root.innerHTML = val
          });
        }
        this.content = val
      }
    },
    registerNewBlot () { // 注册新组件
      const blots = Quill.import('blots/embed');// 引入源码中的embed
      class YhqInlineBlot extends blots {// 定义新的blot类型
        static create (value) {
          const node = super.create(value);
          node.dataset.blot = "YhqInlineBlot";
          node.dataset.type = value.type;
          node.dataset.timestamp = (new Date).getTime();

          node.title = value.title;
          node.style = value.style;
          node.className = value.className;

          //   设置自定义html
          node.innerHTML = value.title

          node.setAttribute('contenteditable', 'false');
          return node;
        }

        // 返回节点自身的value值 用于撤销操作
        static value (node) {
          return node.innerHTML
        }
      }
      // blotName
      YhqInlineBlot.blotName = 'YhqInlineBlot';
      // 标签类型自定义
      YhqInlineBlot.tagName = 'section';
      Quill.register(YhqInlineBlot, true);
    },
    getEditor () {
      return this.$refs.yhqQuillEditor.quill
    },
    getEditorContent () {
      let quill = this.getEditor()
      let content = quill.root.innerHTML
      if (content === "<p><br></p>") {
        content = ""
      }
      return content
    },
    editorChange (e) {
      const quill = this.getEditor()
      const imgArr = myData.qqImg.concat(myData.symbolImg)
      const content = quill.getContents().ops
      let len = 0
      let formatLen = 0
      for (let i = 0; i < content.length; i++) {
        // console.log(len, content)
        const item = content[i]
        if (item.insert && item.insert.YhqInlineBlot) {
          let arr = item.insert.YhqInlineBlot.split('<span contenteditable="false">')
          let blotLen = arr[arr.length - 1].split('</span>')[0]
          len += blotLen.length
          continue
        }
        if (item.attributes) {
          const length = item.insert.length || item.insert.image.length || 1
          for (const one in item.attributes) {
            quill.formatText(formatLen, formatLen + length, one, false); // 清除格式
          }
          formatLen += length
          continue
        }
        if (item.insert && item.insert.image) {
          let flag = imgArr.includes(item.insert.image)
          if (flag) {
            len += item.insert.image.length
          } else {
            quill.removeFormat(len, len + 1);
          }
          continue
        }
        if (item.insert && !item.attributes && !item.insert.image) {
          len += item.insert.length
          continue
        }
        if (item.insert && item.insert.image) {
          len += 1
        }
      }
    },
    insertBlot (content) {
      // 插入静态变量span标签
      let defaultContent = {
        title: "",
        style: "color: #0f6aff;display: inline-block;",
        className: "yhq-emoji-blot",
        type: ""
      }
      if (!content.title || !content.type) {
        alert("请填写title和type")
      }
      const quill = this.getEditor()
      const index = quill.selection.savedRange.index
      quill.insertEmbed(index, 'YhqInlineBlot', Object.assign(defaultContent, content));
      this.$nextTick(() => {
        quill.setSelection(index + 1);
      });
    },
    blotContentReplace (content, str) {
      // 把content里含有 YhqInlineBlot 的section标签替换成想要的字符串
      // content 没传值使用文本框里格式化好的值
      // str 没传值使用YhqInlineBlot组件中的type值
      if (content === undefined) {
        content = this.encoding(this.content)
      }
      let indexStart = content.indexOf('<section data-blot="YhqInlineBlot" data-type=')
      if (indexStart === -1) {
        return content
      } else {
        let indexEnd = content.indexOf("<\/span>﻿<\/section>", indexStart + 1)
        let yhqInlineBlot = content.substring(indexStart, indexEnd + 18)
        if (str === undefined) {
          let indexEnd_1 = content.indexOf('" data-timestamp="', indexStart + 1)
          str = content.substring(indexStart + 46, indexEnd_1)
        }
        content = content.replace(yhqInlineBlot, str)
        return this.blotContentReplace(content, str)
      }
    },
    onFocus () {
      this.faceFlag = false
    },
    /*向编辑器内容区域插入表情图片base64*/
    addFace (item, indexNo, type) {
      const quill = this.getEditor()
      const index = quill.selection.savedRange.index
      if (type === 1) {
        quill.insertEmbed(index, 'image', item, 'qqImg')
      } else {
        quill.insertEmbed(index, 'image', item, 'symbolImg')
      }
      quill.setSelection(index + 1)
    },
    /*编码-图片=>[微笑]*/
    encoding (content) {
      if (!content) {
        if (this.newPlug) {
          return ""
        } else {
          content = this.getEditorContent()
        }
      }
      // console.log("encoding:编码-图片=>[微笑]", content)
      let arr = []
      arr = content.split("</p><p>")
      const newarr = arr.map((item) => {
        item = item.replace(/(<p>|<\/p>|<br>|<\/br>)?/g, "")
        item = this.imgReplaceToCode(item);
        return item
      })
      /* 这里转换后端服务存取的格式 */
      const str = newarr.join('\n').replace(/&nbsp;/g, "\t").trim()
      return str
    },
    imgReplaceToCode (item) {
      if (!(item.includes(myData.base64Str) && item.includes("<img src="))) {
        return item
      }
      const startIndex = item.indexOf("<img src=")
      const endIndex = item.indexOf(">", startIndex + 1)
      let str = item.substring(startIndex + 10, endIndex - 1)
      let index = myData.qqImg.indexOf(str)
      if (index === -1) {
        index = myData.symbolImg.indexOf(str)
        str = '<img src="' + str + '">'
        item = item.replace(str, myData.symbolCode[index])
      } else {
        str = '<img src="' + str + '">'
        item = item.replace(str, myData.qqCode[index])
      }
      return this.imgReplaceToCode(item);
    },
    /*解码-[微笑]=>图片*/
    deCoding (item) {
      // console.log("deCoding:解码-[微笑]=>图片")
      if (item === undefined || item === null || item.length === 0) {
        item = ""
      }
      // 换行解析操作
      item = item.split('\u000a')
      for (let i = 0; i < item.length; i++) {
        item[i] = "<p>" + item[i] + "</p>"
        if (item[i] === "<p></p>") {
          item[i] = "<p><br></p>"
        }
      }
      let content = item.join("")
      content = this.symbolCodeReplaceToImg(content)// 符号表情替换成图片
      content = this.qqCodeReplaceToImg(content)//qq表情替换成图片
      return content
    },
    //deCoding-符号表情替换成图片
    symbolCodeReplaceToImg (content) {
      myData.symbolCode.map((value, index) => {
        const num = content.indexOf(value)
        if (num > -1) {
          const regExp = new RegExp(`${value}`, "g");
          const src = myData.symbolImg[index]
          content = content.replace(regExp, `<img src="${src}">`)
        }
      })
      return content
    },
    //deCoding-qq表情替换成图片
    qqCodeReplaceToImg (content) {
      if (!(content.includes("[") && content.includes("]"))) {
        return content
      }
      myData.qqCode.map((value, index) => {
        const num = content.indexOf(value)
        if (num > -1) {
          const qqCode = value.replace("[", "").replace("]", "")
          const regExp = new RegExp(`\\[${qqCode}\\]`, "g");
          const src = myData.qqImg[index]
          content = content.replace(regExp, `<img src="${src}">`)
        }
      })
      return content
    }

  }
}
</script>

<style>
  ul, li, p, a {
    list-style:none;
    margin: 0;
    padding: 0;
  }
  .face-entry {
    margin-top:5px;
    width: 25px;
    height: 25px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFIGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMDQtMjRUMTc6MzA6MzArMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTA0LTI3VDE3OjQ0OjM3KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTA0LTI3VDE3OjQ0OjM3KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmEzMmQ1YjE2LWNkZjUtNDk5My1iMDc2LTg5NDIwMzBjMjIyMiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDphMzJkNWIxNi1jZGY1LTQ5OTMtYjA3Ni04OTQyMDMwYzIyMjIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDphMzJkNWIxNi1jZGY1LTQ5OTMtYjA3Ni04OTQyMDMwYzIyMjIiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmEzMmQ1YjE2LWNkZjUtNDk5My1iMDc2LTg5NDIwMzBjMjIyMiIgc3RFdnQ6d2hlbj0iMjAxOS0wNC0yNFQxNzozMDozMCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+GUGtVwAAAkZJREFUSIm11j1onVUcx/HPNZKAEBxcfEEQRBShU9SYQCAUOhqTxqTEwamo2RzNXxC6/Okg6ObSJR1Cmwgam4BL2iyaUloEJVIhg/gSV1/Q4YLE4Tk3PPfm3twg5g8PPM95+f7OOf+X8zQODg6cpj1wqnQ8eFxnZg5iujxjeBxN/Iyv8SnWI6LZi9FzB5k5g128hW2cwzAewSul7W3sZub5XpxGpw8ycwCJKSxGxHbvPZKZk/gYnyMi4p9+O0i8jNF+cBVxGy9htMxtszaBzHwNr2IqIv7oB6+J/NmaVxiHdnhExaF7WIiIL08K71jgOK7j6Zbj6zuYw/f/FQ4R8RXuY77VVheYxmrHinYyc7nPqpczc6fWtFpYRwRexK0ujH7J2Oj4vokXWh/1RHsUP9ZHRsRYH7iIeKOj6Sc81k2giSE0M7OJv3DSQtXAUEQ81NlRF/gVT6ictIcLEfHtSeiZeUYVPfBkYaH9fL/BRHnfUIuEE9gsvijvZ3G3m8BnNehHeDMzn+lHLmMW8UFpmi+sIwJreDYzxyNiH+9h8ziR0repqkH7mTmG5woLHcUuM+dwCWMR8Xtmvo4PcQXX8F0Z+jwWcBHvRMRKZj6M23g/Ig4F2mK8dGxgPTOHI2JFFdMDWMHf+A1XVRE2UuDDWMeNOpzuF86Sygd3MrNVrt8tT7djmlSV660yt82O3Ae1ibO4jB9U6b+lSqJBVShOqBz6FJYi4pNunJ4CRWRQVQRnMKLKE/gF91RX5tpxV+axAv+Hnfpfxb9DlNE9K+wyIgAAAABJRU5ErkJggg==') no-repeat;
  }
  .expression {
    border: 1px solid #dedede;
  }
  .exp_hd {
    padding: 8px 20px 0;
    overflow: hidden;
    background-color: #f2f2f2;
    display: flex;
  }
  .exp_hd_item {
    color: #333;
    padding: 5px;
    font-size: 14px;
  }
  .exp_hd_item.active {
    background-color: #fff;
  }
  .exp_hd_item a {
    color: #333;
    text-decoration: none;
  }
  .qq-face,.symbol-face {
    background-color: #fff;
    padding-left: 5px;
    max-height: 203px;
    overflow: auto;
  }
  .face-list .face-item {
    width: 25px;
    height: 25px;
    border-bottom: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    cursor: pointer;
    margin: 2px;
    float: left;
  }
  .face-item img {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
