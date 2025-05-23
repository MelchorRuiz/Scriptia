import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { turso } from './db';

async function createTask() {
  const id = uuidv4();
  await turso.execute({
    sql: 'INSERT INTO logs (id, output, status) VALUES (?, ?, ?)',
    args: [id, '', 'queued'],
  });
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
    turso.execute({
      sql: 'UPDATE logs SET status = ? WHERE id = ?',
      args: ['running', id],
    });

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
        turso.execute({
          sql: 'UPDATE logs SET output = output || ? , status = ? WHERE id = ?',
          args: ['\n[ERROR]', 'failed', id],
        });
        return resolve();
      }

      turso.execute({
        sql: 'UPDATE logs SET status = ? WHERE id = ?',
        args: ['finished', id],
      });
      resolve();
    });

    proc.stdout?.on('data', data => {
      turso.execute({
        sql: 'UPDATE logs SET output = output || ? WHERE id = ?',
        args: [data, id],
      });
    });
    proc.stderr?.on('data', data => {
      turso.execute({
        sql: 'UPDATE logs SET output = output || ? WHERE id = ?',
        args: [data, id],
      });
    });
  });
}

async function getTask(id: string) {
  const { rows } = await turso.execute({
    sql: 'SELECT status, output FROM logs WHERE id = ?',
    args: [id],
  });
  const row = rows[0];
  if (!row) return null;

  if (row.status === 'failed' || row.status === 'finished') {
    await turso.execute({
      sql: 'DELETE FROM logs WHERE id = ?',
      args: [id],
    });
  }
  return { status: row.status, log: row.output };
}

export { createTask, runTask, getTask };
