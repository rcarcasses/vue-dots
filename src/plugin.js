import VueDots from './App.vue'

export default {
  install (Vue, options) {
    Vue.component('vue-dots', VueDots)
    Vue.prototype.$vueDots = VueDots.data().store
  }
}

export { VueDots }
