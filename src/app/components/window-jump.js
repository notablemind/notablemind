
module.exports = findNextActiveId

function findNextActiveId(windows, currentActiveView, direction) {
  var boxes = windowBoxes(windows, {x: 0, y: 0, w: 1000, h: 1000})
  var boxMap = {};boxes.forEach(box => boxMap[box.id] = box.box)
  return go(direction, currentActiveView, boxMap)
}

function windowBoxes(windows, container) {
  if (windows.leaf) {
    return [{box: container, id: windows.value.config.store.view.id}]
  }
  var split = splitBox(container, windows.value.orient, windows.value.ratio || .5)
  return windowBoxes(windows.value.first, split.first)
    .concat(windowBoxes(windows.value.second, split.second))
}

function splitBox(box, orient, ratio) {
  var w = box.w
    , h = box.h
  if (orient === 'horiz') {
    return {
      first: {
        x: box.x,
        y: box.y,
        w: w * ratio,
        h: box.h,
      },
      second: {
        x: box.x + w*ratio,
        y: box.y,
        w: w * (1 - ratio),
        h: box.h,
      }
    }
  } else {
    return {
      first: {
        x: box.x,
        y: box.y,
        h: h * ratio,
        w: box.w,
      },
      second: {
        y: box.y + h*ratio,
        x: box.x,
        h: h * (1 - ratio),
        w: box.w,
      }
    }
  }
}

function go(dir, id, boxMap) {
  var x0 = (dir === 'up' || dir === 'down') ? 'y' : 'x'
    , x1 = x0 === 'x' ? 'y' : 'x'
    , d0 = {x: 'w', y: 'h'}[x0]
    , d1 = {x: 'w', y: 'h'}[x1]
    , dr = (dir === 'down' || dir === 'right')

  var box = boxMap[id]
    , pos = {}

  pos[x0] = box[x0] + (dr ? box[d0] : 0)
  pos[x1] = box[x1] + box[d1] / 2

  for (var oid in boxMap) {
    if (oid == id) continue
    var obox = boxMap[oid]
    if (pos[x0] === obox[x0] + (dr ? 0 : obox[d0]) &&
        obox[x1] < pos[x1] && pos[x1] <= obox[x1] + obox[d1])
      return +oid
  }
  return false
}
