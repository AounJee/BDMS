const navLinks = document.querySelectorAll('.nav-link');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
    }

    initUIComponents();
});

// Initialize all UI components (reused from user_dashboard.js)
function initUIComponents() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                link.closest('.nav-item').classList.add('active');
                
                const linkText = link.querySelector('span').textContent;
                document.querySelector('.page-title').textContent = linkText;
            }
        });
    });

    document.querySelector('.notifications').addEventListener('click', () => {
        alert('Notifications clicked!');
    });

    document.querySelector('.user-profile').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// Populate user profile information
function populateUserProfile(user) {
    document.querySelector('.user-name').textContent = user.username || `${user.firstName} ${user.lastName}`;
    if (user.profilePicUrl) {
        document.getElementById('profile-pic-header').src = user.profilePicUrl;
    }
}