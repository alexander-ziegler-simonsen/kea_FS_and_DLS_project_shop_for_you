import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn,
  ManyToMany, JoinTable
} from 'typeorm';
import { Category } from './Category.js';
import { GroceryImage } from './GroceryImage.js';
import { GroceryName } from './GroceryName.js';
import { Price } from './Price.js';
import { Description } from './Description.js';
import { Deleted_Grocery } from './Deleted_Grocery.js';




@Entity()
export class Grocery {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => GroceryName, (name) => name.groceries, { cascade: true })
  @JoinTable()
  names: GroceryName[];

  @ManyToMany(() => GroceryImage, (image) => image.groceries, { cascade: true })
  @JoinTable()
  images: GroceryImage[];

  @ManyToMany(() => Category, (category) => category.groceries, { cascade: true })
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Price, (price) => price.groceries, { cascade: true })
  @JoinTable()
  prices: Price[];

  @ManyToMany(() => Description, (description) => description.groceries, { cascade: true })
  @JoinTable()
  descriptions: Description[];

  @ManyToMany(() => Deleted_Grocery, (deleted) => deleted.groceries, { cascade: true })
  @JoinTable()
  deletedGroceries: Deleted_Grocery[];
}
