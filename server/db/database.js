const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'chitfund.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db = null;
let sqlJs = null;

/**
 * Compatibility wrapper around sql.js to mimic better-sqlite3 API.
 * sql.js is pure JavaScript (no native compilation needed).
 */
class DatabaseWrapper {
    constructor(sqlJsDb) {
        this._db = sqlJsDb;
    }

    prepare(sql) {
        const self = this;
        const sanitize = (params) => params.map(p => (p === undefined ? null : p));

        return {
            run(...params) {
                const cleanParams = sanitize(params);
                self._db.run(sql, cleanParams);
                const changes = self._db.getRowsModified();
                // Get last insert rowid
                const lastIdResult = self._db.exec('SELECT last_insert_rowid() as id');
                const lastInsertRowid = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : 0;
                self._save();
                return { changes, lastInsertRowid };
            },
            get(...params) {
                const cleanParams = sanitize(params);
                const stmt = self._db.prepare(sql);
                stmt.bind(cleanParams);
                let result = null;
                if (stmt.step()) {
                    const columns = stmt.getColumnNames();
                    const values = stmt.get();
                    result = {};
                    columns.forEach((col, i) => {
                        result[col] = values[i];
                    });
                }
                stmt.free();
                return result;
            },
            all(...params) {
                const cleanParams = sanitize(params);
                const stmt = self._db.prepare(sql);
                stmt.bind(cleanParams);
                const results = [];
                while (stmt.step()) {
                    const columns = stmt.getColumnNames();
                    const values = stmt.get();
                    const row = {};
                    columns.forEach((col, i) => {
                        row[col] = values[i];
                    });
                    results.push(row);
                }
                stmt.free();
                return results;
            }
        };
    }

    exec(sql) {
        try {
            this._db.run(sql);
            this._save();
        } catch (e) {
            if (e.message && e.message.includes('no transaction is active')) {
                // Ignore rollback or commit when transaction already ended
                return;
            }
            throw e;
        }
    }

    pragma(pragmaStr) {
        try {
            this._db.run(`PRAGMA ${pragmaStr}`);
        } catch (e) {
            // Ignore pragma errors (some not supported in sql.js)
        }
    }

    _save() {
        try {
            const data = this._db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbPath, buffer);
        } catch (e) {
            // Ignore save errors during transactions
        }
    }

    close() {
        this._save();
        this._db.close();
    }

    /** Get the raw database binary for backup */
    getDbBuffer() {
        return Buffer.from(this._db.export());
    }

    /** Restore from a binary buffer */
    restoreFromBuffer(buffer) {
        this._db = new sqlJs.Database(new Uint8Array(buffer));
        this._save();
    }
}

// Initialize synchronously using a blocking pattern
let wrapper = null;

function initSync() {
    if (wrapper) return wrapper;

    // Use a synchronous workaround: check if we can load the wasm synchronously
    // sql.js needs async init, so we'll use a startup pattern
    throw new Error('Database not initialized. Call initDatabase() first.');
}

async function initDatabase() {
    if (wrapper) return wrapper;

    sqlJs = await initSqlJs();

    let sqlJsDb;
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        sqlJsDb = new sqlJs.Database(new Uint8Array(fileBuffer));
    } else {
        sqlJsDb = new sqlJs.Database();
    }

    wrapper = new DatabaseWrapper(sqlJsDb);

    // Enable foreign keys
    wrapper.pragma('foreign_keys = ON');

    // Initialize schema
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    // Execute each statement separately since sql.js doesn't support multiple statements in exec well
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
        try {
            wrapper._db.run(stmt + ';');
        } catch (e) {
            // Ignore "already exists" errors
            if (!e.message.includes('already exists')) {
                console.warn('Schema warning:', e.message);
            }
        }
    }
    wrapper._save();

    return wrapper;
}

function getDb() {
    if (!wrapper) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return wrapper;
}

module.exports = { initDatabase, getDb };
