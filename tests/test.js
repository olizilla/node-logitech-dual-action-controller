var buttons = require('../buttons.json')
var LogitechDualActionController = require('../index.js')

var controller = new LogitechDualActionController()

for (name in buttons) {
  controller.on(name + ':press',   console.log)
  controller.on(name + ':release', console.log)  
}
