(function(window){
    'use strict';

    /*
     * obj operation
     */

    var type = Object.prototype.toString.call.bind(Object.prototype.toString);

    var forEach = function(obj, method){
        if(type(obj) === '[object Array]'){
            for(var i = 0, l = obj.length; i < l && method.call(this, obj[i], i) !== false; i++);
            return;
        }

        for(var key in obj) if(obj.hasOwnProperty(key) && method.call(this, obj[key], key) === false) return;
    };

    var transform = function(obj, method){
        if(!obj) return obj;
        var target = new obj.constructor();
        forEach(obj, function(val, key){method(target, val, key)});
        return target;
    };

    var map = function(obj, method){
        return transform(obj, function(target, val, key){target[key] = method ? method(val, key) : val});
    };

    var filter = function(obj, method){
        return transform(obj, function(target, val, key){if(method(val, key)) target[key] = val});
    };

    var clone = map;

    var extend = function(target, addon, alone){
        target = (alone ? clone(target) : target) || {};
        forEach(addon, function(val, key){target[key] = val;});
        return target;
    };

    /*
     * ajax
     */

    var formatUrl = function(url, data){
        var params = [];
        forEach(data, function(val, key){
            params.push([key, val].map(encodeURIComponent).join('='));
        });

        if(params.length){
            url = url +
                (url.indexOf('?') >= 0 ? '&' : '?') +
                params.join('&');
        }
        return url;
    };

    // jsonp
    var jsonp = function(url, data, callback){
        if(!callback){
            callback = data;
            data = {};
        }

        data = extend({
            cb: 'cb_' + (Math.random() + '').slice(2)
        }, data);

        url = formatUrl(url, data);

        var script = extend(document.createElement('script'), {
            src: url,
            async: true,
            charset: 'utf-8'
        });

        window[data.cb] = function(){
            callback.apply(this, arguments);

            document.head.removeChild(script);
            script = null;
        };

        document.head.appendChild(script);
    };

    /*
     * async
     */

    // [function(function(err, result)), ...], function(err, result) -> null
    var finish = function(tasks, callback) {
        var left = tasks.length,
            results = [],
            over = false;

        if(!left){
            callback();
            return;
        }

        tasks.forEach(function(task, i){
            task(function(err, result){
                if(over){
                    return;
                }

                if(err){
                    over = true;
                    throw err;
                }else{
                    results[i] = result;

                    left--;

                    if(!left){
                        callback.apply(null, results);
                    }
                }
            });
        });
    };

    /*
     * other helper
     */

    // 'a${x}c', {x:'b'} -> 'abc'
    var format = function(template, vars) {
        return template.replace(/\$\{([^\{\}]*)\}/g, function(_, name) {
            var value = vars[name.trim()];
            return value == null ? '' : value + '';
        });
    };

    // decorate dom element
    var fns = {
        on: HTMLElement.prototype.addEventListener,
        un: HTMLElement.prototype.removeEventListener,
        css: function(key, val){
            var ele = this;
            type(key) === '[object String]' ?
                this.style.setProperty(key, val) :
                forEach(key, function(v, k){
                    ele.css(k, v);
                });
            return this;
        },
        addClass: function(adds){
            var clses = this.className.split(' ');
            adds.split(' ').forEach(function(cls){
                var i = clses.indexOf(cls);
                if(i < 0){
                    clses.push(cls);
                }
            });
            this.className = clses.join(' ');
            return this;
        },
        removeClass: function(rms){
            var clses = this.className.split(' ');
            rms.split(' ').forEach(function(cls){
                var i = clses.indexOf(cls);
                if(i >= 0){
                    clses[i] = null;
                }
            });
            this.className = clses.filter(function(cls){return cls}).join(' ');
            return this;
        },
        show: function(){this.css('display', '');return this;},
        hide: function(){this.css('display', 'none');return this;},
        find: function(selector){return $(selector, this)},
        findAll: function(selector){return $$(selector, this)},
        parent: function(){return decorate(this.parentNode)}
    };

    var decorate = function(element){
        return element ? extend(element, fns) : element;
    };

    var $ = function(selector, node){
        return decorate(type(selector) === '[object String]' ? (node || document).querySelector(selector) : selector);
    };

    var $$ = function(selector, node){
        return Array.prototype.slice.call(
            type(selector) === '[object String]' ?
            (node || document).querySelectorAll(selector) :
            selector
        ).map(decorate);
    };

    // export helpers

    extend($, {
        type: type,
        forEach: forEach,
        map: map,
        filter: filter,
        clone: clone,
        extend: extend,
        formatUrl: formatUrl,
        jsonp: jsonp,
        finish: finish,
        format: format
    });

    extend(window, {
        $: $,
        $$: $$
    });

})(this);