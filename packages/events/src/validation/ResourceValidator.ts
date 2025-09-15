import { BaseValidator } from './ValidationChain';
import { Command, ValidationResult, GameContext, SpawnCommand } from '../types';

/**
 * Resource validation: ensures commands don't exceed system limits
 */
export class ResourceValidator extends BaseValidator {
  private commandCooldowns = new Map<string, number>();
  private readonly DEFAULT_COOLDOWN = 1000; // 1 second

  protected doValidation(command: Command, context?: GameContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check cooldowns
    this.validateCooldown(command, result);

    // Check resource limits based on command type
    switch (command.action) {
      case 'spawn':
        this.validateSpawnResources(command as SpawnCommand, context, result);
        break;

      case 'modify':
        this.validateModifyResources(command, context, result);
        break;

      default:
        // No resource validation needed
        break;
    }

    return result;
  }

  private validateCooldown(command: Command, result: ValidationResult): void {
    const now = Date.now();
    const cooldownKey = `${command.action}`;
    const lastExecution = this.commandCooldowns.get(cooldownKey);

    if (lastExecution) {
      const timeSinceLastExecution = now - lastExecution;
      const cooldownTime = this.getCooldownForCommand(command);

      if (timeSinceLastExecution < cooldownTime) {
        const remainingTime = cooldownTime - timeSinceLastExecution;
        result.isValid = false;
        result.errors.push({
          code: 'COOLDOWN_ACTIVE',
          message: `Command '${command.action}' is on cooldown. Wait ${Math.ceil(remainingTime / 1000)}s`,
          severity: 'error'
        });
        return;
      }
    }

    // Update cooldown
    this.commandCooldowns.set(cooldownKey, now);
  }

  private getCooldownForCommand(command: Command): number {
    // Different cooldowns for different command types
    switch (command.action) {
      case 'spawn':
        return 500; // 0.5 seconds for spawn
      case 'modify':
        return 1000; // 1 second for modify
      case 'move':
        return 100; // 0.1 seconds for move
      default:
        return this.DEFAULT_COOLDOWN;
    }
  }

  private validateSpawnResources(
    command: SpawnCommand,
    context: GameContext | undefined,
    result: ValidationResult
  ): void {
    if (!context) {
      result.warnings.push({
        code: 'NO_CONTEXT',
        message: 'No game context provided for resource validation'
      });
      return;
    }

    const { resources } = context;

    // Check entity count limits
    if (resources.entityCount >= resources.maxEntities) {
      result.isValid = false;
      result.errors.push({
        code: 'MAX_ENTITIES_REACHED',
        message: `Cannot spawn more entities. Current: ${resources.entityCount}/${resources.maxEntities}`,
        severity: 'error'
      });
      result.suggestions = ['Try removing some entities first', 'Increase maxEntities limit'];
      return;
    }

    // Warn if approaching limit
    const entityUsagePercent = (resources.entityCount / resources.maxEntities) * 100;
    if (entityUsagePercent > 80) {
      result.warnings.push({
        code: 'HIGH_ENTITY_USAGE',
        message: `Entity count is high (${entityUsagePercent.toFixed(1)}%)`,
        suggestion: 'Consider optimizing entity usage'
      });
    }

    // Check memory usage
    const memoryUsagePercent = (resources.memoryUsage / resources.maxMemory) * 100;
    if (memoryUsagePercent > 90) {
      result.isValid = false;
      result.errors.push({
        code: 'MEMORY_LIMIT_EXCEEDED',
        message: `Memory usage too high (${memoryUsagePercent.toFixed(1)}%)`,
        severity: 'error'
      });
      return;
    }

    if (memoryUsagePercent > 75) {
      result.warnings.push({
        code: 'HIGH_MEMORY_USAGE',
        message: `Memory usage is high (${memoryUsagePercent.toFixed(1)}%)`,
        suggestion: 'Monitor memory usage carefully'
      });
    }

    // Validate batch spawn limits
    const count = this.getSpawnCount(command);
    if (count > 50) {
      result.isValid = false;
      result.errors.push({
        code: 'BATCH_LIMIT_EXCEEDED',
        message: `Cannot spawn ${count} entities at once. Limit: 50`,
        severity: 'error'
      });
      result.suggestions = ['Break into smaller batches', 'Use count ≤ 50'];
    }
  }

  private validateModifyResources(
    command: Command,
    context: GameContext | undefined,
    result: ValidationResult
  ): void {
    // Modify commands are generally less resource-intensive
    // But we can add specific validations for expensive modifications

    if (command.target?.type === 'world') {
      result.warnings.push({
        code: 'EXPENSIVE_OPERATION',
        message: 'World-level modifications can be resource intensive',
        suggestion: 'Consider targeting specific chunks or entities instead'
      });
    }
  }

  private getSpawnCount(command: SpawnCommand): number {
    // Check if command specifies a count
    if (command.properties?.count && typeof command.properties.count === 'number') {
      return command.properties.count;
    }
    return 1; // Default single spawn
  }

  /**
   * Clear cooldowns (useful for testing)
   */
  public clearCooldowns(): void {
    this.commandCooldowns.clear();
  }

  /**
   * Get remaining cooldown time for a command
   */
  public getRemainingCooldown(commandAction: string): number {
    const lastExecution = this.commandCooldowns.get(commandAction);
    if (!lastExecution) return 0;

    const now = Date.now();
    const cooldownTime = this.getCooldownForCommand({ action: commandAction });
    const elapsed = now - lastExecution;

    return Math.max(0, cooldownTime - elapsed);
  }
}