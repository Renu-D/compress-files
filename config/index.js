module.exports = {
    PORT: process.env.PORT || 3000,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_REGION: process.env.AWS_REGION || "ap-south-1",
    S3_BUCKET: process.env.S3_BUCKET || "mediacompress",
};
