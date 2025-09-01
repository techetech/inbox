const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function addSampleEmails() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'secure_email',
    password: 'harsh@postsql',
    port: 5432,
  });

  try {
    // Get admin user and mailbox
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@localhost']
    );
    
    if (userResult.rows.length === 0) {
      console.log('Admin user not found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    const mailboxResult = await pool.query(
      'SELECT id FROM mailboxes WHERE user_id = $1 AND name = $2',
      [userId, 'Inbox']
    );
    
    if (mailboxResult.rows.length === 0) {
      console.log('Inbox not found');
      return;
    }
    
    const mailboxId = mailboxResult.rows[0].id;

    // Sample emails with different security statuses
    const sampleEmails = [
      {
        from: 'security@cyberbank.com',
        subject: 'Security Alert: Unusual Login Activity',
        body: 'We detected unusual login activity on your account from IP 192.168.1.100. If this was not you, please contact support immediately.',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        status: 'delivered'
      },
      {
        from: 'notifications@suspicious-site.tk',
        subject: 'URGENT: Your account will be suspended!',
        body: 'Click here immediately to verify your account: http://phishing-site.tk/verify. You have 24 hours before suspension.',
        spf: 'fail',
        dkim: 'fail', 
        dmarc: 'fail',
        status: 'quarantined'
      },
      {
        from: 'newsletter@techcrunch.com',
        subject: 'Weekly Tech News Digest',
        body: 'This week in tech: AI breakthroughs, cybersecurity trends, and startup funding rounds. Read our latest analysis...',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        status: 'delivered'
      },
      {
        from: 'support@microsoft.com',
        subject: 'Office 365 License Renewal',
        body: 'Your Office 365 license is set to expire in 30 days. Please renew to continue using Microsoft services.',
        spf: 'pass',
        dkim: 'fail',
        dmarc: 'pass',
        status: 'delivered'
      },
      {
        from: 'admin@localhost',
        subject: 'Test Email from Internal System',
        body: 'This is a test email sent from the internal email system to verify functionality.',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        status: 'delivered'
      }
    ];

    console.log('Adding sample emails...');
    
    for (const email of sampleEmails) {
      const messageId = uuidv4();
      const receivedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days
      
      await pool.query(
        `INSERT INTO messages (
          id, mailbox_id, from_email, to_emails, subject, body_text,
          received_at, direction, status, spf_result, dkim_result, dmarc_result
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          messageId,
          mailboxId,
          email.from,
          ['admin@localhost'],
          email.subject,
          email.body,
          receivedAt,
          0, // inbound
          email.status,
          email.spf,
          email.dkim,
          email.dmarc
        ]
      );
      
      console.log(`Added email: ${email.subject}`);
    }
    
    console.log('Sample emails added successfully!');
    
  } catch (error) {
    console.error('Error adding sample emails:', error);
  } finally {
    await pool.end();
  }
}

addSampleEmails();
