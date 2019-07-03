<template>
  <div>
    <quill-editor v-model="content" ref="yhqQuillEditor" @change="editorChange($event)" @focus="onFocus($event)" v-bind:options="options" :style="style"></quill-editor>
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
        <div class="qq_cont" v-if="index==1">
          <ul class="qq-face">
            <li class="face-item" v-for="(item, index) in qqImg" :key="index" @click="addFace(item, index, 1)">
              <img :src="item" alt="">
            </li>
          </ul>
        </div>
        <div class="symbol_cont"  v-if="index==2">
          <ul class="symbol-face">
            <li class="face-item" v-for="(item, index) in symbolImg" :key="index" @click="addFace(item, index, 2)">
              <img :src="item" alt="">
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import myData from './data'
  export default {
    name: "yhqEmoji",
    // props: ['yhqOptions', 'yhqContent', 'yhqStyle', 'yhqFaceStyle', 'yhqFaceListStyle'],
    props: {
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
    data: function () {
      return {
        options: {placeholder: '请输入内容', modules: { toolbar: ''}},
        content: "",
        style: {height: '240px'},
        faceStyle: {},
        faceListStyle: {},
        index: 1,
        faceFlag: false,
        qqCode: [],
        symbolCode: [],
        qqImg: [],
        symbolImg: [],
        encodeItem: ""
      }
    },
    created () {
      this.qqCode = myData.qqCode;
      this.symbolCode = myData.symbolCode.split("")
      this.qqImg = myData.qqImg;
      this.symbolImg = myData.symbolImg;
      if (this.yhqOptions) {Object.assign(this.options, this.yhqOptions)}
      if (this.yhqContent) { this.content = this.yhqContent}
      if (this.yhqStyle) { this.style = this.yhqStyle}
      if (this.yhqFaceStyle) { this.faceStyle = this.yhqFaceStyle}
      if (this.yhqFaceListStyle) { this.faceListStyle = this.yhqFaceListStyle}
    },
    methods: {
      getEditor () {
        return this.$refs.yhqQuillEditor.quill
      },
      getEditorContent () {
        return this.content
      },
      editorChange (e) {
        let quill = this.getEditor()
        let content = quill.getContents().ops
        let len = 0
        for (let i = 0; i < content.length; i++) {
          if (content[i].insert && content[i].insert.image && (!myData.qqImg.includes(content[i].insert.image) && !myData.symbolImg.includes(content[i].insert.image))) {
            quill.removeFormat(len, len + 1);
            continue
          }
          if (content[i].attributes) {
            quill.removeFormat(len, len + content[i].insert.length);
            continue
          }
          if (content[i].insert && !content[i].attributes && !content[i].insert.image) {
            len += content[i].insert.length
            continue
          }
          if (content[i].insert && content[i].insert.image) {
            len += 1
          }
        }
      },
      onFocus () {
        this.faceFlag = false
      },
      addFace (item, indexNo, type) {
        let quill = this.getEditor()
        let index = quill.selection.savedRange.index
        if (type === 1) {
          quill.insertEmbed(index, 'image', item, 'title')
        } else {
          quill.insertEmbed(index, 'image', item, 'title')
        }
        quill.setSelection(index + 1)
      },
      encodeImg (item) {
        if (item.includes("src=")) {
          let startIndex = item.indexOf("src=")
          let endIndex = item.indexOf(">")
          let str = item.substring(startIndex + 5, endIndex - 1)
          let index = myData.qqImg.indexOf(str)
          if (index === -1) {
            index = myData.symbolImg.indexOf(str)
            str = 'src="' + str + '">'
            item = item.replace(str, myData.symbolCode[index])
          } else {
            str = 'src="' + str + '">'
            item = item.replace(str, myData.qqCode[index])
          }
          this.encodeImg(item);
        } else {
          this.encodeItem = item;
        }
      },
      encoding (content) {
        if (!content) {
          content = this.getEditorContent()
        }
        let arr = []
        arr = content.split("</p><p>")
        let newarr = arr.map((item) => {
          item = item.replace(/(<img |<p>|<\/p>|<br>)?/g, "")
          this.encodeItem = ""
          this.encodeImg(item);
          item = this.encodeItem
          return item
        })
        /* 这里转换后端服务存取的格式 */
        let str = newarr.join('\n').replace(/&nbsp;/g, "\t").trim()
        return str
      },
      deCoding (item) {
        if (item === undefined || item === null || item.length === 0) {
          item = ""
        }
        // 换行解析操作
        item = item.split('\u000a')
        for (let i = 0; i < item.length; i++) {
          item[i] = "<p>" + item[i] + "</p>"
          if (item[i] === "<p></p>") {
            item[i] = "</br>"
          }
        }
        item = item.join("")
        let content = item
        let startnum = ''
        let endnum = ''
        let newContent = item
        // qq表情
        if (content.indexOf('[' > 0)) {
          for (let i = 0; i < content.length; i++) {
            if (content.charAt(i) === '[') {
              startnum = i
            }
            if (content.charAt(i) === ']') {
              endnum = i
            }
            if (endnum) {
              let imgCode = content.substring(startnum, endnum + 1)
              let imgNum = ''
              myData.qqCode.forEach(function (value, index) {
                if (imgCode === value) {
                  imgNum = index
                }
              })
              if (imgNum >= 0) {
                imgCode = imgCode.substring(1, imgCode.length - 1)
                let regExp = new RegExp(`\\[${imgCode}\\]`, "g");
                let src = myData.qqImg[imgNum]
                newContent = newContent.replace(regExp, `<img src="${src}">`)
              }
              endnum = ''
              startnum = ''
            }
          }
        }
        // 符号表情
        for (let j = 0; j < content.length; j++) {
          myData.symbolCode.split("").map(function (value, index) {
            if (value === content.charAt(j)) {
              let imgNum = myData.symbolCode.indexOf(value)
              let regExp = new RegExp(`${value}`, "g");
              let src = myData.symbolImg[imgNum]
              newContent = newContent.replace(regExp, `<img src="${src}">`)
            }
          })
        }
        return newContent
      }
    }
  }
</script>

<style scoped>
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
<style>
</style>
