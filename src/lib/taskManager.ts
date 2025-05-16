import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

function createTask() {
  const id = uuidv4();
  db.prepare('INSERT INTO logs (id, output, status) VALUES (?, ?, ?)').run(id, '', 'queued');
  return { id };
}

function runTask(id: string, code: string, params: string) {
  return new Promise<void>((resolve) => {
    db.prepare('UPDATE logs SET status = ? WHERE id = ?').run('running', id);

    const tmpScript = path.join(os.tmpdir(), `${id}.sh`);
    fs.writeFileSync(tmpScript, code);

    const safeParams = params.replace(/(["$`\\])/g, '\\$1');

    const cmd = `docker run --rm --network bridge --cpus="0.5" --memory="256m" -v ${tmpScript}:/script.sh:ro alpine sh /script.sh ${safeParams}`;

    const proc = exec(cmd, { timeout: 300000 }, (error) => {
      fs.unlinkSync(tmpScript);

      if (error) {
        db.prepare('UPDATE logs SET output = output || ? , status = ? WHERE id = ?')
          .run('\n[ERROR]', 'failed', id);
        return resolve();
      }

      db.prepare('UPDATE logs SET status = ? WHERE id = ?').run('finished', id);
      resolve();
    });

    proc.stdout?.on('data', data => {
      db.prepare('UPDATE logs SET output = output || ? WHERE id = ?').run(data, id);
    });
    proc.stderr?.on('data', data => {
      db.prepare('UPDATE logs SET output = output || ? WHERE id = ?').run(data, id);
    });
  });
}

function getTask(id: string) {
  const row = db.prepare('SELECT status, output FROM logs WHERE id = ?').get(id) as { status: string; output: string } | undefined;
  if (!row) return null;

  if (row.status === 'failed' || row.status === 'finished') {
    db.prepare('DELETE FROM logs WHERE id = ?').run(id);
  }
  return { status: row.status, log: row.output };
}

export { createTask, runTask, getTask };
