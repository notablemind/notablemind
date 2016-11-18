
const viewTypes = {
  // pdf: require('treed/views/pdf'),
  list: require('treed/views/list'),
  mindmap: require('treed/views/mindmap'),
  paper: require('treed/views/paper'),
  focus: require('treed/views/focus'),
  tray: require('../treed-plugins/tray'),
  exhibit: require('itreed/exhibit').default,
}

export default viewTypes
