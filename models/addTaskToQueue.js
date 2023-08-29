const Redis = require('ioredis');
const redis = new Redis();

const addTaskToQueue = async (task) => {
    try {
        const queueExists = await redis.exists('download-queue');
        if (!queueExists) {
            await redis.lpush('download-queue', JSON.stringify(task));
        } else {
            const existsInQueue = await redis.lrange('download-queue', 0, -1);
            if (!existsInQueue.includes(JSON.stringify(task))) {
                await redis.rpush('download-queue', JSON.stringify(task));
                console.log('Task added to the queue');
            } else {
                console.log('The task already exists in the queue');
            }
        }
    } catch (error) {
        console.error('Error adding task to queue:', error);
    }
};

module.exports = addTaskToQueue;