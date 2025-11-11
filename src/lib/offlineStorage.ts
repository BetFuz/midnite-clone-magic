interface OfflineAction {
  id: string;
  type: 'bet_placement' | 'profile_update' | 'deposit';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorage {
  private readonly STORAGE_KEY = 'offline_actions';
  private readonly MAX_RETRIES = 3;

  // Queue an action for later execution
  queueAction(type: OfflineAction['type'], data: any): string {
    const actions = this.getActions();
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const action: OfflineAction = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    actions.push(action);
    this.saveActions(actions);
    return id;
  }

  // Get all pending actions
  getActions(): OfflineAction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load offline actions:', e);
      return [];
    }
  }

  // Remove an action from queue
  removeAction(id: string): void {
    const actions = this.getActions().filter(a => a.id !== id);
    this.saveActions(actions);
  }

  // Increment retry count
  incrementRetry(id: string): boolean {
    const actions = this.getActions();
    const action = actions.find(a => a.id === id);
    
    if (!action) return false;
    
    action.retryCount++;
    
    if (action.retryCount >= this.MAX_RETRIES) {
      this.removeAction(id);
      return false;
    }
    
    this.saveActions(actions);
    return true;
  }

  // Save actions to storage
  private saveActions(actions: OfflineAction[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions));
    } catch (e) {
      console.warn('Failed to save offline actions:', e);
    }
  }

  // Clear all actions
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get action count
  getCount(): number {
    return this.getActions().length;
  }
}

export const offlineStorage = new OfflineStorage();
