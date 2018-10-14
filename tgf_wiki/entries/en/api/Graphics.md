The `Graphics` class is used to draw on [Images](/#api:Image). For example, the screen buffer, which is an Image.

### Functions
|Function|Description|
-----|-----
`Graphics.new(target)` | Creates a new Graphics object for `target`.
`Graphics:clear(color)` | Clears the image (sets all pixels) to a `color`.
`Graphics:remap(oldColor, newColor)` | Remaps a color to another. If no arguments are passed, the mappings are reset.
`Graphics:remap(newColor)` | Remaps everything that isn't transparent to `newColor`.
`Graphics:pixel(x, y, color)` | Draws a single pixel.
`Graphics:line(x1, y1, x2, y2, color)` | Draws a line.
`Graphics:rect(x, y, w, h, color, fill)` | Draws a rectangle.
`Graphics:circle(x, y, radius, color, fill` | Draws a circle.
`Graphics:sprite(image, x, y, [flipx], [flipy], [clip])` | Draws a (region of an) image, and optionally flips it horizontally and vertically. See [Rect](/#api:Rect) for `clip`.
`Graphics:tile(image, index, x, y, tileW, tileH)` | Draws a tile from a tile set image specified by `tileW`, `tileH` and `index`.
`Graphics:text(font, text, x, y)` | Draws a string. See [Font](/#api:Font).
`Graphics:clip([x1, y1, x2, y2])` | Sets the clipping region. The clipping region is a bounding box that is used to discard pixels when drawing, when no parameters are specified, the clipping region is reset. Notice that, the parameters must be the min and max extents and not position and size!
`Graphics:transparency([color])` | Sets the palette color used for transparency. If no parameters are passed, the transparency key is reset.

### Properties
|Property|Description|
-----|-----
`Graphics.target` | Gets/Sets the Image target for this Graphics context. `Beware! If you set the target of the main graphics object, and don't save it, bad things can happen!`
