const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Article = require('./article');
const Useful = require('./useful');
const newsSites = require('./newsSites');

const scrappingSite = async (sites) => {
    switch (sites.name) {
        case 'LA PRESSE DU JOUR':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);

                    $('.td_module_mx5').each(async (index, element) => {
                        const title = $(element).find('a.td-image-wrap').attr('title');
                        const image = $(element).find('img.entry-thumb').attr('data-img-url');
                        let lien = $(element).find('a.td-image-wrap ').attr('href');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;

                            $new('.td-post-content').each(async (index, element) => {
                                $new(element).find('span,a.url,small,iframe,figure,img').remove();
                                content = $new(element).html();
                            });

                            Article.newArticle(6, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });

            }
            break;

        case 'LE SOLEIL BENIN INFO':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);

                    $('.recent-post').each(async (index, element) => {
                        const lien = $(element).find('h2 a').attr('href');
                        const image = $(element).find('.et-main-image a img').attr('srcset');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data)
                            let content;

                            const title = $new('h1.post-heading').text();
                            $new('article').each(async (index, element) => {
                                $new(element).find('.post-meta,div,iframe,figure,img').remove();
                                content = $new(element).html();
                            });

                            Article.newArticle(5, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        case '24 HEURES AU BENIN':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);
                    const url = 'https://www.24haubenin.info';

                    $('.une').each(async (index, element) => {
                        let lien = $(element).find('a:not(.url)').attr('href');
                        lien = url + await Useful.removeLeadingDot(lien);
                        const title = $(element).find('h2').text();

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;
                            let image = 'https://www.24haubenin.info/' + $new(element).find('img.spip_logo').attr('src');
                            $new('.article').each(async (index, element) => {
                                $new(element).find('span,a.url,small,iframe,figure,img').remove();
                                content = $new(element).html();
                            });
                            Article.newArticle(4, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        case 'LE MATINAL':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);

                    $('.jeg_hero_wrapper article').each(async (index, element) => {
                        const lien = $(element).find('.jeg_thumb a').attr('href');
                        const newContent = await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;

                            const image = $new('.jeg_featured.featured_image a').attr('href');
                            const title = $new('h1.jeg_post_title').text();
                            $new('.content-inner').each(async (index, element) => {
                                $new(element).find('span,a.url,small,iframe,figure,img,div').remove();
                                content = $new(element).html();
                            });
                            Article.newArticle(7, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });

            }
            break;

        case 'L\'ÉVÉNEMENT PRÉCIS':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);
                    $('.list_item').each(async (index, element) => {
                        const title = $(element).find('h3 a').attr('title');
                        const lien = $(element).find('h3 a').attr('href');
                        const image = $(element).find('.entry-thumb img.image_over').attr('src');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;

                            $new('.post_content').each(async (index, element) => {
                                $new(element).find('span,a,small,iframe,figure,img,div').remove();
                                content = $new(element).html();
                            });
                            Article.newArticle(8, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });

                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        case 'LAUTRE VISION':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);

                    $('.mg-col article').each(async (index, element) => {
                        const lien = $(element).find('.item-content a').attr('href');
                        const title = $(element).find('.item-content a').attr('title');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;

                            const image = $new('.post-thumbnail img').attr('data-src');
                            $new('.single-post-content').each(async (index, element) => {
                                $new(element).find('span,a,small,iframe,figure,img,div').remove();
                                content = $new(element).html();
                            });
                            Article.newArticle(10, site.category, title, content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        case 'LA NATION':
            for (const site of sites.categories) {
                await axios.get(site.url).then(function (response) {
                    const $ = cheerio.load(response.data);

                    $('.col-sm-12.col-lg-4.featured').each(async (index, element) => {
                        const lien = $(element).find('.col-sm-12 a:not(.icon)').attr('href');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            let content;

                            let title = $new('.news-content h1.title-custum').text();
                            title = title.trim();

                            const image = $new('.text-end img').attr('data-src');
                            content = $new('h6.description-article').html();

                            $new('.content-para').each(async (index, element) => {
                                $new(element).find('span,a,small,iframe,figure,img').remove();
                                content += $new(element).html();
                            });
                            Article.newArticle(11, site.category, title, content, image);
                        }).catch(() => {
                            console.log('Error while scrapping' + lien);
                        });
                    });
                }).catch(() => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        case 'LE MATIN':
            for (const site of sites.categories) {
                await axios.get(site.url).then((response) => {
                    const $ = cheerio.load(response.data);
                    const url = 'http://www.quotidienlematin.net';

                    $('.affichage-unit').each(async (index, element) => {
                        const lien = url + $(element).find('a').attr('href');

                        await axios.get(lien).then((newContent) => {
                            const $new = cheerio.load(newContent.data);
                            const title = $new('div.textimagrub1contenu').text();
                            const image = url + $new('.shop-item-image img').attr('src');
                            let content;

                            $new('.marge.text-left').each(async (index, element) => {
                                $new(element).find('span,a,small,iframe,figure,img,.textimagrub1').remove();
                                content += $new(element).html();
                            });
                            console.log(content);
                            // Article.newArticle(12, site.category, title.trim(), content, image);
                        }).catch((err) => {
                            console.log('Error while scrapping' + lien);
                        });
                    });

                }).catch((err) => {
                    console.log('Error while scrapping' + site.url);
                });
            }
            break;

        default:
            break;
    }
};

const scrapeAllSites = async () => {
    for (const site of newsSites) {
        await scrappingSite(site);
    }
};

cron.schedule('*/15 * * * *', scrapeAllSites);
module.exports = scrappingSite;