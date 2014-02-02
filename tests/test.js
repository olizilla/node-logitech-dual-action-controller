var buttons = require('../buttons.json')
var LogitechDualActionController = require('../index.js')

var controller = new LogitechDualActionController()

for (name in buttons) {
  controller.on(name + ':press',   console.log)
  controller.on(name + ':release', console.log)  
}

['ready','left:move', 'right:move'].forEach(function (evt) {
  controller.on(evt, function(data){
    console.log(evt, data)
  })
})