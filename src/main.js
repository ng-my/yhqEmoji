import Vue from 'vue'
import App from './App.vue'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

new Vue({
  el: '#app',
  render: h => h(App)
})
