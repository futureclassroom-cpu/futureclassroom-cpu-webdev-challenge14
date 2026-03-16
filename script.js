// Scroll animations
const obs = new IntersectionObserver(e => e.forEach(x => { if(x.isIntersecting) x.target.classList.add('visible'); }), {threshold:.1});
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// Counter animation
function animateCounter(el, target) {
    let cur = 0, step = target / (2000/16);
    const t = setInterval(() => { cur = Math.min(cur+step,target); el.textContent = Math.floor(cur).toLocaleString(); if(cur>=target) clearInterval(t); }, 16);
}
const statsObs = new IntersectionObserver(e => e.forEach(x => { if(x.isIntersecting){ x.target.querySelectorAll('.stat-num[data-target]').forEach(el => { animateCounter(el,+el.dataset.target); el.removeAttribute('data-target'); }); statsObs.unobserve(x.target); } }), {threshold:.3});
document.querySelectorAll('#statsBanner').forEach(el => statsObs.observe(el));

// Navbar shadow on scroll
window.addEventListener('scroll', () => { document.getElementById('mainNav').style.boxShadow = scrollY>50 ? '0 4px 30px rgba(0,0,0,.3)' : 'none'; });

// Form submit
function handleSubmit(btn) { btn.textContent='✓ Message Sent!'; btn.style.background='#2D6A4F'; btn.style.color='#fff'; setTimeout(()=>{ btn.textContent='Send Message'; btn.style.background=''; btn.style.color=''; }, 3000); }
