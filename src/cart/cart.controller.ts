import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateQuantityCartDto } from './dto/update-quantity-cart.dto';
import { UpdateSingleItem } from './dto/updateSingleItem.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  //when user first add item to cart
  @Post("add-to-cart")
  addToCart(
    @Body() createCartDto:CreateCartDto
  ){
    console.log(createCartDto)
    return this.cartService.addToCart(createCartDto);
  }

  //when user wants to view all items that are currently in their cart
  @Get("get-cart-items/:user_id")
  getCartItems(
    @Param('user_id') user_id:number
  ) {
    try{
      
    return this.cartService.getActiveCartItems(user_id);
    }catch(error){
      console.log(error);
    }
  }


  //user want to view all previous purchases
  @Get("get-cart-items/:user_id/history")
  geHistorytCartItems(
    @Param('user_id') user_id:number
  ) {
    try{
      
    return this.cartService.getHistoryCartItems(user_id);
    }catch(error){
      console.log(error);
    }
  }

  @Get('check-is-cart/:user_id/:inventory_id')
  checkIsCartAdded(
    @Param('user_id') user_id:number,
    @Param('inventory_id') inventory_id:number
  ){
    return this.cartService.checkCart(user_id,inventory_id)
  }
  //this update method updates items that where just pending in the users cart to now been bought
  @Patch('order')
  update(@Body() updateCartDto: UpdateCartDto) {
    console.log("body", updateCartDto);

    
  
    const {user_id, status, inventory_ids } = updateCartDto;

    if (!status || !Array.isArray(inventory_ids)||!user_id) {
  throw new BadRequestException("Missing status or inventory_ids");
}
  
    return this.cartService.makeOrder(user_id, inventory_ids,status);
  }

  @Patch('order-one-item')
  updateItem(@Body() updateSingleItem:UpdateSingleItem) {
    console.log("body", updateSingleItem);
  
    const { user_id, status, cart_id } = updateSingleItem;
  
    return this.cartService.makeItemOrder(user_id, cart_id,status);
  }
  

  //update quantity
  @Patch('cart-quantity')
  async updateCartQuantity(
    @Body() updateCartQuantity:UpdateQuantityCartDto
  ){
    console.log("to be updated",updateCartQuantity);
    const {inventory_id,quantity,id/*cart id*/}=updateCartQuantity;
      try{
    const reults= await this.cartService.UpdateVirtualQuantity(quantity,inventory_id,id)

    console.log("results",reults);
    
    return reults;
  }
    catch(error){
      console.error(error);
    }
  }


  
  // DELETE endpoint to remove an item from the cart
  @Delete('remove-item/:user_id/:cart_id')
  async deleteCartItem(
    @Param('user_id') user_id: number,
    @Param('cart_id') cartId: number
  ) {
    try {
      const result = await this.cartService.deleteCartItem(user_id, cartId);
      return {
        message: result,
      };
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw new BadRequestException('Failed to delete cart item.');
    }
  }
}
