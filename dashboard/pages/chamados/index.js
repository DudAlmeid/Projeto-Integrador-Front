// Dados de exemplo para inicializar o kanban
const initialData = {
  cards: [
    {
      id: 'card-1',
      title: 'Instalar novo computador',
      description:
        'Configurar Windows e instalar programas básicos para o setor financeiro.',
      priority: 'high',
      assignee: 'João Silva',
      status: 'open',
    },
    {
      id: 'card-2',
      title: 'Problema de conexão com a internet',
      description:
        'Verificar problema de instabilidade na rede do departamento comercial.',
      priority: 'medium',
      assignee: 'Maria Oliveira',
      status: 'open',
    },
    {
      id: 'card-3',
      title: 'Atualizar sistema ERP',
      description:
        'Realizar atualização do sistema para versão 2.5.4 nos servidores.',
      priority: 'low',
      assignee: 'Carlos Santos',
      status: 'open',
    },
    {
      id: 'card-4',
      title: 'Configurar impressora de rede',
      description:
        'Instalar nova impressora HP no setor de RH e configurar acesso em rede.',
      priority: 'medium',
      assignee: 'Ana Souza',
      status: 'progress',
    },
    {
      id: 'card-5',
      title: 'Instalar antivírus',
      description:
        'Atualizar licenças de antivírus e instalar em novos computadores.',
      priority: 'medium',
      assignee: 'Paulo Mendes',
      status: 'progress',
    },
    {
      id: 'card-6',
      title: 'Manutenção preventiva servidores',
      description:
        'Realizar limpeza física e verificação de logs nos servidores principais.',
      priority: 'high',
      assignee: 'Roberto Almeida',
      status: 'done',
    },
    {
      id: 'card-7',
      title: 'Backup dados fiscais',
      description:
        'Realizar backup completo da base de dados do sistema fiscal.',
      priority: 'high',
      assignee: 'Carla Moreira',
      status: 'done',
    },
  ],
};

// Classe principal de gerenciamento da aplicação
class KanbanApp {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadData();
  }

  initializeElements() {
    // Elementos do modal
    this.modal = document.getElementById('cardModal');
    this.cardForm = document.getElementById('cardForm');
    this.closeBtn = document.querySelector('.close-modal');
    this.addCardBtn = document.getElementById('addCardBtn');

    // Campos do formulário
    this.cardTitleInput = document.getElementById('cardTitle');
    this.cardDescriptionInput = document.getElementById('cardDescription');
    this.cardPriorityInput = document.getElementById('cardPriority');
    this.cardAssigneeInput = document.getElementById('cardAssignee');

    // Estado da aplicação
    this.editingCardId = null;
    this.columns = document.querySelectorAll('kanban-column');
  }

  setupEventListeners() {
    // Modal e formulário
    this.addCardBtn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.cardForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Eventos dos cards
    document.addEventListener('edit-card', (e) =>
      this.handleEditCard(e.detail)
    );
    document.addEventListener('card-status-changed', (e) =>
      this.handleStatusChange(e.detail)
    );
  }

  openModal(cardData = null) {
    // Resetar ou preencher o formulário
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

  handleFormSubmit(e) {
    e.preventDefault();

    const cardData = {
      title: this.cardTitleInput.value,
      description: this.cardDescriptionInput.value,
      priority: this.cardPriorityInput.value,
      assignee: this.cardAssigneeInput.value,
      status: this.editingCardId
        ? this.getCardById(this.editingCardId).getAttribute('status')
        : 'open',
    };

    if (this.editingCardId) {
      this.updateCard(this.editingCardId, cardData);
    } else {
      this.createCard(cardData);
    }

    this.closeModal();
  }

  createCard(cardData) {
    const id = 'card-' + Date.now();

    // Criar novo elemento de card
    const card = document.createElement('task-card');
    card.id = id;
    card.setAttribute('title', cardData.title);
    card.setAttribute('description', cardData.description);
    card.setAttribute('priority', cardData.priority);
    card.setAttribute('assignee', cardData.assignee);
    card.setAttribute('status', cardData.status);

    // Adicionar à coluna apropriada
    const targetColumn = document.querySelector(
      `kanban-column[data-status="${cardData.status}"]`
    );
    if (targetColumn) {
      targetColumn.appendChild(card);
    } else {
      // Adicionar à primeira coluna como fallback
      this.columns[0].appendChild(card);
    }

    // Salvar dados
    this.saveData();
  }

  updateCard(id, cardData) {
    const card = this.getCardById(id);
    if (!card) return;

    card.setAttribute('title', cardData.title);
    card.setAttribute('description', cardData.description);
    card.setAttribute('priority', cardData.priority);
    card.setAttribute('assignee', cardData.assignee);

    // Salvar dados
    this.saveData();
  }

  handleEditCard(cardData) {
    this.openModal(cardData);
  }

  handleStatusChange(data) {
    // TODO: Adicionar lógica para atualizar o status do card no localStorage e no backend
    this.saveData();
  }

  getCardById(id) {
    return document.getElementById(id);
  }

  loadData() {
    // Carregar dados do localStorage ou usar dados iniciais
    let data;

    try {
      const savedData = localStorage.getItem('kanbanData');
      data = savedData ? JSON.parse(savedData) : initialData;
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      data = initialData;
    }

    // Limpar colunas
    this.columns.forEach((column) => {
      // Remove apenas os task-cards, não outros elementos que possam estar na coluna
      const cards = column.querySelectorAll('task-card');
      cards.forEach((card) => card.remove());
    });

    // Adicionar cards às colunas corretas
    data.cards.forEach((cardData) => {
      const card = document.createElement('task-card');
      card.id = cardData.id;
      card.setAttribute('title', cardData.title);
      card.setAttribute('description', cardData.description);
      card.setAttribute('priority', cardData.priority);
      card.setAttribute('assignee', cardData.assignee);
      card.setAttribute('status', cardData.status);

      // Encontrar coluna correta
      const targetColumn = document.querySelector(
        `kanban-column[data-status="${cardData.status}"]`
      );
      if (targetColumn) {
        targetColumn.appendChild(card);
      }
    });
  }

  saveData() {
    // Coletar dados de todos os cards
    const cards = [];
    document.querySelectorAll('task-card').forEach((card) => {
      cards.push({
        id: card.id,
        title: card.getAttribute('title'),
        description: card.getAttribute('description'),
        priority: card.getAttribute('priority'),
        assignee: card.getAttribute('assignee'),
        status: card.getAttribute('status'),
      });
    });

    // Salvar no localStorage
    // TODO: Adicionar lógica para salvar no backend psoteriormente quando o Erick fizer a API
    try {
      localStorage.setItem('kanbanData', JSON.stringify({ cards }));
    } catch (e) {
      console.error('Erro ao salvar dados:', e);
    }
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new KanbanApp();
});
