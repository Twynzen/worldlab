import { BaseValidator } from './ValidationChain';
import { Command, ValidationResult, GameContext, SpawnCommand } from '../types';

/**
 * Spatial validation: ensures commands respect physical/geometric constraints
 */
export class SpatialValidator extends BaseValidator {
  protected doValidation(command: Command, context?: GameContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (command.action) {
      case 'spawn':
        return this.validateSpawnCommand(command as SpawnCommand, context, result);

      case 'move':
        return this.validateMoveCommand(command, context, result);

      default:
        // No spatial validation needed for this command
        return result;
    }
  }

  private validateSpawnCommand(
    command: SpawnCommand,
    context?: GameContext,
    result: ValidationResult = { isValid: true, errors: [], warnings: [] }
  ): ValidationResult {
    const { position } = command;

    // If position is relative to another entity
    if (position.near) {
      if (!context) {
        result.isValid = false;
        result.errors.push({
          code: 'MISSING_CONTEXT',
          message: 'Game context required for relative positioning',
          field: 'position.near',
          severity: 'error'
        });
        return result;
      }

      // Find the reference entity
      const referenceEntity = context.nearbyEntities.find(
        entity => entity.type === position.near || entity.id.toString() === position.near
      );

      if (!referenceEntity) {
        result.isValid = false;
        result.errors.push({
          code: 'REFERENCE_NOT_FOUND',
          message: `Reference entity '${position.near}' not found`,
          field: 'position.near',
          severity: 'error'
        });
        result.suggestions = [`Available entities: ${context.nearbyEntities.map(e => e.type).join(', ')}`];
        return result;
      }

      // Calculate actual spawn position
      const radius = position.radius || 5;
      const angle = Math.random() * Math.PI * 2;
      const actualX = referenceEntity.position.x + Math.cos(angle) * radius;
      const actualZ = referenceEntity.position.z + Math.sin(angle) * radius;

      // Check world bounds
      if (context.worldBounds) {
        if (actualX < context.worldBounds.min.x || actualX > context.worldBounds.max.x ||
            actualZ < context.worldBounds.min.z || actualZ > context.worldBounds.max.z) {
          result.isValid = false;
          result.errors.push({
            code: 'OUT_OF_BOUNDS',
            message: `Calculated position (${actualX.toFixed(1)}, ${actualZ.toFixed(1)}) is outside world bounds`,
            field: 'position',
            severity: 'error'
          });
          return result;
        }
      }
    }

    // If absolute position is provided
    if (typeof position.x === 'number' && typeof position.z === 'number') {
      if (context?.worldBounds) {
        if (position.x < context.worldBounds.min.x || position.x > context.worldBounds.max.x ||
            position.z < context.worldBounds.min.z || position.z > context.worldBounds.max.z) {
          result.isValid = false;
          result.errors.push({
            code: 'OUT_OF_BOUNDS',
            message: `Position (${position.x}, ${position.z}) is outside world bounds`,
            field: 'position',
            severity: 'error'
          });
          return result;
        }
      }

      // Check for collision with existing entities
      if (context?.nearbyEntities) {
        const minDistance = 2; // Minimum distance between entities
        const collision = context.nearbyEntities.find(entity => {
          const distance = Math.sqrt(
            Math.pow(entity.position.x - position.x!, 2) +
            Math.pow(entity.position.z - position.z!, 2)
          );
          return distance < minDistance;
        });

        if (collision) {
          result.isValid = false;
          result.errors.push({
            code: 'COLLISION_DETECTED',
            message: `Position too close to existing entity (${collision.type})`,
            field: 'position',
            severity: 'error'
          });

          // Suggest alternative position
          const suggestedX = position.x! + minDistance + 1;
          result.suggestions = [`Try position: (${suggestedX}, ${position.z})`];
          return result;
        }
      }
    }

    // Validate Y position if provided (height validation)
    if (typeof position.y === 'number') {
      if (position.y < -100 || position.y > 1000) {
        result.warnings.push({
          code: 'EXTREME_HEIGHT',
          message: `Height ${position.y} is extreme. Normal range: -100 to 1000`,
          suggestion: 'Consider using height between 0-200 for ground level'
        });
      }
    }

    return result;
  }

  private validateMoveCommand(
    command: Command,
    context?: GameContext,
    result: ValidationResult = { isValid: true, errors: [], warnings: [] }
  ): ValidationResult {
    // Basic move command validation
    if (!command.entityId) {
      result.isValid = false;
      result.errors.push({
        code: 'MISSING_ENTITY_ID',
        message: 'Move command requires entityId',
        field: 'entityId',
        severity: 'error'
      });
    }

    if (!command.destination) {
      result.isValid = false;
      result.errors.push({
        code: 'MISSING_DESTINATION',
        message: 'Move command requires destination',
        field: 'destination',
        severity: 'error'
      });
    }

    return result;
  }
}