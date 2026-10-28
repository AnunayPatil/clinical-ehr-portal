/**
 * Angular RxJS-style Event Bus & Observable Pattern
 * Supports Subject and BehaviorSubject patterns for reactive component state management.
 */
export class Observable {
    subscribeFn;
    constructor(subscribeFn) {
        this.subscribeFn = subscribeFn;
    }
    subscribe(observer) {
        return this.subscribeFn(observer);
    }
}
export class Subject {
    observers = [];
    asObservable() {
        return new Observable((observer) => {
            this.observers.push(observer);
            return () => {
                this.observers = this.observers.filter(o => o !== observer);
            };
        });
    }
    next(value) {
        for (const observer of [...this.observers]) {
            observer(value);
        }
    }
    unsubscribeAll() {
        this.observers = [];
    }
}
export class BehaviorSubject extends Subject {
    _currentValue;
    constructor(_currentValue) {
        super();
        this._currentValue = _currentValue;
    }
    get value() {
        return this._currentValue;
    }
    asObservable() {
        return new Observable((observer) => {
            observer(this._currentValue); // Instantly emit current state upon subscription
            this.observers.push(observer);
            return () => {
                this.observers = this.observers.filter(o => o !== observer);
            };
        });
    }
    next(value) {
        this._currentValue = value;
        super.next(value);
    }
}
