const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const db = require('./db');

/**
 * Class representing the filesystem operations supported by the server and client side
 */
class usefulFunction {

    /**
     * Method to generate a Slug
     * @param {string} inputString 
     * @returns string
     */
    static generateSlug(inputString) {
        const accentsMap = {
            'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ý': 'y', 'ÿ': 'y',
            'ç': 'c', 'Ç': 'c'
        };
        const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"”“\\|,.<>»«\/?’]+/g;
        const spaces = /[ ]/g;
        const lowercaseString = inputString.toLowerCase();
        const removedSpecialChars = lowercaseString.replace(specialChars, "");
        const withoutAccents = removedSpecialChars.replace(/[^\u0000-\u007E]/g, char => accentsMap[char] || char);
        const slug = withoutAccents.replace(spaces, "-");
        return slug;
    }

    /**
     * @param {string} imageUrl url of the image
     * @returns 
     */
    static extractedExtension(imageUrl) {
        const lastDotIndex = imageUrl.indexOf('?');
        if (lastDotIndex !== -1) {
            const extension = imageUrl ? imageUrl.split('?')[0] : null;
            return extension;
        }
        return imageUrl;
    }

    /**
     * How to download an image from a link
     * @param {string} imageUrl url of the image
     * @param {string} articleId id of the article
     * @returns new image name {string}
     */
    static async downloadImage(imageUrl, articleId) {
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            if (response.status === 200) {
                const timestamp = Date.now();
                const extension = this.extractedExtension(path.extname(imageUrl));
                const imageName = `image_${timestamp}${extension}`;
                const imagePath = path.join(__dirname, '..', 'public', 'assets', 'actualite_img', imageName);
                await fs.writeFile(imagePath, response.data);
                const dbSuccess = await db.editArticleURLsImage(articleId, imageName);
                if (dbSuccess) {
                    console.log(`Image ${imageName} downloaded and processed successfully`);
                    return true;
                } else {
                    console.log(`Failed to update article with image ${imageName}`);
                    await fs.unlink(imagePath);
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error('Error downloading image:', error.message);
            return false;
        }
    }

    /**
     * Method Method to replace the elements of a text {spaces, and special characters}
     * @param {string} dataToEncrypt 
     * @returns string
     */
    static async urllink(dataToEncrypt) {
        let data = dataToEncrypt.toLowerCase();
        data = data.replace(/[^a-zA-Z0-9]/g, '');
        data = data.replace(/[ ]/g, '');
        return data;
    }

    /**
     * Method to remove (.) at the beginning of a url
     * @param {string} inputString 
     * @returns string
     */
    static removeLeadingDot(inputString) {
        if (inputString.startsWith('.')) {
            return inputString.substring(1);
        }
        return inputString;
    }

    // webRedis
    // script tag
    /**
     * Method to rename picture
     * @param {string} picture 
     * @returns string
     */
    static renamePicture(picture, url) {
        if (picture.indexOf('http') === -1) {
            if (picture.startsWith('.') || picture.startsWith('/')) {
                picture = this.removeLeadingDot(picture);
            }
            picture = url + (url.endsWith('/') ? '' : '/') + picture;
        }
        return picture;
    }
}

module.exports = usefulFunction;