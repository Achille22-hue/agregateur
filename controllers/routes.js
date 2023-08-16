const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Oganes = require('../models/organe');
const bodyParser = require('body-parser');
const scrapeSite = require('../models/scrapping.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Sites = [
    {
        name: '24 HEURES AU BENIN',
        site: [
            { url: 'https://www.24haubenin.info/?-Politique-2-2-2-2-2-2-2-2-2-2-' },
            { url: 'https://www.24haubenin.info/?-Societe-4-4-' },
            { url: 'https://www.24haubenin.info/?-Sport-', },
            { url: 'https://www.24haubenin.info/?-Economie-' },
        ],
        options: [
            {
                selector: '.une',
                lienSelector: 'a:not(.url)',
                titleSelector: 'h3.article',
                imageSelector: 'img.spip_logo',
                contentSelector: '.article'
            },
        ]
    }
];


router.get('/', async (req, res) => {
    await Article.queryAllArticle().then(async (pagingData) => {
        const lastArticle = await Article.getLastArticle();
        res.render('home', { pagingData: pagingData, lastArticle: lastArticle });
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/test', async (req, res) => {
    const sites = await Oganes.queryAllArticlepressesScrapping();
    scrapeSite(sites[2]);
    res.send(sites[2]);
});


router.get('/paging/:page', async (req, res) => {
    const requestedPage = req.params.page || 1;
    await Article.queryAllArticle(parseInt(requestedPage)).then(async (pagingData) => {
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
    await Oganes.getArticleByPress(id, parseInt(page)).then((pagingData) => {
        res.render('organe', { pagingData: pagingData, organes: id });
    }).catch((error) => {
        res.status(404).render('404');
        console.log(error);
    });
});

router.get('/all/organes', async (req, res) => {
    const organes = await Oganes.queryAllArticleOrganes();
    res.status(200).json(organes.rows);
});

router.get('/actualite/:cat/:page?', async (req, res) => {
    const cat = req.params.cat;
    const page = req.params.page || 1;
    await Article.getArticleByCategory(cat, parseInt(page)).then((pagingData) => {
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