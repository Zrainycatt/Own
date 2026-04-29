document.addEventListener('DOMContentLoaded', () => {
  initTargetCursor();
  initNavigation();
  initScrollAnimations();
  initCategoryCards();
  initContactForm();
  initHeaderScroll();
  initSkillBars();
  initWorkCards();
});

function initTargetCursor() {
  const gsapScript = document.createElement('script');
  gsapScript.src = 'https://cdn.bootcdn.net/ajax/libs/gsap/3.12.2/gsap.min.js';
  
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'css/targetCursor.css';
  document.head.appendChild(cssLink);
  
  gsapScript.onload = () => {
    const cursorScript = document.createElement('script');
    cursorScript.src = 'js/targetCursor.js';
    cursorScript.onload = () => {
      new TargetCursor({
        targetSelector: '.cursor-target',
        spinDuration: 2,
        hideDefaultCursor: true,
        hoverDuration: 0.2,
        parallaxOn: true
      });
    };
    document.head.appendChild(cursorScript);
  };
  document.head.appendChild(gsapScript);
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });
}

function initSkillBars() {
  const skillBars = document.querySelectorAll('.bar-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute('data-width') || '100%';
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

function initCategoryCards() {
  const cards = document.querySelectorAll('.category-card');
  
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 100}ms`;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
    
    card.addEventListener('click', () => {
      const href = card.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
}

function initWorkCards() {
  const cards = document.querySelectorAll('.work-card');
  
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 100}ms`;
    
    card.addEventListener('mouseenter', () => {
      const img = card.querySelector('img');
      if (img) {
        img.style.transform = 'scale(1.1)';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('img');
      if (img) {
        img.style.transform = 'scale(1)';
      }
    });
  });
}

function initContactForm() {
  const form = document.querySelector('.contact-form form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('.btn');
      const originalText = btn.textContent;
      
      btn.textContent = '发送中...';
      btn.disabled = true;
      
      setTimeout(() => {
        btn.textContent = '发送成功!';
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 2000);
      }, 1000);
    });
  }
}

function navigateToDetail(workId) {
  window.location.href = `detail.html?id=${workId}`;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});