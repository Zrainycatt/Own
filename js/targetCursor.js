class TargetCursor {
  constructor(options = {}) {
    this.targetSelector = options.targetSelector || '.cursor-target';
    this.spinDuration = options.spinDuration || 2;
    this.hideDefaultCursor = options.hideDefaultCursor !== undefined ? options.hideDefaultCursor : true;
    this.hoverDuration = options.hoverDuration || 0.2;
    this.parallaxOn = options.parallaxOn !== undefined ? options.parallaxOn : true;
    
    this.isMobile = this.checkMobile();
    
    if (this.isMobile) return;
    
    this.constants = {
      borderWidth: 3,
      cornerSize: 12
    };
    
    this.cursorRef = null;
    this.dotRef = null;
    this.cornersRef = null;
    this.spinTl = null;
    
    this.isActiveRef = false;
    this.targetCornerPositionsRef = null;
    this.tickerFnRef = null;
    this.activeStrengthRef = 0;
    
    this.activeTarget = null;
    this.currentLeaveHandler = null;
    this.resumeTimeout = null;
    
    this.init();
  }
  
  checkMobile() {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }
  
  init() {
    this.createCursor();
    this.setupEventListeners();
    this.createSpinTimeline();
  }
  
  createCursor() {
    const cursorWrapper = document.createElement('div');
    cursorWrapper.className = 'target-cursor-wrapper';
    
    const dot = document.createElement('div');
    dot.className = 'target-cursor-dot';
    
    const cornerTl = document.createElement('div');
    cornerTl.className = 'target-cursor-corner corner-tl';
    
    const cornerTr = document.createElement('div');
    cornerTr.className = 'target-cursor-corner corner-tr';
    
    const cornerBr = document.createElement('div');
    cornerBr.className = 'target-cursor-corner corner-br';
    
    const cornerBl = document.createElement('div');
    cornerBl.className = 'target-cursor-corner corner-bl';
    
    cursorWrapper.appendChild(dot);
    cursorWrapper.appendChild(cornerTl);
    cursorWrapper.appendChild(cornerTr);
    cursorWrapper.appendChild(cornerBr);
    cursorWrapper.appendChild(cornerBl);
    
    document.body.appendChild(cursorWrapper);
    
    this.cursorRef = cursorWrapper;
    this.dotRef = dot;
    this.cornersRef = [cornerTl, cornerTr, cornerBr, cornerBl];
    
    if (this.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }
    
    gsap.set(cursorWrapper, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  }
  
  createSpinTimeline() {
    if (this.spinTl) {
      this.spinTl.kill();
    }
    this.spinTl = gsap.timeline({ repeat: -1 })
      .to(this.cursorRef, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
  }
  
  moveCursor(x, y) {
    if (!this.cursorRef) return;
    gsap.to(this.cursorRef, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out'
    });
  }
  
  cleanupTarget(target) {
    if (this.currentLeaveHandler) {
      target.removeEventListener('mouseleave', this.currentLeaveHandler);
    }
    this.currentLeaveHandler = null;
  }
  
  setupEventListeners() {
    const moveHandler = (e) => this.moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);
    
    const mouseDownHandler = () => {
      if (!this.dotRef) return;
      gsap.to(this.dotRef, { scale: 0.7, duration: 0.3 });
      gsap.to(this.cursorRef, { scale: 0.9, duration: 0.2 });
    };
    
    const mouseUpHandler = () => {
      if (!this.dotRef) return;
      gsap.to(this.dotRef, { scale: 1, duration: 0.3 });
      gsap.to(this.cursorRef, { scale: 1, duration: 0.2 });
    };
    
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    
    const enterHandler = (e) => {
      const directTarget = e.target;
      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches && current.matches(this.targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      
      if (!target || !this.cursorRef || !this.cornersRef) return;
      if (this.activeTarget === target) return;
      if (this.activeTarget) {
        this.cleanupTarget(this.activeTarget);
      }
      if (this.resumeTimeout) {
        clearTimeout(this.resumeTimeout);
        this.resumeTimeout = null;
      }
      
      this.activeTarget = target;
      const corners = Array.from(this.cornersRef);
      corners.forEach(corner => gsap.killTweensOf(corner));
      gsap.killTweensOf(this.cursorRef, 'rotation');
      this.spinTl?.pause();
      gsap.set(this.cursorRef, { rotation: 0 });
      
      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = this.constants;
      const cursorX = gsap.getProperty(this.cursorRef, 'x');
      const cursorY = gsap.getProperty(this.cursorRef, 'y');
      
      this.targetCornerPositionsRef = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];
      
      this.isActiveRef = true;
      gsap.ticker.add(this.tickerFnRef);
      
      gsap.to(this, { activeStrengthRef: 1, duration: this.hoverDuration, ease: 'power2.out' });
      
      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: this.targetCornerPositionsRef[i].x - cursorX,
          y: this.targetCornerPositionsRef[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });
      
      const leaveHandler = () => {
        gsap.ticker.remove(this.tickerFnRef);
        this.isActiveRef = false;
        this.targetCornerPositionsRef = null;
        gsap.set(this, { activeStrengthRef: 0, overwrite: true });
        this.activeTarget = null;
        
        if (this.cornersRef) {
          const corners = Array.from(this.cornersRef);
          gsap.killTweensOf(corners);
          const { cornerSize } = this.constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(corner, {
              x: positions[index].x,
              y: positions[index].y,
              duration: 0.3,
              ease: 'power3.out'
            }, 0);
          });
        }
        
        this.resumeTimeout = setTimeout(() => {
          if (!this.activeTarget && this.cursorRef && this.spinTl) {
            const currentRotation = gsap.getProperty(this.cursorRef, 'rotation');
            const normalizedRotation = currentRotation % 360;
            this.spinTl.kill();
            this.spinTl = gsap.timeline({ repeat: -1 })
              .to(this.cursorRef, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
            gsap.to(this.cursorRef, {
              rotation: normalizedRotation + 360,
              duration: this.spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                this.spinTl?.restart();
              }
            });
          }
          this.resumeTimeout = null;
        }, 50);
        
        this.cleanupTarget(target);
      };
      
      this.currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };
    
    window.addEventListener('mouseover', enterHandler, { passive: true });
    
    const scrollHandler = () => {
      if (!this.activeTarget || !this.cursorRef) return;
      const mouseX = gsap.getProperty(this.cursorRef, 'x');
      const mouseY = gsap.getProperty(this.cursorRef, 'y');
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget = elementUnderMouse && 
        (elementUnderMouse === this.activeTarget || elementUnderMouse.closest(this.targetSelector) === this.activeTarget);
      if (!isStillOverTarget && this.currentLeaveHandler) {
        this.currentLeaveHandler();
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    this.destroy = () => {
      if (this.tickerFnRef) {
        gsap.ticker.remove(this.tickerFnRef);
      }
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      
      if (this.activeTarget) {
        this.cleanupTarget(this.activeTarget);
      }
      
      this.spinTl?.kill();
      document.body.style.cursor = 'auto';
      
      if (this.cursorRef) {
        document.body.removeChild(this.cursorRef);
      }
      
      this.isActiveRef = false;
      this.targetCornerPositionsRef = null;
      this.activeStrengthRef = 0;
    };
    
    this.tickerFnRef = () => {
      if (!this.targetCornerPositionsRef || !this.cursorRef || !this.cornersRef) return;
      
      const strength = this.activeStrengthRef;
      if (strength === 0) return;
      
      const cursorX = gsap.getProperty(this.cursorRef, 'x');
      const cursorY = gsap.getProperty(this.cursorRef, 'y');
      
      const corners = Array.from(this.cornersRef);
      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');
        
        const targetX = this.targetCornerPositionsRef[i].x - cursorX;
        const targetY = this.targetCornerPositionsRef[i].y - cursorY;
        
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        
        const duration = strength >= 0.99 ? (this.parallaxOn ? 0.2 : 0) : 0.05;
        
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    };
  }
}

window.TargetCursor = TargetCursor;