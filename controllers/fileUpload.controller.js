const sharp = require('sharp'); //  To compress image
const zlib = require('zlib'); // To compress csv files

const s3 = require('./../utils/aws');
const config = require('./../config/index');

module.exports.uploadFile = async (req, res) => {
    try {
      // Compress the file using Sharp for images
      let compressedFile = req.file.buffer;
      let filePath = "uploads";
      let key = null;
      if (req.file.mimetype.startsWith('image')) {
        compressedFile = await sharp(req.file.buffer).resize(200).toBuffer();
        filePath = "images";
        key = `${filePath}/${req.file.originalname}`;
      } else if (['text/csv', 'application/pdf', 'video/mp4'].includes(req.file.mimetype)) {
        filePath = req.file.mimetype.split('/')[1];
        compressedFile = zlib.gzipSync(req.file.buffer);
        if (compressedFile.length > req.file.buffer.length) {
            compressedFile = req.file.buffer;
        }
        key = `${filePath}/${req.file.originalname}.gz`;
      } else {
        return res.status(400).json({message: "Invalid file format"});
      }
  
      // Check and create the bucket if it doesn't exist
      await createBucketIfNotExists(config.S3_BUCKET);

    //   // Upload the compressed file to S3
      const params = {
        Bucket: config.S3_BUCKET,
        Key: key,
        Body: compressedFile,
        ContentType: `*/*`,
      };
      await s3.upload(params).promise();
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file');
    }
};

const createBucketIfNotExists = async (bucketName) => {
    try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log(`Bucket '${bucketName}' already exists.`);
    } catch (error) {
        if (error.statusCode === 404) {
          await s3.createBucket({ Bucket: bucketName }).promise();
          console.log(`Bucket '${bucketName}' created.`);
        } else {
          throw error;
        }
    }
}

module.exports.listFiles = async (req, res) => {
    try {
      const params = {
        Bucket: config.S3_BUCKET,
      };
  
      const data = await s3.listObjectsV2(params).promise();
  
      const files = data.Contents.map((item) => item.Key);
      res.json({ files });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error listing files in S3 bucket' });
    }
}

module.exports.downloadFile = async (req, res) => {
    try {
        const params = {
        Bucket: config.S3_BUCKET,
        Key: `${config.S3_IMAGE_PATH}/${req.params.filename}`,
        };

        const fileStream = s3.getObject(params).createReadStream();
        res.set('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        fileStream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error downloading file');
    }
};