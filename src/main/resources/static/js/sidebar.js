document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarToggleDesktop = document.getElementById('sidebar-toggle-desktop');
  const mainContent = document.querySelector('.main-content');

  // Load the sidebar state from localStorage
  setTimeout(() => {
    const isCollapsed = localStorage.getItem('isSidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('sidebar-collapsed');
    }
  }, 100);

  // Toggle sidebar on mobile
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
    localStorage.setItem('isSidebarCollapsed', sidebar.classList.contains('collapsed'));
  });

  // Toggle sidebar on desktop
  sidebarToggleDesktop.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
    localStorage.setItem('isSidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
});