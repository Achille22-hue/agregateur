const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Oganes = require('../models/organe');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.get('/', async (req, res) => {
    await Article.getAll().then(async (pagingData) => {
        const lastArticle = await Article.getLastArticle();
        res.render('home', { pagingData: pagingData, lastArticle: lastArticle });
    }).catch((error) => {
        console.log(error);
    });
});


router.get('/paging/:page', async (req, res) => {
    const requestedPage = req.params.page || 1;
    await Article.getAll(parseInt(requestedPage)).then(async (pagingData) => {
        const lastArticle = await Article.getLastArticle();
        res.render('home', { pagingData: pagingData, lastArticle: lastArticle });
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/articles/:id/:titre', async (req, res) => {
    const titre = req.params.titre;
    const id = parseInt(req.params.id);
    await Article.getById(id, titre).then((articles) => {
        res.render('detail', { articles: articles });
    }).catch((error) => {
        res.render('404', { error: error });
    });
});

router.get('/presse/:id/:page?', async (req, res) => {
    const id = req.params.id;
    const page = req.params.page || 1;
    await Oganes.getOrganesById(id, parseInt(page)).then((pagingData) => {
        res.render('organe', { pagingData: pagingData, organes: id });
    }).catch((error) => {
        res.status(404).render('404');
        console.log(error);
    });
});

router.get('/all/organes', async (req, res) => {
    const organes = await Oganes.getAllOrganes();
    res.status(200).json(organes.rows);
});

router.get('/actualite/:cat/:page?', async (req, res) => {
    const cat = req.params.cat;
    const page = req.params.page || 1;
    await Article.getArticleByCat(cat, parseInt(page)).then((pagingData) => {
        res.render('categorie', { pagingData: pagingData, category: cat });
    }).catch((error) => {
        console.log(error);
        res.status(404).render('404');
    })
});

router.get('/search/:q/:page?', async (req, res) => {
    const q = req.params.q;
    const requestedPage = req.params.page || 1;
    const pagingData = await Article.searchNews(q, requestedPage);
    res.render('search', { pagingData: pagingData, param: q });
});


module.exports = router;