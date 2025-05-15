
import { table } from 'console';
import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, primaryKey, boolean, date, index } from 'drizzle-orm/pg-core';

// Define your tablesimport { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';



export const inboxTable = pgTable('inbox', {
    inboxid: serial('inboxid').primaryKey(),
    blocker: text('blocker').notNull(),
    block:boolean('block').notNull(),
});

export const messagesTable = pgTable('messages', {
    id:serial('id').primaryKey(),
    inboxid: integer('inboxid')
        .notNull()
        .references(() => inboxTable.inboxid, { onDelete: 'cascade' }),
    userid: integer('userid')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdat: timestamp('createdat').defaultNow(),
    status:text('status').notNull(),
}
);


export const inboxParticipantsTable = pgTable('inboxparticipants', {
    firstuserid: integer('userid')
        .notNull()
        .references(() => usersTable.userid, { onDelete: 'cascade' }),
    seconduserid:integer('currentuser')
    .notNull()
    .references(()=>usersTable.userid,{onDelete:'cascade'}),
    inboxid: integer('inboxid')
        .notNull()
        .references(() => inboxTable.inboxid, { onDelete: 'cascade' }),
},
(table)=>{
    return{
        pk: primaryKey({ columns: [table.firstuserid, table.seconduserid] }),
    }
});




export type insertInbox=typeof inboxTable.$inferInsert;
export type selectInbox=typeof inboxTable.$inferSelect;

export type insertInboxParticipants=typeof inboxParticipantsTable.$inferInsert;
export type selectInboxParticpants=typeof inboxParticipantsTable.$inferSelect;

export type insertMessages=typeof messagesTable.$inferInsert;
export type selectMessages=typeof messagesTable.$inferSelect;






export const usersTable = pgTable('users', {
    userid: serial('userid').primaryKey(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    email: text('email').unique(),
    password: text('password').notNull(),
    activationstatus: boolean('activationstatus').notNull(),
    sex:text("sex").notNull(),
    dateofbirth:date("dateofbirth").notNull(),
    phonenumber:text("phonenumber").notNull(),
    photoUrl:text('photourl').notNull(),
    publicId:text('publicId').notNull(),
  },
  
  (table) => ({
    titleSearchIndex: index('title_search_index')
    .using('gin', sql`to_tsvector('english', ${table.firstname})`),
  }),
);

export type insertUsers=typeof usersTable.$inferInsert;
export type selectUsers=typeof usersTable.$inferSelect;

    

export const inventory=pgTable('inventory',{
  id:serial('id').primaryKey(),
  name:text('name').notNull(),
  description:text('description').notNull(),
  photo_url:text('photo_url').notNull(),
  photo_public_id:text('photo_publlic_id').notNull(),
  user_id: integer('user_id')
  .notNull()
  .references(() => usersTable.userid, { onDelete: 'cascade' }),
  created_at: timestamp('createdat').defaultNow(),
  type:text("type").notNull(),
  price:text("price").notNull(),
  whatsappmessage:text('whatsappmessage').notNull(),
  quantity:integer('quantity').notNull(),
});
export type selectInventory=typeof inventory.$inferSelect;
export type insertInventory=typeof inventory.$inferInsert;


export const likes=pgTable('likes',{
    like_id:serial('like_id').primaryKey(),
    inventory_id:integer('iventory_id').notNull()
        .references(()=>inventory.id,{onDelete:'cascade'}),
    user_id:integer('user_id').notNull().references(()=>usersTable.userid,{onDelete:'cascade'})
})

export type selectLikes=typeof likes.$inferSelect;
export type insertLikes=typeof likes.$inferInsert;


export const comments=pgTable('comments',{
    comment_id:serial('comment_id').primaryKey(),

    comment:text('comment').notNull(),
    inventory_id:integer('inventory_id').notNull()
        .references(()=>inventory.id,{onDelete:'cascade'}),
    user_id:integer('user_id').notNull()
        .references(()=>usersTable.userid,{onDelete:'cascade'}),
    created_at:timestamp('createdat').defaultNow(),
})


export type selectComments=typeof comments.$inferSelect;
export type insertComments=typeof comments.$inferInsert;

export const notification=pgTable('notificatios',{
  id:serial('id').primaryKey(),
  recipientId:integer('recipientId').notNull()
    .references(()=>usersTable.userid,{onDelete:'cascade'}),
  notification:text('notification').notNull(),
  status:text('status').notNull(),//seen, recieved
  created_at:timestamp('created_at').defaultNow(),

  
});
export type selectNotification=typeof notification.$inferSelect;
export type insertNotification=typeof notification.$inferInsert;

export const  cart=pgTable('cart',{
    id:serial('id').primaryKey(),
    inventory_id:integer('inventory_id').notNull().references(()=>inventory.id,{onDelete:'cascade'}),
    user_id:integer('user_id').notNull().references(()=>usersTable.userid,{onDelete:'cascade'}),
    created_at:timestamp('created_at').defaultNow(),
    quantity:integer('quantity').notNull(),
    //status of the items at a point in time
    status:text("status").notNull(),//active, removed ,outofStock,reservation expired
    notification:boolean("notification").notNull().default(false),
});

export type selectCart=typeof cart.$inferSelect;
export type insertCArt=typeof cart.$inferInsert;
