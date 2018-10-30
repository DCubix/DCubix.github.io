## Building
Tools Needed:
* CMake
* Anything that can compile C++17 code

Dependencies:
* Linux
	* Debian-based: `sudo apt install libsdl2-dev libsdl2-2.0-0 lua5.3`

* Windows
	* [SDL2](https://www.libsdl.org/download-2.0.php)
	* [Lua 5.3](http://luabinaries.sourceforge.net/download.html)

### Linux Build
```sh
$ mkdir build && cd build
$ cmake -G "Unix Makefiles"
-DCMAKE_BUILD_TYPE=Release .
$ make -j2
```

### Windows Build
- Create a `build` folder in TGF's root dir and open CMake GUI.
- Set the `source path` to TGF's folder, where CMakelists.txt resides.
- Set the `build path` to the `build` folder you've just created.
- Configure.
- Set the generator to `Visual Studio {YOUR VERSION}` or to any other build tool you use.
- Click Finish, wait for it to complete and then click Generate.
- Open the generated project files in your IDE and build.