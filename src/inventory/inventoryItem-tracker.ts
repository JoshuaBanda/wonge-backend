export class InventoryItemTracker {
    private userSentInventoryItems: Map<number, Set<number>>;
  
    constructor() {
      this.userSentInventoryItems = new Map();
    }
  
    getSentInventoryItemIds(userId: number): number[] {
      return Array.from(this.userSentInventoryItems.get(userId) || []);
    }
  
    markInventoryItemsAsSent(userId: number, inventoryItems: { id: number }[]): void {
      if (!this.userSentInventoryItems.has(userId)) {
        this.userSentInventoryItems.set(userId, new Set());
      }
      const userInventoryItems = this.userSentInventoryItems.get(userId)!;
      inventoryItems.forEach((inventoryItem) => userInventoryItems.add(inventoryItem.id));
      //console.log(`Marking inventoryItems as sent for user ${userId}: ${Array.from(usernventoryItems)}`);
    }
  
    clearSentInventoryItems(userId: number): void {
      //console.log(`Clearing sent inventoryItem IDs for user ${userId}`);
      this.userSentInventoryItems.delete(userId);
    }
  
    clearAllSentInventoryItems(): void {
      //console.log('Clearing sent inventoryItem IDs for all users');
      this.userSentInventoryItems.clear();
    }
  }
  