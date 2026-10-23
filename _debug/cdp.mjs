// Minimal Chrome DevTools Protocol driver (Node 24, no dependencies).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333, profile } = {}) {
    const dir = profile || path.join(os.tmpdir(), 'pixivtest', `prof-${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });
    const args = [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-dev-shm-usage',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${dir}`,
        '--window-size=1366,900',
        'about:blank',
    ];
    const proc = spawn(CHROME, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    let version = null;
    for (let i = 0; i < 120; i++) {
        try {
            const r = await fetch(`http://127.0.0.1:${port}/json/version`);
            version = await r.json();
            break;
        } catch { await sleep(250); }
    }
    if (!version) throw new Error(`Chrome did not start on port ${port}. stderr:\n${stderr.slice(-2000)}`);
    return { proc, port, dir, version };
}

export class Session {
    constructor(ws) {
        this.ws = ws;
        this.id = 0;
        this.pending = new Map();
        this.handlers = new Map();
        ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id && this.pending.has(msg.id)) {
                const { resolve, reject } = this.pending.get(msg.id);
                this.pending.delete(msg.id);
                if (msg.error) reject(new Error(`${msg.error.message} ${JSON.stringify(msg.error.data || '')}`));
                else resolve(msg.result);
                return;
            }
            if (msg.method) {
                const list = this.handlers.get(msg.method);
                if (list) for (const fn of list) fn(msg.params, msg.sessionId);
            }
        });
    }

    static async connect(port) {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        const page = targets.find((t) => t.type === 'page');
        if (!page) throw new Error('no page target');
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
            ws.addEventListener('open', res, { once: true });
            ws.addEventListener('error', rej, { once: true });
        });
        const s = new Session(ws);
        s.targetId = page.id;
        return s;
    }

    on(method, fn) {
        if (!this.handlers.has(method)) this.handlers.set(method, []);
        this.handlers.get(method).push(fn);
    }

    send(method, params = {}) {
        const id = ++this.id;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error(`timeout: ${method}`));
                }
            }, 60000);
        });
    }

    // Evaluate an expression in the page, returning the value (awaiting promises).
    async eval(expression) {
        const r = await this.send('Runtime.evaluate', {
            expression,
            awaitPromise: true,
            returnByValue: true,
            userGesture: true,
        });
        if (r.exceptionDetails) {
            const d = r.exceptionDetails;
            throw new Error(`page exception: ${d.text} ${d.exception && d.exception.description || ''}`);
        }
        return r.result.value;
    }

    async navigate(url) {
        await this.send('Page.navigate', { url });
    }

    async waitFor(expression, { timeout = 30000, interval = 300 } = {}) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            try {
                if (await this.eval(expression)) return true;
            } catch { /* navigation in progress */ }
            await sleep(interval);
        }
        throw new Error(`waitFor timed out: ${expression}`);
    }

    close() { try { this.ws.close(); } catch {} }
}

export { sleep };
