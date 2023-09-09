const {S3Client, PutObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const multiparty = require('multiparty');
const fs = require('fs');
const mime = require('mime-types');

module.exports.uploadImage = async (req, res) => {
    const form = new multiparty.Form();
    const bucketName = 'jfly-ecommerce';

    const {fields, files} = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if(err) reject(err);
            resolve({fields, files});
        });
    });

    const client = new S3Client({
        region: 'ap-southeast-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    });

    const links = [];

    for (const file of files.file) {
        const ext = file.originalFilename.split('.').pop();
        // const allowed = ['jpg', 'jpeg', 'png'];

        // if(!allowed.includes(ext)) {
        //     return res.status(400).json({error: 'Must upload JPEG or PNG file.'});
        // }

        const newFileName = Date.now() + '.' + ext;
        
        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: newFileName,
            Body: fs.readFileSync(file.path),
            ContentType: mime.lookup(file.path),
            ACL: 'public-read'
        }));

        const link = `https://${bucketName}.s3.amazonaws.com/${newFileName}`;
        links.push(link);
    }
    res.status(200).json({links});
}

module.exports.deleteImage = async (req, res) => {
    const bucketName = 'jfly-ecommerce';
    const { imageKey } = req.params;

    const client = new S3Client({
        region: 'ap-southeast-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    });

    const deleteCommand = await client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: imageKey
    }))

    console.log(deleteCommand);
    res.status(200).json({msg: 'deleted object ' + imageKey + ' from aws bucket'});
}
