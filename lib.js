(function(window){
    'use strict';

    // helpers
    var type = Object.prototype.toString.call.bind(Object.prototype.toString);

    var forEach = function(object, handler){
        if(type(object) === '[object Array]'){
            for(var i = 0, l = object.length; i < l && handler.call(this, object[i], i) !== false; i++);
            return;
        }

        for(var key in object) if(object.hasOwnProperty(key) && handler.call(this, object[key], key) === false) return;
    };

    var clone = function(obj){
        if(!obj) return obj;
        var o = new obj.constructor();
        forEach(obj, function(val, key){o[key] = val});
        return o;
    };

    var extend = function(target, addon, self){
        target = (self ? target : clone(target)) || {};
        forEach(addon, function(val, key){target[key] = val;});
        return target;
    };

    var fns = {
        on: function(){return this.addEventListener.apply(this, arguments)},
        un: function(){return this.removeEventListener.apply(this, arguments)},
        css: function(key, val){
            var ele = this;
            return type(key) === '[object String]' ?
                this.style.setProperty(key, val) :
                forEach(key, function(v, k){
                    ele.css(k, v);
                });
        },
        show: function(){this.css('display', '')},
        hide: function(){this.css('display', 'none')},
        find: function(selector){return $(selector, this)},
        parent: function(){return decorate(this.parentNode)}
    };
    var decorate = function(element){
        return element ? extend(element, fns, true) : element;
    };

    var $ = function(selector, node){
        return decorate(type(selector) === '[object String]' ? (node || document).querySelector(selector) : selector);
    };

    var $$ = function(){
        return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments)).map(decorate);
    };

    // export helpers

    extend($, {
        type: type,
        forEach: forEach,
        clone: clone,
        extend: extend
    }, true);

    extend(window, {
        $: $,
        $$: $$
    }, true);

})(this);