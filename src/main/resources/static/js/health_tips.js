const navLinks = document.querySelectorAll('.nav-link');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
        await loadHealthTips();
    } catch (error) {
        console.error('Auth check failed:', error);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 5000);
    }

    initUIComponents();
});

// Initialize all UI components
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
        await AuthService.logout();
    });
}

// Populate user profile information
function populateUserProfile(user) {
    document.querySelector('.user-name').textContent = user.username || `${user.firstName} ${user.lastName}`;
    if (user.profilePicUrl) {
        document.getElementById('profile-pic-header').src = user.profilePicUrl;
    }
}

// Load health tips from API
async function loadHealthTips() {
    try {
        const response = await fetch('/api/health-tips', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load health tips');
        }

        const tips = await response.json();
        const tipsContainer = document.querySelector('.tips-container');
        tipsContainer.innerHTML = '';

        if (tips.length === 0) {
            tipsContainer.innerHTML = '<p>No health tips available.</p>';
            return;
        }

        tips.forEach(tip => {
            const tipDiv = document.createElement('div');
            tipDiv.classList.add('health-tip');
            tipDiv.innerHTML = `
                <div class="tip-icon">
                    <i class="bi bi-heart-pulse"></i>
                </div>
                <div class="tip-content">
                    <h3>${tip.title}</h3>
                    <p>${tip.content}</p>
                </div>
            `;
            tipsContainer.appendChild(tipDiv);
        });
    } catch (error) {
        console.error('Error loading health tips:', error);
        useSampleHealthTips();
    }
}

// Fallback to sample data
function useSampleHealthTips() {
    const sampleTips = [
        { title: 'Stay Hydrated', content: 'Drink plenty of water before and after donation to help your body recover quickly.' },
        { title: 'Eat Iron-Rich Foods', content: 'Include foods like spinach, red meat, and beans in your diet to maintain healthy iron levels.' },
        { title: 'Rest Properly', content: 'Get a good night\'s sleep before donation and avoid strenuous activity for 24 hours after.' }
    ];

    const tipsContainer = document.querySelector('.tips-container');
    tipsContainer.innerHTML = '';

    sampleTips.forEach(tip => {
        const tipDiv = document.createElement('div');
        tipDiv.classList.add('health-tip');
        tipDiv.innerHTML = `
            <div class="tip-icon">
                <i class="bi bi-heart-pulse"></i>
            </div>
            <div class="tip-content">
                <h3>${tip.title}</h3>
                <p>${tip.content}</p>
            </div>
        `;
        tipsContainer.appendChild(tipDiv);
    });
}