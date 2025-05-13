// Function to update the page title of the header component
function updatePageTitle(title) {
  const headerComponent = document.querySelector('header-component');
  if (headerComponent) {
    headerComponent.setAttribute('page-title', title);
    document.title = title + ' | Projeto integrador';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const currentSection = document.querySelector('section').id;

  const titleMap = {
    'tela-chamados': 'Chamadas',
    'tela-dashboard': 'Dashboard',
    'tela-clientes': 'Clientes',
    'tela-produtos': 'Produtos',
  };

  const pageTitle = titleMap[currentSection] || 'Página';
  updatePageTitle(pageTitle);
});
