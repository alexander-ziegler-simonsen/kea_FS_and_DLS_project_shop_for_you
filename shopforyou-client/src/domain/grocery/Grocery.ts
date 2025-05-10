import { Category } from "../category/Category";
import { Description } from "../description/Description";
import { GroceryImage } from "../groceryImage/GroceryImage";
import { GroceryName } from "../groceryName/GroceryName";
import { Price } from "../price/Price";
import { Amount } from "../amount/Amount";

export interface Grocery {
    id: number;
    createdAt: Date;
    groceryname: GroceryName[];
    groceryimage: GroceryImage[];
    categories: Category[];
    price: Price[];
    description: Description[];
    amount: Amount[];
}