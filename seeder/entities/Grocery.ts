import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn,
  ManyToMany, JoinTable
} from 'typeorm';
import { GroceryName } from './GroceryName';
import { GroceryImage } from './GroceryImage';
import { Category } from './Category';
import { Price } from './Price';
import { Description } from './Description';
import { Deleted_Grocery } from './Deleted_Grocery';
import { Amount } from './Amount';

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

  @ManyToMany(() => Amount, (amount) => amount.groceries, { cascade: true })
  @JoinTable()
  amounts: Amount[];
}
