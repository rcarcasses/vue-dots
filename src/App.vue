<template>
  <div id="app">
    <svg-dots :store="store"/>
  </div>
</template>

<script>
import SVGDots from './components/SVGDots'
import {store} from './components/store'

export default {
  name: 'app',
  data () {
    return {
      store
    }
  },
  components: {
    'svg-dots': SVGDots
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 90vh;
}
</style>
