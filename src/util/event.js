export function createEventBus(eventBus){
    const $on = (event, callback) => {
        if (!eventBus.listeners[event]) {
          eventBus.listeners[event] = [];
        }
        eventBus.listeners[event].push(callback);
    };
  
    // 触发一个事件
    const $emit = (event, ...args) => {
        if (eventBus.listeners[event]) {
          eventBus.listeners[event].forEach(callback => callback(...args));
        }
    };

    // 移除一个事件
    const $remove = (event ,callback)=>{
        if (eventBus.listeners[event]){
            let index = eventBus.listeners[event].indexOf(callback)
            eventBus.listeners[event].splice(index, 1);
        }
    }

    return {$on ,$emit ,$remove}
}