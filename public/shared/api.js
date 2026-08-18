/* Shared helpers used by all three front-ends (login, portal1, portal2, admin) */

const Auth = {
    getToken() {
        return localStorage.getItem('token');
    },
    getUser() {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    },
    save(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
