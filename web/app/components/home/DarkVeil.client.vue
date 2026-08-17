<template>
  <canvas ref="canvasRef" class="site-hero__video" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, useTemplateRef } from 'vue';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

interface DarkVeilProps {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
}

const props = withDefaults(defineProps<DarkVeilProps>(), {
  hueShift: 0,
  noiseIntensity: 0,
  scanlineIntensity: 0,
  speed: 0.5,
  scanlineFrequency: 0,
  warpAmount: 0,
  resolutionScale: 1
});

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');
const emit = defineEmits<{ ready: [] }>();
let didEmitReady = false;
const markReady = () => {
  if (didEmitReady) return;
  didEmitReady = true;
  emit('ready');
};

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

// Лёгкий процедурный шейдер вместо CPPN (8 буферов, ~32 exp на пиксель,
// десятки mat4-умножений). Визуальный язык тот же — тёмное «дышащее»
// абстрактное пятно с медленным дрейфом и мягким warp'ом, но на ~5–8x
// дешевле для GPU: fbm из 3 октав вместо нейросети.
const fragment = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

float hash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+34.23);
    return fract(p.x*p.y);
}

float vnoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),
               mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
}

float fbm(vec2 p){
    float v=0.0;
    float a=0.55;
    for(int i=0;i<3;i++){
        v+=a*vnoise(p);
        p=p*2.03+vec2(11.7,7.3);
        a*=0.5;
    }
    return v;
}

mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);

vec3 hueShiftRGB(vec3 col,float deg){
    vec3 yiq=rgb2yiq*col;
    float rad=radians(deg);
    float cosh=cos(rad),sinh=sin(rad);
    vec3 yiqShift=vec3(yiq.x,yiq.y*cosh-yiq.z*sinh,yiq.y*sinh+yiq.z*cosh);
    return clamp(yiq2rgb*yiqShift,0.0,1.0);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/uResolution.xy;
    float aspect=uResolution.x/uResolution.y;
    vec2 p=vec2((uv.x-0.5)*2.0*aspect,(uv.y-0.5)*2.0);

    // Медленный дрейф
    p+=vec2(0.3,0.2)*uTime*0.042;

    // Мягкий domain warp вместо mat4-слоёв CPPN
    p+=vec2(sin(p.y*2.8+uTime*0.45)*0.14,
            cos(p.x*2.8+uTime*0.33)*0.14)*uWarp;

    float v=fbm(p*1.9);
    v=v*0.7+vnoise(p*7.3)*0.3;

    // Тёмная фиолетовая база близка к CSS-вейлу главной
    vec3 col=mix(vec3(0.06,0.03,0.10),vec3(0.35,0.18,0.55),v*v);
    // Лёгкая сиреневая дымка поверх мажорных тонов
    float v2=fbm(p*3.7+vec2(5.2,1.3));
    col=mix(col,vec3(0.55,0.25,0.72),v2*v2*0.35);

    float scanline_val=sin(fragCoord.y*uScanFreq)*0.5+0.5;
    col.rgb*=1.0-(scanline_val*scanline_val)*uScan;
    col.rgb+=(hash(fragCoord.xy+uTime*61.0)-0.5)*uNoise;

    // Перелив: плавно покачиваем оттенок во времени, чтобы вейл «дышал»
    fragColor=vec4(hueShiftRGB(col,uHueShift+20.0*sin(uTime*0.05)),1.0);
}

void main(){
    vec4 col;mainImage(col,gl_FragCoord.xy);
    gl_FragColor=col;
}
`;

let renderer: Renderer | null = null;
let program: Program | null = null;
let mesh: Mesh | null = null;
let frame: number | null = null;
let start: number = 0;
let visible = true;
let ro: ResizeObserver | null = null;
let io: IntersectionObserver | null = null;
let targetW = 0;
let targetH = 0;

// Вейл — фон hero, поэтому рендерим в пониженном разрешении и растягиваем
// канвас на всю площадь: пикселей заметно меньше, картинка не меняется.
const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
const dprCap = isMobile ? 1 : 1.25
const baseScale = isMobile ? 0.5 : 0.6

// Адаптивное качество: 0 — полное, дальше ступенями вниз.
// Если видеокарта «провисает» — снижаем разрешение, а не FPS.
let quality = 0
const QUALITY_SCALES = [1, 0.75, 0.55, 0.4]
const getScale = () => {
  const propScale = props.resolutionScale === 1 ? 1 : props.resolutionScale
  return baseScale * QUALITY_SCALES[quality]! * propScale
}

let fpsFrames = 0
let fpsWindowStart = 0
let lowFpsStreak = 0
let goodFpsStreak = 0
let didStart = false
let startTimer: ReturnType<typeof setTimeout> | null = null
let hidden = typeof document !== 'undefined' && document.hidden

const adjustQuality = (fps: number) => {
  if (fps < 24) {
    lowFpsStreak++
    goodFpsStreak = 0
    if (lowFpsStreak >= 2 && quality < QUALITY_SCALES.length - 1) {
      quality++
      lowFpsStreak = 0
      resize()
    }
  } else {
    lowFpsStreak = 0
    if (fps > 48) {
      goodFpsStreak++
      if (goodFpsStreak >= 3 && quality > 0) {
        quality--
        goodFpsStreak = 0
        resize()
      }
    }
  }
}

const onVisibility = () => {
  hidden = document.hidden
  if (!hidden && visible && !frame && didStart) {
    fpsFrames = 0
    fpsWindowStart = performance.now()
    loop()
  }
}

const cleanup = () => {
  if (startTimer) {
    clearTimeout(startTimer)
    startTimer = null
  }
  if (frame) {
    cancelAnimationFrame(frame);
    frame = null;
  }
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', onVisibility);
  ro?.disconnect();
  ro = null;
  io?.disconnect();
  io = null;
};

const resize = () => {
  if (!canvasRef.value || !renderer || !program) return;

  const parent = canvasRef.value.parentElement;
  if (!parent) return;

  const rect = parent.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (w < 2 || h < 2) return;

  const dpr = renderer.dpr;
  const scale = getScale();
  targetW = Math.round(w * scale);
  targetH = Math.round(h * scale);
  // uniform uResolution в css-пикселях * реальный dpr,
  // чтобы uv-координаты шейдера не зависели от пониженного разрешения.
  program.uniforms.uResolution.value.set(w * dpr, h * dpr);
  const pxW = Math.round(w * dpr * scale);
  const pxH = Math.round(h * dpr * scale);
  if (canvasRef.value.width !== pxW || canvasRef.value.height !== pxH) {
    renderer.setSize(targetW, targetH);
    canvasRef.value.style.width = '';
    canvasRef.value.style.height = '';
  }
};

const loop = () => {
  if (!program || !renderer || !mesh) return;
  if (!visible || hidden) {
    frame = null;
    return;
  }

  const now = performance.now();
  fpsFrames++;
  if (now - fpsWindowStart >= 1200) {
    const fps = (fpsFrames * 1000) / (now - fpsWindowStart);
    fpsFrames = 0;
    fpsWindowStart = now;
    adjustQuality(fps);
  }

  program.uniforms.uTime.value = ((now - start) / 1000) * props.speed;
  program.uniforms.uHueShift.value = props.hueShift;
  program.uniforms.uNoise.value = props.noiseIntensity;
  program.uniforms.uScan.value = props.scanlineIntensity;
  program.uniforms.uScanFreq.value = props.scanlineFrequency;
  program.uniforms.uWarp.value = props.warpAmount;
  const r = renderer;
  r.render({ scene: mesh });
  // Готовность — только первый кадр в полный размер слоя, а не дефолтные
  // 300x150 от конструктора OGL.
  if (
    !didEmitReady &&
    canvasRef.value &&
    canvasRef.value.width > 2 &&
    canvasRef.value.height > 2 &&
    canvasRef.value.parentElement
  ) {
    const pr = canvasRef.value.parentElement.getBoundingClientRect();
    const pxW = Math.round(pr.width * r.dpr * getScale());
    const pxH = Math.round(pr.height * r.dpr * getScale());
    if (canvasRef.value.width === pxW && canvasRef.value.height === pxH) {
      markReady();
    }
  }
  frame = requestAnimationFrame(loop);
};

onMounted(() => {
  if (!canvasRef.value) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = canvasRef.value;
  const parent = canvas.parentElement;
  if (!parent) return;

  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, dprCap),
      canvas
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: props.hueShift },
        uNoise: { value: props.noiseIntensity },
        uScan: { value: props.scanlineIntensity },
        uScanFreq: { value: props.scanlineFrequency },
        uWarp: { value: props.warpAmount }
      }
    });

    mesh = new Mesh(gl, { geometry, program });

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    ro = new ResizeObserver(resize);
    ro.observe(parent);
    io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting)
        if (visible && !frame && didStart) loop()
      },
      { rootMargin: '80px' },
    )
    io.observe(parent)
    resize();
    requestAnimationFrame(resize);

    // Интро играет на CSS-вейле (~450мс шторки + запас). WebGL стартует
    // после, чтобы не грузить GPU в самый пик загрузки страницы.
    startTimer = setTimeout(() => {
      startTimer = null
      didStart = true
      start = performance.now()
      fpsWindowStart = start
      if (visible && !hidden) loop()
    }, 1100)
  } catch (err) {
    console.warn('[DarkVeil] WebGL недоступен, использую CSS-вейл:', err);
    canvas.style.display = 'none';
    cleanup();
  }
});

onUnmounted(() => {
  cleanup();
});

watch(
  () => [
    props.hueShift,
    props.noiseIntensity,
    props.scanlineIntensity,
    props.speed,
    props.scanlineFrequency,
    props.warpAmount
  ],
  () => {
    if (program) {
      program.uniforms.uHueShift.value = props.hueShift;
      program.uniforms.uNoise.value = props.noiseIntensity;
      program.uniforms.uScan.value = props.scanlineIntensity;
      program.uniforms.uScanFreq.value = props.scanlineFrequency;
      program.uniforms.uWarp.value = props.warpAmount;
    }
  }
);
</script>