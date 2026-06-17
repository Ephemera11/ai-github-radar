import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { config } from './config.js';

export async function createPool(): Promise<Pool> {
  const pool = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
  });

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      repoId VARCHAR(191) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      owner VARCHAR(255) NOT NULL,
      url VARCHAR(512) NOT NULL,
      summary TEXT NOT NULL,
      language VARCHAR(100) NOT NULL DEFAULT '',
      license VARCHAR(100) NOT NULL DEFAULT '',
      topics TEXT NOT NULL,
      stars INT NOT NULL DEFAULT 0,
      forks INT NOT NULL DEFAULT 0,
      pushedAt VARCHAR(50) NOT NULL DEFAULT '',
      last30dStars INT NOT NULL DEFAULT 0,
      activityScore DOUBLE NOT NULL DEFAULT 0,
      recommendationScore DOUBLE NOT NULL DEFAULT 0,
      recommendationReason TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS research_records (
      repoId VARCHAR(191) PRIMARY KEY,
      favorite TINYINT NOT NULL DEFAULT 0,
      hidden TINYINT NOT NULL DEFAULT 0,
      tags TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  return pool;
}
