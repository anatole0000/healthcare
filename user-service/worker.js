const { Worker } = require('bullmq');
const { sendMail } = require('./utils/mailer');
require('dotenv').config();


const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker('emailQueue', async job => {
  if (job.name === 'sendResetPasswordMail') {
    const { to, subject, text } = job.data;
    await sendMail({ to, subject, text });
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
