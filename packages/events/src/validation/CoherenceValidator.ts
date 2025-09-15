import { BaseValidator } from './ValidationChain';
import { Command, ValidationResult, GameContext, SpawnCommand } from '../types';

/**
 * Coherence validation: ensures commands maintain world logic and consistency
 */
export class CoherenceValidator extends BaseValidator {
  // Biome compatibility rules
  private readonly biomeCompatibility: { [biome: string]: string[] } = {
    'desert': ['cactus', 'rock_desert', 'snake', 'lizard'],
    'forest': ['tree_oak', 'tree_pine', 'deer', 'wolf', 'mushroom'],
    'tundra': ['rock_small', 'ice_crystal', 'polar_bear'],
    'grassland': ['grass_tall', 'flower', 'rabbit', 'cow'],
    'mountain': ['rock_large', 'eagle', 'goat'],
    'ocean': ['fish', 'seaweed', 'coral'],
    'swamp': ['tree_willow', 'frog', 'alligator']
  };

  // Scale limits for different entity types
  private readonly scaleConstraints: { [entityType: string]: { min: number; max: number } } = {
    'tree': { min: 0.5, max: 3.0 },
    'rock': { min: 0.3, max: 5.0 },
    'building': { min: 0.8, max: 2.0 },
    'animal': { min: 0.5, max: 2.0 },
    'item': { min: 0.1, max: 1.5 }
  };

  protected doValidation(command: Command, context?: GameContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (command.action) {
      case 'spawn':
        return this.validateSpawnCoherence(command as SpawnCommand, context, result);

      case 'modify':
        return this.validateModifyCoherence(command, context, result);

      default:
        return result;
    }
  }

  private validateSpawnCoherence(
    command: SpawnCommand,
    context: GameContext | undefined,
    result: ValidationResult
  ): ValidationResult {
    const { entity, properties } = command;

    // Validate entity exists and is recognized
    if (!this.isValidEntityType(entity)) {
      result.warnings.push({
        code: 'UNKNOWN_ENTITY',
        message: `Entity type '${entity}' is not recognized`,
        suggestion: 'Check entity name spelling or add to entity registry'
      });
    }

    // Validate biome compatibility
    if (context) {
      this.validateBiomeCompatibility(entity, context, result);
    }

    // Validate scale constraints
    if (properties?.scale) {
      this.validateScale(entity, properties.scale, result);
    }

    // Validate rotation constraints
    if (properties?.rotation) {
      this.validateRotation(entity, properties.rotation, result);
    }

    // Validate logical constraints
    this.validateLogicalConstraints(entity, command, result);

    return result;
  }

  private validateModifyCoherence(
    command: Command,
    context: GameContext | undefined,
    result: ValidationResult
  ): ValidationResult {
    const { target, changes } = command;

    // Validate target exists
    if (!target) {
      result.isValid = false;
      result.errors.push({
        code: 'MISSING_TARGET',
        message: 'Modify command requires a target',
        field: 'target',
        severity: 'error'
      });
      return result;
    }

    // Validate changes don't break physics laws
    if (changes.gravity !== undefined) {
      if (typeof changes.gravity !== 'number' || changes.gravity < -50 || changes.gravity > 50) {
        result.isValid = false;
        result.errors.push({
          code: 'INVALID_GRAVITY',
          message: 'Gravity must be a number between -50 and 50',
          field: 'changes.gravity',
          severity: 'error'
        });
      }
    }

    // Validate material changes
    if (changes.material) {
      this.validateMaterialChange(changes.material, result);
    }

    return result;
  }

  private validateBiomeCompatibility(
    entity: string,
    context: GameContext,
    result: ValidationResult
  ): void {
    // For now, we'll use a simplified biome detection
    // In a real implementation, this would query the biome from chunk data
    const currentBiome = this.detectBiome(context);

    if (currentBiome && this.biomeCompatibility[currentBiome]) {
      const compatibleEntities = this.biomeCompatibility[currentBiome];
      const entityBase = this.getEntityBase(entity);

      if (!compatibleEntities.some(compatible => entityBase.includes(compatible.split('_')[0]))) {
        result.warnings.push({
          code: 'BIOME_INCOMPATIBILITY',
          message: `'${entity}' is unusual for ${currentBiome} biome`,
          suggestion: `Consider: ${compatibleEntities.slice(0, 3).join(', ')}`
        });
      }
    }
  }

  private validateScale(entity: string, scale: number, result: ValidationResult): void {
    const entityType = this.getEntityType(entity);
    const constraints = this.scaleConstraints[entityType];

    if (constraints) {
      if (scale < constraints.min || scale > constraints.max) {
        result.isValid = false;
        result.errors.push({
          code: 'INVALID_SCALE',
          message: `Scale ${scale} invalid for ${entityType}. Range: ${constraints.min}-${constraints.max}`,
          field: 'properties.scale',
          severity: 'error'
        });
        return;
      }
    }

    // General scale sanity check
    if (scale <= 0 || scale > 10) {
      result.isValid = false;
      result.errors.push({
        code: 'EXTREME_SCALE',
        message: `Scale ${scale} is extreme. Use positive values ≤ 10`,
        field: 'properties.scale',
        severity: 'error'
      });
    }
  }

  private validateRotation(
    entity: string,
    rotation: { x: number; y: number; z: number },
    result: ValidationResult
  ): void {
    // Validate rotation values are reasonable (in radians)
    Object.entries(rotation).forEach(([axis, value]) => {
      if (typeof value !== 'number') {
        result.errors.push({
          code: 'INVALID_ROTATION_TYPE',
          message: `Rotation ${axis} must be a number`,
          field: `properties.rotation.${axis}`,
          severity: 'error'
        });
        result.isValid = false;
      } else if (Math.abs(value) > Math.PI * 4) {
        result.warnings.push({
          code: 'EXTREME_ROTATION',
          message: `Rotation ${axis} value ${value.toFixed(2)} is very large`,
          suggestion: 'Consider values between -π and π (radians)'
        });
      }
    });
  }

  private validateLogicalConstraints(
    entity: string,
    command: SpawnCommand,
    result: ValidationResult
  ): void {
    // Flying entities shouldn't be spawned underground
    if (this.isFlyingEntity(entity) && command.position.y !== undefined && command.position.y < 0) {
      result.warnings.push({
        code: 'FLYING_UNDERGROUND',
        message: `Flying entity '${entity}' spawned underground (y=${command.position.y})`,
        suggestion: 'Consider positive Y values for flying entities'
      });
    }

    // Water entities should be near water
    if (this.isAquaticEntity(entity)) {
      result.warnings.push({
        code: 'AQUATIC_PLACEMENT',
        message: `Aquatic entity '${entity}' should be spawned near water`,
        suggestion: 'Ensure spawn location has water nearby'
      });
    }

    // Very large entities need space
    if (command.properties?.scale && command.properties.scale > 2.0) {
      result.warnings.push({
        code: 'LARGE_ENTITY_SPACING',
        message: `Large entity (scale ${command.properties.scale}) needs adequate space`,
        suggestion: 'Ensure sufficient clearance around spawn point'
      });
    }
  }

  private validateMaterialChange(material: any, result: ValidationResult): void {
    const validMaterials = ['wood', 'stone', 'metal', 'glass', 'water', 'ice', 'dirt', 'sand'];

    if (typeof material === 'string' && !validMaterials.includes(material)) {
      result.warnings.push({
        code: 'UNKNOWN_MATERIAL',
        message: `Material '${material}' is not recognized`,
        suggestion: `Valid materials: ${validMaterials.join(', ')}`
      });
    }
  }

  // Helper methods
  private isValidEntityType(entity: string): boolean {
    // In a real implementation, this would check against a registry
    const commonEntities = [
      'tree', 'tree_oak', 'tree_pine', 'rock', 'rock_large', 'grass',
      'building', 'house', 'cactus', 'flower', 'mushroom'
    ];
    return commonEntities.some(valid => entity.includes(valid.split('_')[0]));
  }

  private detectBiome(context: GameContext): string | null {
    // Simplified biome detection - in reality this would use world data
    // For now, return null to indicate unknown biome
    return null;
  }

  private getEntityBase(entity: string): string {
    return entity.split('_')[0];
  }

  private getEntityType(entity: string): string {
    if (entity.includes('tree')) return 'tree';
    if (entity.includes('rock')) return 'rock';
    if (entity.includes('building') || entity.includes('house')) return 'building';
    if (entity.includes('animal') || entity.includes('deer') || entity.includes('wolf')) return 'animal';
    return 'item';
  }

  private isFlyingEntity(entity: string): boolean {
    const flyingEntities = ['bird', 'eagle', 'dragon', 'butterfly', 'bat'];
    return flyingEntities.some(flying => entity.includes(flying));
  }

  private isAquaticEntity(entity: string): boolean {
    const aquaticEntities = ['fish', 'shark', 'whale', 'seaweed', 'coral'];
    return aquaticEntities.some(aquatic => entity.includes(aquatic));
  }
}