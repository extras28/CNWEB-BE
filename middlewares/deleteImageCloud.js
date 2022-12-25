const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dc7pxknio",
    api_key: "517486121833359",
    api_secret: "xYZHadseQcIZNSkR-yG9s-g56-8",
});

const deleteImageCloud = async (filenames) => {
    console.log(filenames);
    cloudinary.api.delete_resources(filenames, function (error, result) {
        console.log(result);
    });
};

module.exports = deleteImageCloud;
