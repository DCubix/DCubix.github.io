"use strict";
var GLFX;
(function (GLFX) {
    GLFX.GL = null;
    GLFX.Canvas = null;
    function createContext(eid, width, height) {
        let canvas = null;
        if (eid) {
            canvas = document.getElementById(eid);
        }
        else {
            canvas = document.createElement("canvas");
            canvas.id = "glfx";
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
        }
        GLFX.Canvas = canvas;
        GLFX.GL = canvas.getContext("webgl");
    }
    GLFX.createContext = createContext;
    function nextFrame(callback) {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        }
        else {
            console.error("Your browser does not support requestAnimationFrame, please use setTimeout instead.");
        }
    }
    GLFX.nextFrame = nextFrame;
})(GLFX || (GLFX = {}));
Math.radians = function (d) {
    return d * Math.PI / 180;
};
Math.degrees = function (r) {
    return r * 180 / Math.PI;
};
Math.cot = function (a) {
    return 1.0 / Math.tan(a);
};
Math.isPowerOfTwo = function (v) {
    return (v & (v - 1)) == 0;
};
Math.sinCos = function (a) {
    return [Math.sin(a), Math.cos(a)];
};
Array.prototype.first = function () {
    return this[0];
};
Array.prototype.last = function () {
    return this[this.length - 1];
};
Array.prototype.empty = function () {
    return this.length == 0;
};
var GLFX;
(function (GLFX) {
    class Dict {
        constructor() {
            this.items = {};
        }
        containsKey(k) {
            return this.items.hasOwnProperty(k);
        }
        length() {
            return this.keys().length;
        }
        add(k, value) {
            this.items[k] = value;
        }
        remove(k) {
            var val = this.items[k];
            delete this.items[k];
            return val;
        }
        get(k) {
            return this.items[k];
        }
        keys() {
            return Object.keys(this.items);
        }
        values() {
            return Object.keys(this.items).map(key => this.items[key]);
        }
    }
    GLFX.Dict = Dict;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class VertexAttrib {
        constructor(size, normalized) {
            this.size = size;
            this.normalized = normalized;
        }
    }
    class VertexFormat {
        constructor() {
            this.attribs = new GLFX.Dict();
        }
        add(name, size, norm) {
            this.attribs.add(name, new VertexAttrib(size, norm));
        }
        get size() {
            let off = 0;
            for (let v of this.attribs.values()) {
                off += Float32Array.BYTES_PER_ELEMENT * v.size;
            }
            return off;
        }
        bind(shader) {
            let stride = this.size;
            let off = 0;
            for (let k of this.attribs.keys()) {
                let v = this.attribs.get(k);
                let loc = shader.getAttribLocation(k);
                if (loc != -1) {
                    GLFX.GL.enableVertexAttribArray(loc);
                    GLFX.GL.vertexAttribPointer(loc, v.size, GLFX.GL.FLOAT, v.normalized, stride, off);
                }
                off += Float32Array.BYTES_PER_ELEMENT * v.size;
            }
        }
        unbind(shader) {
            for (let k of this.attribs.keys()) {
                let loc = shader.getAttribLocation(k);
                if (loc != -1) {
                    GLFX.GL.disableVertexAttribArray(loc);
                }
            }
        }
    }
    GLFX.VertexFormat = VertexFormat;
    class OBJVertex {
        constructor(position, uv, normal) {
            this.position = position;
            this.uv = uv;
            this.normal = normal;
        }
        getFormat() {
            let fmt = new VertexFormat();
            fmt.add("vPosition", 3, false);
            fmt.add("vUV", 2, false);
            fmt.add("vNormal", 3, false);
            return fmt;
        }
        toArray() {
            return [
                this.position.x, this.position.y, this.position.z,
                this.uv.x, this.uv.y,
                this.normal.x, this.normal.y, this.normal.z
            ];
        }
        getPosition() {
            return this.position;
        }
        getNormal() {
            return this.normal;
        }
        setNormal(n) {
            this.normal = n;
        }
    }
    GLFX.OBJVertex = OBJVertex;
    class NormalCalculator {
        constructor(mode) {
            this.mode = mode;
        }
        process(mesh) {
            switch (this.mode) {
                case GLFX.GL.POINTS:
                case GLFX.GL.LINES:
                case GLFX.GL.LINE_LOOP:
                case GLFX.GL.LINE_STRIP:
                    break;
                case GLFX.GL.TRIANGLES:
                    {
                        for (let i = 0; i < mesh.indices.length; i += 3) {
                            let i0 = mesh.getIndex(i + 0);
                            let i1 = mesh.getIndex(i + 1);
                            let i2 = mesh.getIndex(i + 2);
                            this.__triNormal(mesh, i0, i1, i2);
                        }
                    }
                    break;
                case GLFX.GL.TRIANGLE_FAN:
                    {
                        for (let i = 0; i < mesh.indices.length; i += 2) {
                            let i0 = mesh.getIndex(0);
                            let i1 = mesh.getIndex(i);
                            let i2 = mesh.getIndex(i + 1);
                            this.__triNormal(mesh, i0, i1, i2);
                        }
                    }
                    break;
                case GLFX.GL.TRIANGLE_STRIP:
                    {
                        for (let i = 0; i < mesh.indices.length - 2; i++) {
                            let i0, i1, i2;
                            if (i % 2 === 0) {
                                i0 = mesh.getIndex(i + 0);
                                i1 = mesh.getIndex(i + 1);
                                i2 = mesh.getIndex(i + 2);
                            }
                            else {
                                i0 = mesh.getIndex(i + 2);
                                i1 = mesh.getIndex(i + 1);
                                i2 = mesh.getIndex(i + 0);
                            }
                            this.__triNormal(mesh, i0, i1, i2);
                        }
                    }
                    break;
            }
            for (let i = 0; i < mesh.vertices.length; i++) {
                mesh.vertices[i].setNormal(mesh.vertices[i].getNormal().normalized());
            }
        }
        __triNormal(mesh, i0, i1, i2) {
            let v0 = mesh.vertices[i0].getPosition();
            let v1 = mesh.vertices[i1].getPosition();
            let v2 = mesh.vertices[i2].getPosition();
            let e0 = v1.sub(v0);
            let e1 = v2.sub(v0);
            let n = e0.cross(e1);
            mesh.vertices[i0].setNormal(mesh.vertices[i0].getNormal().add(n));
            mesh.vertices[i1].setNormal(mesh.vertices[i1].getNormal().add(n));
            mesh.vertices[i2].setNormal(mesh.vertices[i2].getNormal().add(n));
        }
    }
    GLFX.NormalCalculator = NormalCalculator;
    class Mesh {
        constructor(indexed = true, dynamic = false) {
            this.vbo = GLFX.GL.createBuffer();
            this.format = null;
            this.indexed = indexed;
            this.dynamic = dynamic;
            this.vertices = new Array();
            this.indices = new Array();
            this.vbo_size = 0;
            this.ibo_size = 0;
            if (indexed)
                this.ibo = GLFX.GL.createBuffer();
            else
                this.ibo = null;
        }
        clear() {
            this.vertices = [];
            this.indices = [];
        }
        get vertexCount() { return this.vertices.length; }
        get indexCount() { return this.indices.length; }
        addVertex(v) {
            this.vertices.push(v);
        }
        addIndex(i) {
            this.indices.push(i);
        }
        addIndexBase(i) {
            this.indices.push(i + this.vertices.length);
        }
        addTriangle(i0, i1, i2) {
            this.indices.push(i0, i1, i2);
        }
        addQuad(v) {
            if (v.length < 4)
                return;
            let b = this.vertices.length;
            this.vertices.push(...v);
            this.addTriangle(b + 0, b + 1, b + 2);
            this.addTriangle(b + 2, b + 3, b + 0);
        }
        addConvex(v) {
            if (v.length < 3)
                return;
            let b = this.vertices.length;
            this.vertices.push(...v);
            for (let i = 1; i < v.length - 1; i++) {
                this.indices.push(b + 0);
                this.indices.push(b + i);
                this.indices.push(b + i + 1);
            }
        }
        addAll(vs, is) {
            let b = this.vertices.length;
            this.vertices.push(...vs);
            for (let i of is) {
                this.indices.push(b + i);
            }
        }
        static fromOBJ(str) {
            let tempVerts = [];
            let tempUVs = [];
            let tempNorms = [];
            let overts = [];
            let oinds = new Array();
            function parseVert(str) {
                let spl = str.split(" ");
                if (spl.length < 3)
                    return [0, 0, 0];
                return spl.map(function (e) { return parseFloat(e); });
            }
            function parseUV(str) {
                let spl = str.split(" ");
                if (spl.length < 2)
                    return [0, 0];
                return spl.map(function (e) { return parseFloat(e); });
            }
            function parseFace(str) {
                let spl = str.split("/");
                return spl.map(function (e) { return parseInt(e) - 1; });
            }
            function inTriangle(point, tri1, tri2, tri3) {
                let u = tri2.sub(tri1);
                let v = tri3.sub(tri1);
                let w = point.sub(tri1);
                let n = u.cross(v);
                let y = u.cross(w).dot(n) / n.dot(n);
                let b = u.cross(w).dot(n) / n.dot(n);
                let a = 1 - y - b;
                return (a >= 0 &&
                    a <= 1 &&
                    b >= 0 &&
                    b <= 1 &&
                    y >= 0 &&
                    y <= 1);
            }
            function triangulate(vverts, oinds) {
                if (vverts.length < 3)
                    return;
                if (vverts.length == 3) {
                    oinds.push(0, 1, 2);
                    return;
                }
                let tverts = vverts.slice();
                while (true) {
                    for (let i = 0; i < tverts.length; i++) {
                        let pprev;
                        if (i == 0) {
                            pprev = tverts.last();
                        }
                        else {
                            pprev = tverts[i - 1];
                        }
                        let pcur = tverts[i];
                        let pnext;
                        if (i == tverts.length - 1) {
                            pnext = tverts[0];
                        }
                        else {
                            pnext = tverts[i + 1];
                        }
                        if (tverts.length == 3) {
                            for (let j = 0; j < tverts.length; j++) {
                                if (vverts[j].position.equals(pcur.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(pprev.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(pnext.position))
                                    oinds.push(j);
                            }
                            tverts = [];
                            break;
                        }
                        if (tverts.length == 4) {
                            for (let j = 0; j < vverts.length; j++) {
                                if (vverts[j].position.equals(pcur.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(pprev.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(pnext.position))
                                    oinds.push(j);
                            }
                            let tempVec = new GLFX.Vec3();
                            for (let j = 0; j < tverts.length; j++) {
                                if (!tverts[j].position.equals(pcur.position)
                                    && !tverts[j].position.equals(pprev.position)
                                    && !tverts[j].position.equals(pnext.position)) {
                                    tempVec = tverts[j].position;
                                    break;
                                }
                            }
                            for (let j = 0; j < vverts.length; j++) {
                                if (vverts[j].position.equals(pprev.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(pnext.position))
                                    oinds.push(j);
                                if (vverts[j].position.equals(tempVec))
                                    oinds.push(j);
                            }
                            tverts = [];
                            break;
                        }
                        let angle = pprev.position.sub(pcur.position).angle(pnext.position.sub(pcur.position)) * (180 / Math.PI);
                        if (angle <= 0 && angle >= 180)
                            continue;
                        let intri = false;
                        for (let v of vverts) {
                            if (inTriangle(v.position, pprev.position, pcur.position, pnext.position) &&
                                !v.position.equals(pprev.position) &&
                                !v.position.equals(pcur.position) &&
                                !v.position.equals(pnext.position)) {
                                intri = true;
                                break;
                            }
                        }
                        if (intri)
                            continue;
                        for (let j = 0; j < vverts.length; j++) {
                            if (vverts[j].position.equals(pcur.position))
                                oinds.push(j);
                            if (vverts[j].position.equals(pprev.position))
                                oinds.push(j);
                            if (vverts[j].position.equals(pnext.position))
                                oinds.push(j);
                        }
                        let k = tverts.length;
                        while (k--) {
                            let v = tverts[k];
                            if (v.position.equals(pcur.position)) {
                                tverts.splice(k, 1);
                                break;
                            }
                        }
                        i = -1;
                    }
                    if (oinds.length == 0)
                        break;
                    if (vverts.length == 0)
                        break;
                }
            }
            let lines = str.split("\n").map(function (e) { return e.trim(); }).reverse();
            while (!lines.empty()) {
                let line = lines.pop();
                let type = line.substr(0, line.indexOf(" "));
                let args = line.substr(line.indexOf(" ") + 1).trim();
                if (line.length == 0) {
                    continue;
                }
                else if (type == "#") {
                    continue;
                }
                else if (type == "v") {
                    let v = parseVert(args);
                    tempVerts.push(new GLFX.Vec3(v[0], v[1], v[2]));
                }
                else if (type == "vt") {
                    let vt = parseUV(args);
                    tempUVs.push(new GLFX.Vec2(vt[0], vt[1]));
                }
                else if (type == "vn") {
                    let vn = parseVert(args);
                    tempNorms.push(new GLFX.Vec3(vn[0], vn[1], vn[2]));
                }
                else if (type == "f") {
                    let indices = args.split(" ");
                    let vverts = [];
                    for (let i of indices) {
                        let face = parseFace(i);
                        let type = 0;
                        if (face.length == 1) {
                            type = 1;
                        }
                        else if (face.length == 2) {
                            type = 2;
                        }
                        else if (face.length == 3) {
                            if (!face[1]) {
                                type = 4;
                            }
                            else {
                                type = 3;
                            }
                        }
                        let vert = new OBJVertex(new GLFX.Vec3(), new GLFX.Vec2(), new GLFX.Vec3());
                        switch (type) {
                            case 1:
                                {
                                    vert.position.set(tempVerts[face[0]]);
                                    vverts.push(vert);
                                }
                                break;
                            case 2:
                                {
                                    vert.position.set(tempVerts[face[0]]);
                                    vert.uv.set(tempUVs[face[1]]);
                                    vverts.push(vert);
                                }
                                break;
                            case 3:
                                {
                                    vert.position.set(tempVerts[face[0]]);
                                    vert.uv.set(tempUVs[face[1]]);
                                    vert.normal.set(tempNorms[face[2]]);
                                    vverts.push(vert);
                                }
                                break;
                            case 4:
                                {
                                    vert.position.set(tempVerts[face[0]]);
                                    vert.normal.set(tempNorms[face[2]]);
                                    vverts.push(vert);
                                }
                                break;
                        }
                    }
                    overts.push(...vverts);
                    let vinds = new Array();
                    triangulate(vverts, vinds);
                    for (let idx of vinds) {
                        oinds.push((overts.length - vverts.length) + idx);
                    }
                }
            }
            let m = new Mesh(true, false);
            m.addAll(overts, oinds);
            m.flush();
            return m;
        }
        getIndex(i) {
            if (this.indexed) {
                return this.indices[i];
            }
            return i;
        }
        process(processor) {
            processor.process(this);
        }
        flush() {
            if (this.vertices.length == 0)
                return;
            if (this.format == null) {
                this.format = this.vertices[0].getFormat();
            }
            let vsize = this.format.size * this.vertices.length;
            let vdata = [];
            for (let v of this.vertices) {
                vdata.push(...v.toArray());
            }
            let usage = this.dynamic ? GLFX.GL.DYNAMIC_DRAW : GLFX.GL.STATIC_DRAW;
            GLFX.GL.bindBuffer(GLFX.GL.ARRAY_BUFFER, this.vbo);
            if (vsize > this.vbo_size) {
                if (!this.dynamic)
                    GLFX.GL.bufferData(GLFX.GL.ARRAY_BUFFER, new Float32Array(vdata), usage);
                else
                    GLFX.GL.bufferData(GLFX.GL.ARRAY_BUFFER, vsize, usage);
                this.vbo_size = vsize;
            }
            if (this.dynamic)
                GLFX.GL.bufferSubData(GLFX.GL.ARRAY_BUFFER, 0, new Float32Array(vdata));
            if (this.indexed) {
                GLFX.GL.bindBuffer(GLFX.GL.ELEMENT_ARRAY_BUFFER, this.ibo);
                let esize = Uint32Array.BYTES_PER_ELEMENT * this.indices.length;
                if (esize > this.ibo_size) {
                    if (!this.dynamic)
                        GLFX.GL.bufferData(GLFX.GL.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), usage);
                    else
                        GLFX.GL.bufferData(GLFX.GL.ELEMENT_ARRAY_BUFFER, esize, usage);
                    this.ibo_size = esize;
                }
                if (this.dynamic)
                    GLFX.GL.bufferSubData(GLFX.GL.ELEMENT_ARRAY_BUFFER, 0, new Uint32Array(this.indices));
                GLFX.GL.bindBuffer(GLFX.GL.ELEMENT_ARRAY_BUFFER, null);
            }
            GLFX.GL.bindBuffer(GLFX.GL.ARRAY_BUFFER, null);
        }
        bind(shader) {
            this.shader = shader;
            if (this.indexed) {
                GLFX.GL.bindBuffer(GLFX.GL.ELEMENT_ARRAY_BUFFER, this.ibo);
            }
            GLFX.GL.bindBuffer(GLFX.GL.ARRAY_BUFFER, this.vbo);
            this.format.bind(shader);
        }
        unbind() {
            this.format.unbind(this.shader);
            if (this.indexed) {
                GLFX.GL.bindBuffer(GLFX.GL.ELEMENT_ARRAY_BUFFER, null);
            }
            GLFX.GL.bindBuffer(GLFX.GL.ARRAY_BUFFER, null);
        }
        render(mode, offset = 0, count = -1) {
            if (this.indexed) {
                let cnt = count == -1 ? this.indexCount : count;
                GLFX.GL.drawElements(mode, cnt, GLFX.GL.UNSIGNED_INT, offset);
            }
            else {
                let cnt = count == -1 ? this.vertexCount : count;
                GLFX.GL.drawArrays(mode, offset, cnt);
            }
        }
        destroy() {
            GLFX.GL.deleteBuffer(this.vbo);
            if (this.indexed)
                GLFX.GL.deleteBuffer(this.ibo);
        }
    }
    GLFX.Mesh = Mesh;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    let Target;
    (function (Target) {
        Target[Target["ColorAttachment"] = 0] = "ColorAttachment";
        Target[Target["DepthAttachment"] = 1] = "DepthAttachment";
        Target[Target["StencilAttachment"] = 2] = "StencilAttachment";
    })(Target = GLFX.Target || (GLFX.Target = {}));
    class RenderTarget {
        constructor(width, height, target) {
            this.texture = new GLFX.Texture2D(null, width, height);
            this.fbo = GLFX.GL.createFramebuffer();
            const att = [
                GLFX.GL.COLOR_ATTACHMENT0,
                GLFX.GL.DEPTH_ATTACHMENT,
                GLFX.GL.STENCIL_ATTACHMENT
            ];
            this.texture.bind(0);
            GLFX.GL.bindFramebuffer(GLFX.GL.FRAMEBUFFER, this.fbo);
            GLFX.GL.framebufferTexture2D(GLFX.GL.FRAMEBUFFER, att[target], GLFX.GL.TEXTURE_2D, this.texture.id, 0);
            GLFX.GL.bindFramebuffer(GLFX.GL.FRAMEBUFFER, null);
            this.texture.unbind();
        }
        bind() {
            this.oldVP = GLFX.GL.getParameter(GLFX.GL.VIEWPORT);
            GLFX.GL.bindFramebuffer(GLFX.GL.FRAMEBUFFER, this.fbo);
            GLFX.GL.viewport(0, 0, this.texture.width, this.texture.height);
        }
        unbind() {
            let vp = this.oldVP;
            GLFX.GL.bindFramebuffer(GLFX.GL.FRAMEBUFFER, null);
            GLFX.GL.viewport(vp[0], vp[1], vp[2], vp[3]);
        }
        destroy() {
            GLFX.GL.deleteFramebuffer(this.fbo);
            this.texture.destroy();
        }
    }
    GLFX.RenderTarget = RenderTarget;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class Uniform {
        constructor(loc) {
            this.loc = loc;
        }
        setInt(v) {
            GLFX.GL.uniform1i(this.loc, v);
        }
        setFloat(v) {
            GLFX.GL.uniform1f(this.loc, v);
        }
        setVec2(v) {
            GLFX.GL.uniform2f(this.loc, v.x, v.y);
        }
        setVec3(v) {
            GLFX.GL.uniform3f(this.loc, v.x, v.y, v.z);
        }
        setVec4(v) {
            GLFX.GL.uniform4f(this.loc, v.x, v.y, v.z, v.w);
        }
        setMat4(v) {
            GLFX.GL.uniformMatrix4fv(this.loc, false, v.value);
        }
    }
    GLFX.Uniform = Uniform;
    class Shader {
        constructor(vert, frag) {
            this.program = GLFX.GL.createProgram();
            this.uniforms = new GLFX.Dict();
            this.attributes = new GLFX.Dict();
            let vs = GLFX.GL.createShader(GLFX.GL.VERTEX_SHADER);
            GLFX.GL.shaderSource(vs, vert);
            GLFX.GL.compileShader(vs);
            if (!GLFX.GL.getShaderParameter(vs, GLFX.GL.COMPILE_STATUS)) {
                console.error("Vertex Shader Error:\n\t" + GLFX.GL.getShaderInfoLog(vs));
                GLFX.GL.deleteShader(vs);
                return;
            }
            let fs = GLFX.GL.createShader(GLFX.GL.FRAGMENT_SHADER);
            GLFX.GL.shaderSource(fs, frag);
            GLFX.GL.compileShader(fs);
            if (!GLFX.GL.getShaderParameter(fs, GLFX.GL.COMPILE_STATUS)) {
                console.error("Fragment Shader Error:\n\t" + GLFX.GL.getShaderInfoLog(fs));
                GLFX.GL.deleteShader(fs);
                return;
            }
            GLFX.GL.attachShader(this.program, vs);
            GLFX.GL.attachShader(this.program, fs);
            GLFX.GL.linkProgram(this.program);
            GLFX.GL.deleteShader(vs);
            GLFX.GL.deleteShader(fs);
        }
        static fromHTMLElement(veid, feid) {
            return new Shader(document.getElementById(veid).innerHTML, document.getElementById(feid).innerHTML);
        }
        bind() {
            GLFX.GL.useProgram(this.program);
        }
        unbind() {
            GLFX.GL.useProgram(null);
        }
        getUniformLocation(name) {
            if (!this.uniforms.containsKey(name)) {
                let loc = GLFX.GL.getUniformLocation(this.program, name);
                if (loc !== null && loc !== -1) {
                    this.uniforms.add(name, loc);
                }
                else {
                    return null;
                }
            }
            return this.uniforms.get(name);
        }
        getAttribLocation(name) {
            if (!this.attributes.containsKey(name)) {
                let loc = GLFX.GL.getAttribLocation(this.program, name);
                if (loc !== null && loc !== -1) {
                    this.attributes.add(name, loc);
                }
                else {
                    return null;
                }
            }
            return this.attributes.get(name);
        }
        getUniform(name) {
            let loc = this.getUniformLocation(name);
            if (loc) {
                return new Uniform(loc);
            }
            return null;
        }
        destroy() {
            GLFX.GL.deleteProgram(this.program);
        }
    }
    GLFX.Shader = Shader;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class Texture2D {
        constructor(src = null, width = 1, height = 1) {
            this.ispow2 = false;
            this.valid = false;
            let _this = this;
            this.id = GLFX.GL.createTexture();
            if (src) {
                let img = new Image();
                img.onload = function () {
                    GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, _this.id);
                    GLFX.GL.texImage2D(GLFX.GL.TEXTURE_2D, 0, GLFX.GL.RGBA, GLFX.GL.RGBA, GLFX.GL.UNSIGNED_BYTE, img);
                    if (Math.isPowerOfTwo(img.width) && Math.isPowerOfTwo(img.height)) {
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_S, GLFX.GL.REPEAT);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_T, GLFX.GL.REPEAT);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MIN_FILTER, GLFX.GL.LINEAR_MIPMAP_LINEAR);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MAG_FILTER, GLFX.GL.LINEAR);
                        GLFX.GL.generateMipmap(GLFX.GL.TEXTURE_2D);
                        _this.ispow2 = true;
                    }
                    else {
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_S, GLFX.GL.CLAMP_TO_EDGE);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_T, GLFX.GL.CLAMP_TO_EDGE);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MIN_FILTER, GLFX.GL.LINEAR);
                        GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MAG_FILTER, GLFX.GL.LINEAR);
                    }
                    _this.valid = true;
                    GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, null);
                    _this.width = img.width;
                    _this.height = img.height;
                };
                img.src = src;
            }
            else {
                GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, _this.id);
                if (Math.isPowerOfTwo(width) && Math.isPowerOfTwo(height)) {
                    GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MIN_FILTER, GLFX.GL.LINEAR_MIPMAP_LINEAR);
                    GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MAG_FILTER, GLFX.GL.LINEAR);
                    _this.ispow2 = true;
                }
                else {
                    GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MIN_FILTER, GLFX.GL.LINEAR);
                    GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_MAG_FILTER, GLFX.GL.LINEAR);
                }
                GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_S, GLFX.GL.CLAMP_TO_EDGE);
                GLFX.GL.texParameteri(GLFX.GL.TEXTURE_2D, GLFX.GL.TEXTURE_WRAP_T, GLFX.GL.CLAMP_TO_EDGE);
                GLFX.GL.texImage2D(GLFX.GL.TEXTURE_2D, 0, GLFX.GL.RGBA, width, height, 0, GLFX.GL.RGBA, GLFX.GL.UNSIGNED_BYTE, null);
                _this.valid = true;
                GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, null);
                _this.width = width;
                _this.height = height;
            }
        }
        static fromImage(img) {
            let tex = new Texture2D(null, img.width, img.height);
            let canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            tex.update(ctx.getImageData(0, 0, img.width, img.height));
            return tex;
        }
        update(data) {
            this.bind();
            GLFX.GL.texSubImage2D(GLFX.GL.TEXTURE_2D, 0, 0, 0, GLFX.GL.RGBA, GLFX.GL.UNSIGNED_BYTE, data);
            if (Math.isPowerOfTwo(data.width) && Math.isPowerOfTwo(data.height)) {
                GLFX.GL.generateMipmap(GLFX.GL.TEXTURE_2D);
            }
            this.unbind();
        }
        bind(slot = 0) {
            if (this.valid) {
                GLFX.GL.activeTexture(GLFX.GL.TEXTURE0 + slot);
                GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, this.id);
            }
        }
        unbind() {
            GLFX.GL.bindTexture(GLFX.GL.TEXTURE_2D, null);
        }
        generateMipmaps() {
            if (this.ispow2)
                GLFX.GL.generateMipmap(GLFX.GL.TEXTURE_2D);
        }
        destroy() {
            GLFX.GL.deleteTexture(this.id);
        }
    }
    GLFX.Texture2D = Texture2D;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class Mat4 {
        constructor(v = null) {
            if ((v instanceof Float32Array || v instanceof Array) && v.length == 16) {
                this.rows = [
                    new GLFX.Vec4(v[0], v[1], v[2], v[3]),
                    new GLFX.Vec4(v[4], v[5], v[6], v[7]),
                    new GLFX.Vec4(v[8], v[9], v[10], v[11]),
                    new GLFX.Vec4(v[12], v[13], v[14], v[15])
                ];
            }
            else {
                this.rows = [
                    new GLFX.Vec4(1, 0, 0, 0),
                    new GLFX.Vec4(0, 1, 0, 0),
                    new GLFX.Vec4(0, 0, 1, 0),
                    new GLFX.Vec4(0, 0, 0, 1)
                ];
            }
            this.fa = new Float32Array(16);
        }
        static fromRows(rows) {
            let m = new Mat4();
            m.rows = rows;
            return m;
        }
        get value() {
            let i = 0;
            for (let row of this.rows) {
                for (let v of row.values) {
                    this.fa[i++] = v;
                }
            }
            return this.fa;
        }
        getValue(row, col) {
            return this.rows[row].values[col];
        }
        clone() {
            let [a, b, c, d] = this.rows;
            return new Mat4([
                a.x, a.y, a.z, a.w,
                b.x, b.y, b.z, b.w,
                c.x, c.y, c.z, c.w,
                d.x, d.y, d.z, d.w
            ]);
        }
        transposed() {
            let [a, b, c, d] = this.rows;
            return new Mat4([
                a.x, b.x, c.x, d.x,
                a.y, b.y, c.y, d.y,
                a.z, b.z, c.z, d.z,
                a.w, b.w, c.w, d.w
            ]);
        }
        inverted() {
            let mat = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            let tmp = new Array(12);
            let src = new Array(16);
            for (let i = 0; i < 4; i++) {
                src[i + 0] = this.getValue(i, 0);
                src[i + 4] = this.getValue(i, 1);
                src[i + 8] = this.getValue(i, 2);
                src[i + 12] = this.getValue(i, 3);
            }
            tmp[0] = src[10] * src[15];
            tmp[1] = src[11] * src[14];
            tmp[2] = src[9] * src[15];
            tmp[3] = src[11] * src[13];
            tmp[4] = src[9] * src[14];
            tmp[5] = src[10] * src[13];
            tmp[6] = src[8] * src[15];
            tmp[7] = src[11] * src[12];
            tmp[8] = src[8] * src[14];
            tmp[9] = src[10] * src[12];
            tmp[10] = src[8] * src[13];
            tmp[11] = src[9] * src[12];
            mat[0][0] = tmp[0] * src[5] + tmp[3] * src[6] + tmp[4] * src[7];
            mat[0][0] -= tmp[1] * src[5] + tmp[2] * src[6] + tmp[5] * src[7];
            mat[0][1] = tmp[1] * src[4] + tmp[6] * src[6] + tmp[9] * src[7];
            mat[0][1] -= tmp[0] * src[4] + tmp[7] * src[6] + tmp[8] * src[7];
            mat[0][2] = tmp[2] * src[4] + tmp[7] * src[5] + tmp[10] * src[7];
            mat[0][2] -= tmp[3] * src[4] + tmp[6] * src[5] + tmp[11] * src[7];
            mat[0][3] = tmp[5] * src[4] + tmp[8] * src[5] + tmp[11] * src[6];
            mat[0][3] -= tmp[4] * src[4] + tmp[9] * src[5] + tmp[10] * src[6];
            mat[1][0] = tmp[1] * src[1] + tmp[2] * src[2] + tmp[5] * src[3];
            mat[1][0] -= tmp[0] * src[1] + tmp[3] * src[2] + tmp[4] * src[3];
            mat[1][1] = tmp[0] * src[0] + tmp[7] * src[2] + tmp[8] * src[3];
            mat[1][1] -= tmp[1] * src[0] + tmp[6] * src[2] + tmp[9] * src[3];
            mat[1][2] = tmp[3] * src[0] + tmp[6] * src[1] + tmp[11] * src[3];
            mat[1][2] -= tmp[2] * src[0] + tmp[7] * src[1] + tmp[10] * src[3];
            mat[1][3] = tmp[4] * src[0] + tmp[9] * src[1] + tmp[10] * src[2];
            mat[1][3] -= tmp[5] * src[0] + tmp[8] * src[1] + tmp[11] * src[2];
            tmp[0] = src[2] * src[7];
            tmp[1] = src[3] * src[6];
            tmp[2] = src[1] * src[7];
            tmp[3] = src[3] * src[5];
            tmp[4] = src[1] * src[6];
            tmp[5] = src[2] * src[5];
            tmp[6] = src[0] * src[7];
            tmp[7] = src[3] * src[4];
            tmp[8] = src[0] * src[6];
            tmp[9] = src[2] * src[4];
            tmp[10] = src[0] * src[5];
            tmp[11] = src[1] * src[4];
            mat[2][0] = tmp[0] * src[13] + tmp[3] * src[14] + tmp[4] * src[15];
            mat[2][0] -= tmp[1] * src[13] + tmp[2] * src[14] + tmp[5] * src[15];
            mat[2][1] = tmp[1] * src[12] + tmp[6] * src[14] + tmp[9] * src[15];
            mat[2][1] -= tmp[0] * src[12] + tmp[7] * src[14] + tmp[8] * src[15];
            mat[2][2] = tmp[2] * src[12] + tmp[7] * src[13] + tmp[10] * src[15];
            mat[2][2] -= tmp[3] * src[12] + tmp[6] * src[13] + tmp[11] * src[15];
            mat[2][3] = tmp[5] * src[12] + tmp[8] * src[13] + tmp[11] * src[14];
            mat[2][3] -= tmp[4] * src[12] + tmp[9] * src[13] + tmp[10] * src[14];
            mat[3][0] = tmp[2] * src[10] + tmp[5] * src[11] + tmp[1] * src[9];
            mat[3][0] -= tmp[4] * src[11] + tmp[0] * src[9] + tmp[3] * src[10];
            mat[3][1] = tmp[8] * src[11] + tmp[0] * src[8] + tmp[7] * src[10];
            mat[3][1] -= tmp[6] * src[10] + tmp[9] * src[11] + tmp[1] * src[8];
            mat[3][2] = tmp[6] * src[9] + tmp[11] * src[11] + tmp[3] * src[8];
            mat[3][2] -= tmp[10] * src[11] + tmp[2] * src[8] + tmp[7] * src[9];
            mat[3][3] = tmp[10] * src[10] + tmp[4] * src[8] + tmp[9] * src[9];
            mat[3][3] -= tmp[8] * src[9] + tmp[11] * src[10] + tmp[5] * src[8];
            let det = 1.0 / (src[0] * mat[0][0] + src[1] * mat[0][1] + src[2] * mat[0][2] + src[3] * mat[0][3]);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    mat[i][j] = mat[i][j] * det;
                }
            }
            let fmat = new Array(16);
            for (let row of mat) {
                fmat.push(...row);
            }
            return new Mat4(fmat);
        }
        mul(rhs) {
            if (rhs instanceof Mat4) {
                let d = new Array(16);
                let ot = rhs.transposed();
                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 4; i++) {
                        d[i + j * 4] = this.rows[j].dot(ot.rows[i]);
                    }
                }
                return new Mat4(d);
            }
            else if (rhs instanceof GLFX.Vec4) {
                return new GLFX.Vec4(this.rows[0].dot(rhs), this.rows[1].dot(rhs), this.rows[2].dot(rhs), this.rows[3].dot(rhs));
            }
            else if (rhs instanceof GLFX.Vec3) {
                let v = new GLFX.Vec4(rhs.x, rhs.y, rhs.z, 1);
                return new GLFX.Vec3(this.rows[0].dot(v), this.rows[1].dot(v), this.rows[2].dot(v));
            }
            else if (typeof rhs == 'number') {
                let d = new Array(16);
                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 4; i++) {
                        d[i + j * 4] = this.getValue(j, i) * rhs;
                    }
                }
                return new Mat4(d);
            }
        }
        static ident() {
            return new Mat4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        static translation(x, y = 0, z = 0) {
            let vx = 0, vy = y, vz = z;
            if (x instanceof GLFX.Vec3) {
                vx = x.x;
                vy = x.y;
                vz = x.z;
            }
            else {
                vx = x;
                vy = y;
                vz = z;
            }
            return new Mat4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                vx, vy, vz, 1
            ]);
        }
        static scale(x, y = 0, z = 0) {
            let vx = 0, vy = y, vz = z;
            if (x instanceof GLFX.Vec3) {
                vx = x.x;
                vy = x.y;
                vz = x.z;
            }
            else {
                vx = x;
                vy = y;
                vz = z;
            }
            return new Mat4([
                vx, 0, 0, 0,
                0, vy, 0, 0,
                0, 0, vz, 0,
                0, 0, 0, 1
            ]);
        }
        static uniformScale(s) {
            return new Mat4([
                s, 0, 0, 0,
                0, s, 0, 0,
                0, 0, s, 0,
                0, 0, 0, 1
            ]);
        }
        static rotationX(a) {
            let s = Math.sin(a), c = Math.cos(a);
            return new Mat4([
                1.0, 0.0, 0.0, 0.0,
                0.0, c, -s, 0.0,
                0.0, s, c, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
        }
        static rotationY(a) {
            let s = Math.sin(a), c = Math.cos(a);
            return new Mat4([
                c, 0.0, -s, 0.0,
                0.0, 1.0, 0.0, 0.0,
                s, 0.0, c, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
        }
        static rotationZ(a) {
            let s = Math.sin(a), c = Math.cos(a);
            return new Mat4([
                c, -s, 0.0, 0.0,
                s, c, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
        }
        static euler(a) {
            return Mat4.rotationX(a.x).mul(Mat4.rotationY(a.y)).mul(Mat4.rotationZ(a.z));
        }
        static axisAngle(axis, a) {
            let s = Math.sin(a), c = Math.cos(a);
            let t = 1.0 - c;
            let ax = axis.normalized();
            let x = ax.x;
            let y = ax.y;
            let z = ax.z;
            return new Mat4([
                t * x * x + c, t * x * y - z * s, t * x * z + y * s, 0.0,
                t * x * y + z * s, t * y * y + c, t * y * z - x * s, 0.0,
                t * x * z - y * s, t * y * z + x * s, t * z * z + c, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
        }
        static ortho(l, r, t, b, n, f) {
            let w = r - l;
            let h = b - t;
            let d = f - n;
            return new Mat4([
                2.0 / w, 0.0, 0.0, 0.0,
                0.0, 2.0 / h, 0.0, 0.0,
                0.0, 0.0, -2.0 / d, 0.0,
                -(r + l) / w, -(t + b) / h, -(f + n) / d, 1.0
            ]);
        }
        static ortho2D(width, height) {
            return Mat4.ortho(0, width, height, 0, -1, 1);
        }
        static frustum(l, r, b, t, n, f) {
            let n2, w, h, d;
            n2 = 2 * n;
            w = r - l;
            h = t - b;
            d = f - n;
            let m = new Mat4();
            m.rows[0].set(n2 / w, 0, 0, 0);
            m.rows[1].set(0, n2 / h, 0, 0);
            m.rows[2].set((r + l) / w, (t + b) / h, (-f - n) / d, -1);
            m.rows[3].set(0, 0, (-n2 * f) / d, 0);
            return m;
        }
        static perspective(fov, asp, n, f) {
            let xmax, ymax;
            ymax = n * Math.tan(fov);
            xmax = ymax * asp;
            return Mat4.frustum(-xmax, xmax, -ymax, ymax, n, f);
        }
        static lookAt(eye, at, up) {
            let z = eye.sub(at).normalized();
            let x = up.cross(z).normalized();
            let y = z.cross(x);
            let R = new Mat4([
                x.x, x.y, -x.z, 0.0,
                y.x, y.y, -y.z, 0.0,
                z.x, z.y, -z.z, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
            return Mat4.translation(eye.mul(-1)).mul(R);
        }
    }
    GLFX.Mat4 = Mat4;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class Quat {
        constructor(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        get imaginary() {
            return new GLFX.Vec3(this.x, this.y, this.z);
        }
        get magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        }
        get forward() {
            return this.mul(new GLFX.Vec3(0, 0, -1));
        }
        get right() {
            return this.mul(new GLFX.Vec3(1, 0, 0));
        }
        get up() {
            return this.mul(new GLFX.Vec3(0, 1, 0));
        }
        normalized() {
            let m = this.magnitude;
            return new Quat(this.x / m, this.y / m, this.z / m, this.w / m);
        }
        conjugated() {
            return new Quat(-this.x, -this.y, -this.z, this.w);
        }
        toMat4() {
            return GLFX.Mat4.fromRows([
                this.mul(new GLFX.Vec3(1.0, 0.0, 0.0)).extend(0.0),
                this.mul(new GLFX.Vec3(0.0, 1.0, 0.0)).extend(0.0),
                this.mul(new GLFX.Vec3(0.0, 0.0, 1.0)).extend(0.0),
                new GLFX.Vec4(0, 0, 0, 1)
            ]).transposed();
        }
        add(q) {
            return new Quat(this.x + q.x, this.y + q.y, this.z + q.z, this.w + q.w);
        }
        mul(o) {
            if (o instanceof Quat) {
                return new Quat(this.w * o.x - this.z * o.y + this.y * o.z + this.x * o.w, this.z * o.x + this.w * o.y - this.x * o.z + this.y * o.w, -this.y * o.x + this.x * o.y + this.w * o.z + this.z * o.w, -this.x * o.x - this.y * o.y - this.z * o.z + this.w * o.w);
            }
            else if (o instanceof GLFX.Vec3) {
                let q = new Quat(o.x, o.y, o.z, 0.0);
                return this.mul(q.mul(this.conjugated())).imaginary;
            }
            else {
                return new Quat(this.x * o, this.y * o, this.z * o, this.w * o);
            }
        }
        static axisAngle(axis, angle) {
            let a = angle / 2.0;
            let s = Math.sin(angle);
            return new Quat(axis.x * s, axis.y * s, axis.z * s, Math.cos(a));
        }
    }
    GLFX.Quat = Quat;
})(GLFX || (GLFX = {}));
var GLFX;
(function (GLFX) {
    class Vec2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        dot(b) {
            return this.x * b.x + this.y * b.y;
        }
        perpDot(b) {
            return this.x * b.y - this.y * b.x;
        }
        neg() {
            return this.mul(-1);
        }
        extend(z) {
            return new Vec3(this.x, this.y, z);
        }
        normalized() {
            let len = this.length;
            return new Vec2(this.x / len, this.y / len);
        }
        get perp() {
            return new Vec2(-this.y, this.x);
        }
        get angle() {
            return Math.atan2(this.y, this.x);
        }
        get lengthSqr() {
            return this.dot(this);
        }
        get length() {
            return Math.sqrt(this.lengthSqr);
        }
        add(b) {
            let v;
            if (b instanceof Vec2) {
                v = b;
            }
            else {
                v = new Vec2(b, b);
            }
            return new Vec2(this.x + v.x, this.y + v.y);
        }
        sub(b) {
            let v;
            if (b instanceof Vec2) {
                v = b;
            }
            else {
                v = new Vec2(b, b);
            }
            return new Vec2(this.x - v.x, this.y - v.y);
        }
        mul(b) {
            let v;
            if (b instanceof Vec2) {
                v = b;
            }
            else {
                v = new Vec2(b, b);
            }
            return new Vec2(this.x * v.x, this.y * v.y);
        }
        div(b) {
            let v;
            if (b instanceof Vec2) {
                v = b;
            }
            else {
                v = new Vec2(b, b);
            }
            return new Vec2(this.x / v.x, this.y / v.y);
        }
        set(x, y) {
            if (x instanceof Vec2) {
                this.x = x.x;
                this.y = x.y;
            }
            else {
                this.x = x;
                this.y = y;
            }
        }
        equals(v) {
            return this.x == v.x && this.y == v.y;
        }
    }
    GLFX.Vec2 = Vec2;
    class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        dot(b) {
            return this.x * b.x + this.y * b.y + this.z * b.z;
        }
        cross(b) {
            return new Vec3(this.y * b.z - this.z * b.y, this.z * b.x - this.x * b.z, this.x * b.y - this.y * b.x);
        }
        neg() {
            return this.mul(-1);
        }
        extend(w) {
            return new Vec4(this.x, this.y, this.z, w);
        }
        normalized() {
            let len = this.length;
            return new Vec3(this.x / len, this.y / len, this.z / len);
        }
        get lengthSqr() {
            return this.dot(this);
        }
        get length() {
            return Math.sqrt(this.lengthSqr);
        }
        add(b) {
            let v;
            if (b instanceof Vec3) {
                v = b;
            }
            else {
                v = new Vec3(b, b, b);
            }
            return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        sub(b) {
            let v;
            if (b instanceof Vec3) {
                v = b;
            }
            else {
                v = new Vec3(b, b, b);
            }
            return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        mul(b) {
            let v;
            if (b instanceof Vec3) {
                v = b;
            }
            else {
                v = new Vec3(b, b, b);
            }
            return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        div(b) {
            let v;
            if (b instanceof Vec3) {
                v = b;
            }
            else {
                v = new Vec3(b, b);
            }
            return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
        }
        set(x, y, z) {
            if (x instanceof Vec3) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
            }
            else {
                this.x = x;
                this.y = y;
                this.z = z;
            }
        }
        equals(v) {
            return this.x == v.x && this.y == v.y && this.z == v.z;
        }
        angleCos(v) {
            let length1Sqared = this.lengthSqr;
            let length2Sqared = v.lengthSqr;
            let dot = this.dot(v);
            return (dot / (Math.sqrt(length1Sqared * length2Sqared)));
        }
        angle(v) {
            let cos = this.angleCos(v);
            cos = cos < 1 ? cos : 1;
            cos = cos > -1 ? cos : -1;
            return Math.acos(cos);
        }
    }
    GLFX.Vec3 = Vec3;
    class Vec4 {
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        dot(b) {
            return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
        }
        normalized() {
            let len = this.length;
            return new Vec4(this.x / len, this.y / len, this.z / len, this.w / len);
        }
        set(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        neg() {
            return this.mul(-1);
        }
        get lengthSqr() {
            return this.dot(this);
        }
        get length() {
            return Math.sqrt(this.lengthSqr);
        }
        get values() {
            return [this.x, this.y, this.z, this.w];
        }
        add(b) {
            let v;
            if (b instanceof Vec4) {
                v = b;
            }
            else {
                v = new Vec4(b, b, b, b);
            }
            return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
        }
        sub(b) {
            let v;
            if (b instanceof Vec4) {
                v = b;
            }
            else {
                v = new Vec4(b, b, b);
            }
            return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
        }
        mul(b) {
            let v;
            if (b instanceof Vec4) {
                v = b;
            }
            else {
                v = new Vec4(b, b, b, b);
            }
            return new Vec4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
        }
    }
    GLFX.Vec4 = Vec4;
})(GLFX || (GLFX = {}));
