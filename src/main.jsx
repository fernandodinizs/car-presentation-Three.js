import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, OrbitControls } from '@react-three/drei';
import { ArrowUpRight, Gauge, Menu, X, Zap } from 'lucide-react';

import * as THREE from 'three';

import './styles.css';

import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, Observer);

let lenis = null;     // instância global
let snapApi = null;   // usada pelo Nav 
const hooks = {};     // ponte entre a intro e o snap
const COLS = 14, ROWS = 8;
const q = (el) => gsap.utils.selector(el);


  
const vehicle = {
  brand: 'HONDA',
  model: 'CIVIC TYPE R',
  year: '2026',
  engine: '2.0L VTEC TURBO',
  power: '320',
  torque: '420',
  topSpeed: '272',
  zeroToHundred: '5.4',
  transmission: '6-SPEED MANUAL',
  weight: '1,430',
  length: '4.593',
  wheelbase: '2.735',
};


// MODELO 3D  
function DemoCar({ interactive = false, hideTip = false, staticSide = false }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);

  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.28, 0.06);
    shape.quadraticCurveTo(-2.44, 0.20, -2.34, 0.40);
    shape.lineTo(-2.02, 0.54);
    shape.quadraticCurveTo(-1.68, 0.62, -1.48, 0.76);
    shape.quadraticCurveTo(-1.22, 1.02, -0.92, 1.15);
    shape.quadraticCurveTo(-0.28, 1.26, 0.36, 1.21);
    shape.quadraticCurveTo(0.76, 1.17, 0.93, 0.96);
    shape.quadraticCurveTo(1.05, 0.79, 1.36, 0.67);
    shape.lineTo(1.86, 0.50);
    shape.quadraticCurveTo(2.20, 0.40, 2.30, 0.22);
    shape.quadraticCurveTo(2.34, 0.10, 2.26, 0.04);
    shape.lineTo(-2.28, 0.06);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 1.82,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 2,
      steps: 1,
    });

    geometry.translate(0, 0, -1.82 / 2);
    return geometry;

  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

     if (!interactive && !staticSide) {
      group.current.rotation.y += delta * 0.14;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.035;
    }
  });

  const wheelPositions = [
    [1.52, 0.34, 0.86],
    [1.52, 0.34, -0.86],
    [-1.52, 0.34, 0.86],
    [-1.52, 0.34, -0.86],
  ];

  const body = (
    <group
      ref={group}
      scale={1.15}
      rotation={[0, 0.35, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Carroceria */}
      <mesh geometry={bodyGeometry} position={[0, 0.28, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={hovered ? '#e6e6e6' : '#d8d8d8'}
          metalness={0.7}
          roughness={0.28}
          clearcoat={1}
        />
      </mesh>

      {/* Vidro / cabine */}
      <mesh position={[-0.35, 1.2, 0]} rotation={[0.02, 0, 0]} castShadow>
        <boxGeometry args={[1.55, 0.42, 1.58]} />
        <meshPhysicalMaterial color="#0d1420" metalness={0.9} roughness={0.15} transparent opacity={0.88} />
      </mesh>

      {/* Frisos laterais */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[-0.15, 0.62, side * 0.93]}>
          <boxGeometry args={[3.1, 0.05, 0.02]} />
          <meshStandardMaterial color="#111318" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* Aerofólio */}
      <mesh position={[-2.05, 1.02, 0]}>
        <boxGeometry args={[1.05, 0.05, 1.55]} />
        <meshStandardMaterial color="#111318" metalness={0.4} roughness={0.5} />
      </mesh>
      {[0.6, -0.6].map((z) => (
        <mesh key={z} position={[-2.05, 0.86, z]}>
          <boxGeometry args={[0.06, 0.32, 0.06]} />
          <meshStandardMaterial color="#111318" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* Faróis e lanternas */}
      {[0.72, -0.72].map((z) => (
        <group key={z}>
          <mesh position={[2.22, 0.46, z]}>
            <boxGeometry args={[0.12, 0.1, 0.28]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[-2.28, 0.42, z]}>
            <boxGeometry args={[0.1, 0.12, 0.34]} />
            <meshStandardMaterial color="#9c0000" emissive="#350000" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}

      {/* Rodas */}
      {wheelPositions.map(([x, y, z]) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.24, 20]} />
            <meshStandardMaterial color="#121316" metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.26, 12]} />
            <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );

  if (staticSide) {
    return body;
  }

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.18}>
        {body}
      </Float>
      {interactive && !hideTip && (
        <Html position={[0, 1.7, 0]} center>
          <div className="model-tip">ARRASTE PARA GIRAR 360°</div>
        </Html>
      )}
    </>
  );
}
// -----------------------------------------------


function VehicleScene({ interactive = false, className = '', staticSide = false}) {
  const [dragged, setDragged] = useState(false);

  return (
    <Canvas
      className={className}
      camera={{ position: [4.6, 2.2, 5.2], fov: 34 }}
      dpr={[1, 1.8]}
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} castShadow />
      <directionalLight position={[-5, 2, -4]} intensity={1.6} />
      <pointLight position={[0, 1.5, 4]} intensity={4} distance={8} />
      <Environment preset="city" environmentIntensity={0.45} />
      <DemoCar interactive={interactive} hideTip={dragged} staticSide={staticSide}/>
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={4}
          maxDistance={8}
          minPolarAngle={Math.PI / 3.1}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
          onStart={() => setDragged(true)}
        />
      )}
    </Canvas>
  );
}



// ------------- VEHICLE INFORMATION POINTS PERFORM ---------------
const vehicleInfoPoints = {
  engine: {
    number: '01',
    title: '2.0L VTEC Turbo Engine',
    description:
      'The heart of the Type R. A 2.0L VTEC TURBO engine developed to deliver power and immediate response when you need it most.',
    position: {
      left: '76%', // POSIÇÃO HORIZONTAL
      top: '36%', //POSIÇÃO VERTICAL
    },
  },

  cockpit: {
    number: '02',
    title: "DRIVER'S COCKPIT",
    description:
      'Everything was designed around the driver. Controls, driving position, and instruments work together to keep the focus on the experience.',
    position: {
      left: '66%',
      top: '23%',
    },
  },

  aero: {
    number: '03',
    title: 'REAR SPOILER',
    description:
      'A functional aerodynamic element that contributes to stability and a striking visual presence..',
    position: {
      left: '32%',
      top: '23%',
    },
  },

  frontWheel: {
    number: '04',
    title: 'FRONT ASSEMBLY',
    description:
      'The front-end setup combines grip, control, and precision to inspire confidence upon entering corners.',
    position: {
      left: '70%',
      top: '55%',
    },
  },

  rearWheel: {
    number: '05',
    title: 'REAR ASSEMBLY',
    description:
      'Tires and wheels work together with the chassis to deliver stability and traction.',
    position: {
      left: '34%',
      top: '41%',
    },
  },
};
// -------------------------- FIM VEIHCLE INFORMATION POINT --------------------------------------------

// -------------------------- VEIHCLE CARD POINT --------------------------------------------
function VehicleInfoSection() {
  const [activePoint, setActivePoint] = useState(null);

  // const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const lineRef = useRef(null);

  const activeData = activePoint ? vehicleInfoPoints[activePoint] : null;

  /*
   * Animação do card quando troca de informação.
   */
  useEffect(() => {
    if (!activeData || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          x: -35,
          y: 15,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
        }
      );

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          {
            scaleX: 0,
            transformOrigin: 'left center',
          },
          {
            scaleX: 1,
            duration: 0.65,
            ease: 'power3.out',
          }
        );
      }
    });

    return () => ctx.revert();
  }, [activePoint, activeData]);

  const handlePointClick = (point) => {
    setActivePoint(point);
  };

  const closeInfo = () => {
    if (!cardRef.current) {
      setActivePoint(null);
      return;
    }

    gsap.to(cardRef.current, {
      opacity: 0,
      x: -25,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        setActivePoint(null);
      },
    });
  };


  return (
    <section /*ref={sectionRef}*/ className="vehicle-info-section snap-section" id="section-6">
      <div className="final-watermark">TYPE R</div>
      <div className="vehicle-info-header">
        <div className="section-index">
          06 / THE MACHINE
        </div>

        <div className="vehicle-info-title">
          <div className="eyebrow">
            EXPLORE / DETAILS
          </div>

          <h2>EVERY <br/>
            <em>DETAIL</em>
          </h2>
        </div>

        <p className="vehicle-info-description">
          Explore the machine. Click on each point to
          discover the details behind the design.
        </p>
      </div>

      <div className="vehicle-info-stage">
        {/* MODELO 3D */}
        <div className="vehicle-info-model">
          <VehicleScene staticSide />
        </div>

        {/* LINHA DE CONEXÃO */}
        {activeData && (
          <svg className="vehicle-info-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line
              ref={lineRef}
              x1="27"
              y1="76"
              x2={parseFloat(activeData.position.left)}
              y2={parseFloat(activeData.position.top)}
            />
          </svg>
        )}

        {/* HOTSPOTS */}
        {Object.entries(vehicleInfoPoints).map(
          ([key, point]) => {
            const isActive =
              activePoint === key;

            return (
              <button
                key={key}
                type="button"
                className={`vehicle-hotspot ${
                  isActive ? 'active' : ''
                }`}
                style={{
                  left: point.position.left,
                  top: point.position.top,
                }}
                onClick={() => handlePointClick(key)}
                aria-label={`Ver ${point.title}`}
              >
                <span className="hotspot-core" />
                <span className="hotspot-ring" />
              </button>
            );
          }
        )}

        {/* CARD */}
        {activeData && (
          <article ref={cardRef} className="vehicle-info-card">
            <button
              type="button"
              className="vehicle-info-close"
              onClick={closeInfo}
              aria-label="Fechar informação"
            >
              ×
            </button>

            <span className="vehicle-info-number"> [{activeData.number}] </span>
            <h3> {activeData.title} </h3>
            <p> {activeData.description} </p>

            <div className="vehicle-info-card-footer">
              <span> GARAGE / TECHNICAL DETAIL </span>
              <span> {activeData.number}/05 </span>
            </div>

          </article>
        )}

        {/* TEXTO INFERIOR */}
        <div className="vehicle-info-footer">
          <span> SELECT A POINT </span>
          <span> 05 AVAILABLE </span>
        </div>

      </div>
    </section>
  );
}
// -------------------------- FIM VEIHCLE CARD POINT --------------------------------------------

// -------------------------- TILES --------------------------------

function Tiles() {
  return (
    <div className="tiles" aria-hidden="true">
      {Array.from({ length: COLS * ROWS }, (_, i) => <i key={i} className="tile" />)}
    </div>
  );
}

// -------------------------- FIM TILES -----------------------------

const goSnap = (id) => (e) => { if (snapApi?.goToId(id)) e.preventDefault(); };

// NAVBAR
function Nav({ open, setOpen }) {


  const links = [
    { href: '#section-1', label: 'DESIGN' },
    { href: '#section-2', label: 'PERFORMANCE' },
    { href: '#section-3', label: 'DIMENSIONS' },
    { href: '#section-4', label: 'COCKPIT' },
    { href: '#section-5', label: 'INTERACT' },
    { href: '#section-6', label: 'THE MACHINE' },
  ];

  return (
    <>
      <header className="nav">
        <a href="#top" className="logo" onClick={goSnap('top')}>GARAGE<span>.</span></a>

         <nav className="nav-links">
          {links.map((link, i) => (
            <a key={link.href} href={link.href}
              onClick={(e) => { if (snapApi?.goToId(link.href.slice(1))) e.preventDefault(); }}>
              [0{i + 1}] {link.label}
            </a>
          ))}
        </nav>

        

        <div className="nav-right">
          <a href="#reserve" className="nav-cta" onClick={goSnap('reserve')}>RESERVE</a>

        </div>
      </header>

    </>
  );
}
// ----------------------

function Reveal({ children, className = '' }) {
  const ref = useRef();

  return <div ref={ref} className={className}>{children}</div>;
}

function Metric({ value, label, sub }) {
  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}



// ----------------------------------------------------------------------------------------
//                          INICIALIZAÇÃO DA INTRO                
// -------------------------------------------
function buildIntro() {
  const model = document.querySelector('.hero-model');
  // distância para o carro ficar centralizado na tela
  const centerX = () => window.innerWidth / 2 - (model.offsetLeft + model.offsetWidth / 2);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=450%',          // quanto "scroll" a intro consome
      scrub: true,            // o Lenis já suaviza, não precisa de scrub: 1
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onLeave: () => hooks.onLeave?.(),
    },
  });

  tl.to('.intro-cue', { opacity: 0, duration: 0.3 }, 0)
    // 1) título vem "pra frente" e some
    .to('.intro-title', { scale: 22, opacity: 0, ease: 'power2.in', duration: 1.6 }, 0)
    .to('.hero-grid', { scale: 1.6, duration: 3.2 }, 0)
    // 2) carro surge no centro
    .fromTo(model, { opacity: 0, scale: 0.35, x: centerX },
      { opacity: 1, scale: 0.85, x: centerX, ease: 'power2.out', duration: 1.4 }, 1)
    // 3) carro vai pro lado
    .to(model, { x: 0, scale: 1, ease: 'power3.inOut', duration: 1.4 }, 2.7)
    // 4) hero atual aparece
    .fromTo('.hero-copy > *', { opacity: 0, x: -60 },
      { opacity: 1, x: 0, ease: 'power2.out', duration: 0.8, stagger: 0.15 }, 3.3)
    .fromTo('.hero-stat,.hero-side', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 4)
    .to({}, { duration: 0.4 }); // respiro final

  return tl.scrollTrigger;
}
// ----------------------------------------------------------------------------------------
//                        FIM  INICIALIZAÇÃO DA INTRO                
// -------------------------------------------


// ----------------------------------------------------------------------------------------
//                           ANIMAÇÃO POR SESSÃO                
// -------------------------------------------

// d é a direção (1 descendo, -1 subindo), então as animações invertem sozinhas ao voltar.
const hPanels = [
  { k: 'ENGINE', v: '2.0', u: 'L VTEC TURBO' },
  { k: 'TRANSMISSION', v: '6', u: '-SPEED MANUAL' },
  { k: 'CURB WEIGHT', v: '1,430', u: 'KG' },
  { k: 'WHEELBASE', v: '2.735', u: 'M' },
];

const sectionFX = {
  // 01 DESIGN: texto sobe e entra girando levemente
  'section-1': {
    targets: '.section-index,.giant-copy,.statement-bottom',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.giant-copy'), { opacity: 0, yPercent: 60 * d, rotate: 2 * d },
        { opacity: 1, yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: 0.12 }, 0)
      .fromTo(q(el)('.section-index,.statement-bottom'), { opacity: 0, y: 20 * d },
        { opacity: 1, y: 0, duration: 0.6 }, 0.3),

    exit: (el, d) => gsap.timeline()
      .to(q(el)('.giant-copy'), { opacity: 0, yPercent: -40 * d, duration: 0.5, ease: 'power3.in', stagger: 0.06 })
      .to(q(el)('.section-index,.statement-bottom'), { opacity: 0, duration: 0.3 }, 0),
  },

  // 02 PERFORMANCE: texto da esquerda, métricas sobem em cascata
  'section-2': {
    targets: '.section-index,.split-copy h2,.split-copy p,.metric',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.section-index,.split-copy h2,.split-copy p'), { opacity: 0, x: -80, scale: 1 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.metric'), { opacity: 0, y: 60 * d, scale: 1 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0.15),
    exit: (el) => gsap.timeline()
      .to(q(el)('.section-index,.split-copy h2,.split-copy p,.metric'),
        { opacity: 0, scale: 0.94, duration: 0.45, ease: 'power2.in', stagger: 0.04 }),
  },

  // 03 DIMENSIONS: as linhas de cota "se desenham"
  'section-3': {
    targets: '.section-index,.dimension-layout h2,.muted-copy,.dim-visual,.dim-grid > div',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.section-index,.dimension-layout h2,.muted-copy'), { opacity: 0, y: 50 * d },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.dim-visual'), { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2)
      .fromTo(q(el)('.dim-line.horizontal'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, 0.4)
      .fromTo(q(el)('.dim-line.vertical'), { scaleY: 0, transformOrigin: 'top' },
        { scaleY: 1, duration: 0.9, ease: 'power3.inOut' }, 0.5)
      .fromTo(q(el)('.dim-grid > div'), { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.6),

    exit: (el, d) => gsap.timeline()
      .to(q(el)('.section-index,.dimension-layout h2,.muted-copy,.dim-visual,.dim-grid > div'),
        { opacity: 0, y: -30 * d, duration: 0.45, ease: 'power2.in', stagger: 0.03 }),
  },

  // 04 COCKPIT: o painel é revelado com clip-path (não mexe no transform 3D do CSS)
  'section-4': {
    targets: '.section-index,.cockpit-copy > *,.cockpit-visual,.dash-card',
    enter: (el) => gsap.timeline()
      .fromTo(q(el)('.section-index,.cockpit-copy > *'), { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.cockpit-visual'), { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
        { opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 1.1, ease: 'power3.inOut' }, 0.1)
      .fromTo(q(el)('.dash-card'), { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, 0.8),

    exit: (el) => gsap.timeline()
      .to(q(el)('.section-index,.cockpit-copy > *'), { opacity: 0, x: -40, duration: 0.4, stagger: 0.04 })
      .to(q(el)('.cockpit-visual'), { clipPath: 'inset(0 100% 0 0)', duration: 0.5, ease: 'power3.in' }, 0),
  },

  // 05 INTERACT: modelo "cresce" de dentro da seção
  'section-5': {
    targets: '.section-index,.interactive-head > *,.interactive-model',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.section-index,.interactive-head > *'), { opacity: 0, y: -40 * d },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.interactive-model'), { opacity: 0, scale: 0.8, y: 60 * d },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.15),

    exit: (el) => gsap.timeline()
      .to(q(el)('.interactive-model'), { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in' })
      .to(q(el)('.section-index,.interactive-head > *'), { opacity: 0, duration: 0.3 }, 0),
  },

  // NOVA: scroll lateral em passos
  'section-hscroll': {
    steps: 4,
    targets: '.section-index,.h-viewport,.h-progress',
    enter: (el, d, startSub = 0) => {
      gsap.set(q(el)('.h-track'), { x: -startSub * window.innerWidth });
      gsap.set(q(el)('.h-bar'), { scaleX: (startSub + 1) / 4 });
      return gsap.timeline()
        .fromTo(q(el)('.section-index,.h-progress'), { opacity: 0, x: 0, y: 20 },
          { opacity: 1, x: 0, y: 0, duration: 0.6, stagger: 0.1 }, 0)
        .fromTo(q(el)('.h-viewport'), { opacity: 0, x: 120 * d },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, 0.1);
        
    },
    step: (el, i) => gsap.timeline()
      .to(q(el)('.h-track'), { x: -i * window.innerWidth, duration: 1, ease: 'power3.inOut' })
      .to(q(el)('.h-bar'), { scaleX: (i + 1) / 4, duration: 1, ease: 'power3.inOut' }, 0),

    exit: (el, d) => gsap.timeline()
      .to(q(el)('.section-index,.h-viewport,.h-progress'), { opacity: 0, x: -80 * d, duration: 0.45, ease: 'power2.in' }),
  },

  // 06 THE MACHINE (substitui os ScrollTriggers internos do componente)
  'section-6': {
    targets: '.vehicle-info-header > *,.vehicle-info-model,.vehicle-hotspot,.vehicle-info-footer',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.vehicle-info-header > *'), { opacity: 0, y: 40 * d },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.vehicle-info-model'), { opacity: 0, x: 120 * d },
        { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, 0.1)
      .fromTo(q(el)('.vehicle-hotspot'), { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }, 0.7)
      .fromTo(q(el)('.vehicle-info-footer'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6),

    exit: (el) => gsap.timeline()
      .to(q(el)('.vehicle-hotspot'), { opacity: 0, scale: 0, duration: 0.3, stagger: 0.04 })
      .to(q(el)('.vehicle-info-header > *,.vehicle-info-model,.vehicle-info-footer'), { opacity: 0, duration: 0.4 }, 0),
  },

  // 07 RESERVE
  reserve: {
    targets: '.reserve-head > *,.reserve-card,.reserve-form,footer',
    enter: (el, d) => gsap.timeline()
      .fromTo(q(el)('.reserve-head > *'), { opacity: 0, y: 40 * d },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0)
      .fromTo(q(el)('.reserve-card'), { opacity: 0, y: 60 * d },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0.2)
      .fromTo(q(el)('.reserve-form,footer'), { opacity: 0, y: 0 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.7),

    exit: (el) => gsap.timeline()
      .to(q(el)('.reserve-head > *,.reserve-card,.reserve-form,footer'), { opacity: 0, y: 30, duration: 0.4, stagger: 0.04 }),
  },
};
// ----------------------------------------------------------------------------------------
//                          fim ANIMAÇÃO POR SESSÃO                
// -------------------------------------------


// ----------------------------------------------------------------------------------------
//                          TRAVA PAGE NA SESSÃO            
// ------------------------------------------

function buildSnap(introST) {
  const sections = gsap.utils.toArray('.snap-section');
  const ids = sections.map((s) => s.id);
  const tiles = gsap.utils.toArray('.tile');
  const fxOf = (i) => sectionFX[ids[i]];
  let current = -1;   // -1 = intro
  let sub = 0;        // passo atual (scroll lateral)
  let busy = false;

  // estado inicial: tudo escondido até a primeira entrada
  sections.forEach((s, i) => {
    const t = fxOf(i)?.targets;
    if (t) gsap.set(q(s)(t), { opacity: 0 });
  });

  const release = () => gsap.delayedCall(0.25, () => { busy = false; }); // evita "cauda" do trackpad
  const stagger = (dir) => ({ grid: [ROWS, COLS], from: dir > 0 ? 'start' : 'end', amount: 0.55 });
  const lock = () => { lenis.stop(); obs.enable(); };
  const unlock = () => { lenis.start(); obs.disable(); };
  const jump = (target) => lenis.scrollTo(target, { immediate: true, force: true });

  function goTo(next, toStart = false) {
    if (busy || next === current || next < -1 || next >= sections.length) return;
    busy = true;
    const dir = next > current ? 1 : -1;
    const from = current;
    const startSub = next >= 0 && dir < 0 ? (fxOf(next).steps || 1) - 1 : 0;

    const tl = gsap.timeline({ onComplete: release });

    // SAÍDA da seção atual
    if (from >= 0) tl.add(fxOf(from).exit(sections[from], dir));

    // quadrados cobrem a tela
    tl.to(tiles, { scale: 1.02, duration: 0.4, ease: 'power2.inOut', stagger: stagger(dir) },
      from >= 0 ? '-=0.25' : 0)
      // troca de seção com a tela coberta
      .add(() => {
        current = next;
        if (next < 0) {
          unlock();
          jump(toStart ? 0 : introST.end - 2);
        } else {
          sub = startSub;
          lock();
          jump(sections[next]);
        }
      })
      // quadrados saem
      .to(tiles, { scale: 0, duration: 0.4, ease: 'power2.inOut', stagger: stagger(dir) }, '+=0.05');

    // ENTRADA da próxima
    if (next >= 0) tl.add(fxOf(next).enter(sections[next], dir, startSub), '-=0.45');
  }

  // um gesto = um passo lateral (se a seção tiver) ou uma seção
  function step(dir) {
    if (busy || current < 0) return;
    const fx = fxOf(current);
    if (fx?.steps) {
      const s = sub + dir;
      if (s >= 0 && s < fx.steps) {
        busy = true;
        sub = s;
        fx.step(sections[current], s).eventCallback('onComplete', release);
        return;
      }
    }
    goTo(current + dir);
  }

  const obs = Observer.create({
    type: 'wheel,touch',
    wheelSpeed: -1,            // roda pra baixo => onUp (convenção do Observer)
    tolerance: 30,
    preventDefault: true,
    ignore: '.interactive-model', // deixa arrastar o carro sem trocar de seção
    onUp: () => step(1),
    onDown: () => step(-1),
  });
  obs.disable();

  // ao terminar a intro, assume o controle
  hooks.onLeave = () => {
    if (busy || current !== -1) return;
    current = 0; sub = 0;
    lock();
    jump(sections[0]);
    fxOf(0).enter(sections[0], 1, 0);
  };

  const onKey = (e) => {
    if (current < 0 || e.target.closest?.('input,textarea')) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); step(1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); step(-1); }
  };
  const onResize = () => { if (current >= 0) jump(sections[current]); };
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  // usado pelo menu / "back to top"
  snapApi = {
    goToId(id) {
      if (id === 'top') { goTo(-1, true); return true; }
      const i = ids.indexOf(id);
      if (i < 0) return false;
      goTo(i);
      return true;
    },
  };

  return () => {
    obs.kill();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    snapApi = null;
    hooks.onLeave = null;
    lenis?.start();
    gsap.set(tiles, { clearProps: 'all' });
  };
}

// mobile: sem trava, só reveal simples ao rolar
function buildMobile() {
  gsap.utils.toArray('.snap-section').forEach((s) => {
    const fx = sectionFX[s.id];
    if (!fx) return;
    gsap.set(q(s)(fx.targets), { opacity: 0 });
    ScrollTrigger.create({ trigger: s, start: 'top 75%', once: true, onEnter: () => fx.enter(s, 1, 0) });
  });
}

// ----------------------------------------------------------------------------------------
//                          FIM TRAVA PAGE NA SESSÃO              
// ------------------------------------------




function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [reserved, setReserved] = useState(false);

  function handleReserve(e) {
    e.preventDefault();
    setReserved(true);
  }


//           USER EFFECT
// -------------------------------------------------------------------------------------------

  useEffect(() => {

    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: true, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 801px)', mobile: '(max-width: 800px)' }, (ctx) => {
      const introST = buildIntro();
      if (ctx.conditions.desktop) {
        const cleanup = buildSnap(introST);
        return cleanup;
      }
      buildMobile();
    });

    return () => {
      mm.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    };
  }, []);

//         FIM  USER EFFECT
// -------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------
//                               PAGINA WEB DE FATO
// ---------------------------------------

  return (
    <main id="top">
      <div className="scanlines" aria-hidden="true" />
      <Tiles />
      <Nav open={menuOpen} setOpen={setMenuOpen} />

      {/* first page */}

      <section className="hero">
        <div className="hero-grid" />

        <h1 className="intro-title"><span>CIVIC</span><em>TYPE R</em></h1>
        <div className="intro-cue scroll-cue"><span className="scroll-bar" /> SCROLL TO DISCOVER</div>

        <div className="hero-copy">
          <div className="eyebrow">HONDA / PERFORMANCE DIVISION / 2026</div>
          <h1>CIVIC<br /><em>TYPE R</em></h1>
          <p className="hero-description">A machine shaped by motion. Explore every line, number and detail.</p>
        </div>
        
        <div className="hero-model"><VehicleScene /></div>
        <div className="hero-side">TYPE R <span>01—07</span></div>
        <div className="hero-stat"><strong>320</strong><span>HP</span></div>
      </section>

      {/* END first page */}


    
{/* -------------------------------- INICIO PAGs ---------------------------------- */}
      
      <section className="statement snap-section" id="section-1">
        <div className="section-index">01 / DESIGN</div>
        <Reveal>
          <p className="giant-copy parallax-word" data-direction="-6">BUILT</p>
          <p className="giant-copy outline">TO MOVE</p>
        </Reveal>
        <div className="statement-bottom">
          <p>Every surface has a purpose. Every angle carries intent. The Type R turns aerodynamic function into visual identity.</p>
          <span>SCROLL / 01</span>
        </div>
      </section>


      <section className="split-section dark snap-section" id="section-2">
        <div className="split-copy">
          <div className="section-index">02 / PERFORMANCE</div>
          <Reveal>
            <h2>RAW<br /><em>NUMBERS.</em></h2>
            <p>Power where you need it. Control where it matters.</p>
          </Reveal>
        </div>
        <div className="metrics">
          <Metric value={vehicle.power} label="HORSEPOWER" sub="PS @ 6,500 RPM" />
          <Metric value={vehicle.torque} label="TORQUE / NM" sub="MAX OUTPUT" />
          <Metric value={vehicle.zeroToHundred} label="0—100 KM/H" sub="SECONDS" />
          <Metric value={vehicle.topSpeed} label="TOP SPEED" sub="KM/H" />
        </div>
      </section>

  

      <section className="dimensions-section snap-section" id="section-3">
        <div className="section-index">03 / DIMENSIONS</div>
        <div className="dimension-layout">
          <div>
            <Reveal><h2>FORM<br /><em>MEETS</em><br />FUNCTION</h2></Reveal>
            <p className="muted-copy">Proportions tuned around stability, weight and presence.</p>
          </div>
          <div className="dimension-card">
            <div className="dim-visual">
              <div className="dim-line horizontal"><span>4.593 M</span></div>
              <div className="fake-car-side"><div className="fake-window" /></div>
              <div className="dim-line vertical"><span>1.407 M</span></div>
            </div>
            <div className="dim-grid">
              <div><strong>1,430</strong><span>KG / WEIGHT</span></div>
              <div><strong>2.735</strong><span>M / WHEELBASE</span></div>
              <div><strong>1.890</strong><span>M / WIDTH</span></div>
              <div><strong>0.27</strong><span>CD / DRAG</span></div>
            </div>
          </div>
        </div>
      </section>


      {/*------------------------------ scroll lateral ------------------------------*/}
      <section className="hscroll-section snap-section" id="section-hscroll">
        <div className="section-index">THE NUMBERS / KEEP SCROLLING</div>
        <div className="h-viewport">
          <div className="h-track">
            {hPanels.map((p, i) => (
              <article className="h-panel" key={p.k}>
                <span className="h-num">[0{i + 1}]</span>
                <h3>{p.v}<small>{p.u}</small></h3>
                <p>{p.k}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="h-progress"><i className="h-bar" /></div>
      </section>
      {/*------------------------------ FIM scroll lateral  ------------------------------*/}


      <section className="cockpit-section snap-section" id="section-4">
        <div className="section-index">04 / COCKPIT</div>
        <div className="cockpit-copy">
          <div className="eyebrow">DRIVER / MACHINE</div>
          <h2>EVERYTHING<br /><em>WITHIN REACH</em></h2>
          <p>Focused controls. Supportive seats. A cabin designed around the person behind the wheel.</p>
        </div>
        <div className="cockpit-visual">
          <div className="dashboard-glow" />
          <div className="dash-card"><Gauge size={20} /><span>RPM</span><strong>6,500</strong></div>
          <div className="dash-card right"><Zap size={20} /><span>BOOST</span><strong>1.6 BAR</strong></div>
        </div>
      </section>



      <section className="interactive-section snap-section" id="section-5">
        <div className="section-index">05 / INTERACT</div>
        <div className="interactive-head">
          <div><div className="eyebrow">YOUR TURN</div><h2>TAKE<br /><em>CONTROL</em></h2></div>
          <p>Drag the vehicle. Inspect the silhouette from every angle.</p>
        </div>
        <div className="interactive-model">
          <VehicleScene interactive />
        </div>
      </section>
      <VehicleInfoSection />

        

      <section className="reserve-section snap-section" id="reserve">

        <div className="reserve-head">
          <div>
            <span className="section-index">07 / AVAILABILITY</span>

            <h2>RESERVE<br/><em>YOURS</em></h2>

            <a href="#top" className="back-top" onClick={goSnap('top')}>BACK TO TOP <ArrowUpRight size={17} /></a>
          </div>
          <p className="muted-copy">Limited production. Exclusive service for collectors and brand enthusiasts.</p>
        </div>

        <div className="reserve-grid">
          <div className="reserve-card">
            <span className="section-index">[01] PERSONALIZATION</span>
            <h3>BESPOKE FINISH</h3>
            <p>Choose exclusive colors, finishes, and chassis number engraving.</p>
          </div>
          <div className="reserve-card">
            <span className="section-index">[02] TELEMETRY</span>
            <h3>TRACK TELEMETRY</h3>
            <p>Access to the track telemetry app with AI driving coaching.</p>
          </div>
          <div className="reserve-card">
            <span className="section-index">[03] SUPPORT</span>
            <h3>24-Hour Assistance</h3>
            <p>Dedicated technical team anywhere in the world in less than 24 hours.</p>
          </div>
        </div>

        <form className="reserve-form" onSubmit={handleReserve}>
          <input type="email" required placeholder="YOUR EMAIL" />
          <button type="submit">TO SEND</button>
        </form>

        {reserved && (
          <div className="reserve-success">
            ✓ Request received. A concierge will contact you.
          </div>
        )}

        {/* FOOTER DENTRO DE RESERVE */}
        <footer>
          <span>GARAGE. / VEHICLE EXPERIENCE</span>
          <div className="footer-links">
            <a href="#">PRIVACY</a>
            <a href="#">TERMS</a>
            <a href="#">IMPRENSA</a>
          </div>
          <span>BUILT FOR THE ROAD AHEAD.</span>
        </footer>
        {/* FIM FOOTER DENTRO DE RESERVE */}

      </section>


    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <Suspense fallback={<div className="loading">LOADING EXPERIENCE...</div>}><App /></Suspense>
);
