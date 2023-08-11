const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./controllers/routes');
const scrappingSite = require('./models/scrappeur');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/scrapping', async (req, res) => {
    const newsSites = [
        {
            name: 'L MATIN', categories: [
                { url: 'http://www.quotidienlematin.net/article/politique/', category: 1 }
            ]
        }
    ];

    await scrappingSite(newsSites[0]).then((result) => {
        console.log('terminer');
    }).catch((err) => {
        console.log(err);
    });
});

app.use('/', routes);

app.use((req, res, next) => {
    res.status(404).render('404');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('404');
});
app.listen(port, () => {
    console.log(`Le serveur Express écoute sur le port ${port}`);
});