import { Category } from "../category/Category";
import { Description } from "../description/Description";
import { GroceryImage } from "../groceryImage/GroceryImage";
import { GroceryName } from "../groceryName/GroceryName";
import { Price } from "../price/Price";
import { Amount } from "../amount/Amount";

export interface Grocery {
    id: number;
    createdAt: Date;
    names: GroceryName[];
    images: GroceryImage[];
    categories: Category[];
    prices: Price[];
    descriptions: Description[];
    amounts: Amount[];
}