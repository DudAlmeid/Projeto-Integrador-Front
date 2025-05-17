class ClientTableComponent extends HTMLElement {
  constructor() {
    super();
    this.clients = [
      {
        id: '0285',
        solicitante: 'Carlos Souza',
        descricao: 'Computador necessitando...',
        endereco: 'UN002 - São Paulo',
        status: 'Em aberto',
        prazo: '25 jul. 24',
      },
      {
        id: '4554',
        solicitante: 'Fernanda Lima',
        descricao: 'Reparo de celular',
        endereco: 'UN005 - Pernambuco',
        status: 'Em aberto',
        prazo: '15 jul. 24',
      },
      {
        id: '4554',
        solicitante: 'Manuel Marques',
        descricao: 'Reparo de tablet',
        endereco: 'UN003 - Bahia',
        status: 'Em aberto',
        prazo: '27 jun. 24',
      },
      {
        id: '0387',
        solicitante: 'Lucas Fernandes',
        descricao: 'Reparo de celular',
        endereco: 'UN004 - Rio de Janeiro',
        status: 'Em aberto',
        prazo: '12 jun. 24',
      },
      {
        id: '5698',
        solicitante: 'Vitória Almeida',
        descricao: 'Reparo de tablet',
        endereco: 'UN007 - Santa Catarina',
        status: 'Em atendimento',
        prazo: '21 mai. 24',
      },
      {
        id: '5698',
        solicitante: 'Manuel Marques',
        descricao: 'Computador necessitando...',
        endereco: 'UN001 - Minas Gerais',
        status: 'Em atendimento',
        prazo: '20 mai. 24',
      },
      {
        id: '0545',
        solicitante: 'Ana Silva',
        descricao: 'Formatação',
        endereco: 'UN006 - Praia Grande',
        status: 'Em aberto',
        prazo: '30 abr. 24',
      },
      {
        id: '6598',
        solicitante: 'Fernanda Lima',
        descricao: 'O computador necessita ...',
        endereco: 'UN008 - Guarujá',
        status: 'Em aberto',
        prazo: '23 abr. 24',
      },
      {
        id: '0286',
        solicitante: 'Carlos Souza',
        descricao: 'O computador necessita ...',
        endereco: 'UN001 - Santos',
        status: 'Em aberto',
        prazo: '12 abr. 24',
      },
      {
        id: '0286',
        solicitante: 'Lucas Fernandes',
        descricao: 'O computador necessita ...',
        endereco: 'UN002 - Bertioga',
        status: 'Em aberto',
        prazo: '08 abr. 24',
      },
    ];

    this.unidades = [
      { id: 'UN001', nome: 'Minas Gerais' },
      { id: 'UN002', nome: 'São Paulo' },
      { id: 'UN003', nome: 'Bahia' },
      { id: 'UN004', nome: 'Rio de Janeiro' },
      { id: 'UN005', nome: 'Pernambuco' },
      { id: 'UN006', nome: 'Praia Grande' },
      { id: 'UN007', nome: 'Santa Catarina' },
      { id: 'UN008', nome: 'Guarujá' },
    ];

    this.modalMode = 'create';
    this.currentClientId = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  createModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.id = 'clientModal';

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Novo Cliente</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="clientForm">
            <div class="form-group">
              <label for="clientId">ID</label>
              <input type="text" id="clientId" name="id" placeholder="ID do cliente" required>
            </div>
            
            <div class="form-group">
              <label for="clientName">Solicitante</label>
              <input type="text" id="clientName" name="solicitante" placeholder="Nome do solicitante" required>
            </div>
            
            <div class="form-group">
              <label for="clientDescription">Descrição</label>
              <textarea id="clientDescription" name="descricao" placeholder="Descrição da solicitação" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="clientLocation">Unidade</label>
              <select id="clientLocation" name="endereco" required>
                <option value="">Selecione uma unidade</option>
                ${this.unidades
                  .map(
                    (unidade) => `
                  <option value="${unidade.id} - ${unidade.nome}">${unidade.id} - ${unidade.nome}</option>
                `
                  )
                  .join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="clientStatus">Status</label>
              <select id="clientStatus" name="status" required>
                <option value="Em aberto">Em aberto</option>
                <option value="Em atendimento">Em atendimento</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="clientDeadline">Prazo</label>
              <input type="date" id="clientDeadline" name="prazo" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="modal-cancel">Cancelar</button>
          <button class="modal-save">Salvar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  openModal(mode, clientData = null) {
    this.modalMode = mode;
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    const modalTitle = modal.querySelector('.modal-title');

    if (mode === 'create') {
      modalTitle.textContent = 'Novo Cliente';
      form.reset();

      // Gerar ID aleatório de 4 dígitos para novo cliente (verificar se é necessário)
      const randomId = Math.floor(1000 + Math.random() * 9000);
      document.getElementById('clientId').value = randomId.toString();
    } else if (mode === 'edit') {
      modalTitle.textContent = 'Editar Cliente';
      this.currentClientId = clientData.id;

      document.getElementById('clientId').value = clientData.id;
      document.getElementById('clientName').value = clientData.solicitante;
      document.getElementById('clientDescription').value = clientData.descricao;
      document.getElementById('clientLocation').value = clientData.endereco;
      document.getElementById('clientStatus').value = clientData.status;

      const dateParts = clientData.prazo.split(' ');
      const month = this.getMonthNumber(dateParts[1]);
      const day = parseInt(dateParts[0]);
      const year = '20' + dateParts[2];
      const formattedDate = `${year}-${month}-${day.toString().padStart(2, '0')}`;
      document.getElementById('clientDeadline').value = formattedDate;
    }

    modal.classList.add('open');
  }

  getMonthNumber(monthAbbr) {
    const months = {
      'jan.': '01',
      'fev.': '02',
      'mar.': '03',
      'abr.': '04',
      'mai.': '05',
      'jun.': '06',
      'jul.': '07',
      'ago.': '08',
      'set.': '09',
      'out.': '10',
      'nov.': '11',
      'dez.': '12',
    };
    return months[monthAbbr] || '01';
  }

  formatDateToBrazilian(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear().toString().substr(-2);

    const monthNames = [
      'jan.',
      'fev.',
      'mar.',
      'abr.',
      'mai.',
      'jun.',
      'jul.',
      'ago.',
      'set.',
      'out.',
      'nov.',
      'dez.',
    ];
    return `${day} ${monthNames[month]} ${year}`;
  }

  closeModal() {
    const modal = document.getElementById('clientModal');
    modal.classList.remove('open');
  }

  saveClient() {
    const form = document.getElementById('clientForm');
    const formData = new FormData(form);

    const clientData = {
      id: formData.get('id'),
      solicitante: formData.get('solicitante'),
      descricao: formData.get('descricao'),
      endereco: formData.get('endereco'),
      status: formData.get('status'),
      prazo: this.formatDateToBrazilian(formData.get('prazo')),
    };

    if (this.modalMode === 'create') {
      this.clients.unshift(clientData);
    } else {
      const index = this.clients.findIndex(
        (client) => client.id === this.currentClientId
      );
      if (index !== -1) {
        this.clients[index] = clientData;
      }
    }

    this.closeModal();
    this.render();
    this.setupEventListeners();

    const event = new CustomEvent('client-updated', {
      detail: {
        mode: this.modalMode,
        data: clientData,
      },
      bubbles: true,
    });
    this.dispatchEvent(event);
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.closest('.new-client-button')) {
        this.openModal('create');
      } else if (e.target.closest('.edit-button')) {
        const button = e.target.closest('.edit-button');
        const clientId = button.dataset.id;
        const client = this.clients.find((c) => c.id === clientId);
        if (client) {
          this.openModal('edit', client);
        }
      }
    });

    const modal = document.getElementById('clientModal');
    if (modal) {
      const closeButton = modal.querySelector('.modal-close');
      const cancelButton = modal.querySelector('.modal-cancel');
      const saveButton = modal.querySelector('.modal-save');
      const backdrop = modal.querySelector('.modal-backdrop');

      const closeModal = () => this.closeModal();

      closeButton.addEventListener('click', closeModal);
      cancelButton.addEventListener('click', closeModal);
      backdrop.addEventListener('click', closeModal);
      saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveClient();
      });
    }
  }

  getStatusClass(status) {
    return status === 'Em atendimento' ? 'status-attending' : 'status-open';
  }

  render() {
    this.innerHTML = `
      <div class="table-header">
        <h2 class="table-title">Lista de clientes</h2>
        <button class="new-client-button">
          <i class="fas fa-plus"></i>
          Novo Cliente
        </button>
      </div>
      <table class="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Solicitante</th>
            <th>Descrição</th>
            <th>Endereço</th>
            <th>Status</th>
            <th>Prazo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${this.clients
            .map(
              (client) => `
            <tr>
              <td>${client.id}</td>
              <td>${client.solicitante}</td>
              <td>${client.descricao}</td>
              <td>${client.endereco}</td>
              <td>
                <span class="status-badge ${this.getStatusClass(client.status)}">
                  <span class="status-dot"></span>
                  ${client.status}
                </span>
              </td>
              <td>${client.prazo}</td>
              <td>
                <button class="edit-button" data-id="${client.id}">
                  <i class="fas fa-pencil"></i>
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    if (!document.getElementById('clientModal')) {
      const modal = document.createElement('div');
      modal.classList.add('modal');
      modal.id = 'clientModal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Novo Cliente</h3>
            <button class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form id="clientForm">
              <div class="form-group">
                <label for="clientId">ID</label>
                <input type="text" id="clientId" name="id" placeholder="ID do cliente" required>
              </div>
              
              <div class="form-group">
                <label for="clientName">Solicitante</label>
                <input type="text" id="clientName" name="solicitante" placeholder="Nome do solicitante" required>
              </div>
              
              <div class="form-group">
                <label for="clientDescription">Descrição</label>
                <textarea id="clientDescription" name="descricao" placeholder="Descrição da solicitação" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="clientLocation">Unidade</label>
                <select id="clientLocation" name="endereco" required>
                  <option value="">Selecione uma unidade</option>
                  ${this.unidades
                    .map(
                      (unidade) => `
                    <option value="${unidade.id} - ${unidade.nome}">${unidade.id} - ${unidade.nome}</option>
                  `
                    )
                    .join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label for="clientStatus">Status</label>
                <select id="clientStatus" name="status" required>
                  <option value="Em aberto">Em aberto</option>
                  <option value="Em atendimento">Em atendimento</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="clientDeadline">Prazo</label>
                <input type="date" id="clientDeadline" name="prazo" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="modal-cancel">Cancelar</button>
            <button class="modal-save">Salvar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }
}

customElements.define('client-table-component', ClientTableComponent);
