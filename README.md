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
import yhqEmoji from 'yhqemoji'
Vue.use(yhqEmoji)
Vue.prototype.$emoji = yhqEmoji // 可以在项目中调用内部方法。使用ref也可以

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
      value: {// 1.2.4版本之后 新增v-model
        type: [Object, String],
        default: () => ('')
      },
      yhqContent: { // 1.2.4版本之后 不鼓励使用。可以直接使用 v-model
        type: String,
        default: () => ("")
      },
       yhqOptions: {
        type: [Object, String],
        default: () => ("") // 默认为 {placeholder: '请输入内容', modules: { toolbar: ''}}
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

    1.2.4版本之后可以使用v-model双向绑定。（放弃原来的 yhqContent 传值）

#### Function:
  1、encoding(content)：可以将富文本中的html代码转化成微信需要的数据格式
    参数 content（类型String） 为非必填。没有参数会自动获取富文本的内容进行转换。
    this.$refs.textEdit.encoding();

  2、deCoding(content)：可以将微信的数据格式转化成html代码
    参数 content（类型String） 为必填。
    this.yhqEmoji.yhqEmoji.methods.deCoding(content)

  3、insertBlot(blot)：//自定义组件 插入静态变量变量标签  【1.2.4版本新增方法】
    参数 blot（类型obj）
    {
        title: "",
        style: "color: #0f6aff;display: inline-block;",
        className: "yhq-emoji-blot",
        type: ""
    }
    其中title和type不能为空。
    this.$refs.textEdit.insertBlot(blot)

    4、blotContentReplace(content)  【1.2.4版本新增方法】
    // 把content里含有 YhqInlineBlot 的yhqblot标签替换成定义的type字段
    // content 没传值使用文本框里格式化好的值
    参数 content 需要格式的内容，内容含有自定义组件。不传值默认使用文本框里格式化好的值
    this.$refs.textEdit.blotContentReplace(content)

####1.2.4版本之后新增以下内容

    1：可以使用v-model绑定数据。返回的数据是直接格式好的。不用再调用内部方法进行转换

    2：新增方法insertBlot 和 blotContentReplace

    3：新增一个callback 方法quillTip； 返回粘贴图片、对象等错误提示 使用方法：@quillTip="quillTip" argument 为错误提示
```

## Author
[杨宏庆 365398920@qq.com]
