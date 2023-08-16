const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Article = require('./article');
const Useful = require('./useful');
const db = require('./db');

const scrapeSite = async (press) => {
    for (const category of press.site) {
        try {
            const response = await axios.get(category.url);
            const $ = cheerio.load(response.data);
            const option = press.options[0];
            const articleElements = $(option.selector);

            for (const element of articleElements) {
                let link = $(element).find(option.lienSelector).attr('href');
                let picture = $(element).find(option.imageSelector).attr('src');

                // Vérifiez si l'URL du lien contient le domaine du site, sinon, ajoutez le domaine
                link = (link.indexOf('./') !== -1) ? press.siteweb + await Useful.removeLeadingDot(link) : link;

                try {
                    const newContent = await axios.get(link);
                    const $new = cheerio.load(newContent.data);
                    const title = $new(option.titleSelector).text().trim();

                    picture = picture || $new(option.imageSelector).attr('src');
                    picture = (picture) ? await Useful.renamePicture(picture, press.siteweb) : "image_1691412373401.png";

                    let content = '';
                    $new(option.contentSelector).each((index, element) => {
                        $new(element).find('.post-meta,span,a,small,iframe,figure,img,script,div').remove();
                        content += $new.html(element);
                    });

                    Article.newArticle(press.press_id, category.category, title, content, picture);
                } catch (error) {
                    console.log('Error while scraping ' + link);
                }
            }
        } catch (error) {
            console.log('Error while scraping ' + press.name);
        }
    }
};

const scrapeAllSites = async () => {
    const sites = await db.sitesUrl();
    const promises = sites.map(site => scrapeSite(site));
    await Promise.all(promises);
};

// Planifier la tâche de scraping
cron.schedule('*/1 * * * *', scrapeAllSites);
module.exports = scrapeSite;
