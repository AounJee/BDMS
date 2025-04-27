const navLinks = document.querySelectorAll('.nav-link');

// Auth Check and Data Loading
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await AuthService.checkAuth();
        if (!user) {
            throw new Error('Not authenticated');
        }

        populateUserProfile(user);
        await loadHistoryData(user.id);
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
    document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName}`;
}

// Load donation history data from API
async function loadHistoryData(userId) {
    try {
        const response = await fetch(`/api/donors/${userId}/history`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load donation history');
        }

        const history = await response.json();
        const tableBody = document.getElementById('donation-history-table');

        // Clear existing rows
        tableBody.innerHTML = '';

        // Populate table with donation history
        history.forEach(donation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${donation.date}</td>
                <td>${donation.hospital}</td>
                <td>${donation.bloodType}</td>
                <td>${donation.amount}</td>
                <td><span class="status completed">${donation.status}</span></td>
            `;
            tableBody.appendChild(row);
        });

        // If no donations, show a message
        if (history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No donation history available.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading donation history:', error);
        useSampleHistoryData();
    }
}

// Fallback to sample data if API fails
function useSampleHistoryData() {
    const sampleHistory = [
        { date: 'Sep 15, 2023', hospital: 'Central Blood Bank', bloodType: 'O+', amount: '450 ml', status: 'Completed' },
        { date: 'Jun 12, 2023', hospital: 'Community Drive', bloodType: 'O+', amount: '450 ml', status: 'Completed' },
        { date: 'Mar 03, 2023', hospital: 'University Hospital', bloodType: 'O+', amount: '450 ml', status: 'Completed' }
    ];

    const tableBody = document.getElementById('donation-history-table');
    tableBody.innerHTML = '';

    sampleHistory.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.hospital}</td>
            <td>${donation.bloodType}</td>
            <td>${donation.amount}</td>
            <td><span class="status completed">${donation.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}