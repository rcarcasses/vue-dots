export const BUILD = 1
export const MOVE = 2
export const DELETE = 3

const state = {
  background: '/static/Third_Floor_Plan_2016.jpg',
  scale: 1,
  shiftX: 0,
  shiftY: 0,
  nodes: [],            // graphSample.nodes,
  links: [],            // graphSample.links,
  lastId: -1,           // used to assign id to new nodes
  dotStroke: 'rgb(107, 107, 144)',    // dot stroke, as appears in the svg
  dotFill: 'rgb(107, 107, 144)',      // dot fill color
  mode: BUILD,          // current mode of the component
  prevNodeId: -1,       // last node from which a link will be constructed
  lineStyle: 'stroke:rgb(107, 107, 144);stroke-width:4',
  filters: [n => n.id < 4]           // contains functions to apply to the array of nodes with the purpose of filtering
}

function setPrevNodeId (id) {
  state.prevNodeId = id
}

function isStartingPoint () {
  return state.prevNodeId === -1
}

function resetPathBuilding () {
  state.prevNodeId = -1
}

function getNewNodeId () {
  const newId = state.lastId += 1
  return newId
}
/**
 * This function receives an object with the definition of the node to
 * be created. This definition is an object which should contain at least
 * the x and y values which denote the position of the node unscaled
 */
function createNode (obj) {
  let {x, y} = obj
  // we update the id store
  x /= state.scale
  x -= state.shiftX
  y /= state.scale
  y -= state.shiftY
  const id = getNewNodeId()
  const newNode = {
    ...obj,
    id,
    x,
    y
  }
  // adding the new node to nodes list
  state.nodes.push(newNode)
  return newNode
}

// adds a new link given the from and to nodes id
function createLink (from, to) {
  // if the link exist then skip it
  if (state.links.filter(l => l.from === from && l.to === to).length > 0 ||
      state.links.filter(l => l.from === to && l.to === from).length > 0) {
    console.log('[INFO] link exist, not creating')
    return
  }
  state.links.push({from, to})
}

// delete a node given its id
function deleteNode (id) {
  console.log('[INFO] delete node', id)
  // remove the node from the node list
  state.nodes = state.nodes.filter(n => n.id !== id)
  // remove the links associated to the node
  state.links = state.links.filter(l => id !== l.from && id !== l.to)
}

function setScale (s) {
  state.scale = s
}

function shiftSVG (dx, dy) {
  const newX = state.shiftX + dx
  const newY = state.shiftY + dy
  const transform = 'translate(' + newX + ',' + newY + ')'
  // save how much did we shift the svg
  state.shiftX = newX
  state.shiftY = newY
  return transform
}

function setBuildingMode () {
  console.log('[INFO] Setting BUILD mode')
  resetPathBuilding()
  state.mode = BUILD
}

function setMoveMode () {
  console.log('[INFO] Setting MOVE mode')
  state.mode = MOVE
}

function setDeleteMode () {
  console.log('[INFO] Setting DELETE mode')
  state.mode = DELETE
}

function deleteLink (linkId) {
  // remove the link from the links list
  state.links = state.links.filter(l => l.from + '-' + l.to !== linkId)
  console.log('[INFO] link deleted', linkId)
}

function splitLink (linkId, x, y) {
  // we want to remove the clicked link, create a node
  // and create two new links
  const {from, to} = state.links.filter(l => l.from + '-' + l.to === linkId)[0]
  // remove the link from the links list
  state.links = state.links.filter(l => l.from + '-' + l.to !== linkId)
  // create a new node
  const {id} = createNode({x, y})
  // now create two new links
  this.createLink(from, id)
  this.createLink(id, to)
  // store the last id of the node created
  state.prevNodeId = id
  console.log('[INFO] Splitting link and adding a new node inbetween')
}

function shiftNode (nodeId, dx, dy) {
  // get the node to shift
  for (let i = 0; i < state.nodes.length; i++) {
    let node = state.nodes[i]
    if (node.id === nodeId) {
      node.x += dx
      node.y += dy
      break
    }
  }
}
const actions = {
  setPrevNodeId,
  isStartingPoint,
  resetPathBuilding,
  // create a new node and add it to the node list
  createNode,
  deleteNode,
  createLink,
  deleteLink,
  setScale,
  shiftSVG,
  setBuildingMode,
  setMoveMode,
  setDeleteMode,
  splitLink,
  shiftNode
}

const test = [
  {icon: '/static/zara.jpg', name: 'zara', x: 120, y: 100},
  {icon: '/static/h_m.png', name: 'HM', x: 250, y: 200}
].map(n => createNode(n))

export const store = {
  state,
  test,
  actions
}
