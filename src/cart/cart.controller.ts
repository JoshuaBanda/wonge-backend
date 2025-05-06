import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateQuantityCartDto } from './dto/update-quantity-cart.dto';
import { UpdateSingleItem } from './dto/updateSingleItem.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("add-to-cart")
  addToCart(
    @Body() createCartDto:CreateCartDto
  ){
    console.log(createCartDto)
    return this.cartService.addToCart(createCartDto);
  }

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

  @Patch('order')
  update(@Body() updateCartDto: UpdateCartDto) {
    console.log("body", updateCartDto);
  
    const { user_id, status, inventory_ids } = updateCartDto;
  
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
  updateCartQuantity(
    @Body() updateCartQuantity:UpdateQuantityCartDto
  ){
    console.log("to be updated",updateCartQuantity);
    const {inventory_id,quantity,id}=updateCartQuantity;
    
    return this.cartService.UpdateQuantity(quantity,inventory_id,id)
  }
}
