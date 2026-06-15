import path from 'path';

export const config = {
  dbFile: process.env.DB_FILE || path.join(process.cwd(), 'data', 'radar.db'),
};
