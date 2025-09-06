import { injectable } from 'inversify';
import { IEventBus } from '../types';

@injectable()
export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  async publish(event: any): Promise<void> {
    const eventType = event.eventType || event.constructor.name;
    const eventHandlers = this.handlers.get(eventType) || [];
    
    // Execute all handlers for this event type
    const promises = eventHandlers.map(handler => handler(event));
    await Promise.all(promises);
  }

  subscribe(eventType: string, handler: (event: any) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  // Helper method to get all subscribed events (for debugging)
  getSubscribedEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}
