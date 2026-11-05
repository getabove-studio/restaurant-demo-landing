/* =========================================
   1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ========================================= */
const modal = document.getElementById('booking-modal');
const modalForm = document.getElementById('modal-form');
const modalSuccess = document.getElementById('modal-success');
const modalHeader = document.getElementById('modal-header');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

/* =========================================
   2. МОДАЛЬНОЕ ОКНО
   ========================================= */
function openModal() {
    if (modalHeader) modalHeader.classList.remove('hidden');
    if (modalForm) {
        modalForm.reset();
        modalForm.classList.remove('hidden');
        // Очищаем старые ошибки
        ['name-error', 'phone-error', 'agree-error'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
    }
    if (modalSuccess) modalSuccess.classList.add('hidden');
    if (modal) modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('modal-name')?.focus(), 50);
}

function closeModal() {
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* =========================================
   3. ОТПРАВКА ФОРМЫ В TELEGRAM
   ========================================= */
async function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('modal-name');
    const phone = document.getElementById('modal-phone');
    const agree = document.getElementById('modal-agree');
    let valid = true;

    // Валидация
    if (!name.value.trim()) {
        name.classList.add('border-red-500'); document.getElementById('name-error').classList.remove('hidden'); valid = false;
    } else name.classList.remove('border-red-500');

    if (phone.value.replace(/\D/g, '').length < 10) {
        phone.classList.add('border-red-500'); document.getElementById('phone-error').classList.remove('hidden'); valid = false;
    } else phone.classList.remove('border-red-500');

    if (!agree.checked) {
        document.getElementById('agree-error').classList.remove('hidden'); valid = false;
    }

    if (!valid) return;

    // Меняем кнопку на "Отправка..."
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Отправка...';
    submitBtn.disabled = true;

    try {
        // Стучимся в нашу Netlify-функцию (она лежит в папке netlify/functions/send-telegram.js)
        const response = await fetch('/.netlify/functions/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name.value, 
                phone: phone.value 
            })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        // Успех
        if (modalHeader) modalHeader.classList.add('hidden');
        if (modalForm) modalForm.classList.add('hidden');
        if (modalSuccess) modalSuccess.classList.remove('hidden');
        setTimeout(closeModal, 4000);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        // Вместо alert выводим красивую красную плашку прямо в форме
        let errorBox = document.getElementById('form-global-error');
        if (!errorBox) {
            errorBox = document.createElement('p');
            errorBox.id = 'form-global-error';
            errorBox.className = 'text-red-500 text-xs text-center mt-2';
            submitBtn.parentNode.appendChild(errorBox);
        }
        errorBox.textContent = 'Не удалось отправить. Попробуйте позже.';
        
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

document.getElementById('modal-form')?.addEventListener('submit', handleFormSubmit);

/* =========================================
   4. МОБИЛЬНОЕ МЕНЮ
   ========================================= */
function toggleMenu() {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.contains('translate-x-0');
    
    if (isOpen) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('menu-open');
    } else {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.classList.add('menu-open');
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
}

/* =========================================
   5. ВКЛАДКИ МЕНЮ
   ========================================= */
function openMenuTab(tabId, btnElement) {
    document.querySelectorAll('.menu-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.menu-tab-content').forEach(content => content.classList.remove('active'));
    btnElement.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
}

/* =========================================
   6. АНИМАЦИИ ПРИ СКРОЛЛЕ
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach(reveal => revealOnScroll.observe(reveal));
});

/* =========================================
   7. СКРЫТИЕ ПЛАВАЮЩЕЙ КНОПКИ В ФУТЕРЕ
   ========================================= */
const floatingBtn = document.getElementById('floating-btn');
const footer = document.getElementById('contacts');

if (floatingBtn && footer) {
    window.addEventListener('scroll', () => {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight - 50) {
            floatingBtn.classList.add('translate-y-24', 'opacity-0');
            floatingBtn.classList.remove('translate-y-0', 'opacity-100');
        } else {
            floatingBtn.classList.remove('translate-y-24', 'opacity-0');
            floatingBtn.classList.add('translate-y-0', 'opacity-100');
        }
    });
}