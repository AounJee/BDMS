const navLinks = document.querySelectorAll('.nav-link');

// DOM Elements for Profile
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const profilePic = document.getElementById('profile-pic');
const profilePicHeader = document.getElementById('profile-pic-header');
const profilePicUpload = document.getElementById('profile-pic-upload');
const saveChangesBtn = document.getElementById('save-changes');

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

    // Profile Picture Upload Handler
    profilePicUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePic.src = event.target.result;
                profilePicHeader.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save Changes Handler
    saveChangesBtn.addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('email', emailInput.value);
        formData.append('password', passwordInput.value);
        formData.append('username', usernameInput.value);
        if (profilePicUpload.files[0]) {
            formData.append('profilePic', profilePicUpload.files[0]);
        }

        try {
            const response = await fetch('/api/auth/update', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();
            if (response.ok) {
                alert('Profile updated successfully!');
                // Update the header username
                document.querySelector('.user-name').textContent = usernameInput.value;
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Populate user profile information
function populateUserProfile(user) {
    document.querySelector('.user-name').textContent = user.username || `${user.firstName} ${user.lastName}`;
    usernameInput.value = user.username || '';
    emailInput.value = user.email || '';
    passwordInput.value = ''; // Password is not returned for security reasons
    if (user.profilePicUrl) {
        profilePic.src = user.profilePicUrl;
        profilePicHeader.src = user.profilePicUrl;
    }
}