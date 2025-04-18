import { AppDataSource } from "./data-source";
import * as fs from "fs";
import { Grocery } from "./entities/Grocery";
import { Type } from "./entities/Type";
import { Price } from "./entities/Price";
import { Description } from "./entities/Description";
import amqp from "amqplib";

async function setupRabbitMQ() {
  const connection = await amqp.connect(`amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@sfu-rabbitmq:5672`);
  const channel = await connection.createChannel();
  await channel.assertExchange('grocery-exchange', 'topic', { durable: false });
  return { connection, channel };
}

async function insertGroceries() {
  await AppDataSource.initialize();

  const rawData = fs.readFileSync("grocery.json", "utf-8");
  const parsedData = JSON.parse(rawData);
  const groceriesData = parsedData.groceries;

  const groceryRepo = AppDataSource.getRepository(Grocery);
  const typeRepo = AppDataSource.getRepository(Type);
  const priceRepo = AppDataSource.getRepository(Price);
  const descriptionRepo = AppDataSource.getRepository(Description);

  // Clean up old data
  const groceries = await groceryRepo.find({ relations: ["types", "prices", "descriptions"] });

  for (const grocery of groceries) {
    await groceryRepo
      .createQueryBuilder()
      .relation(Grocery, "types")
      .of(grocery)
      .remove(grocery.types);

    await groceryRepo
      .createQueryBuilder()
      .relation(Grocery, "prices")
      .of(grocery)
      .remove(grocery.prices);

    await groceryRepo
      .createQueryBuilder()
      .relation(Grocery, "descriptions")
      .of(grocery)
      .remove(grocery.descriptions);
  }

  await descriptionRepo.delete({});
  await priceRepo.delete({});
  await typeRepo.delete({});
  await groceryRepo.delete({});
  console.log("✅ All previous data deleted");

  const { connection: rabbitConn, channel } = await setupRabbitMQ();

  try {
    for (const item of groceriesData) {
      const typeEntities: Type[] = [];
      for (const t of item.types) {
        let type = await typeRepo.findOne({ where: { name: t.name } });
        if (!type) {
          type = typeRepo.create({
            name: t.name,
            createdAt: new Date(t.createdAt),
          });
          await typeRepo.save(type);
        }
        typeEntities.push(type);
      }

      const priceEntities: Price[] = [];
      for (const p of item.prices) {
        let price = await priceRepo.findOne({ where: { id: p.id } });
        if (!price) {
          price = priceRepo.create({
            id: p.id,
            price: p.price,
            createdAt: new Date(p.createdAt),
          });
          await priceRepo.save(price);
        }
        priceEntities.push(price);
      }

      const descriptionEntities: Description[] = [];
      for (const d of item.descriptions) {
        let description = await descriptionRepo.findOne({ where: { id: d.id } });
        if (!description) {
          description = descriptionRepo.create({
            id: d.id,
            description: d.description,
            createdAt: new Date(d.createdAt),
          });
          await descriptionRepo.save(description);
        }
        descriptionEntities.push(description);
      }

      const grocery = groceryRepo.create({
        id: item.id,
        name: item.name,
        createdAt: new Date(item.createdAt),
        types: typeEntities,
        prices: priceEntities,
        descriptions: descriptionEntities,
      });

      await groceryRepo.save(grocery);
      console.log(`✅ Grocery "${grocery.name}" inserted.`);

      // Send full grocery object to RabbitMQ
      const message = {
        id: grocery.id,
        name: grocery.name,
        createdAt: grocery.createdAt,
        types: typeEntities,
        prices: priceEntities,
        descriptions: descriptionEntities,
      };

      channel.publish('grocery-exchange', 'grocery.created', Buffer.from(JSON.stringify(message)));
      console.log(`📤 Published "${grocery.name}" to RabbitMQ`);
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

insertGroceries().catch((error) => {
  console.error("❌ Error seeding groceries:", error);
  process.exit(1);
});
