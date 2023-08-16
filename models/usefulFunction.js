const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
     * How to download an image from a link
     * @param {string} imageUrl url of the image
     * @returns new image name {string}
     */
    static async downloadImage(imageUrl) {
        return axios.get(imageUrl, { responseType: 'arraybuffer' })
            .then(response => {
                const timestamp = Date.now();
                const extension = path.extname(imageUrl);
                const imageName = `image_${timestamp}${extension}`;
                const imagePath = path.join(__dirname, '..', 'public', 'assets', 'actualite_img', imageName);
                fs.writeFileSync(imagePath, response.data);
                console.log(`L'image ${imageName} a été téléchargée avec succès.`);
                return imageName;
            })
            .catch(error => {
                console.log('Erreur lors du téléchargement de l\'image:', error.message);
                return imageUrl;
            });
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