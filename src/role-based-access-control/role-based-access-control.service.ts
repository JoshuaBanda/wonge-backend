import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleBasedAccessControlDto } from './dto/create-role-based-access-control.dto';
import { UpdateRoleBasedAccessControlDto } from './dto/update-role-based-access-control.dto';
import { db } from 'src/db';
import { rolesTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RoleBasedAccessControlService {

  async getApprovedPrivilege(user_id:number){
    try{
      const res=await db
        .select()
        .from(rolesTable)
        .where(
          eq(rolesTable.user_id,user_id)
        );
      return res;
    }catch(error){
      console.error(error);
      throw new InternalServerErrorException("error getting privileges",error);
    }
  }

    async createPrivilage(user_id:number,role:string){
    try{
      const res=await db
        .insert(rolesTable)
        .values({user_id,role})
        .returning()
    }catch(error){
      console.error(error);
      throw new InternalServerErrorException("error getting privileges",error);
    }
  }
}
