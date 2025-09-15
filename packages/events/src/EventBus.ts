import { EventMap, EventKey, EventHandler, EventRecord } from './types';

/**
 * High-performance, strongly-typed EventBus based on investigation
 * Implements Singleton pattern with TypeScript generics for type safety
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: { [K in EventKey]?: Array<EventHandler<K>> } = {};
  private eventHistory: EventRecord[] = [];
  private traceIdCounter = 0;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event with automatic unsubscribe function
   * Returns unsubscribe function to prevent memory leaks
   */
  public on<K extends EventKey>(
    eventType: K,
    handler: EventHandler<K>
  ): () => void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType]!.push(handler);

    // Return unsubscribe function to prevent memory leaks
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  public off<K extends EventKey>(
    eventType: K,
    handler: EventHandler<K>
  ): void {
    const eventListeners = this.listeners[eventType];
    if (eventListeners) {
      const index = eventListeners.indexOf(handler);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event with optional causality tracking
   */
  public emit<K extends EventKey>(
    eventType: K,
    payload: EventMap[K],
    options?: {
      causedBy?: string;
      source?: string;
      traceId?: string;
    }
  ): string {
    const eventId = this.generateEventId();
    const timestamp = performance.now();

    // Create event record for Event Sourcing
    const eventRecord: EventRecord = {
      eventId,
      eventType,
      payload,
      timestamp,
      causedBy: options?.causedBy,
      metadata: {
        source: options?.source || 'unknown',
        traceId: options?.traceId || this.generateTraceId()
      }
    };

    // Store in event history (with size limit)
    this.eventHistory.push(eventRecord);
    if (this.eventHistory.length > 10000) {
      this.eventHistory.shift(); // Remove oldest event
    }

    // Dispatch to listeners
    const eventListeners = this.listeners[eventType];
    if (eventListeners && eventListeners.length > 0) {
      // Iterate over copy to avoid issues if handler unsubscribes itself
      [...eventListeners].forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
          // Emit error event
          this.emit('command:failed', {
            commandId: eventId,
            command: { action: 'event_handler_error' },
            error: error instanceof Error ? error.message : String(error),
            timestamp
          });
        }
      });
    }

    return eventId;
  }

  /**
   * Get event history for debugging/replay
   */
  public getEventHistory(): EventRecord[] {
    return [...this.eventHistory];
  }

  /**
   * Get events by trace ID for causality tracking
   */
  public getEventsByTrace(traceId: string): EventRecord[] {
    return this.eventHistory.filter(
      event => event.metadata?.traceId === traceId
    );
  }

  /**
   * Clear event history (useful for testing)
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get current listener count for debugging
   */
  public getListenerCount<K extends EventKey>(eventType: K): number {
    return this.listeners[eventType]?.length || 0;
  }

  /**
   * Get all registered event types
   */
  public getRegisteredEvents(): EventKey[] {
    return Object.keys(this.listeners) as EventKey[];
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${++this.traceIdCounter}_${Date.now()}`;
  }

  /**
   * Utility method to emit multiple events as batch (for performance)
   */
  public emitBatch<K extends EventKey>(
    events: Array<{ type: K; payload: EventMap[K]; options?: any }>
  ): string[] {
    const traceId = this.generateTraceId();
    return events.map(event =>
      this.emit(event.type, event.payload, {
        ...event.options,
        traceId
      })
    );
  }
}