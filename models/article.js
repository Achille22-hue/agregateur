const db = require('./db');
const usefulFunction = require('./usefulFunction');
const downloadImageTask = require('./downloadImageTask');

/**
 * Class representing the database connection
 */
class Article extends usefulFunction {

    /**
     * Method to add a new article to the database
     * @param {number} source_id 
     * @param {number} category_id 
     * @param {string} title 
     * @param {string} content
     * @param {string} image_url
     * @returns Object
     */
    static async addNewArticle(source_id, category_id, title, content, image_url) {
        console.log('In the process of scraping');
        try {
            const titleExists = await db.checkTitleExists(title, source_id);
            if (titleExists || title === "") { return 'This title exists' }
            const insertValues = [source_id, category_id, title, content, image_url];
            const article = await db.insertArticle(insertValues);
            downloadImageTask(article);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    /**
     * Method to manage the pagination of the articles retrieved according to the page requested
     * @param {number} requestedPage 
     * @returns Returns an object containing the data to retrieve, the current page and the total page
     */
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

    /**
     * Method to retrieve the last article from the database
     * @returns Last article from the database
     */
    static async getLastArticle() {
        const results = await db.lastArticle();
        return results;
    }

    /**
     * Method to retrieve an article according to its ID
     * @param {number} id 
     * @param {string} title 
     * @returns Article according to its ID
     */
    static async getArticleById(id, title) {
        const results = await db.query('SELECT * FROM ((press_organ AS po INNER JOIN news AS n1 ON n1.source_id = po.id) INNER JOIN category AS c ON n1.category_id = c.id) WHERE n1.id = $1', [id]);
        const article = results.rows;

        if (article.length > 0) {
            const generatedSlug = this.generateSlug(article[0].title);
            if (generatedSlug === title) {
                return article[0];
            } else {
                throw new Error('Slug does not fit');
            }
        } else {
            throw new Error('Item not found');
        }
    }

    /**
     * Method to retrieve an article according to its category
     * @param {string} categoryName 
     * @param {number} requestedPage 
     * @returns Article according to its category
     */
    static async getArticleByCategory(categoryName, requestedPage) {
        const categorys = await db.getAllCategory();
        let data = { articles: [], totalPages: 0, title: categoryName, currentPage: 0 };
        let categoryMatched = false;

        for (const category of categorys.rows) {
            if (categoryName === await this.generateSlug(category.name)) {
                categoryMatched = true;
                if (requestedPage <= 0 || isNaN(requestedPage)) { requestedPage = 1; }
                const count = await db.query('SELECT COUNT(*) AS numberOfArticles FROM news WHERE category_id = $1', [category.id]);
                const perPage = 10;
                const numberOfArticles = parseInt(count.rows[0].numberofarticles);
                const pages = Math.ceil(numberOfArticles / perPage);
                if (numberOfArticles == 0) {
                    data = { articles: [], currentPage: requestedPage, totalPages: pages, title: category.name };
                    continue;
                }
                if (requestedPage > pages) { requestedPage = pages; }
                const firstArticleIndex = (requestedPage * perPage) - perPage;
                const articlesResult = await db.getArticlesByCategoryId(category.id, perPage, firstArticleIndex);
                const articles = articlesResult.rows;
                data = { articles: articles, currentPage: requestedPage, totalPages: pages, title: category.name };
            }
        }
        if (!categoryMatched) { throw new Error('Category not found') }
        return data;
    }

    /**
     * Method to retrieve an number of articles corresponding to the search criteria
     * @param {string} q 
     * @param {number} requestedPage 
     * @returns returns the number of articles corresponding to the search criteria
     */
    static async searchForAnAticle(q, requestedPage) {
        const count = await db.searchMatchCount(q);
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