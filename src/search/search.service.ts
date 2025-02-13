import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { db } from 'src/db';
import { inventory, selectInventory, usersTable } from 'src/db/schema';
import { sql } from 'drizzle-orm';


@Injectable()
export class SearchService {
  // Adjusted to accept a string, not an array of strings.
  async searchUser(name: string): Promise<selectInventory[]> {
    console.log('Search query: ', name);
    try {
      // Perform the search using full-text search on the 'firstname' field
      const result = await db
        .select()
        .from(inventory)
        .where(
          sql`to_tsvector('english', ${inventory.name}) @@ plainto_tsquery('english', ${name})`
        );

      console.log('Search result: ', result);

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error occurred while searching for users', error);
    }
  }
}
