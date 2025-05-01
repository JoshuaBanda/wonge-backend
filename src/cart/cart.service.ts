import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { db } from 'src/db';
import { cart } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class CartService {

  async addToCart(data:any) {
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
    return newCart;
  }
  
  async checkCart(user_id: number, inventory_id: number): Promise<boolean> {
    const existingItem = await db
      .select()
      .from(cart)
      .where(
        sql`${cart.user_id} = ${user_id} AND ${cart.inventory_id} = ${inventory_id}`
      );
  
    if (existingItem.length > 0) {
      //console.log("existing items", existingItem);
      return true;
    } else {
      console.log("no items");
      return false;
    }
  
    return existingItem.length > 0;
  }
  
  async getCartItems(user_id:number){
    try{
      
    const res=await db.select().from(cart).where(eq(cart.user_id,user_id));
    //console.log("res", res);
    if(res==null){
      return
    }//console.log(res)
    
    return res;

    }catch(error){
      throw new InternalServerErrorException("error getting cart items")
    }
  }
  
  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
