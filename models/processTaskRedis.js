const db = require('./db');
const cron = require('node-cron');
const usefulFunction = require('./usefulFunction');
const Redis = require('ioredis');
const redis = new Redis();
const addTaskToQueue = require('./addTaskToQueue');

const processTask = async (task, retries = 3) => {
    try {
        const downloadSuccessful = await usefulFunction.downloadImage(task.image_url, task.id);
        if (!downloadSuccessful) {
            const delay = (4 - retries) * 5000;
            if (retries > 0) {
                setTimeout(() => processTask(task, retries - 1), delay);
            }
        }
    } catch (error) {
        await redis.rpush('download-queue', JSON.stringify(task));
        console.error(`Download failed: ${task.image_url}`);
    }
};

const processQueueContinuously = async () => {
    // await redis.flushall();
    try {
        let task = await redis.lpop('download-queue');
        if (task) {
            await processTask(JSON.parse(task));
        }
    } catch (error) {
        console.error('Error processing queue:', error);
    } finally {
        setTimeout(processQueueContinuously, 5000);
    }
};

cron.schedule('*/1 * * * *', async () => {
    const articleUrls = await db.retrieveArticleUrls();
    articleUrls.forEach(addTaskToQueue);
});

processQueueContinuously();