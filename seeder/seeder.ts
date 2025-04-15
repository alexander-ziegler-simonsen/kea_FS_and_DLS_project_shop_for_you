import { AppDataSource } from "./data-source";
import * as fs from "fs";
import { Grocery } from "./entities/Grocery";
import { Type } from "./entities/Type";
import { Price } from "./entities/Price";
import { Description } from "./entities/Description";

async function insertGroceries() {
  await AppDataSource.initialize();

  const rawData = fs.readFileSync("grocery.json", "utf-8");
  const parsedData = JSON.parse(rawData);
  const groceriesData = parsedData.groceries;

  const groceryRepo = AppDataSource.getRepository(Grocery);
  const typeRepo = AppDataSource.getRepository(Type);
  const priceRepo = AppDataSource.getRepository(Price);
  const descriptionRepo = AppDataSource.getRepository(Description);

  // 🧼 Step 1: Remove all join table references first
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

  // 🧼 Step 2: Now we can delete the actual records
  await descriptionRepo.delete({});
  await priceRepo.delete({});
  await typeRepo.delete({});
  await groceryRepo.delete({});
  console.log("✅ All previous data deleted");

  // 🔁 Step 3: Insert fresh data
  for (const item of groceriesData) {
    // ✅ Prevent duplicate types (based on name)
    const typeEntities: Type[] = [];
    for (const t of item.types) {
      let type = await typeRepo.findOne({ where: { name: t.name } }); // 🟢 changed from ID to name
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
  }

  console.log("🎉 All groceries imported successfully.");
  process.exit(0);
}

insertGroceries().catch((error) => {
  console.error("❌ Error seeding groceries:", error);
  process.exit(1);
});
