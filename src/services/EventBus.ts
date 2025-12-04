// EventBus service for widget communication
class EventBus {
    private subscribers: Record<string, Array<(data: any) => void>> = {};

    subscribe(eventName: string, callback: (data: any) => void): () => void {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);

        // Return unsubscribe function
        return () => {
            this.subscribers[eventName] = this.subscribers[eventName].filter(
                (cb) => cb !== callback
            );
        };
    }

    publish(eventName: string, data: any): void {
        console.log('EventBus Publishing:', eventName, data);
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach((callback) => callback(data));
        }
    }

    unsubscribe(eventName: string, callback: (data: any) => void): void {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName] = this.subscribers[eventName].filter(
                (cb) => cb !== callback
            );
        }
    }
}

// Export singleton instance
export const eventBus = new EventBus();
export default eventBus;

