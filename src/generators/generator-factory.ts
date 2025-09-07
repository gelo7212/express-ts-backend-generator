import { IGenerator, GeneratorType, IDependencyContainer } from '../types';

export interface IGeneratorFactory {
  createGenerator(type: GeneratorType): IGenerator;
  registerGenerator(type: GeneratorType, generator: IGenerator): void;
  getAvailableTypes(): GeneratorType[];
}

/**
 * Factory for creating generators
 */
export class GeneratorFactory implements IGeneratorFactory {
  private generators = new Map<GeneratorType, () => IGenerator>();

  constructor(private container: IDependencyContainer) {}

  createGenerator(type: GeneratorType): IGenerator {
    const factory = this.generators.get(type);
    if (!factory) {
      throw new Error(`No generator registered for type: ${type}`);
    }
    return factory();
  }

  registerGenerator(type: GeneratorType, generator: IGenerator): void {
    this.generators.set(type, () => generator);
  }

  registerGeneratorFactory(type: GeneratorType, factory: () => IGenerator): void {
    this.generators.set(type, factory);
  }

  getAvailableTypes(): GeneratorType[] {
    return Array.from(this.generators.keys());
  }

  hasGenerator(type: GeneratorType): boolean {
    return this.generators.has(type);
  }
}
