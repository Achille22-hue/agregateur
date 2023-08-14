const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Article = require('./article');
const Useful = require('./useful');
const db = require('./db');

const scrapeSite = async (press) => {
    try {
        const response = await axios.get(press.url);
        const $ = cheerio.load(response.data);

        $(press.selector).each(async (index, element) => {
            let link = $(element).find(press.linkSelector).attr('href');
            let picture = $(element).find(press.imageSelector).attr('src');

            //Vérifier si l'URL du lien contient le domaine du site ou pas
            link = (link.indexOf('./') !== -1) ? press.siteweb + await Useful.removeLeadingDot(link) : link;

            try {
                const newContent = await axios.get(link);
                const $new = cheerio.load(newContent.data);
                const title = $new(press.titleSelector).text().trim();

                picture = picture || $new(press.imageSelector).attr('src');

                //Vérifier si l'URL de l'image récupéré contient le domaine du site scraper dans le car le contraire ajoute.
                picture = await Useful.renamePicture(picture, press.siteweb);

                let content = '';
                $new(press.contentSelector).each((index, element) => {
                    $new(element).find('span,a,small,iframe,figure,img,script,div').remove();
                    content += $new.html(element);
                });

                //Insertion du nouvel article dans la base de données
                Article.newArticle(press.press_id, press.category, title, content, picture);
            } catch (error) {
                console.log('Error while scraping ' + link);
            }
        });
    } catch (error) {
        console.log('Error while scraping ' + press.name);
    }
};

const scrapeAllSites = async () => {
    const sites = await db.sitesUrl();
    const promises = sites.map(site => scrapeSite(site));
    // La méthode Promise.all est utilisée pour paralléliser les opérations de scraping sur tous les sites
    await Promise.all(promises);
};

cron.schedule('*/1 * * * *', scrapeAllSites);
module.exports = scrapeSite;