/**
 * Ported to modern TS from: https://github.com/thibauts/eventemitter
 */

type EventListener = (...args) => void;

export class EventEmitter {
    private readonly eventListeners: Record<string, EventListener[]> = {};

    public on(eventName: string, listener: EventListener): void {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(listener);
    }
    public once(eventName: string, listener: EventListener): void {
        const once = (...args: any[]) => {
            listener(...args);
            this.off(eventName, once);
        };
        this.on(eventName, once);
    }
    public off(eventName: string, listener: EventListener): void {
        if (!listener) {
            delete this.eventListeners[eventName];
            return;
        }

        const index = this.eventListeners[eventName].indexOf(listener);
        if (index !== -1) {
            this.eventListeners[eventName].splice(index, 1);
            if (this.eventListeners[eventName].length === 0) {
                delete this.eventListeners[eventName];
            }
        }
    }
    public emit(...args: any[]): void {
        const eventName = args.shift();

        if (!this.eventListeners[eventName]) return;

        this.eventListeners[eventName].forEach(function (listener) {
            listener(...args);
        });
    }
}
