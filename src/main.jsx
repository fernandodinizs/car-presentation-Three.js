import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { ArrowUpRight, Gauge, Menu, X, Zap } from 'lucide-react';
import * as THREE from 'three';
import './styles.css';
  
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
function DemoCar({ interactive = false, hideTip = false }) {
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
    if (!interactive) {
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


function VehicleScene({ interactive = false, className = '' }) {
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
      <DemoCar interactive={interactive} hideTip={dragged} />
      {interactive && (
        <OrbitControls
          enablePan={false}
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
        <a href="#top" className="logo">GARAGE<span>.</span></a>

         <nav className="nav-links">
          {links.map((link, i) => (
            <a key={link.href} href={link.href}>[0{i + 1}] {link.label}</a>
          ))}
        </nav>

        <div className="nav-right">
          <a href="#reserve" className="nav-cta">RESERVE</a>

          {/* MENU - TIRAR DEPOIS TALVEZ */}
          {/* <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X size={19} /> : <Menu size={19} />}
            <span>MENU</span>
          </button> */} 
          {/* --------------------------------------- */}


        </div>
      </header>

      {/* MENU - TIRAR DEPOIS TALVEZ */}

      {/* <div className={`menu-panel ${open ? 'open' : ''}`}>
        {['Design', 'Performance', 'Dimensions', 'Cockpit', 'Reserva'].map((item, i) => (
          <a 
            key={item}
            href={i < 4 ? `#section-${i + 1}` : '#reserve'}
            onClick={() => setOpen(false)}
          >
            <span>0{i + 1}</span>{item}
          </a>
        ))}
      </div> */}

      {/* --------------------------------------- */}


    </>
  );
}
// ----------------------

function Reveal({ children, className = '' }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 42, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  }, []);
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [reserved, setReserved] = useState(false);

  function handleReserve(e) {
    e.preventDefault();
    setReserved(true);
  }


  useEffect(() => {
    // GSAP ScrollTrigger is loaded dynamically to keep this single-file demo simple.
    let cleanup = () => {};
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.to('.hero-copy', {
          yPercent: 35, opacity: 0.15,
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero-model', {
          scale: 0.76, yPercent: 18, rotate: 3,
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.utils.toArray('.parallax-word').forEach((el) => {
          gsap.to(el, {
            xPercent: el.dataset.direction || 8,
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
          });
        });
      });
      cleanup = () => ctx.revert();
      ScrollTrigger.refresh();
    });
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: true });
    let rafId;
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { cleanup(); cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

// -----------------------------------------------------------------------------
//                               PAGINA WEB DE FATO
// ---------------------------------------

  return (
    <main id="top">
      <div className="scanlines" aria-hidden="true" />
      <Nav open={menuOpen} setOpen={setMenuOpen} />

      {/* first page */}

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="eyebrow">HONDA / PERFORMANCE DIVISION / 2026</div>
          <h1>CIVIC<br /><em>TYPE R</em></h1>
          <p className="hero-description">A machine shaped by motion. Explore every line, number and detail.</p>
          <div className="scroll-cue"><span className="scroll-bar" /> SCROLL TO DISCOVER</div>
        </div>
        <div className="hero-model"><VehicleScene /></div>
        <div className="hero-side">TYPE R <span>01—07</span></div>
        <div className="hero-stat"><strong>320</strong><span>HP</span></div>
      </section>

      {/* END first page */}

{/* -------------------------------- INICIO PAGs ---------------------------------- */}
      
      <section className="statement" id="section-1">
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



      <section className="split-section dark" id="section-2">
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

  

      <section className="dimensions-section" id="section-3">
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



      <section className="cockpit-section" id="section-4">
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



      <section className="interactive-section" id="section-5">
        <div className="section-index">05 / INTERACT</div>
        <div className="interactive-head">
          <div><div className="eyebrow">YOUR TURN</div><h2>TAKE<br /><em>CONTROL</em></h2></div>
          <p>Drag the vehicle. Inspect the silhouette from every angle.</p>
        </div>
        <div className="interactive-model">
          <VehicleScene interactive />
        </div>
      </section>



      <section className="final-section" id="section-6">
        <div className="final-watermark">TYPE R</div>
        <div className="final-content">
          <div className="eyebrow">06 / THE MACHINE</div>
          <h2>ENGINEERED<br /><em>TO BE FELT</em></h2>
          <div className="final-specs">
            <span>{vehicle.transmission}</span>
            <span>{vehicle.engine}</span>
            <span>{vehicle.year} / TYPE R</span>
          </div>
          
        </div>
        <div className="final-model"><VehicleScene /></div>
      </section>



      <section className="reserve-section" id="reserve">
        <div className="reserve-head">
          <div>
            <span className="section-index">07 / AVAILABILITY</span>

            <h2>RESERVE<br/><em>YOURS</em></h2>

            <a href="#top" className="back-top">BACK TO TOP <ArrowUpRight size={17} /></a>
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
      </section>



      <footer>
        <span>GARAGE. / VEHICLE EXPERIENCE</span>
        <div className="footer-links">
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
          <a href="#">IMPRENSA</a>
        </div>
        <span>BUILT FOR THE ROAD AHEAD.</span>
      </footer>


    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <Suspense fallback={<div className="loading">LOADING EXPERIENCE...</div>}><App /></Suspense>
);