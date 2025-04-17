import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { SearchModule } from './search/search.module';
import { UserAunthenticateModule } from './user-aunthenticate/user-aunthenticate.module';
import { PostLikesModule } from './post-likes/post-likes.module';
import { CartModule } from './cart/cart.module';
import { AwakeModule } from './awake/awake.module';

@Module({
  imports: [InventoryModule, NotificationModule, UsersModule, OtpModule, EmailModule, SearchModule, UserAunthenticateModule,PostLikesModule, CartModule, AwakeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
