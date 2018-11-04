An `Image` can be used as a _Sprite_ or as the _Screen Buffer_.

### Functions
|Function|Description|
---|---
`Image:get(x, y)` | Gets a pixel at the specified position.
`Image:set(x, y, color)` | Sets a pixel at the specified position.
`Image:add(name, frameList)` | Adds a new animation.
`Image:play(name, frameRate, loop)` | Plays an animation.
`Image:reset` | Resets the current animation.

### Properties
|Property|Description|
---|---
`Image.width` | Image width.
`Image.height` | Image height.
`Image.data` | Image data.
`Image.animation` | Gets the current animation name.
