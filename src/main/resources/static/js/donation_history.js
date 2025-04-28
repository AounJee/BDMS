document.addEventListener('DOMContentLoaded', () => {
    const donations = [
      { id: 1, date: '2023-09-20', donor: 'John Doe', bloodType: 'O+', amount: 450, center: 'Central Blood Bank' },
      { id: 2, date: '2023-09-19', donor: 'Jane Smith', bloodType: 'A-', amount: 450, center: 'Community Blood Drive' },
    ];
  
    let searchTerm = '';
  
    function renderDonations() {
      const filteredDonations = donations.filter(d =>
        d.donor.toLowerCase().includes(searchTerm) || d.bloodType.toLowerCase().includes(searchTerm)
      );
      const tbody = document.getElementById('donation-history-table-body');
      tbody.innerHTML = '';
      filteredDonations.forEach(d => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${d.date}</td>
          <td>${d.donor}</td>
          <td>${d.bloodType}</td>
          <td>${d.amount} ml</td>
          <td>${d.center}</td>
        `;
        tbody.appendChild(row);
      });
    }
  
    document.getElementById('search').addEventListener('input', function(e) {
      searchTerm = e.target.value.toLowerCase();
      renderDonations();
    });
  
    renderDonations();
  });