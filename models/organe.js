const db = require('./db');
const usefulFunction = require('./usefulFunction');

class Oganes extends usefulFunction {
    static async queryAllArticleOrganes() {
        return await db.query('SELECT * FROM press_organ');
    }

    static async getArticleByPress(pressOrgan, requestedPage) {
        let data;
        pressOrgan = await this.generateSlug(pressOrgan);

        const allPressOrgan = await this.queryAllArticleOrganes();
        let categoryMatched = false;
        for (const media of allPressOrgan.rows) {
            if (pressOrgan === await this.urllink(media.name)) {
                categoryMatched = true;
                if (requestedPage <= 0 || isNaN(requestedPage)) {
                    requestedPage = 1;
                }
                const count = await db.query('SELECT COUNT(*) AS numberOfArticles FROM news WHERE source_id = $1', [media.id]);
                const perPage = 10;
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
            throw new Error('L\'organe n\'existe pas !');
        }
        return data;
    }

    static queryAllSiteScrapping() {
        return db.queryAllSiteScrapping();
    }
}
module.exports = Oganes;