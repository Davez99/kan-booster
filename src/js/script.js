const modal = document.getElementById("card-form-modal");

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

function AdicionaCard() {
  debugger;
  const title = document.getElementById("title").value;
  const assignee = document.getElementById("assignee").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;
  const descricaoPrioridade = ChamaPrioridade(priority);
  // Cria um novo card
  const newCard = document.createElement("div");
  newCard.className = "kanban-card";
  newCard.draggable = true;
  newCard.setAttribute("onclick", "AbreModalCard(this)");
  newCard.innerHTML = `
        <div class="badge ${priority}">
            <span>${descricaoPrioridade} Prioridade </span>
        </div>
        <p class="card-title">${title}</p>
        <p class="card-description">${description}</p>
        <div class="card-infos">
            <div class="card-icons">
                <p><i class="fa-regular fa-comment"></i> 0</p>
                <p><i class="fa-solid fa-paperclip"></i> 0</p>
            </div>
            <div class="user">
                <span>${assignee}</span>
            </div>
        </div>
    `;

  // Atribui os eventos dragstart e dragend
  newCard.addEventListener("dragstart", (e) => {
    e.currentTarget.classList.add("dragging");
  });
  newCard.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging");
  });

  // Adiciona o novo card à coluna inicial
  const column = document.querySelector(
    ".kanban-column[data-id='1'] .kanban-cards"
  );
  column.appendChild(newCard);

  // Fecha o modal
  FechaModal();
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

function EditaCard(cardElement) {
  const title = document.getElementById("title").value;
  const assignee = document.getElementById("assignee").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;
  const descricaoPrioridade = ChamaPrioridade(priority);

  // Atualiza os dados do card clicado
  cardElement.querySelector(".card-title").innerText = title;
  cardElement.querySelector(".card-description").innerText = description;

  const badge = cardElement.querySelector(".badge");
  badge.className = `badge ${priority}`; // Atualiza a classe da prioridade
  badge.querySelector("span").innerText = descricaoPrioridade + " prioridade";

  const user = cardElement.querySelector(".user span");
  if (user) {
    user.innerText = assignee;
  }

  // Reatribui os eventos dragstart e dragend
  cardElement.draggable = true;
  cardElement.addEventListener("dragstart", (e) => {
    e.currentTarget.classList.add("dragging");
  });
  cardElement.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging");
  });

  // Fecha o modal
  FechaModal();
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
