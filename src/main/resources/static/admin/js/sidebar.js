// Sidebar toggle logic for admin panel
// Assumes sidebar has class 'sidebar' and toggle button has class 'sidebar-toggle'
document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });
    }
}); 