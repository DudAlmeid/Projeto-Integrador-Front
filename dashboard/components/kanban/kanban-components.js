class KanbanColumn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const title = this.getAttribute('title') || 'Nova Coluna';
    const status = this.getAttribute('status') || 'default';

    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: var(--color-background);
                    border-radius: 8px;
                    padding: 15px;
                    height: calc(100% - 40px);
                    overflow: hidden;
                }
                
                .column-header {
                    margin-bottom: 15px;
                    font-size: 18px;
                    font-weight: 500;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                
                .column-cards {
                    min-height: 200px;
                    height: calc(100% - 40px);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                ::slotted(task-card) {
                    margin-bottom: 5px;
                }
            </style>
            
            <div class="column-header">${title}</div>
            <div class="column-cards">
                <slot></slot>
            </div>
        `;

    // Adiciona o atributo de status para controle via JS
    this.dataset.status = status;

    // Configura evento de drop para arrastar e soltr cards
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('drop', this.handleDrop);
  }

  // Eventos para suporte a arrastar e soltar
  // TODO: Melhorar a lógica de arrastar e soltar, incluindo animações e feedback visual para onde o card pode ser solto
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDrop(e) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);

    if (card) {
      this.appendChild(card);

      // Atualiza o status do card
      card.setAttribute('status', this.dataset.status);

      // Dispara evento de atualização de status
      const event = new CustomEvent('card-status-changed', {
        detail: {
          cardId: cardId,
          newStatus: this.dataset.status,
        },
        bubbles: true,
      });
      this.dispatchEvent(event);
    }
  }
}

// Definição do custom element para card de tarefa
class TaskCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['title', 'description', 'priority', 'assignee', 'status'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
    }
  }

  connectedCallback() {
    // Gera um ID único se não tiver um
    if (!this.id) {
      this.id = 'card-' + Date.now();
    }

    // Torna o card arrastável
    this.setAttribute('draggable', 'true');
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('click', this.handleClick);

    this.render();
  }

  handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  handleClick() {
    // Dispara evento para editar o card
    const event = new CustomEvent('edit-card', {
      detail: {
        cardId: this.id,
        title: this.getAttribute('title'),
        description: this.getAttribute('description'),
        priority: this.getAttribute('priority'),
        assignee: this.getAttribute('assignee'),
        status: this.getAttribute('status'),
      },
      bubbles: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    const title = this.getAttribute('title') || 'Sem título';
    const description = this.getAttribute('description') || '';
    const priority = this.getAttribute('priority') || 'medium';
    const assignee = this.getAttribute('assignee') || '';

    // Mapeia prioridades para textos e classes
    const priorityMap = {
      low: { text: 'Baixa', class: 'priority-low', icon: 'fa-arrow-down' },
      medium: { text: 'Média', class: 'priority-medium', icon: 'fa-minus' },
      high: { text: 'Alta', class: 'priority-high', icon: 'fa-arrow-up' },
    };

    const priorityInfo = priorityMap[priority] || priorityMap.medium;

    // Iniciais do responsável para o avatar
    let initials = '';
    if (assignee) {
      const names = assignee.split(' ');
      initials =
        names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
    }

    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: white;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-family: 'Montserrat', sans-serif;
                }
                
                :host(:hover) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .card-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #333;
                }
                
                .card-description {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 12px;
                    white-space: pre-line;
                }
                
                .card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #888;
                }
                
                .card-priority {
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .priority-high {
                    background-color: #ffebee;
                    color: #d32f2f;
                }
                
                .priority-medium {
                    background-color: #fff8e1;
                    color: #ff8f00;
                }
                
                .priority-low {
                    background-color: #e8f5e9;
                    color: #388e3c;
                }
                
                .card-assignee {
                    display: flex;
                    align-items: center;
                }
                
                .assignee-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-color: #ddd;
                    margin-right: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #666;
                }
            </style>
            
            <div class="card-title">${title}</div>
            
            ${description ? `<div class="card-description">${description}</div>` : ''}
            
            <div class="card-meta">
                <div class="card-priority ${priorityInfo.class}">
                    <i class="fas ${priorityInfo.icon}"></i>
                    ${priorityInfo.text}
                </div>
                
                ${
                  assignee
                    ? `
                <div class="card-assignee">
                    <div class="assignee-avatar">${initials}</div>
                    ${assignee}
                </div>
                `
                    : ''
                }
            </div>
        `;
  }
}

customElements.define('kanban-column', KanbanColumn);
customElements.define('task-card', TaskCard);
