import React, { useState, useEffect, useRef } from 'react';
import './EemonX.css';
import noImage from '../assets/no.jpeg';

/* ═══════════════════════════════════════════════════
   EEMON X — INFERNO EDITION v2
   Fonts: Outfit (display) + Plus Jakarta Sans (body)
   Background: Aurora + Grid + Rich Particle Field
   ═══════════════════════════════════════════════════ */

const EemonX = () => {
  const [teamModalData, setTeamModalData]     = useState(null);
  const [domainModalData, setDomainModalData] = useState(null);
  const [lightboxImage, setLightboxImage]     = useState(null);
  const [isScrolled, setIsScrolled]           = useState(false);
  const [menuOpen, setMenuOpen]               = useState(false);
  const [mousePos, setMousePos]               = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection]     = useState('home');
  const canvasRef                             = useRef(null);
  const [formData, setFormData]               = useState({ name:'', email:'', phone:'', service:'', message:'' });
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitStatus, setSubmitStatus]       = useState({ type:'', text:'' });

  /* ── Mouse cursor glow ── */
  useEffect(() => {
    const fn = (e) => setMousePos({ x:(e.clientX/window.innerWidth-0.5)*2, y:(e.clientY/window.innerHeight-0.5)*2 });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  /* ══════════════════════════════════════════════════════════
     CANVAS — Enhanced particle system:
     • Floating ember sparks drifting upward
     • Grid intersection glints (dot + cross + ring)
     • Nebula wisps (large blurry moving clouds)
     • Connection lines between close particles
     • Shooting stars across the grid
     ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Ember particle ── */
    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x       = Math.random() * canvas.width;
        this.y       = initial ? Math.random() * canvas.height : canvas.height + 12;
        this.vy      = -(Math.random() * 0.40 + 0.06);
        this.vx      = (Math.random() - 0.5) * 0.15;
        this.r       = Math.random() * 1.9 + 0.35;
        this.life    = 0;
        this.maxLife = Math.random() * 450 + 220;
        this.hue     = Math.random() > 0.55 ? 22 : (Math.random() > 0.5 ? 5 : 345);
        this.sat     = 85 + Math.random() * 10;
        this.bright  = 55 + Math.random() * 12;
      }
      update() {
        this.x   += this.vx + Math.sin(this.life * 0.012) * 0.08;
        this.y   += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -12) this.reset();
      }
      draw() {
        const p     = this.life / this.maxLife;
        const alpha = Math.sin(p * Math.PI) * 0.62;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bright}%, ${alpha})`;
        ctx.fill();
      }
    }

    /* ── Grid glint ── */
    const CELL = 52;
    class GridGlint {
      constructor() { this.reset(); }
      reset() {
        const cols = Math.floor(canvas.width  / CELL) + 1;
        const rows = Math.floor(canvas.height / CELL) + 1;
        this.cx   = Math.round(Math.random() * cols) * CELL;
        this.cy   = Math.round(Math.random() * rows) * CELL;
        this.life = 0;
        this.dur  = Math.random() * 90 + 45;
        this.type = Math.random() > 0.6 ? 'dot' : (Math.random() > 0.5 ? 'cross' : 'ring');
      }
      update() {
        this.life++;
        if (this.life > this.dur) this.reset();
      }
      draw() {
        const p = this.life / this.dur;
        const a = Math.sin(p * Math.PI) * 0.7;

        if (this.type === 'dot') {
          // Bright core dot
          ctx.beginPath();
          ctx.arc(this.cx, this.cy, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249,115,22,${a})`;
          ctx.fill();
          // Halo glow
          const g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, 14);
          g.addColorStop(0, `rgba(249,115,22,${a * 0.35})`);
          g.addColorStop(1, 'rgba(249,115,22,0)');
          ctx.beginPath();
          ctx.arc(this.cx, this.cy, 14, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();

        } else if (this.type === 'cross') {
          const sz = 7;
          ctx.strokeStyle = `rgba(220,38,38,${a * 0.72})`;
          ctx.lineWidth   = 0.9;
          ctx.beginPath();
          ctx.moveTo(this.cx - sz, this.cy);
          ctx.lineTo(this.cx + sz, this.cy);
          ctx.moveTo(this.cx, this.cy - sz);
          ctx.lineTo(this.cx, this.cy + sz);
          ctx.stroke();

        } else {
          // Expanding ring
          const maxR = 18 * p;
          ctx.beginPath();
          ctx.arc(this.cx, this.cy, maxR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249,115,22,${a * 0.45})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    /* ── Nebula wisp (large, blurry, slow) ── */
    class Wisp {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x      = Math.random() * canvas.width;
        this.y      = initial ? Math.random() * canvas.height : canvas.height + 80;
        this.r      = Math.random() * 70 + 35;
        this.vx     = (Math.random() - 0.5) * 0.10;
        this.vy     = -(Math.random() * 0.08 + 0.02);
        this.life   = 0;
        this.maxLife= Math.random() * 700 + 400;
        this.hue    = Math.random() > 0.5 ? 18 : 345;
      }
      update() {
        this.x   += this.vx;
        this.y   += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -100) this.reset();
      }
      draw() {
        const p = this.life / this.maxLife;
        const a = Math.sin(p * Math.PI) * 0.040;
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        g.addColorStop(0, `hsla(${this.hue}, 90%, 55%, ${a})`);
        g.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    /* ── Shooting star / grid tracer ── */
    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        // Snap to a random grid row or col
        const useRow = Math.random() > 0.5;
        if (useRow) {
          const row = Math.floor(Math.random() * Math.floor(canvas.height / CELL)) * CELL;
          this.x    = -20;
          this.y    = row;
          this.vx   = Math.random() * 2.5 + 1.5;
          this.vy   = 0;
        } else {
          const col = Math.floor(Math.random() * Math.floor(canvas.width / CELL)) * CELL;
          this.x    = col;
          this.y    = -20;
          this.vx   = 0;
          this.vy   = Math.random() * 2.0 + 1.2;
        }
        this.len    = Math.random() * 80 + 40;
        this.life   = 0;
        this.maxLife= Math.random() * 180 + 90;
        this.delay  = Math.random() * 300; // stagger start
        this.active = false;
      }
      update() {
        if (this.delay > 0) { this.delay--; return; }
        this.active = true;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife ||
            this.x > canvas.width + 30 ||
            this.y > canvas.height + 30) this.reset();
      }
      draw() {
        if (!this.active) return;
        const p = this.life / this.maxLife;
        const a = Math.sin(p * Math.PI) * 0.55;
        const tx = this.x - this.vx * this.len;
        const ty = this.y - this.vy * this.len;
        const g  = ctx.createLinearGradient(tx, ty, this.x, this.y);
        g.addColorStop(0, 'rgba(249,115,22,0)');
        g.addColorStop(0.7, `rgba(249,115,22,${a * 0.5})`);
        g.addColorStop(1,   `rgba(255,180,80,${a})`);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = g;
        ctx.lineWidth   = 1;
        ctx.stroke();
        // Leading dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,100,${a})`;
        ctx.fill();
      }
    }

    /* ── Connection lines ── */
    const connectParticles = (arr) => {
      const maxDist = 85;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const dx = arr[i].x - arr[j].x;
          const dy = arr[i].y - arr[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const a = (1 - d / maxDist) * 0.065;
            ctx.beginPath();
            ctx.moveTo(arr[i].x, arr[i].y);
            ctx.lineTo(arr[j].x, arr[j].y);
            ctx.strokeStyle = `rgba(220,80,20,${a})`;
            ctx.lineWidth   = 0.55;
            ctx.stroke();
          }
        }
      }
    };

    const N_PARTICLES = Math.min(100, Math.floor((canvas.width * canvas.height) / 13000));
    const N_GLINTS    = 18;
    const N_WISPS     = 8;
    const N_STARS     = 5;

    const particles = Array.from({ length: N_PARTICLES }, () => new Particle());
    const glints    = Array.from({ length: N_GLINTS },    () => new GridGlint());
    const wisps     = Array.from({ length: N_WISPS },     () => new Wisp());
    const stars     = Array.from({ length: N_STARS },     () => new ShootingStar());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nebula wisps (background layer)
      wisps.forEach(w => { w.update(); w.draw(); });

      // Grid glints
      glints.forEach(g => { g.update(); g.draw(); });

      // Shooting stars
      stars.forEach(s => { s.update(); s.draw(); });

      // Particle connections
      connectParticles(particles);

      // Ember particles
      particles.forEach(p => { p.update(); p.draw(); });

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Scroll + IntersectionObserver ── */
  useEffect(() => {
    const fn = () => {
      setIsScrolled(window.scrollY > 30);
      const sections = ['home','about','domain','gallery','service','board','contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 200) { setActiveSection(sections[i]); break; }
      }
    };
    window.addEventListener('scroll', fn, { passive: true });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('active');
        else if (e.boundingClientRect.top > 0) e.target.classList.remove('active');
      });
    }, { threshold: 0.08, rootMargin: '-20px 0px -60px 0px' });

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        obs.observe(el);
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
      });
    }, 100);

    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(p => ({ ...p, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type:'', text:'' });
    try {
      const res  = await fetch('https://react-eemon-x-web-api-2.onrender.com/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({ type:'success', text:'Transmission Successful. Protocol Initiated.' });
        setFormData({ name:'', email:'', phone:'', service:'', message:'' });
      } else {
        setSubmitStatus({ type:'error', text: data.message || 'Transmission Failed.' });
      }
    } catch {
      setSubmitStatus({ type:'error', text:'Network error. Check your connection.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus({ type:'', text:'' }), 5000);
    }
  };

  const openTeamModal    = (m) => { setTeamModalData(m);    document.body.style.overflow = 'hidden'; };
  const closeTeamModal   = ()  => { setTeamModalData(null); document.body.style.overflow = ''; };
  const openDomainModal  = (d) => { setDomainModalData(d);  document.body.style.overflow = 'hidden'; };
  const closeDomainModal = ()  => { setDomainModalData(null); document.body.style.overflow = ''; };
  const openLightbox     = (s) => { setLightboxImage(s);    document.body.style.overflow = 'hidden'; };
  const closeLightbox    = ()  => { setLightboxImage(null); document.body.style.overflow = ''; };

  /* ── Data ── */
  const navLinks = [
    { href:'#home',    label:'Home'     },
    { href:'#about',   label:'About'    },
    { href:'#domain',  label:'Domain'   },
    { href:'#gallery', label:'Gallery'  },
    { href:'#service', label:'Projects' },
    { href:'#board',   label:'Board'    },
  ];

  const boardMembers = [
    {
      name:"Praveen Kumar R", role:"Founder",
      roleDesc:"Strategic vision & startup growth architect.",
      email:"pklovetoracer@gmail.com", phone:"9345883673", initials:"PK",
      image:noImage,
      linkedin:"https://www.linkedin.com/", github:"https://github.com/",
      whatsapp:"919345883673",
      specialist:["Startup Strategy","Growth Hacking","Product Vision","Team Leadership"],
    },
    {
      name:"Vinuprasanth T", role:"CEO",
      roleDesc:"Orchestrating enterprise operations & leadership.",
      email:"lightningdragon6723@gmail.com", phone:"9344936502", initials:"VT",
      image:"/no.jpeg",
      linkedin:"https://www.linkedin.com/", github:"https://github.com/",
      whatsapp:"919344936502",
      specialist:["Operations","Enterprise Mgmt","Web Developer","Leadership"],
    },
    {
      name:"Kishore Kalash", role:"Co-Founder",
      roleDesc:"Security engineering & seamless UI ecosystems.",
      email:"kishoremonika87@gmail.com", phone:"9486802976", initials:"KK",
      image:"/no.jpeg",
      linkedin:"https://www.linkedin.com/", github:"https://github.com/",
      whatsapp:"919486802976",
      specialist:["Cyber Security","UI/UX Design","Penetration Testing","Frontend Dev", "Networking", "Adobe Desinger"],
    },
    {
      name:"Yogesh S V", role:"Director",
      roleDesc:"Client scaling and management architecture.",
      email:"vpys2005ys@gmail.com", phone:"9384413599", initials:"YS",
      image:"/no.jpeg",
      linkedin:"https://www.linkedin.com/", github:"https://github.com/",
      whatsapp:"919384413599",
      specialist:["Client Relations","Scale Architecture","UI/UX Design","Adobe Designer"],
    },
  ];

  const domainsList = [
    { icon:"🛡️", title:"Cyber Security",  shortDesc:"Penetration testing, bug hunting, and CTF challenge development.",  services:["Vulnerability Assessments","Network Penetration Testing","Zero-Day Threat Analysis","Custom CTF Environments","Security Audits"] },
    { icon:"🎨", title:"UI / UX Design",   shortDesc:"Human-centered digital experiences that drive engagement.",          services:["Wireframing & Prototyping","User Research & Testing","Interactive System Design","Design System Creation"] },
    { icon:"✒️", title:"Designer",         shortDesc:"Graphic design, branding, and comprehensive visual identities.",      services:["Brand Identity & Logos","Marketing Materials","Motion Graphics","3D Visualizations"] },
    { icon:"💻", title:"Web Development",  shortDesc:"Full-stack scalable applications using React, Python, and Flutter.",  services:["Custom Web Applications","API Development & Integration","Database Architecture","Progressive Web Apps (PWAs)"] },
    { icon:"⚡", title:"ECE",              shortDesc:"Electronics and Communication Engineering integrations.",             services:["IoT System Architecture","Embedded Systems Programming","PCB Design","Signal Processing Analysis"] },
    { icon:"🧠", title:"AI / ML Project",  shortDesc:"Behavioral analysis and advanced malicious activity detection.",      services:["Predictive Modeling","Natural Language Processing","Computer Vision Systems","Behavioral Anomaly Detection"] },
  ];

  const servicesList = [
    { icon:"🔑", title:"Passwordless Auth",  size:"Production",    github:"https://github.com/eemonx/auth" },
    { icon:"📡", title:"Network Analyzer",   size:"Live Traffic",   github:"https://github.com/eemonx/analyzer" },
    { icon:"⏱️", title:"Smart Attendance",   size:"Deployed",       github:"https://github.com/eemonx/attendance" },
    { icon:"🛡️", title:"Women Safety Sys",   size:"Beta V2",        github:"https://github.com/eemonx/safety" },
    { icon:"🎓", title:"Virtual Classroom",  size:"Active Servers", github:"https://github.com/eemonx/classroom" },
    { icon:"🚀", title:"Custom Solutions",   size:"In Development", github:"https://github.com/eemonx/custom" },
  ];

  const galleryItems = [
    { title:"Aura 25",         category:"Workshop",    desc:"Art of Netexploitation workshop.",        src:"6.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Synectics 26",    category:"Seminar",    desc:"Cyber Security Session.",             src:"2.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Synectics 26",    category:"Seminar",    desc:"Cyber Security Session.",  src:"1.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Eemon X Launch",  category:"Keynote",     desc:"Unveiling Eemon X",         src:"3.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Aura 25",         category:"Workshop",    desc:"Art of Netexploitation workshop.",            src:"9.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"IDS Tools",       category:"Learning",    desc:"IDS Snort & Suricata Seminar",             src:"5.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Aura 25",         category:"Workshop",    desc:"Art of Netexploitation workshop.",           src:"7.jpeg?auto=format&fit=crop&q=80&w=800" },
    { title:"Aura 25",         category:"Workshop",    desc:"Art of Netexploitation workshop.",          src:"8.jpeg?auto=format&fit=crop&q=80&w=800" },
  ];

  const stats = [
    { value:"5+", label:"Projects Deployed" },
    { value:"4",   label:"Core Members"      },
    { value:"6",   label:"Tech Domains"      },
    { value:"2+",  label:"Years Active"      },
  ];

  /* ── SVG Icons ── */
  const IconArrow    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
  const IconLinkedIn = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
  const IconGithub   = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;
  const IconVerified = () => <svg className="verified" viewBox="0 0 24 24" fill="none"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="#00c853"/><path d="M16.333 8.333L10.5 14.167l-2.833-2.834L6 12.5l4.5 4.5 7.5-7.5-1.667-1.167z" fill="#030712"/></svg>;
  const IconWA       = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;

  /* ════════════════════════════════
     RENDER
     ════════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:'#060409', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ transform:`translate(${mousePos.x*40+50}vw,${mousePos.y*40+50}vh) translate(-50%,-50%)` }}/>

      {/* ════════════════════════════════
          BACKGROUND SYSTEM
          ════════════════════════════════ */}
      <div className="bg-root">
        <div className="bg-base"/>
        <div className="bg-aurora"/>
        <div className="bg-grid"/>
        <div className="bg-grid-fine"/>
        <div className="bg-dots"/>

        <div className="bg-orb bg-orb-1"/>
        <div className="bg-orb bg-orb-2"/>
        <div className="bg-orb bg-orb-3"/>
        <div className="bg-orb bg-orb-4"/>

        <div className="bg-scanline"/>
        <div className="bg-scanline-v"/>

        <div className="bg-corner bg-corner-tl"/>
        <div className="bg-corner bg-corner-tr"/>
        <div className="bg-corner bg-corner-bl"/>
        <div className="bg-corner bg-corner-br"/>

        <canvas ref={canvasRef} className="bg-canvas"/>
      </div>

      <div className="noise-overlay"/>

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <a href="#home" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <img src="/eemonx logo.png" alt="Eemon X" className="nav-logo-img"/>
          <span className="nav-brand">Eemon<span className="brand-x"> X</span></span>
        </a>

        <ul className="nav-links">
          {navLinks.map(l => (
            <li key={l.href}>
              <a href={l.href} className={activeSection === l.href.slice(1) ? 'active' : ''}>
                {l.label}<span className="nav-dot"/>
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <a href="#contact" className="btn-connect"><span>Connect</span><IconArrow/></a>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span/><span/><span/>
          </button>
        </div>

        <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
               className={activeSection === l.href.slice(1) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="btn-connect mobile-connect" onClick={() => setMenuOpen(false)}>Connect</a>
        </div>
      </nav>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}/>}

      {/* ── HERO ── */}
      <section id="home" className="hero-section">
        <div className="hero-inner reveal">
          <div className="hero-pill">
            <span className="pill-dot"/>
            <span>Welcome to the Future</span>
          </div>

          <h1 className="hero-title">
            <span className="brand-shine">Eemon X</span>
            <span className="hero-tagline">"Securing the future,<br/>designing the present."</span>
          </h1>

          <p className="hero-body">
            We bridge imagination and digital reality through advanced cybersecurity,
            intuitive design, and robust architecture.
          </p>

          <div className="hero-cta">
            <a href="#service" className="btn-primary"><span>Explore Projects</span><IconArrow/></a>
            <a href="#about"   className="btn-ghost">Learn More</a>
          </div>

          <div className="stats-strip">
            {stats.map((s, i) => (
              <div className="stat-item" key={i}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hero-orb"
          style={{ transform:`translate(calc(-50% + ${mousePos.x*-18}px), calc(-50% + ${mousePos.y*-18}px))` }}
        />

        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line"><div className="scroll-dot"/></div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="about-section">
        {/* FIXED: visible watermark */}
        <div className="about-bg-word">ABOUT</div>
        <div className="about-content reveal">
          <div className="about-card">
            <div className="about-card-badge">Who We Are</div>
            <h2>A Visionary<br/><span className="text-glow">Tech Startup</span></h2>
            <p>Eemon X specializes in creating secure, frictionless digital ecosystems. From passwordless authentication architectures to comprehensive UI/UX redesigns, our mission is to deliver interfaces faster and more seamlessly.</p>
            <a href="#domain" className="btn-outline-pill">Explore Our Work →</a>
          </div>
          <div className="about-visual reveal-right">
            <div className="about-grid-visual">
              {['🛡️','🎨','💻','🧠','⚡','✒️'].map((icon, i) => (
                <div className="av-cell" key={i} style={{ animationDelay:`${i*0.13}s` }}>
                  <span>{icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAIN ── */}
      <section id="domain" style={{ position:'relative', zIndex:2, padding:'var(--section-py) var(--section-px)', maxWidth:'1280px', margin:'0 auto' }}>
        <div className="section-header reveal">
          <span className="section-tag">Our Expertise</span>
          <h2>Our <span className="text-glow">Domains</span></h2>
          <p>Click any domain to explore our specialized services.</p>
        </div>
        <div className="domain-grid">
          {domainsList.map((d, i) => (
            <div className="domain-card reveal" key={i} style={{ transitionDelay:`${i*0.08}s` }} onClick={() => openDomainModal(d)}>
              <div className="domain-card-glow"/>
              <div className="domain-icon">{d.icon}</div>
              <h3>{d.title}</h3>
              <p>{d.shortDesc}</p>
              <div className="domain-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ position:'relative', zIndex:2, padding:'var(--section-py) var(--section-px)', maxWidth:'1280px', margin:'0 auto' }}>
        <div className="section-header reveal">
          <span className="section-tag">Visuals</span>
          <h2>Event <span className="text-glow">Gallery</span></h2>
          <p>Highlights from symposiums, workshops & milestones.</p>
        </div>
        <div className="gallery-mosaic">
          {galleryItems.map((item, i) => (
            <div
              className={`gallery-tile reveal ${i === 0 || i === 4 ? 'tile-wide' : ''}`}
              key={i}
              style={{ transitionDelay:`${(i % 4) * 0.08}s` }}
              onClick={() => openLightbox(item.src)}
            >
              <img src={item.src} alt={item.title}/>
              <div className="gallery-tile-overlay">
                <span className="tile-cat">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <div className="tile-zoom-icon">
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="white" strokeWidth="2">
                  <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="service" style={{ position:'relative', zIndex:2, padding:'var(--section-py) var(--section-px)', maxWidth:'1280px', margin:'0 auto' }}>
        <div className="section-header reveal">
          <span className="section-tag">Deployments</span>
          <h2>Our <span className="text-glow">Projects</span></h2>
          <p>Flagship systems actively developed and maintained by Eemon X.</p>
        </div>
        <div className="projects-grid">
          {servicesList.map((s, i) => (
            <div className="project-card reveal" key={i} style={{ transitionDelay:`${i*0.07}s` }}>
              <div className="project-card-glow"/>
              <div className="project-top">
                <div className="project-icon-wrap">
                  <span className="project-icon">{s.icon}</span>
                  <span className="project-tag">APP</span>
                </div>
                <div className="project-badge">{s.size}</div>
              </div>
              <h3 className="project-title">{s.title}</h3>
              <a href={s.github} target="_blank" rel="noopener noreferrer" className="project-github">
                <IconGithub/> View Source Code
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOARD ── */}
      <section id="board" style={{ position:'relative', zIndex:2, padding:'var(--section-py) var(--section-px)', maxWidth:'1280px', margin:'0 auto' }}>
        <div className="section-header reveal">
          <span className="section-tag">Leadership</span>
          <h2>Board <span className="text-glow">Members</span></h2>
          <p>Meet the visionary minds driving Eemon X forward.</p>
        </div>
        <div className="board-grid">
          {boardMembers.map((member, i) => (
            <div
              className="member-card reveal"
              key={i}
              style={{ transitionDelay:`${i*0.10}s` }}
              onClick={() => openTeamModal(member)}
            >
              <div className="member-photo">
                {member.image
                  ? <img src={member.image} alt={member.name}/>
                  : <div className="member-initials-bg">
                      <span className="member-initials-text">{member.initials}</span>
                    </div>
                }
                <div className="member-photo-shade"/>
              </div>
              <div className="member-content">
                <span className="member-role-tag">{member.role}</span>
                <h3 className="member-name">{member.name}<IconVerified/></h3>
                <p className="member-desc">{member.roleDesc}</p>
                <div className="member-footer">
                  <div className="member-socials">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="LinkedIn"><IconLinkedIn/></a>
                    <a href={member.github}   target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="GitHub"><IconGithub/></a>
                  </div>
                  <button
                    className="member-connect"
                    onClick={e => { e.stopPropagation(); window.location.href = `mailto:${member.email}`; }}
                  >
                    Connect +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ position:'relative', zIndex:2, padding:'var(--section-py) var(--section-px)', maxWidth:'1280px', margin:'0 auto' }}>
        <div className="section-header reveal">
          <span className="section-tag">Get in Touch</span>
          <h2>Initialize <span className="text-glow">Connection</span></h2>
          <p>Ready to secure your digital future? Reach out to our team.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info reveal">
            <h3>Headquarters</h3>
            <p className="hq-sub">Eemon X Innovations</p>
            {[
              { icon:"📍", label:"Location",          content:"Erode, Tamil Nadu, India" },
              { icon:"📧", label:"Official Comms",    href:"mailto:eemonx2025@gmail.com", content:"eemonx2025@gmail.com" },
              { icon:"🕒", label:"Hours of Operation",content:"Mon – Fri, 9:00 AM – 6:00 PM (IST)" },
            ].map((item, i) => (
              <div className="contact-item-card reveal" key={i} style={{ transitionDelay:`${i*0.10}s` }}>
                <div className="contact-item-icon">{item.icon}</div>
                <div>
                  <strong>{item.label}</strong>
                  {item.href
                    ? <a href={item.href}>{item.content}</a>
                    : <p style={{ whiteSpace:'pre-line' }}>{item.content}</p>
                  }
                </div>
              </div>
            ))}
          </div>

          <form className="contact-form reveal" onSubmit={handleFormSubmit}>
            <h3 className="form-title">Send an Encrypted Message</h3>
            <div className="form-row">
              <div className="field-group">
                <label>Name</label>
                <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required disabled={isSubmitting}/>
              </div>
              <div className="field-group">
                <label>Email</label>
                <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="Primary email" required disabled={isSubmitting}/>
              </div>
            </div>
            <div className="form-row">
              <div className="field-group">
                <label>Phone</label>
                <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" required disabled={isSubmitting}/>
              </div>
              <div className="field-group">
                <label>Service</label>
                <select id="service" value={formData.service} onChange={handleInputChange} required disabled={isSubmitting}>
                  <option value="" disabled>Select domain…</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI / ML Solutions">AI / ML Solutions</option>
                  <option value="Other">Other Integration</option>
                </select>
              </div>
            </div>
            <div className="field-group">
              <label>Message</label>
              <textarea id="message" rows="4" value={formData.message} onChange={handleInputChange} placeholder="State your requirements…" required disabled={isSubmitting}/>
            </div>
            <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="spin" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" className="spin-path"/>
                  </svg>
                  Transmitting…
                </>
              ) : 'Transmit Message →'}
            </button>
            {submitStatus.text && (
              <div className={`form-alert ${submitStatus.type}`}>{submitStatus.text}</div>
            )}
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-glow"/>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">
              <img src="/eemonx logo.png" alt="Eemon X" className="nav-logo-img"/>
              <span className="nav-brand">Eemon<span className="brand-x"> X</span></span>
            </div>
            <p>Securing the future, designing the present.</p>
            <p>📧 eemonx2025@gmail.com</p>
          </div>
          <div className="footer-nav-cols">
            <div>
              <h4>Navigate</h4>
              {['#home','#about','#domain'].map(h => (
                <a key={h} href={h}>{h.slice(1).charAt(0).toUpperCase() + h.slice(2)}</a>
              ))}
            </div>
            <div>
              <h4>Company</h4>
              {[['#gallery','Gallery'],['#service','Projects'],['#board','Board Members']].map(([h,l]) => (
                <a key={h} href={h}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Eemon X. All rights reserved.</p>
        </div>
      </footer>

      {/* ══ BOARD MEMBER PROFILE MODAL ══ */}
      {teamModalData && (
        <div className="modal-backdrop" onClick={closeTeamModal}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeTeamModal}>×</button>
            <div className="profile-modal-photo">
              {teamModalData.image
                ? <img src={teamModalData.image} alt={teamModalData.name}/>
                : <div className="profile-modal-photo-placeholder">{teamModalData.initials}</div>
              }
              <div className="profile-modal-photo-shade"/>
            </div>
            <div className="profile-modal-body">
              <div className="profile-modal-role">{teamModalData.role}</div>
              <div className="profile-modal-name">{teamModalData.name}<IconVerified/></div>
              <p className="profile-modal-specialty">{teamModalData.roleDesc}</p>
              <div className="profile-modal-fields">
                <div className="profile-field">
                  <div className="profile-field-label">📞 Phone</div>
                  <div className="profile-field-value"><a href={`tel:${teamModalData.phone}`}>{teamModalData.phone}</a></div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">✉️ Email</div>
                  <div className="profile-field-value"><a href={`mailto:${teamModalData.email}`}>{teamModalData.email}</a></div>
                </div>
              </div>
              <div className="profile-specialist">
                <div className="profile-specialist-label">⚡ Specialist in</div>
                <div className="profile-specialist-tags">
                  {teamModalData.specialist.map((s, i) => (
                    <span className="profile-specialist-tag" key={i}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="profile-modal-actions">
                <button className="profile-action-btn profile-action-wa" onClick={() => window.open(`https://wa.me/${teamModalData.whatsapp}`, '_blank')}>
                  <IconWA/> WhatsApp
                </button>
                <button className="profile-action-btn profile-action-email" onClick={() => window.location.href = `mailto:${teamModalData.email}`}>
                  ✉️ Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Domain Modal ── */}
      {domainModalData && (
        <div className="modal-backdrop" onClick={closeDomainModal}>
          <div className="domain-modal-box" onClick={e => e.stopPropagation()}>
            <div className="domain-modal-glow"/>
            <span className="domain-modal-sub">Eemon X Division</span>
            <h2>{domainModalData.title}</h2>
            <p>{domainModalData.shortDesc}</p>
            <div className="domain-services">
              <span className="services-heading">Services Provided</span>
              <ul>{domainModalData.services.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <button className="btn-close-domain" onClick={closeDomainModal}>Close Panel</button>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <img src={lightboxImage} alt="Gallery" onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
};

export default EemonX;
