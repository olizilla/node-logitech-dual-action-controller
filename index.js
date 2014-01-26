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
byte 5: buttons 5,6,7,8,9,10,leftstick,rightstick
byte 6: mode switch... flips the dpad and left analog stick. 4 is on, 5 is off.
byte 7: nothing. Seems to always return 252.
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

  this.leftx = 0
  this.lefty = 0

  this.rightx = 0
  this.righty = 0

  this.hid = getDevice(VENDOR_ID, PRODUCT_ID)
  //TODO: Handle device not availble.

  this.hid.on('data', interpretData.bind(this))
}

util.inherits(LogitechDualActionController, events.EventEmitter);

module.exports = LogitechDualActionController 

// Read the byte Buffer from the device and translate it into somthing useful
function interpretData (data) {

  var info = {
    buttons: readButtons(data),
    dpad: readDpad(data),
    leftx: data[0],
    lefty: data[1],
    rightx: data[2],
    righty: data[3],
  }

  this.emit('data', info)
  // TODO: store current state on instance and emit relevent change events
}

// Figure out which buttons are pressed
function readButtons(data) {

  var res = []

  for (name in buttons) {
    var button = buttons[name]
    var block = data[button.block]
    var bit = button.bit

    // apply the mask for each key and determine if it is pressed.
    if (block & bit){
      res.push(name)
    }
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
    ['dup', 'dleft']
  ]

  var input = data[4] & 0x0F

  return dpadMap[input] || []
}

// Helpful byte logging
function formatByte (num) {
  return pad(8, num.toString(2), '0')
}

// Ask HID for access to the device
function getDevice(vendorId, productId) {
  var devices = hid.devices()

  var deviceData = devices.filter(function(d){
    return (d.vendorId === vendorId && d.productId === productId)
  })[0]

  if (!deviceData) return console.error('No gamepad found', gamepad)

  return new hid.HID(deviceData.path)
}
