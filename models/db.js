const { Client } = require('pg');

/**
 * Class representing the database connection
 */
class BD {
    constructor() {
        this.client = new Client({ user: 'postgres', host: 'localhost', database: 'postgres', password: 'Avent123', port: 5432, });
        this.connect();
    }

    connect() {
        this.client.connect((err) => {
            if (err) {
                console.error('Error connecting to database', err);
            } else {
                console.log('Connected to database');
            }
        });
    }

    /**
     * Method to retrieve article urls and add them to the queue
     * @returns Objet article urls
     */
    async retrieveArticleUrls() {
        const query = 'SELECT id, image_url FROM news WHERE status = 0';
        const articleUrls = await this.client.query(query);
        return articleUrls.rows;
    }

    /**
     * Method to insert a new article in the database
     * @param {Array} insertValues 
     * @returns 
     */
    async insertArticle(insertValues) {
        const query = 'INSERT INTO news (source_id, category_id, title, content, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id,image_url';
        const articleId = await this.client.query(query, insertValues);
        const id = articleId.rows[0];
        return id;
    }

    async editArticleURLsImage(id, imgName) {
        const query = 'UPDATE news SET image_url = $1, status = $2 WHERE id = $3';
        await this.client.query(query, [imgName, 1, id]);
    }

    /**
     * Method executing the item selection query
     * @param {number} perPage 
     * @param {number} premier 
     * @returns object of data
     */
    async queryArticles(perPage, premier) {
        const sql = `
            SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name
            FROM ((press_organ p
            INNER JOIN news n ON n.source_id = p.id)
            INNER JOIN category c ON n.category_id = c.id)
            ORDER BY n.id DESC
            LIMIT $1 OFFSET $2`;

        const results = await this.client.query(sql, [perPage, premier]);
        return results.rows;
    }

    /**
     * Method executing the last item selection query
     * @returns data || null
     */
    async lastArticle() {
        const sql = `
            SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name, p.logo AS logo
            FROM ((press_organ p
            INNER JOIN news n ON n.source_id = p.id)
            INNER JOIN category c ON n.category_id = c.id)
            ORDER BY n.id DESC
            LIMIT 1`;
        const results = await this.client.query(sql);
        if (results.rows.length > 0) {
            return results.rows[0];
        } else {
            return null;
        }
    }

    /**
     * Method for executing the query for selecting articles by press organ
     * @param {number} id 
     * @param {number} perPage 
     * @param {number} premier 
     * @returns object
     */
    async queryPress(id, perPage, premier) {
        const sql = `SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.id AS category_id, c.name AS category, p.name AS press_name
                    FROM ((press_organ p
                    INNER JOIN news n ON n.source_id = p.id)
                    INNER JOIN category c ON n.category_id = c.id)
                    WHERE p.id = $1 ORDER BY n.id DESC  LIMIT $2 OFFSET $3`;
        return await this.client.query(sql, [id, perPage, premier]);
    }

    /**
     * Method for executing the query for selecting all category
     * @returns object
     */
    async getAllCategory() {
        const sql = 'SELECT * FROM category';
        const results = await this.client.query(sql);
        return results;
    }

    /**
     * Method for executing the query for selecting number of articles
     * @returns number
     */
    async numberOfArticles() {
        const sql = 'SELECT COUNT(*) AS numberofarticles FROM news';
        const results = await this.client.query(sql);
        return results.rows[0].numberofarticles;
    }

    /**
     * Method for executing the query PostgreSQL requests
     * @param {string} sql PostgreSQL query
     * @param {Array} values PostgreSQL query values
     * @returns data in object
     */
    async query(sql, values) {
        try {
            const result = await this.client.query(sql, values);
            return result;
        } catch (err) {
            console.error('Error while executing the query', err);
            throw err;
        }
    }

    /**
     * Method for executing the query for search match count
     * @param {string} q 
     * @returns object
     */
    async searchMatchCount(q) {
        const sql = `SELECT COUNT(*) AS numberofarticles FROM news WHERE content ILIKE $1 `;
        const results = await this.client.query(sql, ['%' + q + '%']);
        return results.rows[0].numberofarticles;
    }

    /**
     * Method for executing the query for search match count by per page and limit
     * @param {string} q
     * @param {number} perPage
     * @param {string} premier
     * @returns object
     */
    async search(q, perPage, premier) {
        const sql = `SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name
        FROM ((press_organ p
        INNER JOIN news n ON n.source_id = p.id)
        INNER JOIN category c ON n.category_id = c.id)
        WHERE n.content ILIKE $1 
        ORDER BY n.id DESC 
        LIMIT $2 OFFSET $3`;
        const results = await this.client.query(sql, ['%' + q + '%', perPage, premier]);
        return results;
    }

    /**
     * Method to recover scrapping data
     * @returns object
     */
    async queryAllSiteScrapping() {
        const sql = `SELECT * FROM press_organ INNER JOIN scrap_data ON scrap_data.press_id = press_organ.id`;
        const results = await this.client.query(sql);
        return results.rows;
    }

    /**
     * Method to check whether an art title
     * @returns number
     */
    async checkTitleExists(title, press_id) {
        try {
            const query = 'SELECT COUNT(*) FROM news WHERE title = $1 AND source_id = $2';
            const result = await this.client.query(query, [title, press_id]);
            const count = parseInt(result.rows[0].count, 10);
            return count;
        } catch (error) {
            console.error('Error while checking the existence of the title:', error.message);
            return false;
        }
    }

    /**
     * Method to retrieve the number of articles having as category the category name pass as a parameter
     * @param {string} categoryName 
     * @returns number
     */
    async getArticleCountByCategoryName(categoryName) {
        const countResult = await this.client.query('SELECT COUNT(*) AS numberOfArticles FROM news WHERE category_id = $1', [categoryName]);
        const numberOfArticles = parseInt(countResult.rows[0].numberOfArticles, 10);
        return numberOfArticles;
    }

    /**
     * Method to retrieve the number of articles having as category the category id pass as a parameter
     * @param {string} categoryName 
     * @returns object
     */
    async getArticlesByCategoryId(categoryid, perPage, firstArticleIndex) {
        return this.client.query('SELECT * FROM category INNER JOIN news ON category.id = news.category_id WHERE category.id = $1 ORDER BY news.id DESC LIMIT $2 OFFSET $3', [categoryid, perPage, firstArticleIndex]);
    }
}

const bd = new BD();
module.exports = bd;
