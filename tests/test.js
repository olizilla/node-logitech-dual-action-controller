var LogitechDualActionController = require('../index.js')

var controller = new LogitechDualActionController()

controller.on('ready', function(d){
  console.log('got ready',d)
})

controller.on('data', function(d){
  console.log('got data',d)
})
