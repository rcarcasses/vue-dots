import VueDots from './App.vue'

module.exports = {
  install: function (Vue, options) {
    Vue.component('vue-dots', VueDots)
    Vue.prototype.$vueDots = VueDots.data().store
  }
}
