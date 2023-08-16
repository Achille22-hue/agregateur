const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Oganes = require('../models/organe');
const bodyParser = require('body-parser');
const scrapeSite = require('../models/scrapping.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', async (req, res) => {
    await Article.queryAllArticle().then(async (pagingData) => {
        const lastArticle = await Article.getLastArticle();
        res.render('home', { pagingData: pagingData, lastArticle: lastArticle });
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/test', async (req, res) => {
    const sites = await Oganes.queryAllSiteScrapping();
    scrapeSite(sites[3]);
    res.send(sites[3]);
});


router.get('/paging/:currentPage', async (req, res) => {
    const requestedPage = req.params.currentPage || 1;
    await Article.queryAllArticle(parseInt(requestedPage)).then(async (pagingData) => {
        const lastArticle = await Article.getLastArticle();
        res.render('home', { pagingData: pagingData, lastArticle: lastArticle });
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/articles/:id/:title', async (req, res) => {
    const title = req.params.title;
    const id = parseInt(req.params.id);
    await Article.getArticleById(id, title).then((articles) => {
        res.render('detail', { articles: articles });
    }).catch((error) => {
        res.render('404', { error: error });
    });
});

router.get('/presse/:id/:currentPage?', async (req, res) => {
    const id = req.params.id;
    const currentPage = req.params.currentPage || 1;
    await Oganes.getArticleByPress(id, parseInt(currentPage)).then((pagingData) => {
        res.render('organe', { pagingData: pagingData, organes: id });
    }).catch((error) => {
        res.status(404).render('404');
        console.log(error);
    });
});

router.get('/all/organes', async (req, res) => {
    const organes = await Oganes.queryAllPressOrganes();
    res.status(200).json(organes.rows);
});

router.get('/actualite/:cat/:currentPage?', async (req, res) => {
    const cat = req.params.cat;
    const currentPage = req.params.currentPage || 1;
    await Article.getArticleByCategory(cat, parseInt(currentPage)).then((pagingData) => {
        res.render('categorie', { pagingData: pagingData, category: cat });
    }).catch((error) => {
        console.log(error);
        res.status(404).render('404');
    })
});

router.get('/search/:q/:currentPage?', async (req, res) => {
    const q = req.params.q;
    const requestedPage = req.params.currentPage || 1;
    const pagingData = await Article.searchForAnAticle(q, requestedPage);
    res.render('search', { pagingData: pagingData, searchValue: q });
});


module.exports = router;