const urlEndPoint = "http://localhost:3000";
const modal = document.getElementById("card-form-modal");

const kanbanContainer = document.getElementById("kanban-container");
const newColumnInput = document.getElementById("new-column-title");
const addColumnButton = document.getElementById("add-column-btn");

document.addEventListener("DOMContentLoaded", () => {
  loadKanban();
  loadCards();
});

// Seleciona todos os elementos com a classe '.kanban-card' e adiciona eventos a cada um deles
// document.querySelectorAll(".kanban-card").forEach((card) => {
//   // Evento disparado quando começa a arrastar um card
//   card.addEventListener("dragstart", (e) => {
//     // Adiciona a classe 'dragging' ao card que está sendo arrastado
//     e.currentTarget.classList.add("dragging");
//   });

//   // Evento disparado quando termina de arrastar o card
//   card.addEventListener("dragend", (e) => {
//     // Remove a classe 'dragging' quando o card é solto
//     e.currentTarget.classList.remove("dragging");
//   });
// });

document.getElementById("action-button").addEventListener("click", () => {
  if (selectedColumnId) {
    AdicionaCard(selectedColumnId);
  } else {
    console.error("Nenhuma coluna selecionada!");
  }
});

function enableDragAndDropForCards() {
  document.querySelectorAll(".kanban-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });
}

function enableDragAndDropForColumns() {
  document.querySelectorAll(".kanban-cards").forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("cards-hover");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("cards-hover");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("cards-hover");

      const dragCard = document.querySelector(".kanban-card.dragging");
      if (dragCard) {
        column.appendChild(dragCard);
        atualizaIdColunaReferencia(column, dragCard);
      }
    });
  });
}

// Chamar a função inicial para cards existentes
enableDragAndDropForCards();

// Seleciona todos os elementos com a classe '.kanban-cards' (as colunas) e adiciona eventos a cada um deles
document.querySelectorAll(".kanban-cards").forEach((column) => {
  // Evento disparado quando um card arrastado passa sobre uma coluna (drag over)
  column.addEventListener("dragover", (e) => {
    // Previne o comportamento padrão para permitir o "drop" (soltar) do card
    e.preventDefault();
    // Adiciona a classe 'cards-hover'
    e.currentTarget.classList.add("cards-hover");
  });

  // Evento disparado quando o card sai da área da coluna (quando o card é arrastado para fora)
  column.addEventListener("dragleave", (e) => {
    // Remove a classe 'cards-hover' quando o card deixa de estar sobre a coluna
    e.currentTarget.classList.remove("cards-hover");
  });

  // Evento disparado quando o card é solto (drop) dentro da coluna
  column.addEventListener("drop", (e) => {
    // Remove a classe 'cards-hover', já que o card foi solto
    e.currentTarget.classList.remove("cards-hover");

    // Seleciona o card que está sendo arrastado (que tem a classe 'dragging')
    const dragCard = document.querySelector(".kanban-card.dragging");

    // Anexa (move) o card arrastado para a coluna onde foi solto
    e.currentTarget.appendChild(dragCard);
  });
});

// Adicionar eventos globais de drag nos cards
document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("kanban-card")) {
    e.target.classList.add("dragging");
  }
});

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("kanban-card")) {
    e.target.classList.remove("dragging"); // Garante que a classe seja removida após o drop
  }
});

async function atualizaIdColunaReferencia(cardsContainer, dragCard) {
  const id = dragCard.dataset.id; // ID do card arrastado
  const elementId = cardsContainer.getAttribute("data-column-id"); // ID da nova coluna

  const updatedCardData = {
    columnId: elementId, // Atualiza para o novo ID da coluna
  };

  try {
    await apiRequest(
      `${urlEndPoint}/cards/column/${id}`,
      "PUT",
      updatedCardData
    );
  } catch (error) {
    console.error("Erro ao atualizar coluna do card:", error);
  }
}

let selectedColumnId = null;

function AbreModal(button) {
  const columnId = button.dataset.columnId;
  selectedColumnId = columnId;

  const modal = document.getElementById("card-form-modal");
  modal.classList.remove("hidden");
}

function FechaModal() {
  const form = document.getElementById("add-card-form");
  form.reset();

  const modal = document.getElementById("card-form-modal");
  modal.classList.add("hidden");

  const actionButton = document.getElementById("action-button");
  actionButton.textContent = "Adicionar Card";
  actionButton.onclick = AdicionaCard;
}

function AbreModalCard(cardElement) {
  const actionButton = document.getElementById("action-button");

  // Preenche os valores do card clicado no formulário
  const titleInput = document.getElementById("title");
  const assigneeInput = document.getElementById("assignee");
  const prioritySelect = document.getElementById("priority");
  const descriptionTextarea = document.getElementById("description");

  const title = cardElement.querySelector(".card-title").innerText;
  const description =
    cardElement.querySelector(".card-description")?.innerText || "";
  const priority = cardElement
    .querySelector(".badge")
    .classList.contains("high")
    ? "high"
    : cardElement.querySelector(".badge").classList.contains("medium")
    ? "medium"
    : "low";
  const assignee = cardElement.querySelector(".user span")?.innerText || "";

  titleInput.value = title;
  assigneeInput.value = assignee;
  prioritySelect.value = priority;
  descriptionTextarea.value = description;

  // Configura o botão para salvar alterações no card
  actionButton.textContent = "Salvar Alterações";
  actionButton.onclick = () => EditaCard(cardElement);

  // Exibe o modal
  modal.classList.remove("hidden");
}

async function AdicionaCard(columnId) {
  const title = document.getElementById("title").value;
  const assignee = document.getElementById("assignee").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;

  try {
    const newCardData = {
      title,
      description,
      priority,
      assignee,
      columnId, // Usa o parâmetro passado
    };

    const newCard = await apiRequest(
      `${urlEndPoint}/cards`,
      "POST",
      newCardData
    );

    // Seleciona o contêiner de cards da coluna específica
    const column = document.querySelector(
      `.kanban-column[data-id='${columnId}'] .kanban-cards`
    );

    // Cria o elemento do card e adiciona à coluna
    const cardElement = createCardElement({ ...newCardData, id: newCard.id });
    column.appendChild(cardElement);

    // Fecha o modal, caso esteja aberto
    FechaModal();
  } catch (error) {
    console.error("Erro ao adicionar o card:", error);
  }
}

async function EditaCard(cardElement) {
  const id = cardElement.dataset.id;
  const title = document.getElementById("title").value;
  const assignee = document.getElementById("assignee").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;

  try {
    const updatedCardData = {
      title,
      description,
      priority,
      assignee
    }; // Ajuste conforme necessário

    await apiRequest(`${urlEndPoint}/cards/${id}`, "PUT", updatedCardData);

    cardElement.querySelector(".card-title").innerText = title;
    cardElement.querySelector(".card-description").innerText = description;

    const badge = cardElement.querySelector(".badge");
    badge.className = `badge ${priority}`;
    badge.querySelector("span").innerText = `${ChamaPrioridade(
      priority
    )} Prioridade`;

    const user = cardElement.querySelector(".user span");
    if (user) user.innerText = assignee;

    FechaModal();
  } catch (error) {
    console.error("Erro ao editar o card:", error);
  }
}

async function DeletaCard(cardElement) {
  const id = cardElement.dataset.id;

  try {
    await apiRequest(`${urlEndPoint}/cards/${id}`, "DELETE");
    cardElement.remove();
  } catch (error) {
    console.error("Erro ao deletar o card:", error);
  }
}

function ChamaPrioridade(priority) {
  const priorityDescription =
    priority == "low"
      ? "Baixa"
      : "" || priority == "medium"
      ? "Média"
      : "" || priority == "high"
      ? "Alta"
      : "";
  return priorityDescription;
}

async function apiRequest(url, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}

async function loadCards() {
  try {
    const cards = await apiRequest(`${urlEndPoint}/cards`);
    cards.forEach((card) => {
      const column = document.querySelector(
        `.kanban-column[data-id='${card.columnId}'] .kanban-cards`
      );
      if (column) {
        const newCard = createCardElement(card);
        column.appendChild(newCard);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar os cards:", error);
  }
}

// Função para carregar o Kanban com as colunas do banco

async function loadKanban() {
  try {
    const kanbanContainer = document.querySelector(".kanban");
    const columnsLoad = await apiRequest(`${urlEndPoint}/column`);

    columnsLoad.forEach((columnLoad) => {
      // Verificar se a coluna já existe no DOM
      const existingColumn = document.querySelector(
        `.kanban-column[data-id='${columnLoad.id}']`
      );

      if (!existingColumn) {
        // Criar e adicionar a nova coluna ao final do contêiner
        const newColumn = createColumnElemnt(columnLoad);
        // Adicionar a nova coluna antes do campo de input
        const inputField = document.querySelector(".kanban > .input-field");
        if (inputField) {
          kanbanContainer.insertBefore(newColumn, inputField);
        } else {
          kanbanContainer.prepend(newColumn);
        }
      }
    });
  } catch (error) {
    console.error("Erro ao carregar as colunas:", error);
  }
}

function createCardElement(card) {
  const newCard = document.createElement("div");
  newCard.className = "kanban-card";
  newCard.draggable = true;
  newCard.setAttribute("onclick", "AbreModalCard(this)");
  newCard.dataset.id = card.id;
  newCard.innerHTML = `
          <div class="badge ${card.priority}">
              <span>${ChamaPrioridade(card.priority)} Prioridade</span>
          </div>
          <p class="card-title">${card.title}</p>
          <p class="card-description">${card.description || ""}</p>
          <div class="card-infos">
              <div class="card-icons">
                  <p><i class="fa-regular fa-comment"></i> 0</p>
                  <p><i class="fa-solid fa-paperclip"></i> 0</p>
              </div>
              <div class="user">
                  <span>${card.assignee || ""}</span>
              </div>
          </div>
      `;

  newCard.addEventListener("dragstart", (e) => {
    e.currentTarget.classList.add("dragging");
  });
  newCard.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging");
  });

  return newCard;
}

function createColumnElemnt(column) {
  // Criar o elemento da coluna
  const newColumn = document.createElement("div");
  newColumn.classList.add("kanban-column");
  newColumn.dataset.id = column.id;

  // Estrutura HTML da nova coluna
  newColumn.innerHTML = `
          <div class="kanban-title">
            <h2 class="column-title">${column.title}</h2>
            <button class="edit-column-btn">Editar</button>
            <button class="delete-column-btn">Excluir</button>
            <button class="add-card" onclick="AbreModal(this)" data-column-id="${column.id}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <div class="kanban-cards" data-column-id="${column.id}">
            <!-- Cards serão adicionados aqui -->
          </div>
        `;

  // Adicionar eventos de edição
  const editButton = newColumn.querySelector(".edit-column-btn");
  const columnTitle = newColumn.querySelector(".column-title");
  editButton.addEventListener("click", () => {
    const currentTitle = columnTitle.textContent;

    // Criar um campo de input para edição
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentTitle;
    input.classList.add("edit-input");

    // Substituir o título pelo campo de input
    columnTitle.replaceWith(input);
    input.focus();

    // Lidar com a atualização após pressionar Enter ou desfocar o campo
    input.addEventListener("blur", () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== currentTitle) {
        // Atualizar no backend
        fetch(`${urlEndPoint}/kanban/${column.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        })
          .then((response) => {
            if (response.ok) {
              columnTitle.textContent = newTitle;
            } else {
              columnTitle.textContent = currentTitle; // Reverter em caso de erro
              alert("Erro ao atualizar o título!");
            }
          })
          .catch(() => {
            columnTitle.textContent = currentTitle;
            alert("Erro de conexão ao atualizar o título!");
          });
      } else {
        columnTitle.textContent = currentTitle; // Reverter se vazio ou não alterado
      }
      input.replaceWith(columnTitle);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur(); // Disparar o evento blur para salvar
      }
    });
  });

  // Adicionar eventos de exclusão
  const deleteButton = newColumn.querySelector(".delete-column-btn");
  deleteButton.addEventListener("click", () => {
    deleteColumn(column.id); // Chamar a função para deletar do banco de dados
    newColumn.remove(); // Remover do DOM
  });

  // Adicionar eventos de drag-and-drop
  const cardsContainer = newColumn.querySelector(".kanban-cards");

  cardsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    cardsContainer.classList.add("cards-hover");
  });

  cardsContainer.addEventListener("dragleave", () => {
    cardsContainer.classList.remove("cards-hover");
  });

  cardsContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    cardsContainer.classList.remove("cards-hover");

    // Obter o card que está sendo movido
    const dragCard = document.querySelector(".kanban-card.dragging");
    if (dragCard) {
      cardsContainer.appendChild(dragCard); // Move o card para o novo contêiner
      dragCard.classList.remove("dragging"); // Remove a classe de dragging do card
      atualizaIdColunaReferencia(cardsContainer, dragCard); // Atualiza o ID da coluna
    }
  });

  return newColumn;
}

// Função para criar uma nova coluna visualmente
function createColumn(id, title) {
  const kanbanContainer = document.querySelector(".kanban");
  if (!kanbanContainer) {
    console.error("Elemento '.kanban' não encontrado!");
    return;
  }

  // Criar o elemento da coluna
  const column = document.createElement("div");
  column.classList.add("kanban-column");
  column.dataset.id = id;

  // Estrutura HTML da nova coluna
  column.innerHTML = `
        <div class="kanban-title">
          <h2>${title}</h2>
          <button class="edit-column-btn">Editar</button>
          <button class="delete-column-btn">Excluir</button>
          <button class="add-card" onclick="AbreModal(this)" data-column-id="${id}">
              <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <div class="kanban-cards">
          <!-- Cards serão adicionados aqui -->
        </div>
      `;

  // Adicionar eventos aos botões de edição e exclusão
  column.querySelector(".edit-column-btn").addEventListener("click", () => {
    enableColumnEditing(column, id);
  });

  column.querySelector(".delete-column-btn").addEventListener("click", () => {
    deleteColumn(id);
    column.remove();
  });

  // Adicionar eventos de drag-and-drop à nova coluna
  const cardsContainer = column.querySelector(".kanban-cards");

  cardsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    cardsContainer.classList.add("cards-hover");
  });

  cardsContainer.addEventListener("dragleave", () => {
    cardsContainer.classList.remove("cards-hover");
  });

  cardsContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    cardsContainer.classList.remove("cards-hover");

    const dragCard = document.querySelector(".kanban-card.dragging");
    if (dragCard) {
      cardsContainer.appendChild(dragCard);
      dragCard.classList.remove("dragging");
      atualizaIdColunaReferencia(cardsContainer, cardsContainer, dragCard);
    }
  });

  // Adicionar a nova coluna antes do campo de input
  const inputField = document.querySelector(".kanban > .input-field");
  if (inputField) {
    kanbanContainer.insertBefore(column, inputField);
  } else {
    kanbanContainer.prepend(column);
  }
}

// Função para tornar o título editável e atualizar via API
function enableColumnEditing(columnElement, id) {
  const titleElement = columnElement.querySelector("h2");
  if (!titleElement) return;

  // Criar um campo de entrada com o título atual
  const input = document.createElement("input");
  input.type = "text";
  input.value = titleElement.textContent;
  input.classList.add("edit-title-input");

  // Substituir o título pelo campo de entrada
  titleElement.replaceWith(input);
  input.focus();

  // Ao sair do foco ou pressionar Enter, atualizar o título
  input.addEventListener("blur", () =>
    saveColumnTitle(input, id, columnElement)
  );
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveColumnTitle(input, id, columnElement);
    }
  });
}

// Função para salvar o título da coluna via API
async function saveColumnTitle(input, id, columnElement) {
  const newTitle = input.value.trim();
  if (!newTitle) return; // Não permitir título vazio

  try {
    // Fazer a requisição PUT para atualizar o título
    await fetch(`${urlEndPoint}/kanban/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    });

    // Atualizar o título no front-end
    const newTitleElement = document.createElement("h2");
    newTitleElement.textContent = newTitle;
    input.replaceWith(newTitleElement);
  } catch (error) {
    console.error("Erro ao atualizar o título:", error);
    alert("Erro ao atualizar o título. Tente novamente.");
  }
}

// Evento para adicionar nova coluna ao clicar no botão
addColumnButton.addEventListener("click", async () => {
  const title = newColumnInput.value.trim(); // Obtém o valor do input
  if (title === "") {
    alert("Por favor, digite um título para a coluna!");
    return;
  }

  // Adiciona ao banco de dados e cria a coluna
  const id = await addColumnToDatabase(title);
  createColumn(id, title);

  // Limpa o input após adicionar
  newColumnInput.value = "";
});

// Função para chamar o backend e adicionar a coluna ao banco
async function addColumnToDatabase(title) {
  const response = await fetch(`${urlEndPoint}/kanban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await response.json();
  return data.id;
}

// Função para atualizar o título da coluna no backend
async function updateColumn(id, title) {
  await fetch(`${urlEndPoint}/kanban/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

// Função para excluir a coluna no backend
async function deleteColumn(id) {
  await fetch(`${urlEndPoint}/kanban/${id}`, {
    method: "DELETE",
  });
}
