// Page Loading Handler
window.addEventListener('load', () => {
    // Remove loading state after a small delay to show animations
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 500);
});

// Set loading state initially
document.body.classList.add('loading');

// Navigation Toggle for Mobile
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Close mobile menu after clicking
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Simple form validation
    if (!data.name || !data.email || !data.subject || !data.message) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    // Simulate form submission (replace with actual backend integration)
    showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');

    // Reset form
    contactForm.reset();
});

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        background: #27ae60;
    }

    .notification.error {
        background: #e74c3c;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Animate skill bars on scroll
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillFills = entry.target.querySelectorAll('.skill-fill');
            skillFills.forEach(fill => {
                fill.style.width = fill.style.width; // Trigger animation
            });
        }
    });
}, { threshold: 0.5 });

const skillsSection = document.getElementById('skills');
if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// Animate elements on scroll
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1 });

// Add animation classes to elements
document.querySelectorAll('.experience-card, .achievement-card, .detail-item, .contact-item').forEach(el => {
    animateOnScroll.observe(el);
});

// Add CSS for animations
const animationStyles = `
    .experience-card,
    .achievement-card,
    .detail-item,
    .contact-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .experience-card.animate-in,
    .achievement-card.animate-in,
    .detail-item.animate-in,
    .contact-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

const animationStyleSheet = document.createElement('style');
animationStyleSheet.textContent = animationStyles;
document.head.appendChild(animationStyleSheet);

// Project details modal
const projectModal = document.getElementById('projectModal');
const projectModalCategory = document.getElementById('projectModalCategory');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalSummary = document.getElementById('projectModalSummary');
const projectModalOverview = document.getElementById('projectModalOverview');
const projectModalFlow = document.getElementById('projectModalFlow');
const projectModalFeatures = document.getElementById('projectModalFeatures');
const projectModalTech = document.getElementById('projectModalTech');
const projectModalActions = document.getElementById('projectModalActions');
const projectModalAction = document.getElementById('projectModalAction');
const projectModalNote = document.getElementById('projectModalNote');
const projectModalCloseButton = document.querySelector('.project-modal-close');
const projectDetailButtons = document.querySelectorAll('.project-details-trigger');
let lastProjectTrigger = null;

const projectDetails = {
    'the-voice-lounge': {
        title: 'TheVoiceLounge',
        category: 'AppimateSA - Work',
        summary: 'Media and community platform spanning public content and admin workflows for radio, podcast, and studio operations.',
        overview: 'The Voice Lounge brings the public-facing content experience and the back-office admin flow together. It lets people discover and engage with media content while giving the team a structured way to manage radio, podcast, and recording-studio operations from one workflow.',
        flow: [
            'Users discover content through the public experience.',
            'Editors and admins manage radio, podcast, and studio operations.',
            'Publishing and operational updates stay connected across the platform.'
        ],
        features: [
            'Content management for media teams',
            'Operational tooling for radio, podcast, and studio workflows',
            'Responsive web and mobile surfaces'
        ],
        tech: ['Next.js', 'Supabase', 'Expo'],
        action: {
            label: 'Visit Website',
            href: 'https://www.thevoicelounge.co.za/'
        }
    },
    'citizen-tv': {
        title: 'Citizen TV',
        category: 'AppimateSA - Work',
        summary: 'Public-facing citizen-journalism platform for publishing, reviewing, and discovering community stories.',
        overview: 'Citizen TV is built for news and community content. The flow starts with browsing stories, weather, and alerts, then moves into saved items and categories, and finishes with upload and publishing workflows that keep community content moving.',
        flow: [
            'Browse home, weather, alerts, and community stories.',
            'Save items or drill into categories and discovery views.',
            'Upload and publish content into the platform.'
        ],
        features: [
            'Home, weather, alerts, and explore surfaces',
            'Saved items and category browsing',
            'Upload flows for community content'
        ],
        tech: ['Next.js', 'Supabase', 'Expo'],
        action: {
            label: 'Visit Website',
            href: 'https://citizentv.vercel.app/'
        }
    },
    'appimate-business': {
        title: 'Appimate Business',
        category: 'AppimateSA - Work',
        summary: 'Business intelligence platform for invoicing, quotations, payroll, reporting, and analytics.',
        overview: 'Appimate Business is the front-end for a business intelligence platform that handles invoicing, quotations, payroll, reporting, and analytics. The experience starts with business data capture, then moves into day-to-day operations, and ends with dashboards and reporting that help teams make decisions.',
        flow: [
            'Capture business data and operational records.',
            'Create invoices, quotations, payroll entries, and related workflows.',
            'Review dashboards, quick actions, and reporting insights.'
        ],
        features: [
            'Invoice, quote, payroll, reporting, and analytics workflows',
            'Dashboard experience with quick actions and key indicators',
            'Pricing and product flows for business users'
        ],
        tech: ['Next.js', 'TypeScript', 'Convex'],
        action: {
            label: 'Visit Website',
            href: 'https://business.appimate.com'
        }
    },
    'appimate-api': {
        title: 'Appimate API Server',
        category: 'AppimateSA - Work',
        summary: 'Backend infrastructure for Appimate Business, covering authentication, realtime, file handling, payments, and automation.',
        overview: 'The Appimate API Server powers the Appimate ecosystem. It exposes production backend services for authentication, realtime communication, file handling, payments, notifications, and automation that keep the business platform moving.',
        flow: [
            'Client apps call REST endpoints and realtime sockets.',
            'Authentication and role-based access keep data secure.',
            'Background jobs handle files, video, cron work, and notifications.'
        ],
        features: [
            'REST endpoints with JWT authentication',
            'Role-based access control and Socket.io realtime',
            'MySQL, Redis, Drizzle, Swagger/OpenAPI, Sentry, and AI integrations'
        ],
        tech: ['Node.js', 'TypeScript', 'Express', 'Socket.io', 'MySQL', 'Redis'],
        note: 'Private repository. The code is not linked publicly, but the work is represented here.'
    },
    blockbuster: {
        title: 'BlockBuster',
        category: 'Personal Project',
        summary: 'Xamarin.Forms Android game with three difficulty levels, an AI opponent, and a mobile gameplay loop.',
        overview: 'BlockBuster is a Xamarin.Forms Android game built as a final-year BCom Information Systems project. The experience covers game setup, difficulty selection, AI opponent play, and a mobile gameplay loop designed for cross-platform use.',
        flow: [
            'Choose a difficulty level.',
            'Play against the AI opponent through the game loop.',
            'Use the mobile-friendly interface across supported platforms.'
        ],
        features: [
            'Three difficulty levels',
            'AI opponent',
            'Xamarin.Forms and cross-platform mobile support'
        ],
        tech: ['Xamarin.Forms', 'C#', 'XAML', 'SQLite'],
        note: 'Private repository.'
    },
    craftsphere: {
        title: 'CraftSphere',
        category: 'Personal Project',
        summary: 'Next.js application for MSMEs to map customer journeys and conduct pre-call surveys.',
        overview: 'CraftSphere is a Next.js application for MSMEs to map customer journeys and conduct pre-call surveys. It combines authentication, role-based access, and a dashboard so teams can move from intake to insight in one place.',
        flow: [
            'Authenticate users and route them by role.',
            'Capture survey and journey data.',
            'Review analytics and manage workflows from the dashboard.'
        ],
        features: [
            'Role-based access and protected routes',
            'Supabase-backed authentication and storage',
            'Customer, admin, and artisan workflows'
        ],
        tech: ['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'TypeScript'],
        action: {
            label: 'View Code',
            href: 'https://github.com/LettersBlue/CraftSphere'
        }
    },
    'ai-smme-app': {
        title: 'AI SMME App',
        category: 'Hackathon Project',
        summary: 'AI-powered funding application platform that uses voice-to-text and guided workflows to produce submission-ready applications.',
        overview: 'The AI SMME App helps entrepreneurs turn funding ideas into structured applications. The workflow uses voice-to-text and guided prompts to match applicants with opportunities and produce submission-ready applications.',
        flow: [
            'Capture an idea through voice or guided input.',
            'Match the application to suitable funding opportunities.',
            'Generate a cleaner submission-ready application.'
        ],
        features: [
            'Voice-to-text intake',
            'Funding opportunity matching',
            'Guided application generation'
        ],
        tech: ['Python', 'TensorFlow', 'FastAPI'],
        action: {
            label: 'Visit Website',
            href: 'https://ai-smme-funding.fsell.app'
        }
    }
};

function renderChipList(container, values) {
    if (!container) {
        return;
    }

    container.innerHTML = '';
    values.forEach((value) => {
        const chip = document.createElement('span');
        chip.className = 'tech-tag';
        chip.textContent = value;
        container.appendChild(chip);
    });
}

function renderBulletList(container, values) {
    if (!container) {
        return;
    }

    container.innerHTML = '';
    values.forEach((value) => {
        const item = document.createElement('li');
        item.textContent = value;
        container.appendChild(item);
    });
}

function openProjectModal(projectKey, trigger) {
    if (!projectModal) {
        return;
    }

    const project = projectDetails[projectKey];
    if (!project) {
        return;
    }

    lastProjectTrigger = trigger || null;

    if (projectModalCategory) {
        projectModalCategory.textContent = project.category;
    }

    if (projectModalTitle) {
        projectModalTitle.textContent = project.title;
    }

    if (projectModalSummary) {
        projectModalSummary.textContent = project.summary;
    }

    if (projectModalOverview) {
        projectModalOverview.textContent = project.overview;
    }

    renderBulletList(projectModalFlow, project.flow || []);
    renderBulletList(projectModalFeatures, project.features || []);
    renderChipList(projectModalTech, project.tech || []);

    if (projectModalActions) {
        projectModalActions.hidden = !project.action;
    }

    if (projectModalAction) {
        if (project.action) {
            projectModalAction.hidden = false;
            projectModalAction.textContent = project.action.label;
            projectModalAction.href = project.action.href;
            projectModalAction.target = '_blank';
            projectModalAction.rel = 'noopener noreferrer';
        } else {
            projectModalAction.hidden = true;
        }
    }

    if (projectModalNote) {
        if (project.note) {
            projectModalNote.hidden = false;
            projectModalNote.textContent = project.note;
        } else {
            projectModalNote.hidden = true;
            projectModalNote.textContent = '';
        }
    }

    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (projectModalCloseButton) {
        setTimeout(() => projectModalCloseButton.focus(), 0);
    }
}

function closeProjectModal() {
    if (!projectModal || !projectModal.classList.contains('is-open')) {
        return;
    }

    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastProjectTrigger && typeof lastProjectTrigger.focus === 'function') {
        lastProjectTrigger.focus();
    }
}

projectDetailButtons.forEach((button) => {
    button.addEventListener('click', () => {
        openProjectModal(button.dataset.project, button);
    });
});

document.querySelectorAll('[data-modal-close]').forEach((element) => {
    element.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProjectModal();
    }
});

// Typing effect for hero subtitle (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Initialize typing effect on page load
document.addEventListener('DOMContentLoaded', () => {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        typeWriter(heroSubtitle, originalText, 30);
    }

    // Add stagger delays to project cards
    const projectCards = document.querySelectorAll('.projects-grid .project-card');
    projectCards.forEach((card, index) => {
        card.classList.add(`stagger-${Math.min(index + 1, 9)}`);
    });

    // Add stagger delays to achievement cards
    const achievementCards = document.querySelectorAll('.achievements-grid .achievement-card');
    achievementCards.forEach((card, index) => {
        card.classList.add(`stagger-${Math.min(index + 1, 9)}`);
    });
});
