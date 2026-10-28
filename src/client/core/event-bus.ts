/**
 * Angular RxJS-style Event Bus & Observable Pattern
 * Supports Subject and BehaviorSubject patterns for reactive component state management.
 */

export type Observer<T> = (value: T) => void;
export type Unsubscribe = () => void;

export class Observable<T> {
  constructor(private subscribeFn: (observer: Observer<T>) => Unsubscribe) {}

  subscribe(observer: Observer<T>): Unsubscribe {
    return this.subscribeFn(observer);
  }
}

export class Subject<T> {
  protected observers: Observer<T>[] = [];

  asObservable(): Observable<T> {
    return new Observable<T>((observer) => {
      this.observers.push(observer);
      return () => {
        this.observers = this.observers.filter(o => o !== observer);
      };
    });
  }

  next(value: T): void {
    for (const observer of [...this.observers]) {
      observer(value);
    }
  }

  unsubscribeAll(): void {
    this.observers = [];
  }
}

export class BehaviorSubject<T> extends Subject<T> {
  constructor(private _currentValue: T) {
    super();
  }

  get value(): T {
    return this._currentValue;
  }

  override asObservable(): Observable<T> {
    return new Observable<T>((observer) => {
      observer(this._currentValue); // Instantly emit current state upon subscription
      this.observers.push(observer);
      return () => {
        this.observers = this.observers.filter(o => o !== observer);
      };
    });
  }

  override next(value: T): void {
    this._currentValue = value;
    super.next(value);
  }
}
