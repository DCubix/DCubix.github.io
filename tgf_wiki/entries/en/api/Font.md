A Font is an object that describes a Font Sprite Sheet. This is what TGF uses for text rendering.

### Constructors
|Function|Description|
-----|-----
`Font.new(image, charMap, rows, cols)` | Creates a new font, from an `image` representing the sprite sheet, the `charMap` representing the characters in available in the font and `rows` and `cols` being the number of sprite rows and columns (count on Y and X).

### Functions
|Function|Description|
-----|-----
`Font:stringWidth(text)` | Measures the text width in pixels.

### Properties
|Property|Description|
-----|-----
`Font.height` | Character height in pixels.
`Font.spacing` | Gets/Sets the character spacing in pixels.
`Font.charMap` | Gets/Sets the character map string.
`Font.image` | Gets the sprite sheet image (read-only).
`Font.columns` | X sprite count.
`Font.rows` | Y sprite count.