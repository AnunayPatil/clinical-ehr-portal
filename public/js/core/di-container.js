/**
 * Angular-Concept Dependency Injection (DI) Container
 * Demonstrates how Angular's Hierarchical Injector and Service Singletons operate.
 * Provides clean decoupling between presentation components and business logic / API services.
 */
export class InjectionToken {
    description;
    constructor(description) {
        this.description = description;
    }
    toString() {
        return `InjectionToken [${this.description}]`;
    }
}
export class Injector {
    parent;
    static instance;
    registry = new Map();
    instances = new Map();
    constructor(parent) {
        this.parent = parent;
    }
    static getRoot() {
        if (!Injector.instance) {
            Injector.instance = new Injector();
        }
        return Injector.instance;
    }
    /**
     * Register a provider into the DI container (like Angular module/component providers array)
     */
    register(provider) {
        if (typeof provider === 'function') {
            this.registry.set(provider, { useClass: provider });
        }
        else {
            this.registry.set(provider.provide, provider);
        }
    }
    /**
     * Resolve an instance by its token or class reference
     */
    get(token) {
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
                const resolvedDeps = (provider.deps || []).map((dep) => this.get(dep));
                const instance = provider.useFactory(...resolvedDeps);
                this.instances.set(token, instance);
                return instance;
            }
            const TargetClass = provider.useClass || (typeof token === 'function' ? token : null);
            if (TargetClass) {
                const resolvedDeps = (provider.deps || []).map((dep) => this.get(dep));
                const instance = new TargetClass(...resolvedDeps);
                this.instances.set(token, instance);
                return instance;
            }
        }
        // 3. If token is a class constructor directly without explicit registration, instantiate it
        if (typeof token === 'function') {
            const instance = new token();
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
    clear() {
        this.instances.clear();
        this.registry.clear();
    }
}
/**
 * Decorator to simulate Angular's @Injectable({ providedIn: 'root' })
 */
export function Injectable(options) {
    return function (target) {
        if (options?.providedIn === 'root') {
            Injector.getRoot().register(target);
        }
    };
}
export const AppInjector = Injector.getRoot();
