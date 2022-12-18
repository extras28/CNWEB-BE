const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config()

cloudinary.config({
    cloud_name: "dc7pxknio",
    api_key: "517486121833359",
    api_secret: "xYZHadseQcIZNSkR-yG9s-g56-8",
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    params: {
        folder: 'WebTechnology'
    }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
