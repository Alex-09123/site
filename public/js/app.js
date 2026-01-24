/* --------------------------------------------------------------
   public/js/app.js
   Одинаковый скрипт для всех страниц проекта:
   - index.html    – форма входа
   - register.html – форма регистрации
   - profile.html  – личный кабинет, редактирование и удаление
   -------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------- Общие утилиты ---------------------- */
    const API_ROOT = '/assignment7/api';   // <-- если ваш проект обслуживается в подпапке /assignment7/
    // Если приложение монтировано в корень сайта (без /assignment7), замените на '/api'

    // ---------- Токен ----------
    const setToken   = token => localStorage.setItem('token', token);
    const getToken   = () => localStorage.getItem('token');
    const clearToken = () => localStorage.removeItem('token');

    // ---------- Формирование заголовков с токеном ----------
    const addAuthHeader = (options = {}) => {
        const token = getToken();
        if (!options.headers) options.headers = {};
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        return options;
    };

    // ---------- Утилита вывода сообщений ----------
    const showMsg = (elem, text, type = 'error') => {
        if (!elem) return;
        elem.textContent = text;
        elem.className = type;                 // .error или .success (по CSS)
        // авто‑очистка через 4 сек
        setTimeout(() => { elem.textContent = ''; elem.className = ''; }, 4000);
    };

    /* -------------------- Определяем, где мы сейчас -------------------- */
    const page = location.pathname.split('/').pop(); // index.html, register.html, profile.html

    /* ---------------------------- 1️⃣ Страница входа ---------------------------- */
    if (page === 'index.html' || page === '' || page === '/') {
        const form = document.getElementById('loginForm');
        const err  = document.getElementById('loginError');

        if (!form) return; // защита в случае, если скрипт попал на другую страницу

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const email    = form.email.value.trim();
            const password = form.password.value.trim();

            try {
                const resp = await fetch(`${API_ROOT}/auth/login`, {
                    method : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body   : JSON.stringify({ email, password })
                });
                const data = await resp.json();

                if (!resp.ok) throw new Error(data.msg || (data.errors?.[0]?.msg) || 'Ошибка входа');

                setToken(data.token);
                // Перенаправляем в личный кабинет
                location.href = 'profile.html';
            } catch (err) {
                showMsg(err, err.message);
            }
        });
        return; // дальше скрипт ничего не делает
    }

    /* ---------------------------- 2️⃣ Страница регистрации ---------------------------- */
    if (page === 'register.html') {
        const form   = document.getElementById('registerForm');
        const err    = document.getElementById('regError');
        const suc    = document.getElementById('regSuccess');

        if (!form) return;

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const name     = form.name.value.trim();
            const email    = form.email.value.trim();
            const password = form.password.value.trim();

            try {
                const resp = await fetch(`${API_ROOT}/auth/register`, {
                    method : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body   : JSON.stringify({ name, email, password })
                });
                const data = await resp.json();

                if (!resp.ok) throw new Error(data.msg || (data.errors?.[0]?.msg) || 'Ошибка регистрации');

                setToken(data.token);
                showMsg(suc, 'Регистрация прошла успешно! Перенаправляем...', 'success');
                setTimeout(() => (location.href = 'profile.html'), 1500);
            } catch (err) {
                showMsg(err, err.message);
            }
        });
        return;
    }

    /* ---------------------------- 3️⃣ Страница профиля ---------------------------- */
    if (page === 'profile.html') {
        // Если токена нет – отправляем обратно на страницу входа
        if (!getToken()) {
            location.href = 'index.html';
            return;
        }

        const avatarImg   = document.getElementById('avatarImg');
        const form        = document.getElementById('profileForm');
        const errMsg      = document.getElementById('profileError');
        const sucMsg      = document.getElementById('profileSuccess');
        const deleteBtn   = document.getElementById('deleteBtn');
        const logoutBtn   = document.getElementById('logoutBtn');

        if (!form) return;

        // ---------- Функция получения текущих данных ----------
        const loadProfile = async () => {
            try {
                const resp = await fetch(`${API_ROOT}/users/me`, addAuthHeader());
                const user = await resp.json();

                if (!resp.ok) throw new Error(user.msg || 'Не удалось загрузить профиль');

                // Заполняем форму
                form.name.value  = user.name  || '';
                form.email.value = user.email || '';
                // Аватар
                if (user.avatar) {
                    avatarImg.src = user.avatar;
                } else {
                    avatarImg.removeAttribute('src');
                }
            } catch (err) {
                showMsg(errMsg, err.message);
            }
        };
        loadProfile();

        // ---------- Сохранить изменения ----------
        form.addEventListener('submit', async e => {
            e.preventDefault();

            const name     = form.name.value.trim();
            const email    = form.email.value.trim();
            const password = form.password.value.trim(); // может быть пустым
            const file     = form.avatar?.files?.[0];

            const fd = new FormData();
            fd.append('name', name);
            fd.append('email', email);
            if (password) fd.append('password', password);
            if (file) fd.append('avatar', file);

            try {
                const resp = await fetch(`${API_ROOT}/users/me`, {
                    method : 'PUT',
                    ...addAuthHeader(),
                    body   : fd
                });
                const data = await resp.json();

                if (!resp.ok) throw new Error(data.msg || (data.errors?.[0]?.msg) || 'Не удалось сохранить');

                showMsg(sucMsg, 'Данные успешно обновлены', 'success');

                // Обновляем аватар, если он изменён
                if (data.avatar) avatarImg.src = data.avatar;
            } catch (err) {
                showMsg(errMsg, err.message);
            }
        });

        // ---------- Удалить аккаунт ----------
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Точно удалить аккаунт? Действие необратимо!')) return;

            try {
                const resp = await fetch(`${API_ROOT}/users/me`, {
                    method : 'DELETE',
                    ...addAuthHeader()
                });
                const data = await resp.json();

                if (!resp.ok) throw new Error(data.msg || 'Не удалось удалить');

                clearToken();
                alert('Аккаунт удалён');
                location.href = 'index.html';
            } catch (err) {
                showMsg(errMsg, err.message);
            }
        });

        // ---------- Выход ----------
        logoutBtn.addEventListener('click', () => {
            clearToken();
            location.href = 'index.html';
        });

        return;
    }

    
});