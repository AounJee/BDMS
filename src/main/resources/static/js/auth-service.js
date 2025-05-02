class AuthService {
    static async checkAuth() {
        try {
            const response = await fetch('/api/auth/check', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                window.location.href = '/login.html';
                return null;
            }
            
            return await response.json();
        } catch (error) {
            window.location.href = '/login.html';
            return null;
        }
    }

    static async logout() {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    }
}

// Add logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.querySelector('.sidebar-footer .nav-link:last-child');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }
});