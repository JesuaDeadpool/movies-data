require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors());

const s3 = new S3Client({
    region: process.env.REGION,
    endpoint: process.env.S3_WASABI_ENDPOINT, // tu endpoint Wasabi
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY_ID,
    },
});

app.get('/video', async (req, res) => {
    const key = req.query.key;
    //key = 'Comando.1985.1080p.mp4'
    if (!key) return res.status(400).json({ error: 'Key is required' });

    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hora
        res.json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating presigned URL' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
});