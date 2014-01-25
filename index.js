/*
Logitech Dual Action Controller

HID info:

{ vendorId: 1133,
    productId: 49686,
    path: 'USB_046d_c216_14300000',
    serialNumber: '',
    manufacturer: 'Logitech',
    product: 'Logitech Dual Action',
    release: 768,
    interface: -1 }
*/

var hid = require("node-hid")
var pad = require("pad")

var VENDOR_ID = 1133
var PRODUCT_ID = 49686
var gamepad = getDevice(VENDOR_ID, PRODUCT_ID)

var dpad = {
  '0': 'up',
  '2': 'right',
  '4': 'down',
  '6': 'left',
  '8': 'center'
}

var buttons = [
{}, // left analog horizontal: 0 = left, 255 = right
{}, // left analog vertical: 0 = up, 255 = down
{}, // right analog
{}, // right analog
{
  'one': 16,
  'two': 32,
  'three': 64,
  'four': 128,
},
{
  'five': 1,
  'six': 2,
  'seven': 4,
  'eight': 8,
  'nine': 16,
  'ten': 32,
},
{} // 7: mode button. 4 is on, 5 is off, it flips the meaning of bytes 
]

gamepad.on("data", function(data) {

  var res = []

  buttons.forEach(function (mapping, index) {

    var flags = data[index]
    var mask = buttons[index]

    // console.log(formatByte(flags))

    // apply the mask for each key and determine if it is pressed.
    Object.keys(mask).forEach(function(key){
      if (flags & mask[key]){
        // console.log(pad(8, buttons[key].toString(2), '0'))
        res.push(key)
      }
    })

  })
  // js sux nuts

  var dpad = data[4] & 0x0F

  res.push((360 / 8) * dpad)

  console.log(res)
  console.log('-----------------------------------')
})

gamepad.on("error", function(data) {
  console.err(data)
  console.log('---')
})

function formatByte (num) {
  return pad(8, num.toString(2), '0')
}

function getDevice(vendorId, productId) {
  var devices = hid.devices()

  var deviceData = devices.filter(function(d){
    return (d.vendorId === vendorId && d.productId === productId)
  })[0]

  if (!deviceData) return console.error("No gamepad found", gamepad)

  return new hid.HID(deviceData.path)
}
