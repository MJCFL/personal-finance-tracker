// Simple event emitter for cross-component communication
class EventEmitter {
  private events: Record<string, Function[]> = {};

  // Subscribe to an event
  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Create a singleton instance
const eventEmitter = new EventEmitter();

// Define event types
export const FINANCIAL_DATA_CHANGED = 'FINANCIAL_DATA_CHANGED';
export const TRANSACTION_CHANGED = 'TRANSACTION_CHANGED';

export default eventEmitter;
