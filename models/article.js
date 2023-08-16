const db = require('./db');
const Useful = require('./useful');

class Article extends Useful {


    static async newArticle(source_id, category_id, title, content, image_url) {
        console.log('In the process of scraping');
        const resultPromise = db.checkTitleExists(title, source_id);
        resultPromise.then(async titleExists => {
            if (titleExists || title === "") { return; }
            try {
                const downloadedImageName = await this.downloadImage(image_url);
                const insertValues = [source_id, category_id, title, content, downloadedImageName];
                await db.insertArticle(insertValues);
            } catch (error) {
                console.error('Erreur lors de l\'insertion de l\'article :', error.message);
            }
        }).catch(error => {
            console.error('Erreur lors de la vérification du titre :', error);
        });
    }

    static async queryAllArticle(requestedPage) {

        if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1; }
        const count = await db.numberOfArticles();
        const perPage = 10;
        const numberOfArticles = parseInt(count);
        const pages = Math.ceil(numberOfArticles / perPage);

        if (requestedPage > pages) { requestedPage = pages; }

        const first = ((requestedPage * perPage) - perPage) + 1;
        const articles = await db.queryArticles(perPage, first);

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

    static async getArticleByCategory(name, requestedPage) {
        const category = await db.category();
        let dta = { articles: [], totalPages: 0, titre: name, currentPage: 0 };
        let categoryMatched = false;

        for (const cat of category.rows) {
            if (name === await this.generateSlug(cat.name)) {
                categoryMatched = true;
                if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1; }
                const count = await db.query('SELECT COUNT(*) AS numberOfArticles FROM news WHERE category_id = $1', [cat.id]);
                const perPage = 10;
                const numberOfArticles = parseInt(count.rows[0].numberofarticles);

                const pages = Math.ceil(numberOfArticles / perPage);

                if (numberOfArticles == 0) {
                    dta = { articles: [], currentPage: requestedPage, totalPages: pages, titre: cat.name };
                    continue;
                }

                if (requestedPage > pages) { requestedPage = pages; }
                const first = (requestedPage * perPage) - perPage;
                const results = await db.query('SELECT * FROM category INNER JOIN news ON category.id = news.category_id WHERE category.id = $1 ORDER BY news.id DESC LIMIT $2 OFFSET $3', [cat.id, perPage, first]);
                const articles = results.rows;
                dta = { articles: articles, currentPage: requestedPage, totalPages: pages, titre: cat.name };
            }
        }
        if (!categoryMatched) { throw new Error('Category') }
        return dta;
    }

    static async searchNews(q, requestedPage) {
        const count = await db.countSearch(q);
        const perPage = 10;
        const numberOfArticles = parseInt(count);
        const pages = Math.ceil(numberOfArticles / perPage);
        const first = (parseInt(requestedPage) - 1) * perPage;
        const results = await db.search(q, perPage, first);
        const pagingData = { articles: results.rows, currentPage: requestedPage, totalPages: pages };
        console.log(pagingData);
        return pagingData;
    }
}

module.exports = Article;