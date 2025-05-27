import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { openDb, initializeDb } from "./dbContext.js";

const app = express();
const PORT = 3000;

// Ativar middleware CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Inicializa o banco de dados
initializeDb();

// Rota para buscar todos os cards
app.get("/cards", async (req, res) => {
  const db = await openDb();
  try {
    const cards = await db.all("SELECT * FROM cards");
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para adicionar um novo card
app.post("/cards", async (req, res) => {
  const { title, description, priority, assignee, columnId } = req.body;
  const db = await openDb();
  try {
    const result = await db.run(
      `
      INSERT INTO cards (title, description, priority, assignee, columnId)
      VALUES (?, ?, ?, ?, ?)
    `,
      [title, description, priority, assignee, columnId]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para editar um card
app.put("/cards/:id", async (req, res) => {
  const { title, description, priority, assignee, columnId } = req.body;
  const db = await openDb();
  try {
    const result = await db.run(
      `
      UPDATE cards
      SET title = ?, description = ?, priority = ?, assignee = ?, columnId = ?
      WHERE id = ?
    `,
      [title, description, priority, assignee, columnId, req.params.id]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para editar a coluna de um card
app.put("/cards/column/:id", async (req, res) => {
  const { columnId } = req.body;
  const db = await openDb();
  try {
    const result = await db.run(
      `
      UPDATE cards
      SET  columnId = ?
      WHERE id = ?
    `,
      [ columnId, req.params.id]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para excluir um card
app.delete("/cards/:id", async (req, res) => {
  const db = await openDb();
  try {
    const result = await db.run("DELETE FROM cards WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar todos os cards
app.get("/column", async (req, res) => {
  const db = await openDb();
  try {
    const cards = await db.all("SELECT * FROM kanban");
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar uma nova coluna
app.post("/kanban", async (req, res) => {
  const { title } = req.body;
  const db = await openDb();
  const result = await db.run("INSERT INTO kanban (title) VALUES (?)", [title]);
  res.json({ id: result.lastID });
});

// Atualizar o título de uma coluna
app.put("/kanban/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const db = await openDb();
  await db.run("UPDATE kanban SET title = ? WHERE id = ?", [title, id]);
  res.sendStatus(200);
});

// Excluir uma coluna
app.delete("/kanban/:id", async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run("DELETE FROM kanban WHERE id = ?", [id]);
  res.sendStatus(200);
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
