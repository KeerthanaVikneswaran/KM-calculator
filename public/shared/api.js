/* Shared helpers used by all three front-ends (login, portal1, portal2, admin) */

/* Some in-app browsers (WhatsApp/Instagram/etc.) or strict privacy modes
   block localStorage entirely and throw instead of just returning null.
   These wrappers stop that from crashing the page with an uncaught error. */
function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}
function safeStorageSet(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (err) { return false; }
}
function safeStorageRemove(key) {
    try { localStorage.removeItem(key); } catch (err) { /* ignore */ }
}

const Auth = {
    getToken() {
        return safeStorageGet('token');
    },
    getUser() {
        const raw = safeStorageGet('user');
        return raw ? JSON.parse(raw) : null;
    },
    save(token, user) {
        const ok = safeStorageSet('token', token) && safeStorageSet('user', JSON.stringify(user));
        if (!ok) {
            throw new Error('This browser is blocking site storage, so login can\'t be saved. Please open this page directly in Chrome or Safari (not inside WhatsApp/Instagram/another app\'s browser) and try again.');
        }
    },
    logout() {
        safeStorageRemove('token');
        safeStorageRemove('user');
        window.location.href = '/';
    },
    requireRole(...roles) {
        const user = Auth.getUser();
        if (!Auth.getToken() || !user || !roles.includes(user.role)) {
            window.location.href = '/';
        }
        return user;
    }
};

async function apiFetch(url, options = {}) {
    const headers = Object.assign(
        { 'Content-Type': 'application/json' },
        options.headers || {}
    );
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        Auth.logout();
        throw new Error('Session expired, please log in again');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function statusBadge(status) {
    const map = {
        'Completed': 'bg-success',
        'KM Pending': 'bg-warning text-dark',
        'Bus Pending': 'bg-info text-dark'
    };
    const cls = map[status] || 'bg-secondary';
    return `<span class="badge ${cls}">${status}</span>`;
}
