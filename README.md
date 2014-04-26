# Logitech Dual Action Controller for Node

Provides an EventEmitter with events for the buttons, dpad and analog sticks on
the Logitech Dual Action Controller.

## Install

```shell
 npm install logitech-dual-action
```

## Usage

Step 1. **Plug in the controller**

Step 2. **Add some event listeners**

```js
// Create a new one
var controller = new requre('logitech-dual-action')()

controller.on('1:release', console.log)

controller.on('left:move', function (data) {
  // horizontal positon of left analog stick -100 to 100 and 0 at the center.
  var rotateSpeed = data.x
  rotateRobot(rotateSpeed)
})
```

## Events

The dual action has 12 numbered buttons, 1 to 12, a dpad and 2 analog sticks.

There are `:press` and `:release` events for buttons `1` to `12` like so: `1:press` `1:release`

There are `:press` and `:release` events for the dpad directions like so: `dup:press`
There is also a `dcenter:press` event if you just want to know when they start

There are `left:move` and `right:move` events for the analog sticks,
with a `data` parameter object like ` { x: 0, y: 0 }` representing the position of the stick from -100 to 100 with 0 at the center.

```
      100
       |
-100 - o - 100
       |
     -100
```

| button    | events                      | type
|--------------------------------------------------------------------------------
| 1,2,3,4   | ['#:press', '#:release']    | arcade buttons (replace # with button number)
| 5,6,7,8   | ['#:press', '#:release']    | shoulder button
| 9,10      | ['#:press', '#:release']    | start(ish), select(ish)
| 11,12     | ['#:press', '#:release']    | left stick press, right stick press
| dpad      | ['dup,dright,ddown,dleft']  | dpad digital directions
| sticks    | ['left:move', 'right:move'] | analog stick movement


## HID info, for them experts.

```js
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
```

We get an 8 byte Buffer from each `data` event.

- byte 0: left analog stick horizontal  
- byte 1: left analog stick vertical
- byte 2: right analog stick horizontal
- byte 3: right analog stick vertical
- byte 4: dpad direction and buttons 1,2,3,4
- byte 5: buttons 5,6,7,8,9,10,11,12
- byte 6: mode switch... flips the dpad and left analog stick. 4 is on, 5 is off.
- byte 7: nothing. Seems to always return 252.

See: http://www.autohotkey.com/board/topic/64178-hid-template-and-example-for-logitech-dual-action/
