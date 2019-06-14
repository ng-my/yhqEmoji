# yhqemoji
> yhqemoji
可在富文本编辑器中选择Emoji表情，类似微信那样，
可以获取原生html代码和可直接在微信中显示的表情代码，
也可以将在微信中显示的表情代码代码转换成原生html代码。

## Install

#### NPM

``` bash
npm install yhqemoji --save

## 使用方法

#### 依赖
"quill": "^1.3.6",
"vue-quill-editor": "^3.0.6",

#### main.js中
import yhqEmoji from 'yhqEmoji'
Vue.use(yhqEmoji)

加上 Vue.prototype.yhqEmoji = yhqEmoji
可以全局调用 yhqEmoji 中的方法

#### html代码中
<yhqEmoji :yhqContent="content" ref="textEdit"></yhqEmoji>

props: {
      yhqOptions: {
        type: [Object, String],
        default: () => ("") // 默认为 {placeholder: '请输入内容', modules: { toolbar: ''}}
      },
      yhqContent: {
        type: String,
        default: () => ("") // v-model="content"
      },
      yhqStyle: {
        type: [Object, String],
        required: false,
        default: () => ("") // 输入框的样式 默认为 {}
      },
      yhqFaceStyle: {
        type: [Object, String],
        required: false,
        default: () => ("") // 头像的样式 默认为 {}
      },
      yhqFaceListStyle: {
        type: [Object, String],
        required: false,
        default: () => ("") // 头像列表的样式 默认为 {}
      }
    }

#### Function:
  1、encoding(content)：可以将富文本中的html代码转化成微信需要的数据格式
    参数 content（类型String） 为非必填。没有参数会自动获取富文本的内容进行转换。
    this.$refs.textEdit.encoding();

  2、deCoding(content)：可以将微信的数据格式转化成html代码
    参数 content（类型String） 为必填。
    this.yhqEmoji.yhqEmoji.methods.deCoding(content)
```

## Author
[杨宏庆 365398920@qq.com]
