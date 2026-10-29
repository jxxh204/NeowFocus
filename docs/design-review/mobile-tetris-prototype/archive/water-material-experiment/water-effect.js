// Prototype-only water material. No textures, network, dependencies or app data.
// A separate WebGL canvas lets the existing blocks keep their 2D renderer.
class WaterMaterialSurface {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: true })
    const gl = this.gl
    if (!gl) return
    const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`
    const fragment = `
      precision highp float;
      uniform vec2 resolution;
      uniform float fill, time, reduced, pixelScale;
      vec2 hash(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
      float lens(vec2 p,float t){
        vec2 cell=floor(p),local=fract(p);float first=10.0,second=10.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 neighbor=vec2(float(x),float(y));
          vec2 seed=hash(cell+neighbor);
          vec2 site=.5+.32*sin(t*.32+6.28318*seed);
          float d=length(neighbor+site-local);
          if(d<first){second=first;first=d;}else if(d<second){second=d;}
        }
        return pow(clamp(1.0-(second-first)*5.5,0.0,1.0),3.0);
      }
      float surface(float x,float t){
        return sin(x*.022+t*4.8)*11.0+sin(x*.041-t*6.2+.8)*5.4+sin(x*.072+t*5.1)*2.1+sin(x*.010+t*2.3)*3.0;
      }
      void main(){
        vec2 p=gl_FragCoord.xy/pixelScale;
        float motion=1.0-reduced;
        float t=time*motion;
        float amplitude=motion*smoothstep(0.0,.025,fill);
        float level=min(fill*resolution.y,resolution.y-12.0*(1.0-reduced))+surface(p.x,t)*amplitude;
        float depth=level-p.y;
        if(fill<=0.0||depth<-.6){gl_FragColor=vec4(0.0);return;}
        float meters=max(depth,0.0)/resolution.y;
        vec2 uv=vec2(p.x/resolution.y,meters);
        // Long swells and crossing ripples refract the light field below the surface.
        vec2 warp=vec2(sin(uv.y*11.0+t*.26)+sin(uv.x*17.0-t*.20),
                       cos(uv.x*12.0+t*.21)+sin(uv.y*18.0-t*.17))*.045;
        vec2 refracted=uv+warp;
        float nearSurface=exp(-max(depth,0.0)/125.0);
        vec3 deep=vec3(.045,.125,.155),shallow=vec3(.245,.405,.435);
        vec3 water=mix(deep,shallow,.20+.80*exp(-meters*2.8));
        // Quiet caustic seams, not a luminous grid. Their contrast decays with depth.
        float caustic=lens(refracted*vec2(8.0,9.5)+vec2(t*.025,-t*.018),t);
        float softLight=.5+.5*sin(refracted.x*26.0+refracted.y*9.0+t*.12);
        water+=vec3(.12,.19,.18)*caustic*(.18+.17*exp(-meters*3.0));
        water+=vec3(.035,.055,.05)*pow(softLight,5.0)*exp(-meters*2.0);
        // A narrow meniscus and a wide reflected ribbon give the surface thickness.
        float slope=(surface(p.x+1.0,t)-surface(p.x-1.0,t))*.5*amplitude;
        float fresnel=.5+.5*clamp(-slope,-1.0,1.0);
        float ribbon=exp(-max(depth,0.0)/8.0)*(.22+.13*sin(p.x*.013+t*.22));
        float edge=exp(-abs(depth)/.95)*(.35+fresnel*.27);
        water+=vec3(.24,.30,.29)*ribbon+vec3(.34,.42,.41)*edge;
        // Broad side reflection and underwater attenuation stay below the text contrast ceiling.
        float side=exp(-p.x/42.0)*.045+exp(-(resolution.x-p.x)/70.0)*.025;
        water+=vec3(.6,.8,.8)*side*(.4+nearSurface*.6);
        water=min(water,vec3(.37,.48,.50));
        float alpha=smoothstep(-.6,.8,depth);
        gl_FragColor=vec4(water*alpha,alpha);
      }`
    const compile = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
      return shader
    }
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment)
    if (!vs || !fs) { this.gl = null; return }
    this.program = gl.createProgram()
    gl.attachShader(this.program, vs)
    gl.attachShader(this.program, fs)
    gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) { this.gl = null; return }
    gl.useProgram(this.program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(this.program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    this.uniforms = Object.fromEntries(['resolution','fill','time','reduced','pixelScale'].map(name => [name,gl.getUniformLocation(this.program,name)]))
    gl.clearColor(0,0,0,0)
  }
  draw(width, height, fill, time, reduced) {
    if (!this.gl) { this.canvas.style.display='none'; return false }
    const gl=this.gl,scale=Math.min(devicePixelRatio||1,1.5)
    const w=Math.round(width*scale),h=Math.round(height*scale)
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}
    gl.viewport(0,0,w,h)
    gl.useProgram(this.program)
    gl.uniform2f(this.uniforms.resolution,width,height)
    gl.uniform1f(this.uniforms.pixelScale,scale)
    gl.uniform1f(this.uniforms.fill,fill)
    gl.uniform1f(this.uniforms.time,time)
    gl.uniform1f(this.uniforms.reduced,reduced?1:0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES,0,6)
    return true
  }
}
