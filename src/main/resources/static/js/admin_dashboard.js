document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#logout') {
        e.preventDefault();
        alert('Logging out...');
        window.location.href = '/login.html';
      }
    });
  });
});