function updatePageTitle(title) {
  const headerComponent = document.querySelector('header-component');
  if (headerComponent) {
    headerComponent.setAttribute('page-title', title);
    document.title = title + ' | Projeto integrador';
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  const currentSection = document.querySelector('section').id;

  const titleMap = {
    chamados: 'Chamados',
    histórico: 'Histórico',
    clientes: 'Clientes',
  };

  const pageTitle = titleMap[currentSection] || 'Página';
  updatePageTitle(pageTitle);
});
