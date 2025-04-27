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
    document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName}`;
}

// Load donation history data from API
async function loadHistoryData(userId) {
    try {
        const response = await fetch(`/api/donations/me`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to load donation history');
        }

        const history = await response.json();
        const tableBody = document.getElementById('donation-history-table');

        tableBody.innerHTML = '';

        if (history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No donation history available.</td></tr>';
            return;
        }

        for (const donation of history) {
            const centerResponse = await fetch(`/api/donation-centers/${donation.centerId}`, { credentials: 'include' });
            const center = await centerResponse.json();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(donation.donationDate).toLocaleDateString()}</td>
                <td>${center.name}</td>
                <td>${donation.donor.bloodType}</td>
                <td>${donation.amountMl} ml</td>
                <td><span class="status ${donation.status.toLowerCase()}">${donation.status}</span></td>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading donation history:', error);
        useSampleHistoryData();
    }
}

// Fallback to sample data
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