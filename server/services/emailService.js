import nodemailer from 'nodemailer';
import {
  formatDate,
  getConfidenceLabel,
  getNextRevisionDate,
  daysOverdue,
} from '../utils/revision.js';

let transporter = null;

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

export function isEmailConfigured() {
  const { host, auth } = getSmtpConfig();
  return Boolean(host && auth.user && auth.pass);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    throw new Error('SMTP is not configured. Add SMTP settings to server/.env');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport(getSmtpConfig());
  }
  return transporter;
}

function getRevisionTip(confidenceLevel, tags = []) {
  const tips = {
    1: 'Start from scratch — write brute force first, then optimize. Do not peek at old notes for at least 15 minutes.',
    2: 'Re-solve without looking at your approach. Focus on the edge case you missed last time.',
    3: 'Try solving in a different way (iterative vs recursive). Explain your approach out loud as if in an interview.',
    4: 'Speed run it in 20 minutes. Then write a clean, interview-ready explanation.',
    5: 'Quick refresh: solve once, then teach the pattern to an imaginary friend in 2 minutes.',
  };

  const tagTips = {
    DP: 'Draw the state table before coding. Ask: what subproblem am I reusing?',
    Graph: 'List BFS vs DFS trade-offs for this problem before you start.',
    Trees: 'Sketch the tree and trace your pointer movement on paper first.',
    'Sliding Window': 'Define window invariant in one sentence before writing code.',
    'Binary Search': 'Write the search space and the condition that shrinks it.',
  };

  const tagTip = tags.find((t) => tagTips[t]);
  const base = tips[confidenceLevel] || tips[3];
  return tagTip ? `${base} ${tagTips[tagTip]}` : base;
}

function buildQuestionBlock(q, intervals) {
  const nextDate = getNextRevisionDate(q, intervals);
  const overdue = daysOverdue(q, intervals);
  const label = getConfidenceLabel(q.confidenceLevel);
  const tags = (q.tags || []).join(', ') || 'No tags';
  const tip = getRevisionTip(q.confidenceLevel, q.tags);

  const urgency = overdue > 0
    ? `Overdue by ${overdue} day${overdue > 1 ? 's' : ''}`
    : 'Due today';

  return `
    <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="margin:0 0 8px;color:#f8fafc;font-size:18px;">${q.questionName}</h3>
      <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;">
        <strong style="color:#60a5fa;">${q.platform}</strong>
        &nbsp;·&nbsp; Confidence ${q.confidenceLevel}/5 (${label})
        &nbsp;·&nbsp; <span style="color:#f87171;">${urgency}</span>
      </p>
      <p style="margin:0 0 8px;color:#cbd5e1;font-size:13px;"><strong>Tags:</strong> ${tags}</p>
      <p style="margin:0 0 8px;color:#cbd5e1;font-size:13px;"><strong>Scheduled revision:</strong> ${formatDate(nextDate)}</p>
      ${q.mistakeNotes ? `<p style="margin:0 0 12px;color:#fca5a5;font-size:13px;background:#450a0a33;padding:10px;border-radius:8px;"><strong>Your past mistake:</strong> ${q.mistakeNotes}</p>` : ''}
      <p style="margin:0;color:#86efac;font-size:13px;background:#14532d33;padding:10px;border-radius:8px;">
        <strong>Today's challenge:</strong> ${tip}
      </p>
    </div>
  `;
}

function buildDigestHtml(questions, intervals) {
  const count = questions.length;
  const blocks = questions.map((q) => buildQuestionBlock(q, intervals)).join('');

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,Segoe UI,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#2563eb;color:white;padding:8px 16px;border-radius:8px;font-weight:700;font-size:14px;">DSA Revision Tracker</div>
          <h1 style="color:#f8fafc;margin:16px 0 8px;font-size:24px;">Time to revise ${count} question${count > 1 ? 's' : ''}</h1>
          <p style="color:#94a3b8;margin:0;font-size:14px;">
            Your spaced-revision schedule says these problems need attention today.
            Open the tracker, solve from scratch, then hit <strong>Mark as Revised</strong>.
          </p>
        </div>
        ${blocks}
        <div style="text-align:center;margin-top:24px;padding:16px;background:#1e293b;border-radius:12px;">
          <p style="color:#64748b;font-size:12px;margin:0;">
            Consistency beats cramming. Even 30 minutes of focused revision today compounds over weeks.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildDigestText(questions, intervals) {
  const header = `DSA Revision Tracker — ${questions.length} question(s) due today\n${'='.repeat(50)}\n\n`;

  const body = questions.map((q) => {
    const nextDate = getNextRevisionDate(q, intervals);
    const overdue = daysOverdue(q, intervals);
    const urgency = overdue > 0 ? `Overdue by ${overdue} day(s)` : 'Due today';
    const tip = getRevisionTip(q.confidenceLevel, q.tags);

    return [
      `Question: ${q.questionName}`,
      `Platform: ${q.platform}`,
      `Confidence: ${q.confidenceLevel}/5 (${getConfidenceLabel(q.confidenceLevel)})`,
      `Status: ${urgency}`,
      `Revision date: ${formatDate(nextDate)}`,
      `Tags: ${(q.tags || []).join(', ') || 'None'}`,
      q.mistakeNotes ? `Past mistake: ${q.mistakeNotes}` : null,
      `Challenge: ${tip}`,
      '',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return header + body + '\nOpen your DSA Revision Tracker and mark each question as revised after solving.';
}

export async function sendRevisionDigest(recipientEmail, questions, intervals) {
  const mail = getTransporter();
  const count = questions.length;
  const subject = count === 1
    ? `Revise today: ${questions[0].questionName} (${questions[0].platform})`
    : `Revise today: ${count} DSA questions waiting for you`;

  await mail.sendMail({
    from: `"DSA Revision Tracker" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    text: buildDigestText(questions, intervals),
    html: buildDigestHtml(questions, intervals),
  });
}

export async function sendWeeklySummary(recipientEmail, { stats, questions, intervals }) {
  const mail = getTransporter();
  const weakTopics = stats.topicWeakness?.slice(0, 5).map((t) => `${t.tag}: ${t.count}`).join(', ') || 'None';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:12px;">
      <h2 style="color:#60a5fa;">Weekly DSA Summary</h2>
      <ul style="color:#cbd5e1;line-height:2;">
        <li>Total questions: <strong>${stats.total}</strong></li>
        <li>Weak: <strong>${stats.weak}</strong> | Strong: <strong>${stats.strong}</strong></li>
        <li>Due today: <strong>${stats.dueToday}</strong></li>
        <li>Due next 7 days: <strong>${stats.dueNextWeek}</strong></li>
        <li>Revision streak: <strong>${stats.streak} days</strong></li>
        <li>Top weak topics: <strong>${weakTopics}</strong></li>
      </ul>
      ${stats.daysUntilInterview !== null ? `<p style="color:#94a3b8;">Interview in <strong>${stats.daysUntilInterview}</strong> days. Suggested: <strong>${stats.suggestedDailyRevisions}</strong> revisions/day.</p>` : ''}
    </div>
  `;

  await mail.sendMail({
    from: `"DSA Revision Tracker" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `Weekly DSA Summary — ${stats.dueToday} due, ${stats.streak}-day streak`,
    text: `Weekly summary: ${stats.total} total, ${stats.weak} weak, ${stats.dueToday} due today, streak ${stats.streak}`,
    html,
  });
}

export async function sendTestEmail(recipientEmail) {
  const mail = getTransporter();

  await mail.sendMail({
    from: `"DSA Revision Tracker" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: 'DSA Revision Tracker — Test email successful',
    text: [
      'Your email alerts are configured correctly.',
      '',
      'When a question\'s revision date arrives, you\'ll receive a digest with:',
      '- Question name and platform',
      '- Confidence level and tags',
      '- A personalized "solve from scratch" challenge',
      '- Reminders of past mistakes (if recorded)',
      '',
      'Keep the server running (or deploy it) so the daily check can send alerts on time.',
    ].join('\n'),
    html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:12px;">
        <h2 style="color:#60a5fa;margin-top:0;">Email alerts are working</h2>
        <p style="color:#cbd5e1;line-height:1.6;">Your DSA Revision Tracker is ready to nudge you when revision dates arrive.</p>
        <ul style="color:#94a3b8;line-height:1.8;font-size:14px;">
          <li>Question name &amp; platform in every alert</li>
          <li>Custom "solve from scratch" challenges</li>
          <li>Past mistake reminders</li>
          <li>Daily digest at your scheduled time</li>
        </ul>
        <p style="color:#64748b;font-size:12px;margin-bottom:0;">You're all set. Happy revising!</p>
      </div>
    `,
  });
}

export async function verifySmtpConnection() {
  const mail = getTransporter();
  await mail.verify();
}
