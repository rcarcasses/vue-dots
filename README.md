# vue-dots

> Simple graph building and visualization vue component based in SVG

![Alt Text](https://github.com/rcarcasses/vue-dots/raw/master/examples/vue-dots.gif)

## Usage
Add it to your project:
```
yarn add vue-dots
```
then import the plugin in your main Vue instance:
```
import VueDots from 'vue-dots'
import 'vue-dots/dist/vue-dots.css'
...
Vue.use(VueDots)
```

This registrate a global ```vue-dots``` component and a store object ```this.$vueDots``` which you can access in your own components and fully control the content of the graph editor.

## Keyboard shortcuts
The keyboard events are listened from the window:

- *"b"* build mode: new nodes are added while clicking in the svg area.
- *"m"* move mode: drag and drop of the whole document as well as of nodes.

- *"d"* delete mode: nodes and links are removed on click.
- arrow keys: move the svg in the correspondent direction.
- *"+"* zoom in.
- *"-"* zoom out.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
# This produces a Vue plugin.
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
