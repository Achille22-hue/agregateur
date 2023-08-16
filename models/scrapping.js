const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Article = require('./article');
const usefulFunction = require('./usefulFunction');
const db = require('./db');

const scrapeSite = async (scrapData) => {
    for (const category of scrapData.site) {
        try {
            const response = await axios.get(category.url);
            const $ = cheerio.load(response.data);
            const option = scrapData.options[0];
            const articleElements = $(option.selector);

            for (const element of articleElements) {
                let link = $(element).find(option.lienSelector).attr('href');
                let picture = $(element).find(option.imageSelector).attr('src');

                // Check if the link URL contains the domain of the site, if not, add the domain
                link = (link.indexOf('./') !== -1) ? scrapData.siteweb + await usefulFunction.removeLeadingDot(link) : link;

                try {
                    const newContent = await axios.get(link);
                    const $new = cheerio.load(newContent.data);
                    const title = $new(option.titleSelector).text().trim();

                    picture = picture || $new(option.imageSelector).attr(option.attrImg);
                    picture = (picture) ? await usefulFunction.renamePicture(picture, scrapData.siteweb) : "image_1691412373401.png";

                    let content = '';
                    $new(option.contentSelector).each((index, element) => {
                        $new(element).find('.post-meta,span,a,small,iframe,figure,img,script,div').remove();
                        content += $new.html(element);
                    });

                    Article.addNewArticle(scrapData.press_id, category.category, title, content, picture);
                } catch (error) {
                    console.log('Error while scraping ' + link);
                }
            }
        } catch (error) {
            console.log('Error while scraping ' + scrapData.name);
        }
    }
};

const scrapeAllSites = async () => {
    const scrapData = await db.queryAllSiteScrapping();
    const promises = scrapData.map(site => scrapeSite(site));
    await Promise.all(promises);
};

// Schedule the scraping job
cron.schedule('*/15 * * * *', scrapeAllSites);
module.exports = scrapeSite;
