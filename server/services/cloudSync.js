const fs = require('fs');
const path = require('path');

const GIST_DESC = 'MANI_CHIT_FUND_PERSISTENT_DATABASE';
const GIST_FILENAME = 'chitfund.db.b64';

let activeGistId = process.env.GIST_ID || null;
let lastSyncedAt = null;
let lastError = null;
let debounceTimeout = null;

function isCloudSyncEnabled() {
    return Boolean(process.env.GITHUB_TOKEN);
}

function getSyncStatus() {
    return {
        enabled: isCloudSyncEnabled(),
        gistId: activeGistId,
        lastSyncedAt,
        lastError
    };
}

/**
 * Restore database binary buffer from GitHub Gist on startup
 */
async function restoreFromCloud(localDbPath) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.log('[CLOUD-SYNC] GITHUB_TOKEN not configured. Running in local disk mode.');
        return null;
    }

    console.log('[CLOUD-SYNC] GITHUB_TOKEN detected. Checking cloud persistent storage...');

    try {
        let targetGist = null;

        if (activeGistId) {
            // Fetch directly by ID
            const res = await fetch(`https://api.github.com/gists/${activeGistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Mani-Chit-Fund'
                }
            });
            if (res.ok) {
                targetGist = await res.json();
            }
        }

        if (!targetGist) {
            // Search user's gists for our persistent database gist
            const listRes = await fetch('https://api.github.com/gists?per_page=50', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Mani-Chit-Fund'
                }
            });

            if (listRes.ok) {
                const gists = await listRes.json();
                targetGist = gists.find(g => g.description === GIST_DESC);
                if (targetGist) {
                    activeGistId = targetGist.id;
                    // Fetch full gist data
                    const fullRes = await fetch(`https://api.github.com/gists/${targetGist.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Mani-Chit-Fund'
                        }
                    });
                    if (fullRes.ok) {
                        targetGist = await fullRes.json();
                    }
                }
            } else {
                const errText = await listRes.text();
                throw new Error(`Failed to list gists: ${listRes.status} ${errText}`);
            }
        }

        if (targetGist && targetGist.files && targetGist.files[GIST_FILENAME]) {
            const rawContent = targetGist.files[GIST_FILENAME].content;
            if (rawContent && rawContent.trim().length > 0) {
                const buffer = Buffer.from(rawContent.trim(), 'base64');
                fs.writeFileSync(localDbPath, buffer);
                lastSyncedAt = new Date().toISOString();
                activeGistId = targetGist.id;
                console.log(`[CLOUD-SYNC] SUCCESS: Restored database from GitHub Gist (${activeGistId})! Bytes: ${buffer.length}`);
                return buffer;
            }
        }

        // If gist doesn't exist yet, we will create it after initializing with local data
        console.log('[CLOUD-SYNC] No existing cloud database found. Will create a new private cloud storage gist on first save.');
        return null;
    } catch (err) {
        lastError = err.message;
        console.error('[CLOUD-SYNC] Failed to restore from cloud:', err.message);
        return null;
    }
}

/**
 * Queue a background save to GitHub Gist (debounced 2.5s)
 */
function queueCloudSave(getBufferFn) {
    if (!isCloudSyncEnabled()) return;

    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
        try {
            const buffer = getBufferFn();
            await performCloudUpload(buffer);
        } catch (e) {
            console.error('[CLOUD-SYNC] Debounced save error:', e.message);
        }
    }, 2500);
}

/**
 * Immediate upload to GitHub Gist
 */
async function performCloudUpload(buffer) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return;

    const b64 = buffer.toString('base64');

    try {
        if (!activeGistId) {
            // Create new secret gist
            const createRes = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mani-Chit-Fund'
                },
                body: JSON.stringify({
                    description: GIST_DESC,
                    public: false,
                    files: {
                        [GIST_FILENAME]: { content: b64 }
                    }
                })
            });

            if (createRes.ok) {
                const newGist = await createRes.json();
                activeGistId = newGist.id;
                lastSyncedAt = new Date().toISOString();
                lastError = null;
                console.log(`[CLOUD-SYNC] SUCCESS: Created new private cloud storage gist (${activeGistId})!`);
            } else {
                const errText = await createRes.text();
                throw new Error(`Failed to create gist: ${createRes.status} ${errText}`);
            }
        } else {
            // Update existing gist
            const patchRes = await fetch(`https://api.github.com/gists/${activeGistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mani-Chit-Fund'
                },
                body: JSON.stringify({
                    description: GIST_DESC,
                    files: {
                        [GIST_FILENAME]: { content: b64 }
                    }
                })
            });

            if (patchRes.ok) {
                lastSyncedAt = new Date().toISOString();
                lastError = null;
                console.log(`[CLOUD-SYNC] SUCCESS: Synced latest database to cloud gist (${activeGistId}) at ${lastSyncedAt}`);
            } else {
                const errText = await patchRes.text();
                throw new Error(`Failed to update gist: ${patchRes.status} ${errText}`);
            }
        }
    } catch (err) {
        lastError = err.message;
        console.error('[CLOUD-SYNC] Cloud upload error:', err.message);
    }
}

module.exports = {
    isCloudSyncEnabled,
    getSyncStatus,
    restoreFromCloud,
    queueCloudSave,
    performCloudUpload
};
