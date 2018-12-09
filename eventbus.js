// In case we want to use CustomEvent in here and we need a polyfill for some reason or another
(function () {
    if ( typeof window.CustomEvent === 'function' ) return false;

    function CustomEvent (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

class EventBus {
    constructor () {
        this.listeners = {};
    }

    addEventListener (type, callback, scope) {
        let args = [];
        let numOfArgs = arguments.length;
        for (let i = 0; i < numOfArgs; ++i) {
            args.push(arguments[i]);
        }
        args = args.length > 3 ? args.splice(3, args.length - 1) : [];
        if (typeof this.listeners[type] !== 'undefined') {
            this.listeners[type].push({scope, callback, args});
        } else {
            this.listeners[type] = [{scope, callback, args}];
        }
    }

    removeEventListener (type, callback, scope) {
        if (typeof this.listeners[type] !== 'undefined') {
            let numOfCallbacks = this.listeners[type].length;
            if (callback === undefined && scope === undefined) {
                return numOfCallbacks > 0;
            }
            for (let i = 0; i < numOfCallbacks; ++i) {
                let listener = this.listeners[type][i];
                if ((scope ? listener.scope === scope : true) && listener.callback === callback) {
                    return true;
                }
            }
        }
        return false;
    }

    dispatch (type, parameters) {
        let event = {type, parameters};
        let args = [];
        let numOfArgs = arguments.length;
        for (let i = 0; i < numOfArgs; ++i) {
            args.push(arguments[i]);
        }
        args = args.length > 2 ? args.splice(2, args.length - 1) : [];
        args = [event].concat(args);

        if (typeof this.listeners[type] !== 'undefined') {
            let listeners = this.listeners[type].slice();
            let numOfCallbacks = listeners.length;
            for (let i = 0; i < numOfCallbacks; ++i) {
                let listener = listeners[i];
                if (listener && listener.callback) {
                    let concatArgs = args.concat(listener.args);
                    listener.callback.apply(listener.scope, concatArgs);
                }
            }
        }
    }

    getEvents () {
        let str = '';
        for (let type in this.listeners) {
            let numOfCallbacks = this.listeners[type].length;
            for (let i = 0; i < numOfCallbacks; ++i) {
                let listener = this.listeners[type][i];
                str += listener.scope && listener.scope.className ? listener.scope.className : 'anonymous';
                str += ' listen for "' + type + '"\n';
            }
        }
        return str;
    }
}

/**
 * Sample usage:
 *
 * class SampleClass {
 *     constructor() {
 *         this.className = 'TheNameOfClassForScope';
 *     }
 *     doSomething() {
 *         console.log('Doing something');
 *     }
 * }
 * let newSampleClass = new SampleClass();
 * eventbus.addEventListener('A test event to listen for', newSampleClass.doSomething(), newSampleClass.className);
 */