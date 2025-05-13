import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const TASKS = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function createTask() {
    const id = uuidv4();
    const logFile = path.join(logsDir, `${id}.log`);
    fs.writeFileSync(logFile, '');
    TASKS.set(id, { status: 'queued', logFile });
    return { id };
}

function runTask(id: string, code: string) {
    return new Promise<void>((resolve) => {
      const task = TASKS.get(id);
      task.status = 'running';
  
      const tmpScript = path.join(os.tmpdir(), `${id}.sh`);
      fs.writeFileSync(tmpScript, code);
  
      const cmd = `docker run --rm --network bridge --cpus="0.5" --memory="256m" -v ${tmpScript}:/script.sh:ro alpine sh /script.sh`;
  
      const proc = exec(cmd, { timeout: 300000 }, (error) => {
        fs.unlinkSync(tmpScript);
  
        if (error) {
          fs.appendFileSync(task.logFile, `\n[ERROR] ${error.message}`);
          task.status = 'failed';
          return resolve();
        }
  
        task.status = 'finished';
        resolve();
      });
  
      proc.stdout?.on('data', data => fs.appendFileSync(task.logFile, data));
      proc.stderr?.on('data', data => fs.appendFileSync(task.logFile, data));
    });
  }

function getTask(id: string) {
    if (!TASKS.has(id)) return null;
    const task = TASKS.get(id);
    const log = fs.readFileSync(task.logFile, 'utf-8');
    if (task.status === 'failed' || task.status === 'finished') {
        fs.unlinkSync(task.logFile);
        TASKS.delete(id);
    }
    return { status: task.status, log };
}

export { createTask, runTask, getTask };
