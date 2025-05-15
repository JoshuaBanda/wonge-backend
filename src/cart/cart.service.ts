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
  
    console.log(newCart);
   /* if(newCart){
      await this.UpdateQuantity(newCart.quantity,newCart.inventory_id,newCart.id)
      console.log("quantity updated");
    }*/
   //this will be moved to be updated in the only when ordered
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
  



    async makeOrder(user_id: number, inventoryIds: number[], newStatus: string): Promise<selectCart[] | null> {
  try {

    // 1. Fetch active cart items for user and inventory IDs
    const cartItems = await db
      .select()
      .from(cart)
      .where(
        and(
          inArray(cart.inventory_id, inventoryIds),
          eq(cart.user_id, user_id),
          eq(cart.status, 'active')
        )
      );
          
      //console.log("hi");
      if (cartItems.length === 0) {
      throw new NotFoundException(`No active cart items found.`);
    }
    

    // 2. Fetch inventory quantities
    const inventories = await db
      .select({ id: inventory.id, quantity: inventory.quantity })
      .from(inventory)
      .where(inArray(inventory.id, inventoryIds));

    // 3. Filter eligible items that can be ordered
    const eligibleCarts = cartItems.filter(item => {
      const stock = inventories.find(inv => inv.id === item.inventory_id);
      return stock && item.quantity <= stock.quantity;
    });

    const skippedItems = cartItems.filter(item => {
      const stock = inventories.find(inv => inv.id === item.inventory_id);
      return !stock || item.quantity > stock.quantity;
    });

    if (eligibleCarts.length === 0) {
      throw new Error("None of the items have enough stock to proceed with the order.");
    }

    const eligibleInventoryIds = eligibleCarts.map(item => item.inventory_id);

    // 4. Update cart status only for eligible items
    const updatedCarts = await db
      .update(cart)
      .set({ status: newStatus })
      .where(
        and(
          eq(cart.user_id, user_id),
          inArray(cart.inventory_id, eligibleInventoryIds),
          eq(cart.status, 'active')
        )
      )
      .returning();

    // 5. Update inventory quantities for eligible items
    for (const updatedCart of updatedCarts) {
      await this.UpdateQuantity(updatedCart.quantity, updatedCart.inventory_id, updatedCart.id);
      console.log(`Inventory updated for cart ID ${updatedCart.id}`);
    }

    // Optional: Log skipped items
    if (skippedItems.length > 0) {
      console.warn("Skipped items due to insufficient stock:", skippedItems.map(i => ({
        inventory_id: i.inventory_id,
        requested: i.quantity,
        available: inventories.find(inv => inv.id === i.inventory_id)?.quantity || 0
      })));
    }

    return updatedCarts;

  } catch (error) {
    console.error('Error processing order:', error.message || error);
    throw new InternalServerErrorException(error.message || 'Failed to process order.');
  }
}



async makeItemOrder(user_id: number, cartId: number, newStatus: string): Promise<selectCart[] | null> {
  try {
    console.log("new status", newStatus, "user_id", user_id, "cartId", cartId);

    // 1. Fetch the cart item
    const cartItems = await db
      .select()
      .from(cart)
      .where(
        and(eq(cart.id, cartId), eq(cart.user_id, user_id), eq(cart.status, 'active'))
      );

    if (cartItems.length === 0) {
      throw new NotFoundException(`No active cart item found for user ID ${user_id} and cart ID ${cartId}`);
    }

    const cartItem = cartItems[0];

    // 2. Fetch inventory for the item
    const inventoryItem = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, cartItem.inventory_id));

    if (inventoryItem.length === 0) {
      throw new NotFoundException(`No inventory item found for ID ${cartItem.inventory_id}`);
    }

    const availableStock = inventoryItem[0].quantity;

    // 3. Check stock availability
    if (cartItem.quantity > availableStock) {
      console.warn(`Insufficient stock: requested ${cartItem.quantity}, available ${availableStock}`);
      return null; // or throw new Error('Not enough stock')
    }

    // 4. Update cart status
    const result = await db
      .update(cart)
      .set({ status: newStatus })
      .where(
        and(eq(cart.id, cartId), eq(cart.user_id, user_id))
      )
      .returning();

    console.log("Updated cart:", result);

    // 5. Update inventory quantity
    await this.UpdateQuantity(cartItem.quantity, cartItem.inventory_id, cartItem.id);
    console.log(`Inventory updated for cart ID ${cartItem.id}`);

    return result;

  } catch (error) {
    console.error('Error updating cart:', error);
    throw new InternalServerErrorException(error.message || 'Failed to update cart item.');
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
      
      console.log(`current inventory quantity ${availableInventoryQty}`);
      if (availableInventoryQty == null) {
        throw new Error("Inventory item not found.");
      }
  
      // Step 2: Get current cart quantity
     /* const cartResult = await db
        .select({ quantity: cart.quantity })
        .from(cart)
        .where(eq(cart.id, cartId));
  
      const currentCartQty = cartResult[0]?.quantity;
  
      if (currentCartQty == null) {
        throw new Error("Cart item not found.");
      }*/
      
     // console.log(`current cart quantity ${currentCartQty}`);
  
      // Step 3: Calculate the difference
      //const quantityDifference = currentCartQty - newQuantity;
      
      //
  
      // Step 4: Calculate updated inventory
      const updatedInventoryQty = availableInventoryQty - newQuantity;
      console.log(`difference. availableInventoryQty ${availableInventoryQty} - newQuantity ${newQuantity} = ${availableInventoryQty-1}`);
  
      if (updatedInventoryQty < 0) {
        console.log('failed updating inventory quantity');
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

  //update virtually the quantity user wants to order
  async UpdateVirtualQuantity(newQuantity: number, inventory_id: number, cartId: number) {
    try {
      // Step 1: Get current inventory quantity
      const inventoryResult = await db
        .select({ quantity: inventory.quantity })
        .from(inventory)
        .where(eq(inventory.id, inventory_id));
  
      const availableInventoryQty = inventoryResult[0]?.quantity;
      console.log("current stock",availableInventoryQty);
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
      const quantityDifference =  availableInventoryQty-newQuantity ;
      console.log(`${availableInventoryQty} - ${newQuantity} = ${quantityDifference} quantity dif`)
  
      // Step 4: Calculate updated inventory
      const updatedInventoryQty = availableInventoryQty - quantityDifference;
  
      if (quantityDifference<0) {
        throw new Error("Not enough stock in inventory.");
      }
  
  
      // Step 6: Update cart
      const updatedCart = await db
        .update(cart)
        .set({ quantity: newQuantity })
        .where(eq(cart.id, cartId))
        .returning();

        console.log("kkkkkkkkkkkkkkkkk");
  
      return updatedCart;
  
    } catch (error) {
      console.log("Error updating quantity:", error);
      //throw new Error("Could not update quantity");
    }
  }


  async deleteCartItem(user_id: number, cartId: number): Promise<string> {
  try {
    // Step 1: Check if the cart item exists and is active for the user
    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.id, cartId), eq(cart.user_id, user_id), eq(cart.status, 'active')))
      .limit(1);  // Ensuring we get only one result

    if (cartItem.length === 0) {
      // If the item is not found or it's not active
      throw new NotFoundException(`Cart item with ID ${cartId} not found or not active.`);
    }

    // Step 2: Delete the cart item from the cart table
    await db
      .delete(cart)  // Specify the cart table here
      .where(eq(cart.id, cartId));

    console.log(`Cart item with ID ${cartId} deleted successfully.`);

    // Step 3: Return a success message
    return `Cart item with ID ${cartId} has been deleted successfully.`;

  } catch (error) {
    console.error("Error deleting cart item:", error);
    // Throwing a generic error if something goes wrong
    throw new InternalServerErrorException("Failed to delete the cart item.");
  }
}

  
}
