// Page Loading Handler
window.addEventListener('load', () => {
    // Remove loading state after a small delay to show animations
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 500);
});

// Set loading state initially
document.body.classList.add('loading');

// Navigation, scrollspy, and theme controls
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const mobileNavDialog = document.querySelector('.mobile-nav-dialog');
const mobileNavClose = document.querySelector('.mobile-nav-close');
const mobileNavLinks = document.querySelector('.mobile-nav-links');
const navIndicator = document.querySelector('.nav-indicator');
const navLinks = Array.from(document.querySelectorAll('.nav-link, .mobile-nav-link'));
const trackedSections = Array.from(new Set(navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)));
const themeToggle = document.getElementById('themeToggle');
const themeStorageKey = 'lettersblue-theme';
let mobileNavCloseTimer;

function getPreferredTheme() {
    try {
        const storedTheme = window.localStorage.getItem(themeStorageKey);
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
    } catch (error) {
        // Ignore storage access issues and fall back to system preference.
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
        window.localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
        // Ignore storage failures; theme still applies for this session.
    }

    if (themeToggle) {
        themeToggle.dataset.theme = theme;
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

setTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

function setMobileMenuState(isOpen) {
    if (!navToggle) {
        return;
    }

    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('mobile-nav-open', isOpen);
}

function openMobileMenu() {
    if (!mobileNavDialog || mobileNavDialog.open || window.innerWidth > 768) {
        return;
    }

    window.clearTimeout(mobileNavCloseTimer);
    mobileNavDialog.classList.remove('is-closing');
    mobileNavDialog.showModal();
    setMobileMenuState(true);
    window.requestAnimationFrame(updateNavigationState);
}

function closeMobileMenu({ returnFocus = false, immediate = false } = {}) {
    if (!mobileNavDialog || !mobileNavDialog.open) {
        setMobileMenuState(false);
        return;
    }

    setMobileMenuState(false);
    window.clearTimeout(mobileNavCloseTimer);

    const finishClose = () => {
        if (mobileNavDialog.open) {
            mobileNavDialog.close();
        }
        mobileNavDialog.classList.remove('is-closing');
        if (returnFocus && navToggle) {
            navToggle.focus();
        }
    };

    if (immediate) {
        finishClose();
        return;
    }

    mobileNavDialog.classList.add('is-closing');
    mobileNavCloseTimer = window.setTimeout(finishClose, 180);
}

if (navToggle && mobileNavDialog) {
    navToggle.addEventListener('click', () => {
        if (mobileNavDialog.open) {
            closeMobileMenu({ returnFocus: true });
        } else {
            openMobileMenu();
        }
    });

    mobileNavClose?.addEventListener('click', () => {
        closeMobileMenu({ returnFocus: true });
    });

    mobileNavDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeMobileMenu({ returnFocus: true });
    });

    mobileNavDialog.addEventListener('click', (event) => {
        if (event.target === mobileNavDialog) {
            closeMobileMenu({ returnFocus: true });
        }
    });
}

function scrollToSection(targetSection) {
    if (!targetSection) {
        return;
    }

    const navbarOffset = navbar ? navbar.offsetHeight : 70;
    const offsetTop = Math.max(targetSection.getBoundingClientRect().top + window.scrollY - navbarOffset - 10, 0);

    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        scrollToSection(targetSection);
        closeMobileMenu();
    });
});

function getNavigationProgress() {
    if (trackedSections.length < 2) {
        return 0;
    }

    const navbarOffset = navbar ? navbar.offsetHeight : 70;
    const probeLine = window.scrollY + navbarOffset + (window.innerHeight * 0.35);
    const sectionStops = trackedSections.map((section) => section.offsetTop - 12);

    if (probeLine <= sectionStops[0]) {
        return 0;
    }

    for (let index = 0; index < sectionStops.length - 1; index += 1) {
        const currentStop = sectionStops[index];
        const nextStop = sectionStops[index + 1];

        if (probeLine <= nextStop) {
            const distance = Math.max(nextStop - currentStop, 1);
            const sectionProgress = Math.min(Math.max((probeLine - currentStop) / distance, 0), 1);
            return (index + sectionProgress) / (sectionStops.length - 1);
        }
    }

    return 1;
}

function updateDesktopNavProgress(progress) {
    if (!navIndicator || !navMenu || window.innerWidth <= 768) {
        return;
    }

    const desktopLinks = Array.from(navMenu.querySelectorAll('.nav-link'));
    const firstLink = desktopLinks[0];
    const lastLink = desktopLinks[desktopLinks.length - 1];

    if (!firstLink || !lastLink) {
        return;
    }

    const menuRect = navMenu.getBoundingClientRect();
    const firstRect = firstLink.getBoundingClientRect();
    const lastRect = lastLink.getBoundingClientRect();
    const start = firstRect.left - menuRect.left;
    const end = lastRect.right - menuRect.left;
    const trackLength = Math.max(end - start, 0);

    navMenu.style.setProperty('--nav-progress-start', `${start}px`);
    navMenu.style.setProperty('--nav-progress-track', `${trackLength}px`);
    navMenu.style.setProperty('--nav-progress-fill', `${trackLength * progress}px`);
}

function updateMobileNavProgress(progress) {
    if (!mobileNavDialog?.open || !mobileNavLinks) {
        return;
    }

    const drawerLinks = Array.from(mobileNavLinks.querySelectorAll('.mobile-nav-link'));
    const firstLink = drawerLinks[0];
    const lastLink = drawerLinks[drawerLinks.length - 1];

    if (!firstLink || !lastLink) {
        return;
    }

    const linksRect = mobileNavLinks.getBoundingClientRect();
    const firstRect = firstLink.getBoundingClientRect();
    const lastRect = lastLink.getBoundingClientRect();
    const start = firstRect.top + (firstRect.height / 2) - linksRect.top;
    const end = lastRect.top + (lastRect.height / 2) - linksRect.top;
    const trackLength = Math.max(end - start, 0);

    mobileNavLinks.style.setProperty('--mobile-progress-start', `${start}px`);
    mobileNavLinks.style.setProperty('--mobile-progress-track', `${trackLength}px`);
    mobileNavLinks.style.setProperty('--mobile-progress-fill', `${trackLength * progress}px`);
}

function updateNavigationProgress() {
    const progress = getNavigationProgress();
    updateDesktopNavProgress(progress);
    updateMobileNavProgress(progress);
}

function getCurrentSectionId() {
    if (!trackedSections.length) {
        return '';
    }

    const navbarOffset = navbar ? navbar.offsetHeight : 70;
    const probeLine = window.scrollY + navbarOffset + (window.innerHeight * 0.35);
    let currentId = trackedSections[0].id;

    trackedSections.forEach((section) => {
        if (probeLine >= section.offsetTop - 12) {
            currentId = section.id;
        }
    });

    return currentId;
}

function updateNavigationState() {
    const currentId = getCurrentSectionId();

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('active', isActive);
    });

    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }

    updateNavigationProgress();
}

window.addEventListener('scroll', updateNavigationState, { passive: true });
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu({ immediate: true });
    }
    updateNavigationState();
});
window.addEventListener('load', updateNavigationState);
updateNavigationState();

function sampleDominantColor(image) {
    const sampleSize = 24;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
        return null;
    }

    canvas.width = sampleSize;
    canvas.height = sampleSize;
    context.clearRect(0, 0, sampleSize, sampleSize);
    context.drawImage(image, 0, 0, sampleSize, sampleSize);

    const { data } = context.getImageData(0, 0, sampleSize, sampleSize);
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let weightTotal = 0;

    for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha < 24) {
            continue;
        }

        const weight = alpha / 255;
        redTotal += data[index] * weight;
        greenTotal += data[index + 1] * weight;
        blueTotal += data[index + 2] * weight;
        weightTotal += weight;
    }

    if (!weightTotal) {
        return null;
    }

    return {
        red: Math.round(redTotal / weightTotal),
        green: Math.round(greenTotal / weightTotal),
        blue: Math.round(blueTotal / weightTotal)
    };
}

function getTintAlpha(rgb) {
    const luminance = ((0.2126 * rgb.red) + (0.7152 * rgb.green) + (0.0722 * rgb.blue)) / 255;

    if (luminance > 0.75) {
        return 0.28;
    }

    if (luminance < 0.4) {
        return 0.18;
    }

    return 0.22;
}

function applyProjectImageAccents() {
    document.querySelectorAll('.projects-grid .project-card').forEach((card) => {
        const imageFrame = card.querySelector('.project-image');
        const image = card.querySelector('.project-image img');

        if (!imageFrame || !image) {
            return;
        }

        if (imageFrame.dataset.projectAccentLock === 'true') {
            return;
        }

        const paintAccent = () => {
            try {
                const rgb = sampleDominantColor(image);
                if (!rgb) {
                    return;
                }

                const alpha = getTintAlpha(rgb);
                imageFrame.style.background = `linear-gradient(135deg, rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha}), var(--surface))`;
                imageFrame.style.boxShadow = `inset 0 0 0 1px rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, 0.18)`;
                card.classList.add('has-project-accent');
            } catch (error) {
                // Leave the existing static project frame styling in place.
            }
        };

        if (image.complete && image.naturalWidth > 0) {
            paintAccent();
        } else {
            image.addEventListener('load', paintAccent, { once: true });
        }
    });
}

window.addEventListener('load', applyProjectImageAccents);

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
