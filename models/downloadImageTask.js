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
    articleUrls.map((article) => {
        addImageUrlToQueue(JSON.stringify(article));
    });
};

const downloadImageTask = async (article, retries = 3) => {
    try {
        console.log(article.image_url.toString());
        await usefulFunction.downloadImage(article.image_url, article.id);
    } catch (error) {
        console.log(`${3 - retries + 1} Error downloading image from ${article.image_url} :`, error.message);
        if (retries > 0) {
            const delay = (4 - retries) * 5000;
            setTimeout(() => downloadImageTask(article, retries - 1), delay);
        } else {
            console.error(`Maximum number of retries reached for ${article.image_url}`);
        }
    }
};

setInterval(async () => {
    let article = await redis.lpop('download-queue');
    if (article) {
        await downloadImageTask(JSON.parse(article));
    }
}, 5000);

cron.schedule('*/1 * * * *', retrieveArticleUrls);
module.exports = downloadImageTask;