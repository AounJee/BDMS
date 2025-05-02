document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
  loadRecentDonations();
});

async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/dashboard-stats', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load stats');
    const stats = await res.json();
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
      statValues[0].textContent = stats.totalDonors;
      statValues[1].textContent = stats.totalDonations;
      statValues[2].textContent = stats.pendingRequests;
      statValues[3].textContent = stats.upcomingAppointments;
    }
  } catch (e) {
    console.error('Error loading dashboard stats:', e);
  }
}

async function loadRecentDonations() {
  try {
    const res = await fetch('/api/admin/donations', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load donations');
    const donations = await res.json();
    const tbody = document.querySelector('.recent-donations-card .donation-table tbody');
    tbody.innerHTML = '';
    donations.slice(0, 5).forEach(donation => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(donation.donationDate).toLocaleDateString()}</td>
        <td>${donation.donor && donation.donor.userId ? donation.donor.userId : 'N/A'}</td>
        <td>${donation.donor && donation.donor.bloodType ? donation.donor.bloodType : 'N/A'}</td>
        <td>${donation.amountMl} ml</td>
        <td><span class="status ${donation.status.toLowerCase()}">${donation.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (e) {
    console.error('Error loading recent donations:', e);
  }
}