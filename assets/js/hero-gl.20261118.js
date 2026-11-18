/* Weburate hero background: a tiny raw-WebGL mesh-gradient (cyan / blue / violet) with a
   flowing light trail that leans toward the mouse. Desktop only, lazy-loaded by motion.js
   after window load. Renders at reduced resolution, pauses off-screen and in hidden tabs.
   If WebGL is unavailable the CSS gradient blobs on .hero stay visible as the fallback. */
(function () {
  "use strict";
  var hero = document.querySelector(".hero, .page-hero");
  if (!hero || hero.querySelector(".hero-gl")) return;
  var canvas = document.createElement("canvas");
  canvas.className = "hero-gl";
  canvas.setAttribute("aria-hidden", "true");
  var gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FRAG = [
    "precision mediump float;",
    "uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uHover;",
    "const vec3 C1=vec3(.094,.784,.957);const vec3 C2=vec3(.145,.388,.922);const vec3 C3=vec3(.439,.278,.961);",
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}",
    "float blob(vec2 p,vec2 c,float r){vec2 d=p-c;return exp(-dot(d,d)/(r*r));}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 p=vec2(uv.x*asp,uv.y);",
    " float t=uTime*.12;",
    " vec2 w=vec2(n(p*1.5+t),n(p*1.5-t+4.))-.5;p+=w*.38;",
    " vec2 m=vec2(uMouse.x*asp,uMouse.y);",
    " float b1=blob(p,vec2(asp*(.70+.08*sin(t*1.3)),.80+.07*cos(t)),.40);",
    " float b2=blob(p,vec2(asp*(.92+.05*cos(t*.9)),.38+.10*sin(t*1.1)),.44);",
    " float b3=blob(p,vec2(asp*(.48+.10*sin(t*.7)),.12+.06*cos(t*1.4)),.36);",
    " float bm=blob(p,m,.30)*uHover;",
    " float s=b1+b2+b3+bm;",
    " vec3 col=(C1*b1+C2*b2+C3*b3+mix(C1,C3,uv.x)*bm)/max(s,.001);",
    " float a=clamp(s,0.,1.)*.40;",
    " float ty=.52+.16*sin(uv.x*3.6-uTime*.45)+(m.y-.5)*.12*uHover;",
    " float trail=exp(-pow((uv.y-ty)*30.,2.))*smoothstep(.05,.6,uv.x)*.55;",
    " col=mix(col,mix(C1,C3,uv.x),trail);a=max(a,trail*.75);",
    " a*=mix(.55,1.,smoothstep(.22,.68,uv.x));",
    " gl_FragColor=vec4(col*a,a);",
    "}"
  ].join("\n");

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uMouse = gl.getUniformLocation(prog, "uMouse");
  var uHover = gl.getUniformLocation(prog, "uHover");

  hero.prepend(canvas);
  hero.classList.add("has-gl");

  var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
  function resize() {
    var w = Math.max(1, Math.round(hero.clientWidth * scale));
    var h = Math.max(1, Math.round(hero.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }
  resize();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);

  var mouse = [0.7, 0.6], target = [0.7, 0.6], hover = 0, hoverTarget = 0;
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    target[0] = (e.clientX - r.left) / r.width;
    target[1] = 1 - (e.clientY - r.top) / r.height;
    hoverTarget = 1;
  });
  hero.addEventListener("pointerleave", function () { hoverTarget = 0; });

  var visible = true, raf = 0, first = true, t0 = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    mouse[0] += (target[0] - mouse[0]) * 0.06;
    mouse[1] += (target[1] - mouse[1]) * 0.06;
    hover += (hoverTarget - hover) * 0.04;
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uHover, hover);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (first) { first = false; canvas.classList.add("is-on"); }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; kick(); }).observe(hero);
  document.addEventListener("visibilitychange", kick);
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); visible = false; hero.classList.remove("has-gl"); canvas.remove(); });
  kick();
})();
