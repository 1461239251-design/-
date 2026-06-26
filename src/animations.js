import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   HERO OPENING ANIMATION — page-load entrance sequence
   ================================================================ */
export function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Set initial states — autoAlpha combines opacity + visibility
  gsap.set('.pageBg', { autoAlpha: 0 });
  gsap.set('.pageTexture', { autoAlpha: 0 });
  gsap.set('.heroVeil', { autoAlpha: 0 });
  gsap.set('.heroShowreel', { x: 60, scale: 0.92, autoAlpha: 0 });
  gsap.set('.nav', { y: -80, autoAlpha: 0 });
  gsap.set('.heroAvatar', { scale: 0, rotation: -15 });
  gsap.set('.heroKicker', { x: -40, autoAlpha: 0 });
  gsap.set('.heroTagline', { autoAlpha: 0 });
  gsap.set('.hero h1', { autoAlpha: 0 });
  gsap.set('.hero p', { y: 40, autoAlpha: 0 });
  gsap.set('.heroActions > *', { y: 30, autoAlpha: 0 });
  gsap.set('.heroMeta', { x: 40, autoAlpha: 0 });

  tl
    // Page background + texture fade in
    .to('.pageBg', { autoAlpha: 1, duration: 2.4 }, 0)
    .to('.pageTexture', { autoAlpha: 1, duration: 2.8 }, 0.2)

    // Veil breathes in
    .to('.heroVeil', { autoAlpha: 1, duration: 1.8 }, 0.1)

    // Nav drops in
    .to('.nav', { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out' }, 0.3)

    // Avatar spins in
    .to('.heroAvatar', { scale: 1, rotation: 0, autoAlpha: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0.2)

    // Kicker slides from left
    .to('.heroKicker', { x: 0, autoAlpha: 1, duration: 0.7 }, 0.4)

    // h1 — clip-path mask reveal from right to left
    .fromTo('.hero h1',
      { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'power4.inOut' },
      0.6
    )

    // Tagline
    .to('.heroTagline', { autoAlpha: 1, duration: 0.7 }, 0.8)

    // Description
    .to('.hero p', { y: 0, autoAlpha: 1, duration: 0.8 }, 0.9)

    // Buttons stagger
    .to('.heroActions > *', { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12 }, 1.1)

    // Meta panel
    .to('.heroMeta', { x: 0, autoAlpha: 1, duration: 0.8 }, 1.3)

    // Showreel video card — slides in from right
    .to('.heroShowreel', { x: 0, scale: 1, autoAlpha: 1, duration: 1, ease: 'power3.out' }, 0.6);

  return tl;
}

/* ================================================================
   SCROLL-TRIGGERED ANIMATIONS
   ================================================================ */
export function initScrollAnimations() {
  const triggers = [];

  // --- Section English titles — large decorative text ---
  const enTitles = gsap.utils.toArray('.sectionTitleEn');
  enTitles.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
        );
      },
    });
    triggers.push(st);
  });

  // --- Section headers (number + Chinese title + desc) ---
  const headers = gsap.utils.toArray('.sectionHeader');
  headers.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        // Animate children: sectionNo, h2, p
        const children = el.querySelectorAll('.sectionNo, h2, p');
        gsap.fromTo(children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' }
        );
      },
    });
    triggers.push(st);
  });

  // --- Card stagger grids ---
  const staggerGrids = gsap.utils.toArray('.anim-stagger');
  staggerGrids.forEach((grid) => {
    const cards = grid.children;
    const st = ScrollTrigger.create({
      trigger: grid,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(cards,
          { y: 70, scale: 0.93, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      },
    });
    triggers.push(st);
  });

  // --- Image clip-path reveal (portrait + cover images) ---
  const revealImages = gsap.utils.toArray('.anim-reveal-img');
  revealImages.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut' }
        );
      },
    });
    triggers.push(st);
  });

  // --- Parallax on cover images ---
  const parallaxEls = gsap.utils.toArray('.anim-parallax');
  parallaxEls.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        const y = gsap.utils.interpolate(30, -30, self.progress);
        gsap.set(el, { y });
      },
    });
    triggers.push(st);
  });

  // --- Parallax on portrait panel image ---
  const portraitImg = document.querySelector('.portraitPanel img');
  if (portraitImg) {
    const st = ScrollTrigger.create({
      trigger: portraitImg,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        const s = gsap.utils.interpolate(1.08, 0.96, self.progress);
        gsap.set(portraitImg, { scale: s });
      },
    });
    triggers.push(st);
  }

  return triggers;
}
