import { Command, CommandValidator, ValidationResult, GameContext } from '../types';

/**
 * Chain of Responsibility pattern for command validation
 * Based on investigation recommendation: Spatial → Resource → Coherence
 */
export abstract class BaseValidator implements CommandValidator {
  protected nextValidator?: BaseValidator;

  public setNext(validator: BaseValidator): BaseValidator {
    this.nextValidator = validator;
    return validator;
  }

  public validate(command: Command, context?: GameContext): ValidationResult {
    const result = this.doValidation(command, context);

    // If current validation fails, stop chain
    if (!result.isValid) {
      return result;
    }

    // If there's a next validator and current validation passes, continue chain
    if (this.nextValidator) {
      const nextResult = this.nextValidator.validate(command, context);

      // Combine results (current + next)
      return {
        isValid: nextResult.isValid,
        errors: [...result.errors, ...nextResult.errors],
        warnings: [...result.warnings, ...nextResult.warnings],
        suggestions: [
          ...(result.suggestions || []),
          ...(nextResult.suggestions || [])
        ]
      };
    }

    return result;
  }

  protected abstract doValidation(command: Command, context?: GameContext): ValidationResult;
}

/**
 * Factory for creating validation chains
 */
import { SpatialValidator } from './SpatialValidator';
import { ResourceValidator } from './ResourceValidator';
import { CoherenceValidator } from './CoherenceValidator';

export class ValidationChainFactory {
  public static createDefaultChain(): BaseValidator {

    const spatialValidator = new SpatialValidator();
    const resourceValidator = new ResourceValidator();
    const coherenceValidator = new CoherenceValidator();

    // Chain: Spatial → Resource → Coherence
    spatialValidator
      .setNext(resourceValidator)
      .setNext(coherenceValidator);

    return spatialValidator;
  }

  public static createCustomChain(validators: BaseValidator[]): BaseValidator | null {
    if (validators.length === 0) return null;

    const [first, ...rest] = validators;
    let current = first;

    for (const validator of rest) {
      current = current.setNext(validator);
    }

    return first;
  }
}