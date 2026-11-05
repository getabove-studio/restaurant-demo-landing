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
        
        // Очищаем старые текстовые ошибки
        ['name-error', 'phone-error', 'agree-error'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
        
        // Очищаем красную нижнюю линию с полей ввода
        ['modal-name', 'modal-phone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('!border-red-500');
        });
        
        // Удаляем глобальную плашку ошибки, если она была
        const errBox = document.getElementById('form-global-error');
        if (errBox) errBox.remove();

        // Возвращаем стандартный текст ошибки имени (если меняли на "только буквы")
        const nameError = document.getElementById('name-error');
        if (nameError) nameError.textContent = 'Введите имя';
    }
    if (modalSuccess) modalSuccess.classList.add('hidden');
    if (modal) modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Автофокус на поле имени
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
   3. ОТПРАВКА ФОРМЫ В TELEGRAM (С ПРОВЕРКОЙ)
   ========================================= */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');
    const agreeInput = document.getElementById('modal-agree');
    
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const agreeError = document.getElementById('agree-error');

    if (!nameInput || !phoneInput) return;

    // 1. Сбрасываем старые ошибки перед новой проверкой
    [nameInput, phoneInput].forEach(i => i.classList.remove('!border-red-500'));
    if (nameError) nameError.classList.add('hidden');
    if (phoneError) phoneError.classList.add('hidden');
    if (agreeError) agreeError.classList.add('hidden');

    let valid = true;

    // 2. СТРОГАЯ Проверка Имени (только буквы, пробел и дефис, минимум 2 символа)
    const nameValue = nameInput.value.trim();
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/; 
    
    if (nameValue.length < 2 || !nameRegex.test(nameValue)) {
        nameInput.classList.add('!border-red-500');
        if (nameError) {
            nameError.textContent = 'Только буквы (мин. 2 символа)';
            nameError.classList.remove('hidden');
        }
        valid = false;
    }

    // 3. Проверка Телефона (только цифры, длина строго от 10 до 11)
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
        phoneInput.classList.add('!border-red-500');
        if (phoneError) phoneError.classList.remove('hidden');
        valid = false;
    }
    
    // 4. Проверка Чекбокса
    if (agreeInput && !agreeInput.checked) {
        if (agreeError) agreeError.classList.remove('hidden');
        valid = false;
    }

    // Если есть ошибки — прерываем отправку
    if (!valid) return; 

    // --- ЛОГИКА ОТПРАВКИ В TELEGRAM ---
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Отправка...';
    submitBtn.disabled = true;

    // Убираем старую глобальную ошибку, если она была
    const oldErrorBox = document.getElementById('form-global-error');
    if (oldErrorBox) oldErrorBox.remove();

    try {
        const response = await fetch('/.netlify/functions/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: nameValue, 
                phone: phoneInput.value 
            })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        // Успех
        if (modalHeader) modalHeader.classList.add('hidden');
        if (modalForm) modalForm.classList.add('hidden');
        if (modalSuccess) modalSuccess.classList.remove('hidden');
        
        // Очищаем форму после успешной отправки
        modalForm.reset();
        setTimeout(closeModal, 4000);

    } catch (error) {
        console.error('Ошибка отправки:', error);
        
        // Выводим красную плашку под кнопкой
        let errorBox = document.getElementById('form-global-error');
        if (!errorBox) {
            errorBox = document.createElement('p');
            errorBox.id = 'form-global-error';
            errorBox.className = 'text-red-500 text-xs text-center mt-2 font-semibold';
            submitBtn.parentNode.appendChild(errorBox);
        }
        errorBox.textContent = 'Не удалось отправить. Проверьте интернет или попробуйте позже.';
        
    } finally {
        // Возвращаем кнопку в исходное состояние
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