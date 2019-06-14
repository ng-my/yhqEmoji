var path = require('path')
var webpack = require('webpack')
const NODE_ENV = process.env.NODE_ENV
const enteyMap = {
  production: './src/index.js',
  development: './src/main.js'
}

const pathMap = {
  production: './dist',
  development: './dist'
}

const publicMap = {
  production: './dist/',
  development: '/dist'
}

module.exports = {
  entry: enteyMap[NODE_ENV], // 引入路径 build模式下直接引入组件自身
  output: {
    path: path.resolve(__dirname,  pathMap[NODE_ENV]), // 输出路径
    publicPath: publicMap[NODE_ENV], // 资源引入路径 为了方便我们的demo打包 开发模式和demo模式相同
    filename: 'yhqEmoji.js', // 你的组件名称
    library: 'yhqEmoji', // 填写组件名称即可 人家可以通过这个名称来引入
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
