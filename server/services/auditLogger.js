function logAudit(db, { userId, action, entityType, entityId, oldValue, newValue, reason, ipAddress }) {
    const stmt = db.prepare(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, reason, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const safeStringify = (val) => val === undefined || val === null ? null : (typeof val === 'object' ? JSON.stringify(val) : String(val));

    stmt.run(
        userId,
        action,
        entityType,
        entityId,
        safeStringify(oldValue),
        safeStringify(newValue),
        reason,
        ipAddress || null
    );
}

module.exports = { logAudit };
