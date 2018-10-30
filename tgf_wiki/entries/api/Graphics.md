The `Graphics` class is used to draw on [Images](/?api&Image). For example, the screen buffer, which is an Image.

### Functions
|Function|Description|
-----|-----
`Graphics.new(target)` | Creates a new Graphics object for `target`.
`Graphics:clear(color)` | Clears the image (sets all pixels) to a `color`.
`Graphics:remap(oldColor, newColor)` | Remaps a color to another. If no arguments are passed, the mappings are reset.
`Graphics:remap(newColor)` | Remaps everything that isn't transparent to `newColor`.
`Graphics:pixel(x, y, color)` | Draws a single pixel. Returns `true` if the pixel was successfully drawn, or `false` otherwise.
`Graphics:line(x1, y1, x2, y2, color)` | Draws a line.
`Graphics:rect(x, y, w, h, color, fill)` | Draws a rectangle.
`Graphics:circle(x, y, radius, color, fill` | Draws a circle.
`Graphics:sprite(image, x, y, [flipx], [flipy], [clip])` | Draws a (region of an) image, and optionally flips it horizontally and vertically. See [Rect](/?api&Rect) for `clip`.
`Graphics:tile(image, index, x, y, tileW, tileH)` | Draws a tile from a tile set image specified by `tileW`, `tileH` and `index`.
`Graphics:text(font, text, x, y)` | Draws a string. See [Font](/?api&Font).
`Graphics:clip([x1, y1, x2, y2])` | Sets the clipping region. The clipping region is a bounding box that is used to discard pixels when drawing, when no parameters are specified, the clipping region is reset. Notice that, the parameters must be the min and max extents and not position and size!
`Graphics:transparency([color])` | Sets the palette color used for transparency. If no parameters are passed, the transparency key is reset.
`Graphics:begin3D([polygonMode])` | Begin 3D rendering. (Never forget this! It clears the vertex buffer). `polygonMode` is: `triangles`, `wireframe`, `lines` or `points`.
`Graphics:color(col)` | Set the color of the next triangle.
`Graphics:vertex(x, y, z, u, v)` | Adds a vertex to the vertex buffer.
`Graphics:end3D()` | Ends the 3D rendering (displays all the triangles).
`Graphics:bind(image)` | Binds an Image as a texture.
`Graphics:model(model)` | Adds a 3D [Model](/?api&Model) to the vertex buffer.
`Graphics:matrixMode(mode)` | Specify the current matrix to be modified by the matrix operations. Possible values: `modelView` and `projection`.
`Graphics:identity()` | Loads an identity matrix.
`Graphics:translate(x, y, z)` | Translates the world by `x, y, z` units.
`Graphics:rotate(angle, x, y, z)` | Rotates the world by an `angle` around an axis defined by `x, y, z`.
`Graphics:scale(x, y, z)` | Scales the world by `x, y, z`.
`Graphics:perspective(fov, aspect, znear, zfar)` | Loads a perspective matrix. `fov` is expected to be in radians.
`Graphics:ortho(left, right, bottom, top, znear, zfar)` | Loads an orthographic matrix.
`Graphics:lighting(enabled)` | Enables/Disables lighting.
`Graphics:lightDirection(x, y, z)` | Enables/Disables lighting.

### Properties
|Property|Description|
-----|-----
`Graphics.target` | Gets/Sets the Image target for this Graphics context. `Beware! If you set the target of the main graphics object, and don't save it, bad things can happen!`