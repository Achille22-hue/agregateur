const db = require('./db');
const Useful = require('./useful');

class Oganes extends Useful {
    static async getAllOrganes() {
        return await db.query('SELECT * FROM press_organ');
    }

    static async getOrganesById(name, requestedPage) {
        let dta;
        name = await this.generateSlug(name);

        const press_organ = await this.getAllOrganes();
        let categoryMatched = false;
        for (const media of press_organ.rows) {
            if (name === await this.urllink(media.name)) {
                categoryMatched = true;
                if (requestedPage <= 0 || isNaN(requestedPage)) {
                    requestedPage = 1;
                }
                const count = await db.query('SELECT COUNT(*) AS nb_articles FROM news WHERE source_id = $1', [media.id]);
                const parPage = 10;
                const nb_articles = parseInt(count.rows[0].nb_articles);
                const pages = Math.ceil(nb_articles / parPage);

                if (requestedPage > pages) { requestedPage = pages; }

                const premier = (requestedPage * parPage) - parPage;

                if (nb_articles == 0) {
                    dta = { articles: [], currentPage: requestedPage, totalPages: pages, titre: media };
                    continue;
                }

                const results = await db.queryPress(media.id, parPage, premier);
                const articles = results.rows;

                dta = { articles: articles, currentPage: requestedPage, totalPages: pages, titre: media };
            }
        }

        if (!categoryMatched) {
            throw new Error('L\'organe n\'existe pas !');
        }
        return dta;
    }
}
module.exports = Oganes;