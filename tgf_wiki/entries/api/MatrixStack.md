Matrix stack for 3D transformations.

### Functions
|Function|Description|
-----|-----
`MatrixStack:identity()` | Sets the current matrix to an identity matrix.
`MatrixStack:push()` | Pushes the current matrix to the stack.
`MatrixStack:pop()` | Pops the matrix from the stack.
`MatrixStack:perspective(fov, aspect, near, far)` | Sets the current matrix to a perspective matrix. `fov` being the field of view in radians.
`MatrixStack:translate(x, y, z)` | Translates the current matrix.
`MatrixStack:rotate(angle, x, y, z)` | Rotates the current matrix. `angle` being the amount in radians.
`MatrixStack:scale(x, y, z)` | Scales the current matrix.