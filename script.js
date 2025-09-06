// UniDate - JavaScript para Interatividade
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do DOM
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const heroLearnBtn = document.getElementById('heroLearnBtn');
    
    // Navbar Scroll Effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile Menu Toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
    
    // Modal Functions
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Login Modal Events
    loginBtn.addEventListener('click', function() {
        openModal(loginModal);
    });
    
    heroRegisterBtn.addEventListener('click', function() {
        openModal(registerModal);
    });
    
    closeLoginModal.addEventListener('click', function() {
        closeModal(loginModal);
    });
    
    closeRegisterModal.addEventListener('click', function() {
        closeModal(registerModal);
    });
    
    // Register Modal Events
    registerBtn.addEventListener('click', function() {
        openModal(registerModal);
    });
    
    // Switch between Login and Register modals
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => openModal(registerModal), 150);
    });
    
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(registerModal);
        setTimeout(() => openModal(loginModal), 150);
    });
    
    // Close modals when clicking outside
    [loginModal, registerModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (loginModal.classList.contains('active')) {
                closeModal(loginModal);
            }
            if (registerModal.classList.contains('active')) {
                closeModal(registerModal);
            }
        }
    });
    
    // Form Validation and Submission
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    // Login Form
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        // Email validation for institutional email
        if (!email.includes('@') || !email.includes('.edu.br')) {
            showNotification('Por favor, use seu e-mail institucional.', 'error');
            return;
        }
        
        // Simulate login process
        showNotification('Entrando...', 'info');
        
        setTimeout(() => {
            showNotification('Login realizado com sucesso!', 'success');
            closeModal(loginModal);
            // Here you would redirect to the dashboard
            // window.location.href = 'dashboard.html';
        }, 1500);
    });
    
    // Register Form
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        // Email validation for institutional email
        if (!email.includes('@') || !email.includes('.edu.br')) {
            showNotification('Por favor, use seu e-mail institucional.', 'error');
            return;
        }
        
        // Password validation
        if (password.length < 8) {
            showNotification('A senha deve ter pelo menos 8 caracteres.', 'error');
            return;
        }
        
        // Password confirmation
        if (password !== confirmPassword) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }
        
        // Simulate registration process
        showNotification('Criando conta...', 'info');
        
        setTimeout(() => {
            showNotification('Conta criada com sucesso! Verifique seu e-mail.', 'success');
            closeModal(registerModal);
            // Here you would redirect to email verification or dashboard
        }, 2000);
    });
    
    // Notification System
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
            max-width: 400px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }
    
    function getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#6366f1',
            warning: '#f59e0b'
        };
        return colors[type] || colors.info;
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Hero Learn More Button
    heroLearnBtn.addEventListener('click', function() {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
    
    // Add loading animation to buttons
    function addLoadingState(button, text = 'Carregando...') {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            ${text}
        `;
        button.disabled = true;
        
        return function removeLoadingState() {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards for animation
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
    
    // Add parallax effect to floating elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-icon');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // Add hover effects to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Initialize tooltips for better UX
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--gray-800);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease-out;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 10);
                
                this._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    this._tooltip.remove();
                    this._tooltip = null;
                }
            });
        });
    }
    
    // Initialize tooltips
    initTooltips();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Tab navigation for modals
        if (loginModal.classList.contains('active') || registerModal.classList.contains('active')) {
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const modal = loginModal.classList.contains('active') ? loginModal : registerModal;
            const focusableContent = modal.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });
    
    console.log('UniDate - Sistema carregado com sucesso! 🎓');
});
