document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Intersection Observer for Scroll Animations
  // ==========================================================================
  const fadeElements = document.querySelectorAll('.fade-in');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // ==========================================================================
  // 2. Audio Control Player (With User Gesture Bypass)
  // ==========================================================================
  const audio = document.getElementById('bg-audio');
  const audioToggle = document.getElementById('audio-toggle-btn');
  const audioLabel = audioToggle.querySelector('.audio-label');
  let isPlaying = false;

  audioToggle.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      audioToggle.classList.remove('playing');
      audioLabel.textContent = 'Play Music';
    } else {
      audio.play().then(() => {
        audioToggle.classList.add('playing');
        audioLabel.textContent = 'Pause Music';
      }).catch(err => {
        console.log("Audio play blocked by browser policy:", err);
      });
    }
    isPlaying = !isPlaying;
  });

  // ==========================================================================
  // 3. Canvas Particle Engine (Hearts, Stars, and Petals)
  // ==========================================================================
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = 60;

  // Particle Class
  class Particle {
    constructor(isSplash = false, startX, startY) {
      this.isSplash = isSplash;
      this.x = isSplash ? startX : Math.random() * width;
      this.y = isSplash ? startY : height + Math.random() * 100;
      this.size = Math.random() * 8 + 4;
      this.speedY = isSplash ? (Math.random() * -6 - 2) : (Math.random() * -1 - 0.5);
      this.speedX = isSplash ? (Math.random() * 8 - 4) : (Math.sin(Math.random() * Math.PI) * 0.5);
      this.type = isSplash ? 'heart' : (Math.random() > 0.6 ? 'heart' : (Math.random() > 0.4 ? 'petal' : 'star'));
      this.opacity = isSplash ? 1 : Math.random() * 0.5 + 0.3;
      this.rotation = Math.random() * 360;
      this.spin = Math.random() * 2 - 1;
      this.color = this.getRandomColor();
      this.life = isSplash ? (Math.random() * 60 + 40) : 1000; // splash particles die off
      
      if (this.type === 'heart') {
        const heartEmojis = ['❤️', '💖', '💝', '💕', '💗', '💓', '💞'];
        this.emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      }
    }

    getRandomColor() {
      const colors = [
        'rgba(229, 124, 156, ', // Rose gold
        'rgba(240, 166, 185, ', // Pastel pink
        'rgba(226, 177, 60, ',  // Warm gold
        'rgba(200, 61, 90, '    // Crimson
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'heart') {
        ctx.font = `${this.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
      } else if (this.type === 'petal') {
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 2, this.size, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Glowing Star
        ctx.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(0, -this.size);
          ctx.rotate(Math.PI / 5);
          ctx.lineTo(0, -this.size / 2);
          ctx.rotate(Math.PI / 5);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.spin;

      if (this.isSplash) {
        this.life--;
        this.opacity -= 0.01;
      } else {
        // sway left and right gently
        this.x += Math.sin(this.y * 0.01) * 0.2;
      }

      // Recycle regular particles if they go off screen
      if (!this.isSplash && this.y < -50) {
        this.y = height + Math.random() * 50;
        this.x = Math.random() * width;
        this.opacity = Math.random() * 0.5 + 0.3;
      }
    }
  }

  // Populate ambient particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      
      // Remove dead splash particles
      if (particles[i].isSplash && (particles[i].life <= 0 || particles[i].opacity <= 0)) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Trigger heart burst
  function triggerHeartBurst(x, y) {
    const burstCount = 30;
    for (let i = 0; i < burstCount; i++) {
      particles.push(new Particle(true, x, y));
    }
  }

  // Bind to button
  const sendLoveBtn = document.getElementById('btn-send-love');
  sendLoveBtn.addEventListener('click', (e) => {
    const rect = sendLoveBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2 + window.scrollY;
    
    // Convert coordinate relative to viewport to relative to page canvas
    triggerHeartBurst(e.clientX, e.clientY);
  });

  // Also trigger small bursts on click anywhere on hero
  document.querySelector('.hero').addEventListener('click', (e) => {
    // Only trigger if not clicking buttons
    if (!e.target.closest('.btn')) {
      triggerHeartBurst(e.clientX, e.clientY);
    }
  });

  // ==========================================================================
  // 4. Interactive Envelope / Letter Animation
  // ==========================================================================
  const envelope = document.getElementById('envelope-elem');
  const letterInstruction = document.getElementById('letter-instruction-text');
  let isEnvelopeOpen = false;

  envelope.addEventListener('click', (e) => {
    isEnvelopeOpen = !isEnvelopeOpen;
    if (isEnvelopeOpen) {
      envelope.classList.add('open');
      letterInstruction.textContent = "Click again to slide the letter back";
      // Sparkle burst from the seal when opened
      const sealRect = document.getElementById('seal-elem').getBoundingClientRect();
      triggerHeartBurst(sealRect.left + 20, sealRect.top + 20);
    } else {
      envelope.classList.remove('open');
      letterInstruction.textContent = "Click the seal to read the poem";
    }
  });

  // ==========================================================================
  // 5. Ashmita's Flower Garden Logic
  // ==========================================================================
  const gardenGrid = document.getElementById('garden-grid-container');
  const bloomCounter = document.getElementById('bloom-counter');
  let bloomedCount = 0;

  // 9 Heartfelt Compliments/Thoughts for Ashmita
  const thoughts = [
    "<span class=\"name-highlight\">Ashmita</span>, your laughter is my absolute favorite sound in the world. 💖",
    "I truly admire how passionately you chase your dreams and build your path. ✨",
    "Just speaking to you makes even the most ordinary day feel beautiful. 🌸",
    "Your kindness and warmth shine brightly in everything you do. 💫",
    "The world feels a little softer and more comforting whenever you are around. 🌙",
    "I cherish every conversation we share, no matter how small or simple. 💞",
    "You inspire me to be a more thoughtful, caring version of myself. 🌟",
    "Your presence brings a quiet, comforting ray of sunshine to my life. ☀️",
    "You are rare, <span class=\"name-highlight\">Ashmita</span>, and you deserve all the happiness in the world. 🌹"
  ];

  // Colors for dynamic SVGs
  const flowerThemes = [
    { primary: '#e57c9c', glow: '#ffabbd', leaves: '#398b48' }, // Pink Rose
    { primary: '#e2b13c', glow: '#ffd269', leaves: '#4a9c59' }, // Golden Daisy
    { primary: '#c83d5a', glow: '#f0627f', leaves: '#3e904d' }, // Crimson Tulip
    { primary: '#a38dfc', glow: '#c7b8ff', leaves: '#3d944e' }, // Purple Blossom
  ];

  // Create Popup element programmatically if not exists
  let popup = document.querySelector('.garden-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'garden-popup';
    document.body.appendChild(popup);
  }

  function showPopupMessage(message, color) {
    popup.innerHTML = `<span style="color: ${color}">❤️</span> <span>${message}</span>`;
    popup.classList.add('active');
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      popup.classList.remove('active');
    }, 4500);
  }

  // Generate a beautiful SVG Flower
  function generateFlowerSVG(theme) {
    return `
      <svg class="flower-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path class="flower-stem" d="M50 110 Q52 80 50 50" fill="none" stroke="${theme.leaves}" stroke-width="4"/>
        
        <!-- Leaves -->
        <path class="flower-leaves" d="M50 85 Q35 75 40 68 Q50 75 50 85" fill="${theme.leaves}"/>
        <path class="flower-leaves" d="M50 70 Q65 62 60 55 Q50 62 50 70" fill="${theme.leaves}"/>
        
        <!-- Blossom Head -->
        <g class="flower-head" transform="translate(50, 48)">
          <!-- Outer petals -->
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(0)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(45)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(90)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(135)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(180)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(225)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(270)"/>
          <ellipse cx="0" cy="-15" rx="10" ry="14" fill="${theme.primary}" transform="rotate(315)"/>
          
          <!-- Inner core glow -->
          <circle cx="0" cy="0" r="10" fill="${theme.glow}"/>
          <circle cx="0" cy="0" r="6" fill="#fffef2"/>
        </g>
      </svg>
    `;
  }

  // Create the 9 slots
  for (let i = 0; i < 9; i++) {
    const slot = document.createElement('div');
    slot.className = 'garden-slot';
    slot.dataset.index = i;
    slot.innerHTML = `<span style="font-size: 0.75rem; color: rgba(229,124,156,0.3)">Plant</span>`;
    
    slot.addEventListener('click', (e) => {
      if (slot.classList.contains('bloomed')) {
        // Just show message again
        const theme = flowerThemes[i % flowerThemes.length];
        showPopupMessage(thoughts[i], theme.primary);
        triggerHeartBurst(e.clientX, e.clientY);
        return;
      }

      // Mark bloomed
      slot.classList.add('bloomed');
      bloomedCount++;
      bloomCounter.textContent = bloomedCount;

      const theme = flowerThemes[i % flowerThemes.length];
      slot.innerHTML = generateFlowerSVG(theme);

      // Trigger burst on bloom
      triggerHeartBurst(e.clientX, e.clientY);

      // Show specific message
      setTimeout(() => {
        showPopupMessage(thoughts[i], theme.primary);
      }, 300);
    });

    gardenGrid.appendChild(slot);
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('open');
      }
    });
  }
});
