const { Client } = require('pg');

class BD {
    constructor() {
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: 'Avent123',
            port: 5432,
        });

        this.connect();
    }

    connect() {
        this.client.connect((err) => {
            if (err) {
                console.error('Erreur lors de la connexion à la base de données', err);
            } else {
                console.log('Connecté à la base de données');
            }
        });
    }

    async queryArticles(parPage, premier) {
        const sql = `
            SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name
            FROM ((press_organ p
            INNER JOIN news n ON n.source_id = p.id)
            INNER JOIN category c ON n.category_id = c.id)
            ORDER BY n.id DESC
            LIMIT $1 OFFSET $2`;

        const results = await this.client.query(sql, [parPage, premier]);
        return results.rows;
    }


    async lastArticle() {
        const sql = `
            SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name
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


    async queryPress(id, parPage, premier) {
        const sql = `SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.id AS category_id, c.name AS category, p.name AS press_name
                    FROM ((press_organ p
                    INNER JOIN news n ON n.source_id = p.id)
                    INNER JOIN category c ON n.category_id = c.id)
                    WHERE p.id = $1 ORDER BY n.id DESC  LIMIT $2 OFFSET $3`;
        return await this.client.query(sql, [id, parPage, premier]);
    }

    async category() {
        const sql = 'SELECT * FROM category';
        const results = await this.client.query(sql);
        return results;
    }

    async nbrNews() {
        const sql = 'SELECT COUNT(*) AS nb_articles FROM news';
        const results = await this.client.query(sql);
        return results.rows[0].nb_articles;
    }

    async query(sql, values) {
        try {
            const result = await this.client.query(sql, values);
            return result;
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête', err);
            throw err;
        }
    }

    async countSearch(q) {
        const sql = `SELECT COUNT(*) AS nb_articles FROM news WHERE content ILIKE $1 `;
        const results = await this.client.query(sql, ['%' + q + '%']);
        return results.rows[0].nb_articles;
    }

    async search(q, parPage, premier) {
        const sql = `SELECT n.id, n.title, n.image_url, n.content, n.scrapping_date, c.name AS category, p.name AS press_name
        FROM ((press_organ p
        INNER JOIN news n ON n.source_id = p.id)
        INNER JOIN category c ON n.category_id = c.id)
        WHERE n.content ILIKE $1 
        ORDER BY n.id DESC 
        LIMIT $2 OFFSET $3`;
        const results = await this.client.query(sql, ['%' + q + '%', parPage, premier]);
        return results;
    }

    async sitesUrl() {
        const sql = `SELECT * FROM press_organ INNER JOIN presse_url ON presse_url.press_id = press_organ.id`;
        const results = await this.client.query(sql);
        return results.rows;
    }
}

const bd = new BD();
module.exports = bd;
