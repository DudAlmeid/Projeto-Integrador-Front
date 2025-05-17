class KanbanApp {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadData();
    this.currentStatusFilter = 'all';
  }

  initializeElements() {
    // Modal elements
    this.modal = document.getElementById('cardModal');
    this.cardForm = document.getElementById('cardForm');
    this.closeBtn = document.querySelector('.close-modal');
    this.addCardBtn = document.getElementById('addCardBtn');

    // Form fields
    this.cardTitleInput = document.getElementById('cardTitle');
    this.cardDescriptionInput = document.getElementById('cardDescription');
    this.cardPriorityInput = document.getElementById('cardPriority');
    this.cardAssigneeInput = document.getElementById('cardAssignee');

    // UI elements
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.textContent = 'Carregando...';
    document.body.appendChild(this.loadingIndicator);

    // State management
    this.editingCardId = null;
    this.columns = document.querySelectorAll('kanban-column');
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
  }

  setupEventListeners() {
    // Modal and form
    this.addCardBtn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.cardForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Card events
    document.addEventListener('edit-card', (e) =>
      this.handleEditCard(e.detail)
    );
    document.addEventListener('card-status-changed', (e) =>
      this.handleStatusChange(e.detail)
    );

    // Search functionality
    this.searchBtn.addEventListener('click', () => this.handleSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Refresh button (TODO: Implement this in the html)
    document
      .getElementById('refreshBtn')
      ?.addEventListener('click', () => this.loadData());
  }

  async loadData(status = 'all') {
    this.showLoading();
    this.currentStatusFilter = status;

    try {
      const url =
        status === 'all'
          ? 'http://localhost:3000/api/chamados'
          : `http://localhost:3000/api/chamados?status=${status}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.renderCards(data);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Falha ao carregar dados. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }

  renderCards(cardsData) {
    this.columns.forEach((column) => {
      const container =
        column.shadowRoot?.querySelector('.column-cards') || column;
      container.innerHTML = '';
    });

    // Group cards by status for better performance
    const cardsByStatus = {};
    cardsData.forEach((cardData) => {
      if (!cardsByStatus[cardData.status]) {
        cardsByStatus[cardData.status] = [];
      }
      cardsByStatus[cardData.status].push(cardData);
    });

    // Add cards to their respective columns
    Object.entries(cardsByStatus).forEach(([status, cards]) => {
      const column = document.querySelector(
        `kanban-column[data-status="${status}"]`
      );
      if (!column) return;

      const container =
        column.shadowRoot?.querySelector('.column-cards') || column;

      cards.forEach((cardData) => {
        const card = this.createCardElement(cardData);
        container.appendChild(card);
      });
    });
  }

  createCardElement(cardData) {
    const card = document.createElement('task-card');
    card.id = cardData.id;
    card.setAttribute('title', cardData.titulo);
    card.setAttribute('description', cardData.descricao);
    card.setAttribute('priority', cardData.prioridade || 'medium');
    card.setAttribute('assignee', cardData.usuario_nome || '');
    card.setAttribute('status', cardData.status);

    // Add additional data attributes
    card.dataset.createdAt = cardData.created_at;
    card.dataset.deadline = cardData.prazo;

    return card;
  }

  async handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) return;

    this.showLoading();

    try {
      const response = await fetch(
        `http://localhost:3000/api/chamados/search?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      this.renderCards(results);
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Falha na busca. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }

  async createCard(cardData) {
    this.showLoading();

    try {
      const response = await fetch('http://localhost:3000/api/chamados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: cardData.title,
          descricao: cardData.description,
          prioridade: cardData.priority,
          status: cardData.status,
          usuario_id: 1, // TODO: replace to dynamic user ID after auth were implemented
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();
      this.addCardToColumn(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
      this.showError('Falha ao criar chamado.');
    } finally {
      this.hideLoading();
    }
  }

  async updateCard(id, cardData) {
    this.showLoading();
    console.log('Updating card with ID:', id);

    try {
      const response = await fetch(`http://localhost:3000/api/chamados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: cardData.title,
          descricao: cardData.description,
          prioridade: cardData.priority,
          usuario_id: 1, // TODO: replace to dynamic user ID after auth were implemented
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      const updatedCard = await response.json();
      this.updateCardElement(updatedCard);
    } catch (error) {
      console.error('Error updating card:', error);
      this.showError('Falha ao atualizar chamado.');
    } finally {
      this.hideLoading();
    }
  }

  async handleStatusChange({ cardId, newStatus }) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chamados/${cardId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      this.loadData(this.currentStatusFilter);
    } catch (error) {
      console.error('Error updating status:', error);
      this.showError('Falha ao atualizar status.');
    }
  }

  // UI Helper Methods
  showLoading() {
    this.loadingIndicator.style.display = 'block';
  }

  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);

    setTimeout(() => {
      errorElement.remove();
    }, 3000);
  }

  openModal(cardData = null) {
    // Resetar ou preencher o formulário
    console.log('Opening modal with card data:', cardData);

    this.cardForm.reset();

    // Se estiver editando um card existente
    if (cardData) {
      this.editingCardId = cardData.cardId;
      this.cardTitleInput.value = cardData.title || '';
      this.cardDescriptionInput.value = cardData.description || '';
      this.cardPriorityInput.value = cardData.priority || 'medium';
      this.cardAssigneeInput.value = cardData.assignee || '';

      // Atualiza o título do modal
      document.querySelector('.modal-content h2').textContent =
        'Editar Chamado';
    } else {
      this.editingCardId = null;
      // Atualiza o título do modal
      document.querySelector('.modal-content h2').textContent = 'Novo Chamado';
    }

    this.modal.style.display = 'block';
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.editingCardId = null;
  }

  getCardById(id) {
    const card = document.getElementById(id);
    if (!card) {
      console.error(`Card with ID ${id} not found`);
      return null;
    }
    return card;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const cardData = {
      title: this.cardTitleInput.value,
      description: this.cardDescriptionInput.value,
      priority: this.cardPriorityInput.value,
      assignee: this.cardAssigneeInput.value,
      status: this.editingCardId
        ? this.getCardById(this.editingCardId)?.getAttribute('status')
        : 'open',
    };

    if (this.editingCardId) {
      this.updateCard(+this.editingCardId, cardData);
    } else {
      this.createCard(cardData);
    }

    this.closeModal();
  }

  handleEditCard(cardData) {
    console.log('Edit card event received:', cardData);
    this.openModal(cardData);
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new KanbanApp();
});
