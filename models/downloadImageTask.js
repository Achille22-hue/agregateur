const db = require('./db');
const cron = require('node-cron');
const usefulFunction = require('./usefulFunction');
const Redis = require('ioredis');
const redis = new Redis();

const addImageUrlToQueue = async (article) => {
    await redis.rpush('download-queue', article);
};

const retrieveArticleUrls = async () => {
    const articleUrls = await db.retrieveArticleUrls();
    articleUrls.map((article, index) => {
        addImageUrlToQueue(JSON.stringify(article));
    });
};

const downloadImageTask = async (article) => {
    const retries = 3;
    try {
        await usefulFunction.downloadImage(article.image_url, article.id);
    } catch (error) {
        console.log(`${retries} Error downloading image from ${article.image_url}:`, error.message);
        if (retries > 0) {
            const delay = Math.pow(2, (3 - retries)) * 5000;
            setTimeout(() => downloadImageTask(article.image_url, retries - 1), delay);
            console.log(retries);
        } else {
            console.error(`Max retries reached for ${article.image_url}`);
        }
    }
};

setInterval(async () => {
    const article = await redis.lpop('download-queue');
    console.log(article);
    if (article) {
        await downloadImageTask(article);
    }
}, 5000);

cron.schedule('*/1 * * * *', retrieveArticleUrls);
module.exports = downloadImageTask;
