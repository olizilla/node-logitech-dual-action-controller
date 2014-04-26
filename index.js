/*
Logitech Dual Action Controller
===============================

HID info:

{
  vendorId: 1133,
  productId: 49686,
  path: 'USB_046d_c216_14300000',
  serialNumber: '',
  manufacturer: 'Logitech',
  product: 'Logitech Dual Action',
  release: 768,
  interface: -1
}

We get an 8 byte Buffer from each `data` event.

byte 0: left analog stick horizontal
byte 1: left analog stick vertical
byte 2: right analog stick horizontal
byte 3: right analog stick vertical
byte 4: dpad direciton and buttons 1,2,3,4
byte 5: buttons 5,6,7,8,9,10,11,12
byte 6: mode switch... flips the dpad and left analog stick. 4 is on, 5 is off.
byte 7: nothing. Seems to always return 252.

See: http://www.autohotkey.com/board/topic/64178-hid-template-and-example-for-logitech-dual-action/
*/

var util = require('util')
var events = require('events')
var hid = require('node-hid')
var pad = require('pad')
var buttons = require('./buttons.json')

var VENDOR_ID = 1133
var PRODUCT_ID = 49686

function LogitechDualActionController() {

  for (button in buttons) {
    this[button] = 0
  }
  this.dpad = []
  this.leftstick  = { x:0, y:0 }
  this.rightstick = { x:0, y:0 }

  getDevice(VENDOR_ID, PRODUCT_ID, function(err, device){
    if (err) return consle.error(err)
    this.emit('ready')
    device.on('data', interpretData.bind(this))
  }.bind(this))
}

util.inherits(LogitechDualActionController, events.EventEmitter);

module.exports = LogitechDualActionController


// Read the byte Buffer from the device and translate it into somthing useful
function interpretData (data) {

  var info = {
    buttons: readButtons(data),
    dpad: readDpad(data),
    leftstick:  readStick(data[0],data[1]),
    rightstick: readStick(data[2],data[3])
  }

  for (name in info.buttons) {
    var state = info.buttons[name]
    if (this[name] === state) continue;
    this[name] = state
    var evt = name + (state ? ':press' : ':release')
    this.emit(evt, evt)
  }

  function moved(a, b){
    return a.x !== b.x || a.y !== b.y
  }

  if (moved(this.leftstick, info.leftstick)) {
    this.leftstick = info.leftstick
    this.emit('left:move', info.leftstick)
  }

  if (moved(this.rightstick, info.rightstick)) {
    this.rightstick = info.rightstick
    this.emit('right:move', info.rightstick)
  }

  // check if a dpad has been released
  this.dpad.forEach(function(item){
    if(info.dpad.indexOf(item) < 0){
      this.emit(item + ":release", item + ":release")
    }
  }.bind(this))

  // check if a dpad has been pressed
  info.dpad.forEach(function(item){
    if(this.dpad.indexOf(item) < 0){
      this.emit(item + ":press", item + ":press")
    }
  }.bind(this))

  this.dpad = info.dpad

  this.emit('data', info)
}

// Figure out which buttons are pressed
function readButtons(data) {

  var res = {}

  for (name in buttons) {
    var button = buttons[name]
    var block = data[button.block]
    var bit = button.bit

    // apply the mask for each key and determine if it is pressed.
    res[name] = (block & bit) ? 1 : 0
  }

  return res
}

// Figure out where the dpad is pointing
function readDpad (data) {
  var dpadMap = [
    ['dup'],
    ['dup', 'dright'],
    ['dright'],
    ['ddown', 'dright'],
    ['ddown'],
    ['ddown', 'dleft'],
    ['dleft'],
    ['dup', 'dleft'],
    ['dcenter']
  ]

  var input = data[4] & 0x0F

  return dpadMap[input] || []
}

/*
map raw input to:

      100
       |
-100 - o - 100
       |
     -100
*/
function readStick(rawX, rawY) {
  return {
    x: Math.round(((rawX - 128)/128) * 100),
    y: Math.round(-((rawY - 128)/128) * 100)
  }
}

// Helpful byte logging
function formatByte (num) {
  return pad(8, num.toString(2), '0')
}

// Ask HID for access to the device
function getDevice(vendorId, productId, cb) {

  var deviceData = hid.devices().filter(function(d){
    return (d.vendorId === vendorId && d.productId === productId)
  })[0]

  if (deviceData) {
    return cb(null, new hid.HID(deviceData.path))
  }

  console.error('Please connect Logitech Dual Action Controller...')

  setTimeout(function(){
    getDevice(vendorId, productId, cb)
  }, 1000)
}
