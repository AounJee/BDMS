document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarToggleDesktop = document.getElementById('sidebar-toggle-desktop');
  const mainContent = document.querySelector('.main-content');
  
  // Check if we're on mobile
  const isMobile = () => window.innerWidth <= 768;
  
  // Helper: Set collapsed state with mobile vs desktop handling
  function setSidebarState() {
    const savedState = localStorage.getItem('isSidebarCollapsed') === 'true';
    
    // On page load, handle differently for mobile vs desktop
    if (isMobile()) {
      // On mobile: sidebar should be hidden by default (not showing at all)
      sidebar.classList.remove('open');
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
    } else {
      // On desktop: follow saved collapse state
      if (savedState) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
      } else {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
      }
    }
  }
  
  // Set initial state
  setSidebarState();
  
  // Mobile sidebar toggle - shows/hides the sidebar
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (isMobile()) {
        // On mobile: toggle visibility with the 'open' class
        sidebar.classList.toggle('open');
      } else {
        // On desktop: toggle collapsed state
        const newCollapsed = !sidebar.classList.contains('collapsed');
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        localStorage.setItem('isSidebarCollapsed', newCollapsed);
      }
    });
  }
  
  // Desktop sidebar toggle - collapses/expands the sidebar
  if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', () => {
      const newCollapsed = !sidebar.classList.contains('collapsed');
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed');
      localStorage.setItem('isSidebarCollapsed', newCollapsed);
    });
  }
  
  // Handle window resize events
  window.addEventListener('resize', () => {
    setSidebarState();
  });
});