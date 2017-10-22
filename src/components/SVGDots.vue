<template>
  <div>
    <span class="controls">
      <build-path @click.native.stop="setBuildingMode" v-bind:class="this.state.mode == BUILD ? 'selected' : ''"/>
      <move @click.native.stop="setMoveMode" v-bind:class="this.state.mode == MOVE ? 'selected' : ''"/>
      <delete @click.native.stop="setDeleteMode" v-bind:class="this.state.mode == DELETE ? 'selected' : ''"/>
      <zoom-in @click.native.stop="zoomIn"/>
      <zoom-out @click.native.stop="zoomOut"/>
    </span>
    <svg id="svgMap" width="100%" height="100%" @click="clickSVG" @mousedown="mousedownSVG" @dblclick="endPathBuilding"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
      <defs>
        <filter id="dropShadow" x="0" y="0">
          <feOffset result="offOut" in="SourceAlpha" dx="-2" dy="-2" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="5" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>
      <g id="groupScale" transform="scale(1)">
        <g id="groupMove" transform="translate(0,0)">
         <image :xlink:href="background" />
          <g id="gnodes" v-for="n in state.nodes">
            <template v-if="n.icon">
              <image class="locations node" :xlink:href="n.icon" :x="n.x - ICON_SIZE / 2" :y="n.y - ICON_SIZE" 
                    :width="ICON_SIZE" :height="ICON_SIZE" :id="n.id" :nodeId="n.id"
                    @click="nodeClick" @mousedown.stop="startDragNode"
                    :key="'img' + n.id"  filter="url(#dropShadow)" />
              <text :x="n.x + ICON_SIZE / 2 + 10" :y="n.y - (ICON_SIZE - FONT_SIZE) / 2" :font-size="FONT_SIZE" font-weight="bold">
                {{n.name}}
              </text>
            </template>
            <circle :cx="n.x" :cy="n.y" r="7" :key="'n' + n.id" :nodeId="n.id"
                    @click="nodeClick" @mousedown.stop="startDragNode"
                    class="circle node" :stroke="state.dotStroke" :fill="state.dotFill" />
          </g>         
          <line v-for="l in lineLinks" 
                :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" :style="state.lineStyle" :key="l.id" :linkId="l.id"
                class="line" @click.stop="lineClick"/>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
import ZoomIn from './icons/ZoomIn'
import ZoomOut from './icons/ZoomOut'
import Delete from './icons/Delete'
import Move from './icons/Move'
import BuildPath from './icons/BuildPath'
import {BUILD, MOVE, DELETE} from './store'

export default {
  props: ['store'],
  components: {
    ZoomIn,
    ZoomOut,
    Move,
    BuildPath,
    Delete
  },
  data () {
    return {
      // make the constants available in the template
      BUILD: BUILD,
      MOVE: MOVE,
      DELETE: DELETE,
      ICON_SIZE: 64,
      FONT_SIZE: 24,
      isSplitting: false,
      beingDragId: -1,      // who is being dragged
      isDragging: false,    // says if we are currently dragging something
      isEditing: true,
      state: this.store.state,
      actions: this.store.actions
    }
  },
  methods: {
    zoomIn (event) {
      console.log('[INFO] Zooming in')
      const g = document.querySelector('#groupScale')
      const newScale = parseFloat(this.state.scale) + 0.1
      this.actions.setScale(newScale)
      g.setAttribute('transform', 'scale(' + newScale + ')')
    },
    zoomOut (event) {
      console.log('[INFO] Zooming out')
      const g = document.querySelector('#groupScale')
      const newScale = parseFloat(this.state.scale) - 0.1
      this.actions.setScale(newScale)
      g.setAttribute('transform', 'scale(' + newScale + ')')
    },
    mousedownSVG (event) {
      if (this.state.mode !== MOVE) {
        return
      }
      // now listen globally for mouse movements
      window.addEventListener('mousemove', this.panSVG)
      window.addEventListener('mouseup', this.stopPanSVG)
    },
    panSVG (event) {
      if (this.state.mode !== MOVE) {
        return
      }
      // get how much we move from the last mouse event
      const dx = event.movementX / this.state.scale
      const dy = event.movementY / this.state.scale
      // save mouse position for the next movement
      const g = document.querySelector('#groupMove')
      let transform = g.getAttribute('transform')

      // keep aware of future changes
      window.addEventListener('resize', this.resizeSVG)
      transform = this.actions.shiftSVG(dx, dy)
      // move the svg
      g.setAttribute('transform', transform)
    },
    resizeSVG (event) {
      console.log('[WARN][TODO] Resizing')
      /* const svg = document.querySelector('#svgMap')
      const viewBox = this.getViewBox(svg)
      svg.setAttribute('viewBox', viewBox) */
    },
    getViewBox (svg) {
      const box = svg.getBoundingClientRect()
      return '0 0 ' + box.width + ' ' + box.height
    },
    stopPanSVG (event) {
      if (this.state.mode !== MOVE) {
        return
      }
      console.log('[DEBUG] stop pan')
      // set the dragging mode
      window.removeEventListener('mousemove', this.panSVG)
      window.removeEventListener('mouseup', this.stopPanSVG)
    },
    setBuildingMode (event) {
      this.actions.setBuildingMode()
    },
    setMoveMode (event) {
      this.actions.setMoveMode()
    },
    setDeleteMode (event) {
      this.actions.setDeleteMode()
    },
    lineClick (event) {
      const linkId = event.target.getAttribute('linkId')
      console.log('[INFO] line clicked', linkId)
      switch (this.state.mode) {
        case DELETE:
          this.actions.deleteLink(linkId)
          break
        case BUILD:
          this.actions.splitLink(linkId, event.offsetX, event.offsetY)
          break
        default:
          break
      }
    },
    startDragNode (event) {
      if (this.state.mode !== MOVE) {
        return
      }
      if (event.preventDefault) {
        event.preventDefault()
      }
      if (event.stopPropagation) {
        event.stopPropagation()
      }
      // set the on mouse move listener
      window.addEventListener('mousemove', this.moveNode)
      window.addEventListener('mouseup', this.stopDragNode)
      // set the dragging mode
      this.isDragging = true
      // set which node is starting to drag
      const nodeId = parseInt(event.target.getAttribute('nodeId'))
      this.beingDragId = nodeId
    },
    moveNode (event) {
      if (this.state.mode !== MOVE || !this.isDragging) {
        return
      }
      // get how much we move from the last mouse event
      const dx = event.movementX / this.state.scale// event.offsetX - this.lastMouseX
      const dy = event.movementY / this.state.scale // event.offsetY - this.lastMouseY
      if (Math.abs(dx) > 100 || Math.abs(dy) > 100) {
        return
      }
      // move the node
      this.actions.shiftNode(this.beingDragId, dx, dy)
    },
    stopDragNode (event) {
      if (this.state.mode !== MOVE) {
        return
      }
      // set the dragging mode
      this.isDragging = false
      this.beingDragId = -1
      window.removeEventListener('mousemove', this.moveNode)
      window.removeEventListener('mouseup', this.stopDragNode)
    },
    // called when a node is clicked
    nodeClick (event) {
      const nodeClikedId = parseInt(event.target.getAttribute('nodeId'))
      console.log('[INFO] node clicked', nodeClikedId)
      switch (this.state.mode) {
        case BUILD:
          this.linkWithLastCreate(nodeClikedId)
          break
        case DELETE:
          this.actions.deleteNode(nodeClikedId)
          break
        default:
          break
      }
      event.stopPropagation()
    },
    // join node to the last one
    linkWithLastCreate (nodeClikedId) {
      // here we reset the previous node id such that new path
      // will start from here
      if (!this.actions.isStartingPoint()) {
        console.log('[INFO] Joining nodes...')
        this.actions.createLink(this.state.prevNodeId, nodeClikedId)
      }
      this.actions.setPrevNodeId(nodeClikedId)
      this.isSplitting = true
    },
    clickSVG (event) {
      if (!this.isEditing || this.state.mode !== BUILD) {
        return
      }
      const newNode = this.actions.createNode({ x: event.offsetX, y: event.offsetY })

      // at this time we don't add any link
      if (!this.actions.isStartingPoint()) {
        this.actions.createLink(this.state.prevNodeId, newNode.id)
      }

      if (this.isSplitting) {
        this.isSplitting = false
      }
      this.actions.setPrevNodeId(newNode.id)
    },
    endPathBuilding (event) {
      console.log('[INFO] reseting starting point of the path')
      this.actions.resetPathBuilding()
      this.actions.setMoveMode()
    }
  },
  computed: {
    background () {
      return this.state.background
    },
    lineLinks () {
      return this.state.links.map(l => {
        const n1 = this.state.nodes.filter(n => n.id === l.from)[0]
        const n2 = this.state.nodes.filter(n => n.id === l.to)[0]
        return {
          id: l.from + '-' + l.to,
          x1: n1.x,
          y1: n1.y,
          x2: n2.x,
          y2: n2.y
        }
      })
    }
  },
  watch: {
    links () {
      return this.state.links.map(l => {
        const n1 = this.state.nodes.filter(n => n.id === l.from)[0]
        const n2 = this.state.nodes.filter(n => n.id === l.to)[0]
        return {
          id: l.from + '-' + l.to,
          x1: n1.x,
          y1: n1.y,
          x2: n2.x,
          y2: n2.y
        }
      })
    }
  }
}
</script>

<style scoped>
.controls svg {
  margin-left: 20px;
  margin-top: 20px;
  width: 24px;
  opacity: 0.5;
  cursor: pointer;
}
.controls svg:hover {
  opacity: 1;
}
.controls .selected {
  opacity: 1;
}
div{
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
}
#mapBackground img {
  width: 100%;
}
@keyframes zoomIn {
    0%   {stroke-width: 2}
    100% {stroke-width: 20}
}
.circle {
	stroke-width: 1;
	stroke-linecap: round;
}
.node:hover {
  stroke-width: 16px;
  cursor: pointer;
}
.line:hover {
  cursor: pointer;
}
.locations {
  width: 64px;
  height: 64px;
}
</style>
