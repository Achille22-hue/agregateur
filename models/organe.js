const db = require('./db');
const usefulFunction = require('./usefulFunction');

class Oganes extends usefulFunction {

    /**
     * Method to retrieve all press organ
     * @returns object
     */
    static async queryAllPressOrganes() {
        return await db.query('SELECT * FROM press_organ');
    }

    /**
     * Method to retrieve all articles from a press organ
     * @param {string} pressOrgan 
     * @param {number} requestedPage 
     * @returns json object
     */

    static async getArticleByPress(pressOrgan, requestedPage) {
        const allPressOrgan = await this.queryAllPressOrganes();
        let data;
        pressOrgan = this.generateSlug(pressOrgan);
        let categoryMatched = false;
        const perPage = 10;

        for (const media of allPressOrgan.rows) {
            if (pressOrgan === await this.urllink(media.name)) {
                categoryMatched = true;

                if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1 }

                const count = await db.query('SELECT COUNT(*) AS numberOfArticles FROM news WHERE source_id = $1', [media.id]);
                const numberOfArticles = parseInt(count.rows[0].numberofarticles);
                const pages = Math.ceil(numberOfArticles / perPage);

                if (requestedPage > pages) { requestedPage = pages; }
                const first = (requestedPage * perPage) - perPage;
                if (numberOfArticles == 0) {
                    data = { articles: [], currentPage: requestedPage, totalPages: pages, title: media };
                    continue;
                }
                const results = await db.queryPress(media.id, perPage, first);
                const articles = results.rows;
                data = { articles: articles, currentPage: requestedPage, totalPages: pages, title: media };
            }
        }

        if (!categoryMatched) {
            throw new Error('The organ does not exist!');
        }
        return data;
    }

    /**
     * Method to retrieve site scrapping
     * @returns json object
     */
    static queryAllSiteScrapping() {
        return db.queryAllSiteScrapping();
    }
}
module.exports = Oganes;