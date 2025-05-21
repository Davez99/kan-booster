const modal = document.getElementById("card-form-modal");

document.addEventListener("DOMContentLoaded", () => {
  loadCards();
});

// Seleciona todos os elementos com a classe '.kanban-card' e adiciona eventos a cada um deles
document.querySelectorAll(".kanban-card").forEach((card) => {
  // Evento disparado quando começa a arrastar um card
  card.addEventListener("dragstart", (e) => {
    // Adiciona a classe 'dragging' ao card que está sendo arrastado
    e.currentTarget.classList.add("dragging");
  });

  // Evento disparado quando termina de arrastar o card
  card.addEventListener("dragend", (e) => {
    // Remove a classe 'dragging' quando o card é solto
    e.currentTarget.classList.remove("dragging");
  });
});

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

function AbreModal() {
  const actionButton = document.getElementById("action-button");

  // Configura o botão para adicionar um novo card
  actionButton.textContent = "Adicionar Card";
  actionButton.onclick = AdicionaCard;

  // Exibe o modal
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

async function AdicionaCard() {
    debugger
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
      columnId: 1, // Ajuste conforme necessário
    };

    const newCard = await apiRequest(
      "http://localhost:3000/cards",
      "POST",
      newCardData
    );
    const column = document.querySelector(
      ".kanban-column[data-id='1'] .kanban-cards"
    );
    const cardElement = createCardElement({ ...newCardData, id: newCard.id });
    column.appendChild(cardElement);

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
      assignee,
      columnId: 1,
    }; // Ajuste conforme necessário

    await apiRequest(
      `http://localhost:3000/cards/${id}`,
      "PUT",
      updatedCardData
    );

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
    await apiRequest(`http://localhost:3000/cards/${id}`, "DELETE");
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
    const cards = await apiRequest("http://localhost:3000/cards");
    const column = document.querySelector(
      ".kanban-column[data-id='1'] .kanban-cards"
    );

    cards.forEach((card) => {
      const newCard = createCardElement(card);
      column.appendChild(newCard);
    });
  } catch (error) {
    console.error("Erro ao carregar os cards:", error);
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
