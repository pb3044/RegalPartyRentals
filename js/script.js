// ===================================
// SVG Logo Sequential Animation Setup (Lazy Loaded)
// ===================================

// Lazy load SVG animation only when logo is visible
let svgAnimationInitialized = false;

function initSVGAnimation() {
    if (svgAnimationInitialized) return;
    svgAnimationInitialized = true;
    
    const svgLogo = document.querySelector('.navbar-logo-svg');
    if (!svgLogo) return;
    
    requestAnimationFrame(() => {
        const viewBox = svgLogo.getAttribute('viewBox');
        if (!viewBox) return;
        
        // Parse viewBox and calculate split point
        const viewBoxValues = viewBox.split(/\s+/);
        const svgHeight = parseFloat(viewBoxValues[3]) || 630;
        const splitPoint = svgHeight * 0.6;
        
        // Cache all elements once
        const allElements = svgLogo.querySelectorAll('path, g, line, circle, rect, ellipse');
        const strokedPaths = [];
        const tentElements = [];
        const furnitureElements = [];
        
        // Single pass: set fills, classify elements, and collect references
        allElements.forEach(element => {
            // Set fill for paths
            if (element.tagName === 'path') {
                const currentFill = element.getAttribute('fill');
                if (!currentFill || currentFill === 'none' || currentFill === '' || currentFill === 'transparent') {
                    element.setAttribute('fill', '#8b2d5c');
                }
                
                // Collect stroked paths for later processing
                const stroke = element.getAttribute('stroke');
                if (stroke && stroke !== 'none' && stroke !== '') {
                    strokedPaths.push(element);
                }
            }
            
            // Skip if already classified
            if (element.classList.contains('tent-element') || element.classList.contains('furniture-element')) {
                return;
            }
            
            // Check parent classification first (faster)
            const parent = element.parentElement;
            if (parent) {
                if (parent.classList.contains('tent-element')) {
                    element.classList.add('tent-element');
                    tentElements.push(element);
                    return;
                } else if (parent.classList.contains('furniture-element')) {
                    element.classList.add('furniture-element');
                    furnitureElements.push(element);
                    return;
                }
            }
            
            // Calculate Y position (simplified)
            let yPosition = 0;
            let hasPosition = false;
            
            const cy = element.getAttribute('cy');
            const y = element.getAttribute('y');
            const d = element.getAttribute('d');
            const transform = element.getAttribute('transform');
            
            if (cy) {
                yPosition = parseFloat(cy);
                hasPosition = !isNaN(yPosition);
            } else if (y) {
                yPosition = parseFloat(y);
                hasPosition = !isNaN(yPosition);
            } else if (d) {
                // Quick Y extraction from path data
                const firstCoord = d.match(/[ML]\s+[\d.-]+\s+([\d.-]+)/);
                if (firstCoord) {
                    yPosition = parseFloat(firstCoord[1]);
                    hasPosition = !isNaN(yPosition);
                }
            }
            
            // Check transform
            if (transform && transform.includes('translate')) {
                const translateMatch = transform.match(/translate\([^,]+,\s*([^)]+)\)/);
                if (translateMatch) {
                    const translateY = parseFloat(translateMatch[1]);
                    if (!isNaN(translateY)) {
                        yPosition = hasPosition ? yPosition + translateY : translateY;
                        hasPosition = true;
                    }
                }
            }
            
            // Fallback to bounding box only if needed
            if (!hasPosition) {
                try {
                    const bbox = element.getBBox();
                    yPosition = bbox.y + (bbox.height / 2);
                    hasPosition = true;
                } catch (e) {
                    // getBBox failed, will default to tent
                }
            }
            
            // Classify and collect
            if (yPosition < splitPoint || yPosition === 0 || !hasPosition) {
                element.classList.add('tent-element');
                tentElements.push(element);
            } else {
                element.classList.add('furniture-element');
                furnitureElements.push(element);
            }
        });
        
        // Process stroked paths for dasharray (deferred to avoid layout thrashing)
        requestAnimationFrame(() => {
            strokedPaths.forEach(path => {
                try {
                    const pathLength = path.getTotalLength();
                    if (pathLength > 0) {
                        path.style.setProperty('--path-length', pathLength);
                        path.style.strokeDasharray = pathLength;
                        path.style.strokeDashoffset = pathLength;
                    }
                } catch (e) {
                    path.style.setProperty('--path-length', '1000');
                    path.style.strokeDasharray = '1000';
                    path.style.strokeDashoffset = '1000';
                }
            });
        });
        
        // Set visibility in one batch
        const allClassifiedElements = [...tentElements, ...furnitureElements];
        allClassifiedElements.forEach(el => {
            el.style.setProperty('visibility', 'visible');
            el.style.setProperty('display', 'block');
        });
    });
}

// Observe navbar logo for lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const svgLogo = document.querySelector('.navbar-logo-svg');
    if (svgLogo) {
        const logoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initSVGAnimation();
                    logoObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });
        
        logoObserver.observe(svgLogo);
        
        // Fallback: initialize after 2 seconds if still not visible
        setTimeout(() => {
            if (!svgAnimationInitialized) {
                initSVGAnimation();
            }
        }, 2000);
    }
});

// ===================================
// Smooth Scrolling for Navigation Links
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const target = document.querySelector(targetId);
        if (target) {
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu after clicking
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        }
    });
});

// ===================================
// Close Mobile Menu on Outside Click
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (!navbar || !navbarCollapse) return;
    
    // Listen for clicks on the document
    document.addEventListener('click', function(e) {
        // Check if menu is open
        if (!navbarCollapse.classList.contains('show')) {
            return;
        }
        
        // Check if click is inside the navbar
        const isClickInsideNavbar = navbar.contains(e.target);
        
        // Check if click is on the toggler button (let Bootstrap handle it)
        const isClickOnToggler = navbarToggler && navbarToggler.contains(e.target);
        
        // If click is outside navbar and not on toggler, close the menu
        if (!isClickInsideNavbar && !isClickOnToggler) {
            // Only close on mobile/tablet viewports (where collapse is visible)
            if (window.innerWidth < 992) { // Bootstrap's lg breakpoint
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    // If no instance exists, create one and hide
                    const newBsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    newBsCollapse.hide();
                }
            }
        }
    });
});

// ===================================
// Navbar Scroll Effect
// ===================================

// Throttle helper using requestAnimationFrame
function throttleRAF(fn) {
    let busy = false;
    return function(...args) {
        if (busy) return;
        busy = true;
        requestAnimationFrame(() => {
            fn.apply(this, args);
            busy = false;
        });
    };
}

// ===================================
// Combined Scroll Handlers (Optimized)
// ===================================

// Single scroll handler to reduce main-thread work
window.addEventListener('scroll', throttleRAF(function() {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.pageYOffset;
    
    // Update navbar scrolled state
    if (navbar) {
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Update active navigation link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    let current = '';
    const scrollPosition = scrollY + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}` || (current === '' && href === '#home')) {
            link.classList.add('active');
        }
    });
}));

// ===================================
// Contact Form Handling with EmailJS (Lazy Loaded)
// ===================================

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_gbdye75';
const EMAILJS_TEMPLATE_ID = 'template_g4dpyg9';
const EMAILJS_PUBLIC_KEY = 'VX5dplNyGfKt_KxxH';

// Lazy load EmailJS when contact form is visible
let emailjsLoaded = false;
let emailjsLoading = false;

function loadEmailJS() {
    if (emailjsLoaded || emailjsLoading) return;
    emailjsLoading = true;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    script.onload = function() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            emailjsLoaded = true;
            emailjsLoading = false;
            initContactForm();
        }
    };
    script.onerror = function() {
        emailjsLoading = false;
        console.warn('Failed to load EmailJS');
        initContactForm(); // Still init form for fallback
    };
    document.head.appendChild(script);
}

// Observe contact form section for lazy loading
const contactSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !emailjsLoaded && !emailjsLoading) {
            loadEmailJS();
            contactSectionObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '200px' }); // Load 200px before form is visible

document.addEventListener('DOMContentLoaded', function() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSectionObserver.observe(contactSection);
    } else {
        // If section not found, load immediately
        loadEmailJS();
    }
});

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const eventDate = document.getElementById('eventDate').value;
        const location = document.getElementById('location').value;
        const eventType = document.getElementById('eventType').value;
        const guestCount = document.getElementById('guestCount').value;
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !phone || !message) {
            alert('Please fill in all required fields marked with *.');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        if (phone.length < 10) {
            alert('Please enter a valid phone number.');
            return;
        }
        
        if (!location) {
            alert('Please select an event location.');
            return;
        }
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        const templateParams = {
            name: name,
            from_name: name,
            from_email: email,
            phone: phone,
            event_date: eventDate || 'Not specified',
            location: location,
            event_type: eventType || 'Not specified',
            guest_count: guestCount || 'Not specified',
            message: message,
            to_email: 'info@regalpartyrentals.ca'
        };
        
        if (emailjsLoaded && typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    console.log('Email sent successfully!', response.status, response.text);
                    alert('Thank you for your inquiry! We have received your message and will contact you shortly at ' + email + '.');
                    contactForm.reset();
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }, function(error) {
                    console.error('Email sending failed:', error);
                    alert('Sorry, there was an error sending your message. Please try again or contact us directly at info@regalpartyrentals.ca');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        } else {
            console.warn('EmailJS not loaded yet. Please try again in a moment.');
            alert('Email service is loading. Please try again in a moment or contact us directly at info@regalpartyrentals.ca');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// ===================================
// Animate Elements on Scroll
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Use combined observer instead of separate one

// Enhanced scroll animations with stagger effect
document.addEventListener('DOMContentLoaded', function() {
    // Animate cards with stagger (using combined observer)
    const cards = document.querySelectorAll('.card, .location-card, .review-card, .feature-icon');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.setAttribute('data-delay', index * 0.1);
        combinedObserver.observe(card);
    });
    
    // Animate headings and paragraphs
    const headings = document.querySelectorAll('h2.display-4, h3');
    headings.forEach((heading, index) => {
        heading.style.opacity = '0';
        heading.style.transform = 'translateY(20px)';
        heading.setAttribute('data-delay', index * 0.05);
        combinedObserver.observe(heading);
    });
    
    // Set minimum date for event date input to today
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.setAttribute('min', today);
    }
    
    // Initialize parallax effect for hero
    initParallaxEffect();
    
    // Add scroll progress indicator
    initScrollProgress();
});

function initScrollProgress() {
    let progressContainer = document.querySelector('.scroll-progress');
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.className = 'scroll-progress';
        progressContainer.setAttribute('role', 'progressbar');
        progressContainer.setAttribute('aria-valuemin', '0');
        progressContainer.setAttribute('aria-valuemax', '100');
        progressContainer.setAttribute('aria-valuenow', '0');
        progressContainer.innerHTML = '<div class="scroll-progress__bar"></div>';
        document.body.appendChild(progressContainer);
    }

    const progressBar = progressContainer.querySelector('.scroll-progress__bar');

    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
        progressContainer.setAttribute('aria-valuenow', progress.toFixed(0));
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
}

// Combined intersection observer for all animations (reduces main-thread work)
const combinedObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseFloat(entry.target.getAttribute('data-delay')) || 0;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay * 100);
            });
            combinedObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all animated elements with single observer
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.card, .location-card, .review-card, h2.display-4');
    animatedElements.forEach(el => {
        if (!el.classList.contains('fade-in-up')) {
            combinedObserver.observe(el);
        }
    });
});

// ===================================
// Phone Number Formatting (Optional Enhancement)
// ===================================

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX if it's a 10-digit number
        if (value.length === 10) {
            value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
            e.target.value = value;
        }
    });
}

// ===================================
// Lazy Loading Images (Enhancement)
// ===================================

// Check if browser supports Intersection Observer
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// Handle Missing Images Gracefully
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace broken image with gradient placeholder
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'height: 250px; background: linear-gradient(135deg, #8B2D5C 0%, #6B46C1 50%, #D4A574 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;';
            placeholder.textContent = 'Image Coming Soon';
            this.parentNode.insertBefore(placeholder, this);
        });
    });
});

// ===================================
// Enhanced Parallax Effect for Hero Section
// ===================================

function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Respect user preference for reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Disable parallax on small screens to reduce main-thread work
    if (window.innerWidth <= 768) return;

    // Simplified scroll parallax (reduced complexity)
    let lastScrollY = 0;
    window.addEventListener('scroll', throttleRAF(function() {
        const scrolled = window.pageYOffset;
        if (Math.abs(scrolled - lastScrollY) < 10) return; // Skip if minimal scroll
        lastScrollY = scrolled;
        
        const heroContent = document.querySelector('.hero-overlay');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.3;
        }
    }));
    
    // Disable mouse parallax to reduce main-thread work (can be re-enabled if needed)
    // Mouse parallax removed for performance optimization
}

// ===================================
// Smooth Number Counter Animation
// ===================================

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate review count when it comes into view
const reviewCountObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const reviewCountElement = document.getElementById('reviewCount');
            if (reviewCountElement && !reviewCountElement.classList.contains('animated')) {
                reviewCountElement.classList.add('animated');
                const finalValue = parseInt(reviewCountElement.textContent);
                animateValue(reviewCountElement, 0, finalValue, 2000);
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const reviewCount = document.getElementById('reviewCount');
    if (reviewCount) {
        reviewCountObserver.observe(reviewCount);
    }
    
    // Enhanced hero button interactions
    initHeroButtonEffects();
    
    // Add sparkle effects on hero text hover
    initHeroTextEffects();
});

// ===================================
// Hero Button Magnetic Effect
// ===================================

function initHeroButtonEffects() {
    const heroButtons = document.querySelectorAll('.hero-cta-1, .hero-cta-2');
    
    heroButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'translate(0, 0) scale(1)';
        });
        
        // Pulse glow effect
        setInterval(() => {
            if (document.querySelector('.hero-section:hover')) {
                button.style.boxShadow = '0 0 30px rgba(139, 45, 92, 0.6)';
                setTimeout(() => {
                    button.style.boxShadow = '';
                }, 500);
            }
        }, 3000);
    });
}

// ===================================
// Hero Text Glow Effect on Hover
// ===================================

function initHeroTextEffects() {
    const heroTitle = document.querySelector('.hero-title');
    
    if (heroTitle) {
        heroTitle.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 30px rgba(255, 255, 255, 0.8), 3px 3px 10px rgba(0, 0, 0, 0.3)';
            this.style.transform = 'scale(1.02)';
        });
        
        heroTitle.addEventListener('mouseleave', function() {
            this.style.textShadow = '3px 3px 10px rgba(0, 0, 0, 0.3)';
            this.style.transform = 'scale(1)';
        });
    }
}

// ===================================
// Google Reviews Integration
// ===================================

// Option 1: Manual Reviews (Current Implementation)
// You can manually update the review cards in the HTML with actual reviews

// Option 2: Google My Business API Integration
// To use Google My Business API, you'll need:
// 1. Google Cloud Project
// 2. Google My Business API enabled
// 3. API Key
// Uncomment and configure the function below:

/*
async function loadGoogleReviews() {
    const placeId = 'YOUR_GOOGLE_PLACE_ID'; // Get this from Google My Business
    const apiKey = 'YOUR_GOOGLE_API_KEY';
    
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.result && data.result.reviews) {
            displayReviews(data.result.reviews, data.result.rating, data.result.user_ratings_total);
        }
    } catch (error) {
        console.error('Error loading Google reviews:', error);
    }
}

function displayReviews(reviews, averageRating, totalReviews) {
    const container = document.getElementById('googleReviewsContainer');
    const reviewCountElement = document.getElementById('reviewCount');
    
    // Update aggregate rating
    if (reviewCountElement && totalReviews) {
        reviewCountElement.textContent = totalReviews;
    }
    
    // Clear placeholder reviews
    container.innerHTML = '';
    
    // Display up to 6 reviews
    const reviewsToShow = reviews.slice(0, 6);
    
    reviewsToShow.forEach(review => {
        const reviewCard = createReviewCard(review);
        container.appendChild(reviewCard);
    });
}

function createReviewCard(review) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const stars = generateStars(review.rating);
    const relativeTime = formatRelativeTime(review.time);
    
    col.innerHTML = `
        <div class="review-card card h-100 shadow-sm">
            <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                    <div class="reviewer-avatar me-3">
                        ${review.profile_photo_url 
                            ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="rounded-circle" style="width: 40px; height: 40px;">`
                            : `<i class="bi bi-person-circle text-primary" style="font-size: 2.5rem;"></i>`
                        }
                    </div>
                    <div>
                        <h5 class="mb-0">${review.author_name}</h5>
                        <div class="review-stars text-warning">
                            ${stars}
                        </div>
                    </div>
                </div>
                <p class="review-text mb-3">"${review.text}"</p>
                <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>${relativeTime}
                </small>
            </div>
        </div>
    `;
    
    return col;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi bi-star-fill"></i>';
        } else {
            stars += '<i class="bi bi-star"></i>';
        }
    }
    return stars;
}

function formatRelativeTime(timestamp) {
    const now = Date.now();
    const reviewTime = timestamp * 1000;
    const diffInDays = Math.floor((now - reviewTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
}

// Uncomment to load reviews on page load:
// loadGoogleReviews();
*/

// Option 3: Third-Party Widget Integration
// Consider using services like:
// - ReviewsOnMyWebsite (https://reviewsonmywebsite.com)
// - EmbedSocial (https://embedsocial.com)
// - Elfsight Google Reviews Widget (https://elfsight.com)
// These services provide simple embed codes that you can add to your HTML

// Example: If using a third-party widget, add the script tag in the HTML head:
/*
<script src="https://widget.reviewsonmywebsite.com/widget.js?business_id=YOUR_BUSINESS_ID"></script>
*/

// ===================================
// Scroll to Top Button Functionality
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const scrollTopButton = document.getElementById('scroll-top');
    
    if (scrollTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', throttleRAF(function() {
            if (window.pageYOffset > 300) {
                scrollTopButton.classList.add('active');
            } else {
                scrollTopButton.classList.remove('active');
            }
        }));
        
        // Smooth scroll to top when clicked
        scrollTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
