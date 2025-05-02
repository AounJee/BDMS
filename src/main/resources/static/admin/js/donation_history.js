document.addEventListener('DOMContentLoaded', () => {
  let allDonations = [];
  let searchTerm = '';
  loadDonations();
  document.getElementById('search').addEventListener('input', function(e) {
    searchTerm = e.target.value.toLowerCase();
    renderDonations();
  });

  async function loadDonations() {
    try {
      const res = await fetch('/api/admin/donations', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load donations');
      allDonations = await res.json();
      renderDonations();
    } catch (e) {
      console.error('Error loading donations:', e);
    }
  }

  function renderDonations() {
    const filtered = allDonations.filter(d => {
      const donor = d.donor && d.donor.userId ? `Donor #${d.donor.userId}` : '';
      const bloodType = d.donor && d.donor.bloodType ? d.donor.bloodType : '';
      return donor.toLowerCase().includes(searchTerm) || bloodType.toLowerCase().includes(searchTerm);
    });
    const tbody = document.getElementById('donation-history-table-body');
    tbody.innerHTML = '';
    filtered.forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${d.donationDate ? new Date(d.donationDate).toLocaleDateString() : 'N/A'}</td>
        <td>${d.donorName || 'N/A'}</td>
        <td>${d.donor && d.donor.bloodType ? d.donor.bloodType : 'N/A'}</td>
        <td>${d.amountMl} ml</td>
        <td>${d.centerId || 'N/A'}</td>
      `;
      tbody.appendChild(row);
    });
  }
});