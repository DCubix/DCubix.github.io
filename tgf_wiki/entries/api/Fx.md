The `Fx` object is a global variable (can be accessed everywhere in your script) that handles most of the framework.

### System Functions
|Function|Description|
-----|-----
`Fx:color(colorName)` | Gets a color index from a color name. Possible `colorName` values: `black`, `darkgray`, `gray`, `lightgray`, `white`, `lightbrown`, `brown`, `darkbrown`, `yellow`, `orange`, `red`, `purple`,	`darkblue`, `blue`, `green`, `darkgreen`
`Fx:flip` | Flips the screen buffer to present it to the screen.
`Fx:resize(w, h, scale)` | Resizes the window and screen buffer. The window size equals to `(w/h) * scale`.
`Fx:title([titleString])` | Gets/Sets the window title. When no parameter is passed, this function is treated as a getter.
`Fx:quit` | Exits the application.
`Fx:createImage(w, h)` | Creates an empty [Image](/#api:Image).
`Fx:loadImage(fileName, [ditherLevel])` | Loads an image from a file and reduces its colors to fit TGF's 16 color palette. When `ditherLevel` is not 0, the converter will use a dithering function to smooth the color transitions. Possible values for `ditherLevel` are: `0`, `2`, `3`, `4` and `8`.

### Input Functions
|Function|Description|
-----|-----
`Fx:buttonPressed(buttonName)` | Returns `true` if the button was pressed. Possible values for `buttonName` are: `left`, `right`, `up`, `down`, `x`, `y`, `select`.
`Fx:buttonReleased(buttonName)` | Returns `true` if the button was released.
`Fx:buttonDown(buttonName)` | Returns `true` if the button is down/held.
`Fx:mousePressed(buttonName)` | Returns `true` if the mouse button was pressed. Possible values for `buttonName` are: `left`, `middle`, `right`.
`Fx:mouseReleased(buttonName)` | Returns `true` if the mouse button was released.
`Fx:mouseDown(buttonName)` | Returns `true` if the mouse button is down/held.
`Fx:warpMouse(x, y)` | Sets the mouse position.

### Properties
|Property|Description|
---|---
`Fx.mouseX` | Mouse position's X component.
`Fx.mouseY` | Mouse position's Y component.
`Fx.width` | Screen width. (Not window width!).
`Fx.height` | Screen height. (Not window height!).
`Fx.graphics` | Main [Graphics](/#api:Graphics) context.

#### Buttons
Button|Corresponding Key
---|---
`left` | `Left Arrow`, `S`
`right` | `Right Arrow`, `F`
`up` | `Up Arrow`, `E`
`down` | `Down Arrow`, `D`
`x` | `Z`, `C`, `N`, `Numpad -`, `Left Shift`, `Tab`
`y` | `X`, `V`, `M`, `8`, `A`, `Q`
`select` | `Space`, `Enter`, `Numpad Enter`