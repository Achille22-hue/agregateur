const db = require('./db');
const Useful = require('./useful');

class Article extends Useful {


    static async newArticle(source_id, category_id, title, content, image_url) {

        console.log('In the process of scraping');

        const selected = await db.query('SELECT * FROM news WHERE title = $1 AND source_id = $2', [title, source_id]);
        if (selected.rows[0] || title == "") {
            return;
        } else {
            const downloadedImageName = await this.downloadImage(image_url);
            await db.query('INSERT INTO news (source_id, category_id, title, content, image_url) VALUES ($1, $2, $3, $4, $5) ', [source_id, category_id, title, content, downloadedImageName]);
        }
    }


    static async getAll(requestedPage) {

        if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1; }
        const count = await db.nbrNews();
        const parPage = 10;
        const nb_articles = parseInt(count);
        const pages = Math.ceil(nb_articles / parPage);

        if (requestedPage > pages) { requestedPage = pages; }

        const premier = ((requestedPage * parPage) - parPage) + 1;
        const articles = await db.queryArticles(parPage, premier);

        return { articles: articles, currentPage: requestedPage, totalPages: pages };
    }

    static async getLastArticle() {
        const results = await db.lastArticle();
        return results;
    }

    static async getById(id, titre) {
        const results = await db.query('SELECT * FROM ((press_organ AS po INNER JOIN news AS n1 ON n1.source_id = po.id) INNER JOIN category AS c ON n1.category_id = c.id) WHERE n1.id = $1', [id]);
        const article = results.rows;

        if (article.length > 0) {
            const generatedSlug = this.generateSlug(article[0].title);
            if (generatedSlug === titre) {
                return article[0];
            } else {
                throw new Error('Slug ne correspond pas');
            }
        } else {
            throw new Error('Article non trouvé');
        }
    }

    static async getArticleByCat(name, requestedPage) {
        const category = await db.category();
        let dta = { articles: [], totalPages: 0, titre: name, currentPage: 0 };
        let categoryMatched = false;

        for (const cat of category.rows) {
            if (name === await this.generateSlug(cat.name)) {
                categoryMatched = true;
                if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1; }
                const count = await db.query('SELECT COUNT(*) AS nb_articles FROM news WHERE category_id = $1', [cat.id]);
                const parPage = 10;
                const nb_articles = parseInt(count.rows[0].nb_articles);

                const pages = Math.ceil(nb_articles / parPage);

                if (nb_articles == 0) {
                    dta = { articles: [], currentPage: requestedPage, totalPages: pages, titre: cat.name };
                    continue;
                }

                if (requestedPage > pages) { requestedPage = pages; }
                const premier = (requestedPage * parPage) - parPage;
                const results = await db.query('SELECT * FROM category INNER JOIN news ON category.id = news.category_id WHERE category.id = $1 ORDER BY news.id DESC LIMIT $2 OFFSET $3', [cat.id, parPage, premier]);
                const articles = results.rows;
                dta = { articles: articles, currentPage: requestedPage, totalPages: pages, titre: cat.name };
            }
        }
        if (!categoryMatched) {
            throw new Error('Category');
        }
        return dta;
    }

    static async searchNews(q, requestedPage) {
        const count = await db.countSearch(q);
        const parPage = 10;
        const nb_articles = parseInt(count);
        const pages = Math.ceil(nb_articles / parPage);
        const premier = (parseInt(requestedPage) - 1) * parPage;
        const results = await db.search(q, parPage, premier);
        const pagingData = { articles: results.rows, currentPage: requestedPage, totalPages: pages };
        console.log(pagingData);
        return pagingData;
    }
}

module.exports = Article;