import { EventBus } from './EventBus';
import { ValidationChainFactory } from './validation/ValidationChain';
import {
  Command,
  CommandHandler,
  CommandRecord,
  GameContext,
  SpawnCommand,
  ModifyCommand,
  MoveCommand
} from './types';

/**
 * Command System with JSON DSL and Chain of Responsibility validation
 * Based on investigation recommendations
 */
export class CommandSystem {
  private eventBus: EventBus;
  private validationChain = ValidationChainFactory.createDefaultChain();
  private commandRegistry = new Map<string, CommandHandler>();
  private commandHistory: CommandRecord[] = [];

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || EventBus.getInstance();
    this.registerDefaultHandlers();
  }

  /**
   * Register a command handler
   */
  public registerHandler(action: string, handler: CommandHandler): void {
    this.commandRegistry.set(action, handler);
  }

  /**
   * Execute a command from JSON string
   */
  public async executeFromJSON(
    commandJson: string,
    context?: GameContext
  ): Promise<{ success: boolean; commandId: string; error?: string }> {
    try {
      const command: Command = JSON.parse(commandJson);
      return await this.execute(command, context);
    } catch (error) {
      const commandId = this.generateCommandId();
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';

      this.eventBus.emit('command:failed', {
        commandId,
        command: { action: 'parse_error' },
        error: `JSON Parse Error: ${errorMessage}`,
        timestamp: Date.now()
      });

      return {
        success: false,
        commandId,
        error: errorMessage
      };
    }
  }

  /**
   * Execute a command object
   */
  public async execute(
    command: Command,
    context?: GameContext
  ): Promise<{ success: boolean; commandId: string; error?: string }> {
    const commandId = this.generateCommandId();
    const timestamp = Date.now();

    // Create command record
    const commandRecord: CommandRecord = {
      commandId,
      command,
      timestamp,
      status: 'pending',
      events: []
    };

    this.commandHistory.push(commandRecord);

    try {
      // 1. Validate command using Chain of Responsibility
      commandRecord.status = 'executing';

      if (this.validationChain) {
        const validationResult = this.validationChain.validate(command, context);

        if (!validationResult.isValid) {
          const errorMessage = validationResult.errors.map(e => e.message).join('; ');

          commandRecord.status = 'failed';
          commandRecord.error = errorMessage;

          this.eventBus.emit('command:failed', {
            commandId,
            command,
            error: errorMessage,
            timestamp
          });

          return {
            success: false,
            commandId,
            error: errorMessage
          };
        }

        // Log warnings if any
        if (validationResult.warnings.length > 0) {
          console.warn(`Command warnings for ${command.action}:`,
            validationResult.warnings.map(w => w.message).join('; ')
          );
        }
      }

      // 2. Find and execute handler
      const handler = this.commandRegistry.get(command.action);

      if (!handler) {
        const errorMessage = `No handler registered for action '${command.action}'`;

        commandRecord.status = 'failed';
        commandRecord.error = errorMessage;

        this.eventBus.emit('command:failed', {
          commandId,
          command,
          error: errorMessage,
          timestamp
        });

        return {
          success: false,
          commandId,
          error: errorMessage
        };
      }

      // 3. Execute the command
      await handler.execute(command);

      // 4. Mark as completed
      commandRecord.status = 'completed';

      this.eventBus.emit('command:executed', {
        commandId,
        command,
        success: true,
        timestamp
      });

      return {
        success: true,
        commandId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';

      commandRecord.status = 'failed';
      commandRecord.error = errorMessage;

      this.eventBus.emit('command:failed', {
        commandId,
        command,
        error: errorMessage,
        timestamp
      });

      return {
        success: false,
        commandId,
        error: errorMessage
      };
    }
  }

  /**
   * Parse natural language command to JSON (simple implementation)
   */
  public parseNaturalCommand(input: string): string | null {
    const trimmedInput = input.trim().toLowerCase();

    // Simple regex patterns for common commands
    const patterns = [
      {
        regex: /^spawn\s+(\w+)\s+near\s+(\w+)(\s+(\d+))?$/,
        handler: (match: RegExpMatchArray) => {
          const [, entity, target, , radius] = match;
          return JSON.stringify({
            action: 'spawn',
            entity,
            position: {
              near: target,
              radius: radius ? parseInt(radius) : 10
            }
          });
        }
      },
      {
        regex: /^spawn\s+(\w+)\s+at\s+\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),?\s*(-?\d+(?:\.\d+)?)?\)$/,
        handler: (match: RegExpMatchArray) => {
          const [, entity, x, z, y] = match;
          return JSON.stringify({
            action: 'spawn',
            entity,
            position: {
              x: parseFloat(x),
              z: parseFloat(z),
              y: y ? parseFloat(y) : undefined
            }
          });
        }
      },
      {
        regex: /^move\s+(\w+|\d+)\s+to\s+\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),?\s*(-?\d+(?:\.\d+)?)?\)$/,
        handler: (match: RegExpMatchArray) => {
          const [, entityRef, x, z, y] = match;
          return JSON.stringify({
            action: 'move',
            entityId: isNaN(Number(entityRef)) ? entityRef : parseInt(entityRef),
            destination: {
              x: parseFloat(x),
              z: parseFloat(z),
              y: y ? parseFloat(y) : undefined
            }
          });
        }
      }
    ];

    // Try each pattern
    for (const pattern of patterns) {
      const match = trimmedInput.match(pattern.regex);
      if (match) {
        return pattern.handler(match);
      }
    }

    return null; // No pattern matched
  }

  /**
   * Get command history for debugging
   */
  public getCommandHistory(): CommandRecord[] {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  public clearHistory(): void {
    this.commandHistory = [];
  }

  private registerDefaultHandlers(): void {
    // Default spawn handler
    this.registerHandler('spawn', {
      execute: async (command: Command) => {
        const spawnCmd = command as SpawnCommand;
        console.log(`[SPAWN] Creating ${spawnCmd.entity} at position:`, spawnCmd.position);

        // Emit entity spawned event
        this.eventBus.emit('entity:spawned', {
          entityId: Math.floor(Math.random() * 10000),
          archetype: spawnCmd.entity,
          position: {
            x: spawnCmd.position.x || 0,
            y: spawnCmd.position.y || 0,
            z: spawnCmd.position.z || 0
          }
        });
      }
    });

    // Default move handler
    this.registerHandler('move', {
      execute: async (command: Command) => {
        const moveCmd = command as MoveCommand;
        console.log(`[MOVE] Moving entity ${moveCmd.entityId} to:`, moveCmd.destination);

        // In a real implementation, this would update the entity's position
        // and emit appropriate events
      }
    });

    // Default modify handler
    this.registerHandler('modify', {
      execute: async (command: Command) => {
        const modifyCmd = command as ModifyCommand;
        console.log(`[MODIFY] Modifying ${modifyCmd.target.type}:`, modifyCmd.changes);

        // In a real implementation, this would apply the changes
        // and emit appropriate events
      }
    });
  }

  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}