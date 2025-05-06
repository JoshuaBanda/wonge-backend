import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { db } from 'src/db';
import { cart, inventory, selectCart } from 'src/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class CartService {

  async addToCart(data:any) {
    console.log("status",data.status);
    const exists = await this.checkCart(data.user_id, data.inventory_id);
    // console.log("is exist",exists);
    if (exists) {
      throw new Error("Item already in cart");
    }
  
    const [newCart] = await db
      .insert(cart)
      .values(data)
      .returning();
  
    //console.log(newCart);
    return newCart;
  }
  
  async checkCart(user_id: number, inventory_id: number): Promise<boolean> {
    // Check if there's any active item with the same user_id and inventory_id
    const activeItems = await db
      .select()
      .from(cart)
      .where(
        and(
          eq(cart.user_id, user_id),
          eq(cart.inventory_id, inventory_id),
          eq(cart.status, 'active')
        )
      );

    // If any active items exist, return true (duplicate found)
    if (activeItems.length > 0) {
      console.log('Duplicate active item found:', activeItems);
      return true;
    }

    // No active duplicates found
    console.log('No duplicate active items found');
    return false;
}
  
  async getActiveCartItems(user_id:number){
    try{
      
    const res=await db
      .select()
      .from(cart)
      .where(
        and(
          eq(cart.user_id,user_id),
          eq(cart.status,'active')
        )
      );
    //console.log("res", res);  
    if(res==null){
      return
    }

    const inventoryIds = res.map(item => item.inventory_id);
    //console.log(inventoryIds);

    const inventories = await db
    .select()
    .from(inventory)
    .where(inArray(inventory.id, inventoryIds));

    //mix res and inventories
    const combined = res.map(cartItem => {
      const inventoryItem = inventories.find(inv => inv.id === cartItem.inventory_id);
      return {
        ...cartItem,
        inventory: inventoryItem // attach full inventory object
      };
    });
    return combined;
    }catch(error){
      throw new InternalServerErrorException("error getting cart items")
    }
  }
  
  async getHistoryCartItems(user_id:number){
    try{
      
    const res=await db
      .select()
      .from(cart)
      .where(
        and(
          eq(cart.user_id,user_id),
          eq(cart.status,'ordered')
        )
      );
    //console.log("res", res);  
    if(res==null){
      return
    }

    const inventoryIds = res.map(item => item.inventory_id);
    //console.log(inventoryIds);

    const inventories = await db
    .select()
    .from(inventory)
    .where(inArray(inventory.id, inventoryIds));

    //mix res and inventories
    const combined = res.map(cartItem => {
      const inventoryItem = inventories.find(inv => inv.id === cartItem.inventory_id);
      return {
        ...cartItem,
        inventory: inventoryItem // attach full inventory object
      };
    });
    return combined;
    }catch(error){
      throw new InternalServerErrorException("error getting cart items")
    }
  }
  

  async makeOrder(user_id: number, inventoryIds: number[],newStatus:string): Promise<selectCart[] | null> {
    try {
      console.log("new status",newStatus);
      const result = await db
        .update(cart)
        .set({ status:newStatus })
        .where(
          inArray(cart.inventory_id, inventoryIds)
        )
        .returning();
        console.log(result);


      if (result.length === 0) {
        throw new NotFoundException(`No carts found for inventory IDs: ${inventoryIds.join(', ')}`);
      }

      
  
      return result;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }
  
  async UpdateQuantity(newQuantity: number, inventory_id: number, cartId: number) {
    try {
      // Step 1: Get current inventory quantity
      const inventoryResult = await db
        .select({ quantity: inventory.quantity })
        .from(inventory)
        .where(eq(inventory.id, inventory_id));
  
      const availableInventoryQty = inventoryResult[0]?.quantity;
  
      if (availableInventoryQty == null) {
        throw new Error("Inventory item not found.");
      }
  
      // Step 2: Get current cart quantity
      const cartResult = await db
        .select({ quantity: cart.quantity })
        .from(cart)
        .where(eq(cart.id, cartId));
  
      const currentCartQty = cartResult[0]?.quantity;
  
      if (currentCartQty == null) {
        throw new Error("Cart item not found.");
      }
  
      // Step 3: Calculate the difference
      const quantityDifference = newQuantity - currentCartQty;
  
      // Step 4: Calculate updated inventory
      const updatedInventoryQty = availableInventoryQty - quantityDifference;
  
      if (updatedInventoryQty < 0) {
        throw new Error("Not enough stock in inventory.");
      }
  
      // Step 5: Update inventory
      await db
        .update(inventory)
        .set({ quantity: updatedInventoryQty })
        .where(eq(inventory.id, inventory_id));
  
      // Step 6: Update cart
      const updatedCart = await db
        .update(cart)
        .set({ quantity: newQuantity })
        .where(eq(cart.id, cartId))
        .returning();
  
      return updatedCart;
  
    } catch (error) {
      console.log("Error updating quantity:", error);
      //throw new Error("Could not update quantity");
    }
  }
  
}
