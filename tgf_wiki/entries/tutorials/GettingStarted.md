_Tiny Game Framework_ is very simple to use, all you need is your Lua script and optionally, some assets.

#### Hello World
Here is the most basic program one can write using it
```lua
function create()
	Fx:title("Hello World!")
	Fx:resize(160, 120, 2)

end

function draw(g)
	g:clear(Fx:color("black"))

	Fx:flip()
end

function update(dt)

end
```

The script needs a `create` function, to be called _once_ when the game starts, an `update` function, to be called `60` frames per second, and a `draw` function to be used for rendering.

In that example, first we set the window title to `Hello World!` and then resize the screen to `160x120`, and the window gets scaled by 2.

In the draw loop, we clear the screen and then flip the buffer, so we can see the result: A black screen tittled "Hello World!"