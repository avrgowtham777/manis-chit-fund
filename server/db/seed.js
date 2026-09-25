const bcrypt = require('bcryptjs');
const { initDatabase, getDb } = require('./database');

async function seed() {
    console.log('Starting seed process...');
    
    await initDatabase();
    const db = getDb();
    
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM chit_settings').get().count;
    if (settingsCount > 0) {
        console.log('Data already exists, skipping seed.');
        return;
    }

    try {
        db.exec('BEGIN TRANSACTION');

        // Create admin user
        const adminHash = await bcrypt.hash('Admin@123', 12);
        db.prepare(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`).run('admin', adminHash, 'admin');

        // Create chit settings
        db.prepare(`
            INSERT INTO chit_settings (name, chit_value, duration, pre_lift_payment, post_lift_payment, start_month, start_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("MANI'S CHIT FUND", 500000, 23, 23000, 25000, 'October', 2026);

        // Create 23 months
        const receivableAmounts = [480000, 480000, 480000, 485000, 490000, 495000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 500000, 502000, 503000, 505000, 510000, 520000, 535000];
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let currentMonthIdx = 9; // October (next month from September 2026)
        let currentYear = 2026;

        const monthIds = [];
        for (let i = 0; i < 23; i++) {
            const calendarMonth = `${monthNames[currentMonthIdx]} ${currentYear}`;
            const result = db.prepare(`
                INSERT INTO months (month_number, month_label, calendar_month, receivable_amount)
                VALUES (?, ?, ?, ?)
            `).run(i + 1, `Month ${i + 1}`, calendarMonth, receivableAmounts[i]);
            monthIds.push(result.lastInsertRowid);
            
            currentMonthIdx++;
            if (currentMonthIdx > 11) {
                currentMonthIdx = 0;
                currentYear++;
            }
        }

        // Create 15 members
        const memberNames = [
            'Siromani', 'Manjula', 'Mani Mallika (Chinnu friend)', 'Gold', 'Mallika (Chinnu friend)',
            'Aruna School', 'Saidulu', 'Lucky Akka', 'Krishna', 'Indhu',
            'Premalatha', 'Madhu', 'Surendra', 'Yerrodu', 'Mani Mallika (Chinnu friend)'
        ];

        const memberHash = await bcrypt.hash('Member@123', 12);

        const memberIds = [];
        for (let i = 0; i < 15; i++) {
            const codeNum = (i + 1).toString().padStart(3, '0');
            const memberCode = `MCF${codeNum}`;
            
            const memberResult = db.prepare('INSERT INTO members (member_code, name, status, lift_status) VALUES (?, ?, ?, ?)').run(memberCode, memberNames[i], 'active', 'not_lifted');
            const memberId = memberResult.lastInsertRowid;
            memberIds.push(memberId);

            db.prepare('INSERT INTO users (member_id, username, password_hash, role) VALUES (?, ?, ?, ?)').run(memberId, memberCode.toLowerCase(), memberHash, 'member');
        }

        // Create payment records for all members x all months
        for (const memberId of memberIds) {
            for (const monthId of monthIds) {
                db.prepare('INSERT INTO payments (member_id, month_id, amount_due, amount_paid, remaining_amount, status) VALUES (?, ?, ?, 0, ?, ?)').run(memberId, monthId, 23000, 23000, 'pending');
            }
        }

        db.exec('COMMIT');
        console.log('Database seeded successfully!');
        console.log('');
        console.log('=== Login Credentials ===');
        console.log('Admin:   username=admin, password=Admin@123');
        console.log('Members: username=mcf001 to mcf015, password=Member@123');
        console.log('');
    } catch (error) {
        db.exec('ROLLBACK');
        console.error('Seed failed:', error);
    }
}

seed();
