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
}
