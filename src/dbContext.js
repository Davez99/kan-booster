import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Função para abrir o banco de dados
export async function openDb() {
  return open({
    filename: "./kanban.db",
    driver: sqlite3.Database,
  });
}

// Criação da tabela (executada ao inicializar o banco)
export async function initializeDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      priority TEXT,
      assignee TEXT,
      columnId INTEGER
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS kanban (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT
    )
  `);

  // Forçando o `AUTOINCREMENT` para começar em 2 para a tabela `kanban`
  await db.run(`INSERT INTO kanban (id, title) VALUES (1, 'dummy')`);
  await db.run(`DELETE FROM kanban WHERE id = 1`);
}
