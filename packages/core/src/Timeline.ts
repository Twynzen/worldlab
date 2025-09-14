/**
 * Timeline system for recording and replaying world events
 */

export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
  metadata?: {
    source?: string;
    prompt?: string;
    plausible?: boolean;
  };
}

export class Timeline {
  private events: TimelineEvent[];
  private currentTime: number;
  private isReplaying: boolean;
  private replayIndex: number;
  
  constructor() {
    this.events = [];
    this.currentTime = 0;
    this.isReplaying = false;
    this.replayIndex = 0;
  }
  
  /**
   * Record a new event in the timeline
   */
  recordEvent(event: Omit<TimelineEvent, 'timestamp'>): void {
    if (this.isReplaying) {
      console.warn('Cannot record events during replay');
      return;
    }
    
    const timelineEvent: TimelineEvent = {
      ...event,
      timestamp: this.currentTime
    };
    
    this.events.push(timelineEvent);
    console.log(`Recorded event: ${event.type} at ${this.currentTime}ms`);
  }
  
  /**
   * Update timeline time
   */
  update(deltaTime: number): void {
    this.currentTime += deltaTime * 1000; // Convert to milliseconds
  }
  
  /**
   * Start replay from beginning
   */
  startReplay(): void {
    this.isReplaying = true;
    this.replayIndex = 0;
    this.currentTime = 0;
    console.log('Starting replay...');
  }
  
  /**
   * Stop replay
   */
  stopReplay(): void {
    this.isReplaying = false;
    console.log('Stopping replay...');
  }
  
  /**
   * Get events that should be triggered at current time during replay
   */
  getEventsToReplay(): TimelineEvent[] {
    if (!this.isReplaying) return [];
    
    const eventsToReplay: TimelineEvent[] = [];
    
    while (
      this.replayIndex < this.events.length &&
      this.events[this.replayIndex].timestamp <= this.currentTime
    ) {
      eventsToReplay.push(this.events[this.replayIndex]);
      this.replayIndex++;
    }
    
    return eventsToReplay;
  }
  
  /**
   * Get all recorded events
   */
  getEvents(): TimelineEvent[] {
    return [...this.events];
  }
  
  /**
   * Get events by type
   */
  getEventsByType(type: string): TimelineEvent[] {
    return this.events.filter(event => event.type === type);
  }
  
  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.currentTime = 0;
    this.isReplaying = false;
    this.replayIndex = 0;
  }
  
  /**
   * Export timeline to JSON for storage/analysis
   */
  export(): string {
    return JSON.stringify({
      events: this.events,
      duration: this.currentTime,
      exportedAt: Date.now()
    }, null, 2);
  }
  
  /**
   * Import timeline from JSON
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.events = parsed.events || [];
      this.currentTime = 0;
      this.isReplaying = false;
      this.replayIndex = 0;
      console.log(`Imported ${this.events.length} events`);
    } catch (error) {
      console.error('Failed to import timeline:', error);
    }
  }
  
  /**
   * Get current time in milliseconds
   */
  getCurrentTime(): number {
    return this.currentTime;
  }
  
  /**
   * Check if currently replaying
   */
  getIsReplaying(): boolean {
    return this.isReplaying;
  }
}