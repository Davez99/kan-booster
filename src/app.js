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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
