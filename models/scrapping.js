const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Article = require('./article');
const usefulFunction = require('./usefulFunction');
const db = require('./db');

const scrapeSite = async (scrapData) => {
    for (const category of scrapData.site) {
        console.log('Doing the scraping');
        try {
            const response = await axios.get(category.url);
            const $ = cheerio.load(response.data);
            const option = scrapData.options[0];
            const articleElements = $(option.selector);
            const contentRemoved = '.textimagrub1, .affichage-line3, .textimagrub1contenu, .post-meta,span,a,small,iframe,figure,img,script,div[class]';

            for (const element of articleElements) {
                let link = $(element).find(option.lienSelector).attr('href');
                let picture = $(element).find(option.imageSelector).attr('src');
                link = (link.indexOf('./') !== -1 || link.startsWith('/')) ? scrapData.siteweb + await usefulFunction.removeLeadingDot(link) : link;
                try {
                    const newContent = await axios.get(link);
                    const $new = cheerio.load(newContent.data);
                    const title = $new(option.titleSelector).text().trim();
                    picture = picture || $new(option.imageSelector).attr(option.attrImg);
                    picture = (picture) ? await usefulFunction.renamePicture(picture, scrapData.siteweb) : "image_1691412373401.png";
                    let content = '';
                    $new(option.contentSelector).each((index, element) => {
                        $new(element).find(contentRemoved).remove();
                        content += $new.html(element);
                    });

                    const $text = cheerio.load(content);
                    const Text_content = $text.text();
                    
                    Article.addNewArticle(scrapData.press_id, category.category, title, content, picture, Text_content);

                } catch (error) {
                    console.log('Error while scraping' + link + ' : ' + error);
                }
            }
        } catch (error) {
            console.log('Error while scraping' + scrapData.name + ' : ' + error);
        }
    }
};

const scrapeAllSites = async () => {
    const scrapData = await db.queryAllSiteScrapping();
    const promises = scrapData.map(site => scrapeSite(site));
    await Promise.all(promises);
};

cron.schedule('*/15 * * * *', scrapeAllSites);
module.exports = scrapeSite;