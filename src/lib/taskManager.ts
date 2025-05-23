import { getSecret } from 'astro:env/server';
import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database(path.resolve(getSecret("DB_FILE") || 'data/database.sqlite'));

function createTask() {
  const id = uuidv4();
  db.prepare('INSERT INTO logs (id, output, status) VALUES (?, ?, ?)').run(id, '', 'queued');
  return { id };
}

function runTask(
  id: string,
  code: string,
  params: string,
  platform: 'alpine' | 'ubuntu' | 'python' | 'nodejs',
  dependencies: string[] = []
) {
  return new Promise<void>((resolve) => {
    db.prepare('UPDATE logs SET status = ? WHERE id = ?').run('running', id);

    let installCmd = '';
    let image = '';
    let entrypoint = '';

    switch (platform) {
      case 'alpine':
        image = 'alpine';
        if (dependencies.length > 0) {
          installCmd = `apk update && apk add --no-cache ${dependencies.join(' ')}`;
        }
        entrypoint = 'sh /script.sh';
        break;
      case 'ubuntu':
        image = 'ubuntu';
        if (dependencies.length > 0) {
          installCmd = `apt-get update && apt-get install -y ${dependencies.join(' ')}`;
        }
        entrypoint = 'bash /script.sh';
        break;
      case 'python':
        image = 'python:3.13-alpine';
        if (dependencies.length > 0) {
          installCmd = `PIP_DISABLE_PIP_VERSION_CHECK=1 pip install --root-user-action=ignore --no-warn-script-location ${dependencies.join(' ')}`;
        }
        entrypoint = 'python /script.py';
        break;
      case 'nodejs':
        image = 'node:24-alpine';
        if (dependencies.length > 0) {
          installCmd = `mkdir -p ~/p && cd ~/p && npm init -y && npm install ${dependencies.join(' ')} --save && cp /script.js ~/p/index.js`;
          entrypoint = 'node ~/p/index.js';
        } else {
          entrypoint = 'node /script.js';
        }
        break;
      default:
        image = 'alpine';
        entrypoint = 'sh /script.sh';
    }

    let scriptExt = '.sh';
    if (platform === 'python') scriptExt = '.py';
    if (platform === 'nodejs') scriptExt = '.js';

    const tmpScriptPath = path.join(os.tmpdir(), `${id}${scriptExt}`);
    fs.writeFileSync(tmpScriptPath, code);

    const safeParams = params.replace(/(["$`\\])/g, '\\$1');

    const cmd = `docker run --rm --network bridge --cpus="0.25" --memory="128m" -v ${tmpScriptPath}:/script${scriptExt}:ro ${image} sh -c "${installCmd ? `( ${installCmd} ) > /dev/null 2>&1; ` : ''}${entrypoint} ${safeParams}"`;

    const proc = exec(cmd, { timeout: 300000 }, (error) => {
      fs.unlinkSync(tmpScriptPath);

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
