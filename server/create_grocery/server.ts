// server/create_grocery/server.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'reflect-metadata';

import { AppDataSource } from './data-source.js';
import { Grocery } from './entities/Grocery.js';
import { Type } from './entities/Type.js';
import { Price } from './entities/Price.js';
import { Description } from './entities/Description.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: 'http://127.0.0.1:5500' }));

const auth = new google.auth.GoogleAuth({
  keyFile: 'grocery-uploader-service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

const handler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: ['12_zMly4eQvoggqV6ot1WuLrlfgyxQIse']
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });

    await drive.permissions.create({
      fileId: file.data.id!, // 👈 add the `!` to assert it's never undefined
      requestBody: { role: 'reader', type: 'anyone' }
    });
    
    const imageUrl = `https://drive.google.com/uc?id=${file.data.id}`;

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const groceryRepo = AppDataSource.getRepository(Grocery);
    const typeRepo = AppDataSource.getRepository(Type);
    const priceRepo = AppDataSource.getRepository(Price);
    const descriptionRepo = AppDataSource.getRepository(Description);

    let type = await typeRepo.findOne({ where: { name: req.body.type } });
    if (!type) {
      type = typeRepo.create({ name: req.body.type });
      await typeRepo.save(type);
    }

    const price = priceRepo.create({ price: parseFloat(req.body.price) });
    await priceRepo.save(price);

    const description = descriptionRepo.create({ description: req.body.description });
    await descriptionRepo.save(description);

    const grocery = groceryRepo.create({
      name: req.body.name,
      image: imageUrl,
      types: [type],
      prices: [price],
      descriptions: [description]
    });
    await groceryRepo.save(grocery);

    fs.unlinkSync(req.file.path);
    res.json({ success: true, grocery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

app.post('/api/groceries', upload.single('image'), handler);

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));