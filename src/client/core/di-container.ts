/**
 * Angular-Concept Dependency Injection (DI) Container
 * Demonstrates how Angular's Hierarchical Injector and Service Singletons operate.
 * Provides clean decoupling between presentation components and business logic / API services.
 */

export type Type<T> = new (...args: any[]) => T;

export class InjectionToken<T> {
  constructor(public readonly description: string) {}
  toString(): string {
    return `InjectionToken [${this.description}]`;
  }
}

export type ProviderToken<T> = Type<T> | InjectionToken<T> | string;

export interface Provider<T = any> {
  provide: ProviderToken<T>;
  useClass?: Type<T>;
  useValue?: T;
  useFactory?: (...deps: any[]) => T;
  deps?: ProviderToken<any>[];
}

export class Injector {
  private static instance: Injector;
  private registry = new Map<ProviderToken<any>, any>();
  private instances = new Map<ProviderToken<any>, any>();

  constructor(private parent?: Injector) {}

  public static getRoot(): Injector {
    if (!Injector.instance) {
      Injector.instance = new Injector();
    }
    return Injector.instance;
  }

  /**
   * Register a provider into the DI container (like Angular module/component providers array)
   */
  public register<T>(provider: Provider<T> | Type<T>): void {
    if (typeof provider === 'function') {
      this.registry.set(provider, { useClass: provider });
    } else {
      this.registry.set(provider.provide, provider);
    }
  }

  /**
   * Resolve an instance by its token or class reference
   */
  public get<T>(token: ProviderToken<T>): T {
    // 1. Check if an instance already exists (Singleton pattern)
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // 2. Check if a provider configuration exists
    const provider = this.registry.get(token);

    if (provider) {
      if (provider.useValue !== undefined) {
        this.instances.set(token, provider.useValue);
        return provider.useValue;
      }

      if (provider.useFactory) {
        const resolvedDeps = (provider.deps || []).map((dep: ProviderToken<any>) => this.get(dep));
        const instance = provider.useFactory(...resolvedDeps);
        this.instances.set(token, instance);
        return instance;
      }

      const TargetClass = provider.useClass || (typeof token === 'function' ? token : null);
      if (TargetClass) {
        const resolvedDeps = (provider.deps || []).map((dep: ProviderToken<any>) => this.get(dep));
        const instance = new TargetClass(...resolvedDeps);
        this.instances.set(token, instance);
        return instance;
      }
    }

    // 3. If token is a class constructor directly without explicit registration, instantiate it
    if (typeof token === 'function') {
      const instance = new (token as Type<T>)();
      this.instances.set(token, instance);
      return instance;
    }

    // 4. Delegate to parent injector if available
    if (this.parent) {
      return this.parent.get(token);
    }

    throw new Error(`[DI Container] No provider found for token: ${token.toString()}`);
  }

  /**
   * Reset instances (useful for testing or re-initialization)
   */
  public clear(): void {
    this.instances.clear();
    this.registry.clear();
  }
}

/**
 * Decorator to simulate Angular's @Injectable({ providedIn: 'root' })
 */
export function Injectable(options?: { providedIn?: 'root' }) {
  return function (target: Type<any>) {
    if (options?.providedIn === 'root') {
      Injector.getRoot().register(target);
    }
  };
}

export const AppInjector = Injector.getRoot();
