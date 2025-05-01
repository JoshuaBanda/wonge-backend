import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

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
    return this.cartService.getCartItems(user_id);
  }

  @Get('check-is-cart/:user_id/:inventory_id')
  checkIsCartAdded(
    @Param('user_id') user_id:number,
    @Param('inventory_id') inventory_id:number
  ){
    return this.cartService.checkCart(user_id,inventory_id)
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
