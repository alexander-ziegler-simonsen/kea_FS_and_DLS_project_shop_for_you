import { AppDataSource } from "./data-source";
import * as fs from "fs";
import { Grocery } from "./entities/Grocery";
import { GroceryName } from "./entities/GroceryName";
import { GroceryImage } from "./entities/GroceryImage";
import { Category } from "./entities/Category";
import { Price } from "./entities/Price";
import { Description } from "./entities/Description";
import { Amount } from "./entities/Amount";
import { User } from "./entities/User";
import amqp from "amqplib";

interface GroceryNameData {
  id: number;
  name: string;
  groceryId: number;
}

interface GroceryImageData {
  id: number;
  image: string;
  groceryId: number;
}

interface CategoryData {
  id: number;
  name: string;
  createdAt: string;
  groceryId: number;
}

interface PriceData {
  id: number;
  price: number;
  createdAt: string;
  groceryId: number;
}

interface DescriptionData {
  id: number;
  description: string;
  createdAt: string;
  groceryId: number;
}

interface AmountData {
  id: number;
  amount: number;
  groceryId: number;
}

async function setupRabbitMQ() {
  const connection = await amqp.connect(`amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
  const channel = await connection.createChannel();
  const exchange = 'grocery-exchange';
  const queueName = 'grocery-queue-created';
  const routingKey = 'grocery.created';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queueName, {
    durable: true,
    exclusive: false,
    autoDelete: false,
  });
  await channel.bindQueue(queueName, exchange, routingKey);

  return { connection, channel };
}

async function insertGroceries() {
  await AppDataSource.initialize();

  const rawData = fs.readFileSync("grocery.json", "utf-8");
  const parsedData = JSON.parse(rawData);
  const groceriesData = parsedData.groceries as { id: number, createdAt: string }[];
  const groceryNames = parsedData.groceryNames as GroceryNameData[];
  const groceryImages = parsedData.groceryImages as GroceryImageData[];
  const categoriesData = parsedData.categories as CategoryData[];
  const pricesData = parsedData.prices as PriceData[];
  const descriptionsData = parsedData.descriptions as DescriptionData[];
  const amountsData = parsedData.amounts as AmountData[];

  const groceryRepo = AppDataSource.getRepository(Grocery);
  const groceryNameRepo = AppDataSource.getRepository(GroceryName);
  const groceryImageRepo = AppDataSource.getRepository(GroceryImage);
  const categoryRepo = AppDataSource.getRepository(Category);
  const priceRepo = AppDataSource.getRepository(Price);
  const descriptionRepo = AppDataSource.getRepository(Description);
  const amountRepo = AppDataSource.getRepository(Amount);

  await AppDataSource.query('DELETE FROM grocery_descriptions_description');
  await AppDataSource.query('DELETE FROM grocery_categories_category'); 
  await AppDataSource.query('DELETE FROM grocery_amounts_amount'); 
  await AppDataSource.query('DELETE FROM grocery_prices_price');
  await AppDataSource.query('DELETE FROM grocery_images_grocery_image');
  await AppDataSource.query('DELETE FROM grocery_names_grocery_name');

  
  // Clean up old data
  await AppDataSource.query('DELETE FROM grocery_descriptions_description');
  await descriptionRepo.delete({});
  await priceRepo.delete({});
  await categoryRepo.delete({});
  await groceryImageRepo.delete({});
  await groceryNameRepo.delete({});
  await groceryRepo.delete({});
  await amountRepo.delete({});
 

  console.log("✅ All previous data deleted");

  const { connection: rabbitConn, channel } = await setupRabbitMQ();

  try {
    for (const item of groceriesData) {
      const grocery = groceryRepo.create({
        id: item.id,
        createdAt: new Date(item.createdAt)
      });
      await groceryRepo.save(grocery);

      const relatedNames: GroceryName[] = [];
      const relatedImages: GroceryImage[] = [];
      const relatedCategories: Category[] = [];
      const relatedPrices: Price[] = [];
      const relatedDescriptions: Description[] = [];
      const relatedAmounts: Amount[] = [];

      const nameEntry = groceryNames.find((n: GroceryNameData) => n.groceryId === item.id);
      if (nameEntry) {
        let groceryName = await groceryNameRepo.findOne({ where: { name: nameEntry.name } });
        if (!groceryName) {
          groceryName = groceryNameRepo.create({ name: nameEntry.name });
          await groceryNameRepo.save(groceryName);
        }
        relatedNames.push(groceryName);
      }

      const imageEntry = groceryImages.find((img: GroceryImageData) => img.groceryId === item.id);
      if (imageEntry) {
        let groceryImage = await groceryImageRepo.findOne({ where: { image: imageEntry.image } });
        if (!groceryImage) {
          groceryImage = groceryImageRepo.create({ image: imageEntry.image });
          await groceryImageRepo.save(groceryImage);
        }
        relatedImages.push(groceryImage);
      }

      const categories = categoriesData.filter((c: CategoryData) => c.groceryId === item.id);
      for (const cat of categories) {
        let category = await categoryRepo.findOne({ where: { name: cat.name } });
        if (!category) {
          category = categoryRepo.create({
            name: cat.name,
            createdAt: new Date(cat.createdAt)
          });
          await categoryRepo.save(category);
        }
        relatedCategories.push(category);
      }

      const prices = pricesData.filter((p: PriceData) => p.groceryId === item.id);
      for (const price of prices) {
        const priceEntity = priceRepo.create({
          price: price.price,
          createdAt: new Date(price.createdAt)
        });
        await priceRepo.save(priceEntity);
        relatedPrices.push(priceEntity);
      }

      const descriptions = descriptionsData.filter((d: DescriptionData) => d.groceryId === item.id);
      for (const desc of descriptions) {
        const descriptionEntity = descriptionRepo.create({
          description: desc.description,
          createdAt: new Date(desc.createdAt)
        });
        await descriptionRepo.save(descriptionEntity);
        relatedDescriptions.push(descriptionEntity);
      }

      const amounts = amountsData.filter((a: AmountData) => a.groceryId === item.id);
      for (const amt of amounts) {
        const amountEntity = amountRepo.create({
          amount: amt.amount
        });
        await amountRepo.save(amountEntity);
        relatedAmounts.push(amountEntity);
      }

      grocery.names = relatedNames;
      grocery.images = relatedImages;
      grocery.categories = relatedCategories;
      grocery.prices = relatedPrices;
      grocery.descriptions = relatedDescriptions;
      grocery.amounts = relatedAmounts;
      await groceryRepo.save(grocery);

      const fullGrocery = await groceryRepo.findOne({
        where: { id: grocery.id },
        relations: ["names", "images", "categories", "prices", "descriptions", "amounts"]
      });

      if (fullGrocery) {
        channel.publish('grocery-exchange', 'grocery.created', Buffer.from(JSON.stringify(fullGrocery)));
        console.log(`📤 Published full Grocery ID ${grocery.id} to RabbitMQ`);
      }
    }

    console.log("🎉 All groceries imported and synced successfully.");
  } catch (err) {
    console.error("❌ Error during seeding or syncing:", err);
  } finally {
    await channel.close();
    await rabbitConn.close();
    process.exit(0);
  }
}

async function main() {
  await insertGroceries();
}

main().catch((error) => {
  console.error("❌ Error during seeding:", error);
  process.exit(1);
});
