/**
 * Core World interface and state management
 */

import { EntityManager } from './Entity';
import { RNG } from './RNG';
import { Timeline } from './Timeline';

export interface WorldConfig {
  seed: number;
  width: number;
  height: number;
  timeScale: number;
  enablePhysics: boolean;
  enableReplay: boolean;
}

export interface WorldState {
  entities: number;
  time: number;
  seed: number;
  isReplaying: boolean;
  fps: number;
}

export class WorldCore {
  private config: WorldConfig;
  private entityManager: EntityManager;
  private rng: RNG;
  private timeline: Timeline;
  private startTime: number;
  
  constructor(config: WorldConfig) {
    this.config = config;
    this.entityManager = new EntityManager();
    this.rng = new RNG(config.seed);
    this.timeline = new Timeline();
    this.startTime = Date.now();
  }
  
  /**
   * Update world state
   */
  update(deltaTime: number): void {
    // Update timeline
    this.timeline.update(deltaTime * this.config.timeScale);
    
    // Process replay events if in replay mode
    if (this.timeline.getIsReplaying()) {
      const eventsToReplay = this.timeline.getEventsToReplay();
      eventsToReplay.forEach(event => {
        this.processEvent(event);
      });
    }
  }
  
  /**
   * Process a timeline event
   */
  private processEvent(event: any): void {
    console.log(`Processing event: ${event.type}`, event);
    // This will be extended by specific world implementations
  }
  
  /**
   * Get world state
   */
  getState(): WorldState {
    return {
      entities: this.entityManager.getEntityCount(),
      time: this.timeline.getCurrentTime(),
      seed: this.config.seed,
      isReplaying: this.timeline.getIsReplaying(),
      fps: 0 // This should be updated by the renderer
    };
  }
  
  /**
   * Get entity manager
   */
  getEntityManager(): EntityManager {
    return this.entityManager;
  }
  
  /**
   * Get RNG
   */
  getRNG(): RNG {
    return this.rng;
  }
  
  /**
   * Get timeline
   */
  getTimeline(): Timeline {
    return this.timeline;
  }
  
  /**
   * Get config
   */
  getConfig(): WorldConfig {
    return this.config;
  }
  
  /**
   * Reset world to initial state
   */
  reset(): void {
    this.entityManager = new EntityManager();
    this.rng.reset();
    this.timeline.clear();
    this.startTime = Date.now();
  }
  
  /**
   * Start recording for replay
   */
  startRecording(): void {
    this.timeline.clear();
    console.log('Started recording world events');
  }
  
  /**
   * Start replaying recorded events
   */
  startReplay(): void {
    this.reset();
    this.timeline.startReplay();
  }
  
  /**
   * Stop replay
   */
  stopReplay(): void {
    this.timeline.stopReplay();
  }
}