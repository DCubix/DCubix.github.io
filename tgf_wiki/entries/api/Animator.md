An `Animator` is used for all sorts of animated sprites. Animators are updated by the `Fx` System automatically.

### Functions
|Function|Description|
-----|-----
`Animator:add(name, frameList)` | Adds a new animation to the animator.
`Animator:play(name, frameRate, loop)` | Plays an animation.
`Animator:reset` | Resets the current animation.

### Properties
|Property|Description|
---|---
`Animator.clip` | Gets the clipping rectangle of the current frame.
`Animator.animation` | Gets the current animation name.