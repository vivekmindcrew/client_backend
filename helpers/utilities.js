const fs = require('fs');
const mailchimp = require("@mailchimp/mailchimp_marketing");

exports.base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');

}

// Create Mailchimp image single on server
exports.uploadImageOnMailChimp = (file,ext, mailChimpAuthData, callback) => {
    mailchimp.setConfig(mailChimpAuthData);
    return mailchimp.fileManager.upload({
        name: `logo.${ext}`,
        file_data: file
    })
}

// Create Mailchimp image single on server
exports.uploadedImageOnMailChimpList = (mailChimpAuthData) => {
    mailchimp.setConfig(mailChimpAuthData);
    return mailchimp.fileManager.files();
}










