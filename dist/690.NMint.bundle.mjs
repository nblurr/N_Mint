/*! For license information please see 690.NMint.bundle.mjs.LICENSE.txt */
(self.webpackChunkn_mint=self.webpackChunkn_mint||[]).push([[690],{2690:(t,e,r)=>{r.d(e,{f:()=>E});var n=r(7019),o=r(2408),i=r(2835),a=r(8107),c=r(8614),u=null;try{if(null==(u=WebSocket))throw new Error("inject please")}catch(t){var s=new a.Vy(c.r);u=function(){s.throwError("WebSockets not supported in this environment",a.Vy.errors.UNSUPPORTED_OPERATION,{operation:"new WebSocket()"})}}var l=r(7445);function f(t){return f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},f(t)}function h(){h=function(){return e};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function s(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{s({},"")}catch(t){s=function(t,e,r){return t[e]=r}}function l(t,e,r,n){var i=e&&e.prototype instanceof g?e:g,a=Object.create(i.prototype),c=new R(n||[]);return o(a,"_invoke",{value:j(t,r,c)}),a}function p(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}e.wrap=l;var y="suspendedStart",v="suspendedYield",d="executing",b="completed",w={};function g(){}function m(){}function k(){}var _={};s(_,a,(function(){return this}));var O=Object.getPrototypeOf,E=O&&O(O(I([])));E&&E!==r&&n.call(E,a)&&(_=E);var P=k.prototype=g.prototype=Object.create(_);function x(t){["next","throw","return"].forEach((function(e){s(t,e,(function(t){return this._invoke(e,t)}))}))}function S(t,e){function r(o,i,a,c){var u=p(t[o],t,i);if("throw"!==u.type){var s=u.arg,l=s.value;return l&&"object"==f(l)&&n.call(l,"__await")?e.resolve(l.__await).then((function(t){r("next",t,a,c)}),(function(t){r("throw",t,a,c)})):e.resolve(l).then((function(t){s.value=t,a(s)}),(function(t){return r("throw",t,a,c)}))}c(u.arg)}var i;o(this,"_invoke",{value:function(t,n){function o(){return new e((function(e,o){r(t,n,e,o)}))}return i=i?i.then(o,o):o()}})}function j(e,r,n){var o=y;return function(i,a){if(o===d)throw Error("Generator is already running");if(o===b){if("throw"===i)throw a;return{value:t,done:!0}}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=N(c,n);if(u){if(u===w)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===y)throw o=b,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=d;var s=p(e,r,n);if("normal"===s.type){if(o=n.done?b:v,s.arg===w)continue;return{value:s.arg,done:n.done}}"throw"===s.type&&(o=b,n.method="throw",n.arg=s.arg)}}}function N(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator.return&&(r.method="return",r.arg=t,N(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),w;var i=p(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,w;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,w):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,w)}function L(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function T(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function R(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(L,this),this.reset(!0)}function I(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function r(){for(;++o<e.length;)if(n.call(e,o))return r.value=e[o],r.done=!1,r;return r.value=t,r.done=!0,r};return i.next=i}}throw new TypeError(f(e)+" is not iterable")}return m.prototype=k,o(P,"constructor",{value:k,configurable:!0}),o(k,"constructor",{value:m,configurable:!0}),m.displayName=s(k,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"GeneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,k):(t.__proto__=k,s(t,u,"GeneratorFunction")),t.prototype=Object.create(P),t},e.awrap=function(t){return{__await:t}},x(S.prototype),s(S.prototype,c,(function(){return this})),e.AsyncIterator=S,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new S(l(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},x(P),s(P,u,"Generator"),s(P,a,(function(){return this})),s(P,"toString",(function(){return"[object Generator]"})),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},e.values=I,R.prototype={constructor:R,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(T),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var r=this;function o(n,o){return c.type="throw",c.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=n.call(a,"catchLoc"),s=n.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!s)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,w):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),w},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),T(r),w}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;T(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,r,n){return this.delegate={iterator:I(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),w}},e}function p(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,y(n.key),n)}}function y(t){var e=function(t,e){if("object"!=f(t)||!t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var n=r.call(t,"string");if("object"!=f(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==f(e)?e:e+""}function v(t,e,r){return e=m(e),function(t,e){if(e&&("object"===f(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return d(t)}(t,b()?Reflect.construct(e,r||[],m(t).constructor):e.apply(t,r))}function d(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function b(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(b=function(){return!!t})()}function w(t,e){return w=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},w(t,e)}function g(){return g="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,r){var n=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=m(t)););return t}(t,e);if(n){var o=Object.getOwnPropertyDescriptor(n,e);return o.get?o.get.call(arguments.length<3?t:r):o.value}},g.apply(this,arguments)}function m(t){return m=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},m(t)}var k=function(t,e,r,n){return new(r||(r=Promise))((function(o,i){function a(t){try{u(n.next(t))}catch(t){i(t)}}function c(t){try{u(n.throw(t))}catch(t){i(t)}}function u(t){var e;t.done?o(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(a,c)}u((n=n.apply(t,e||[])).next())}))},_=new a.Vy(c.r),O=1,E=function(t){function e(t,r){var n;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),"any"===r&&_.throwError("WebSocketProvider does not support 'any' network yet",a.Vy.errors.UNSUPPORTED_OPERATION,{operation:"network:any"}),(n=v(this,e,"string"==typeof t?[t,r]:["_websocket",r]))._pollingInterval=-1,n._wsReady=!1,"string"==typeof t?(0,o.yY)(d(n),"_websocket",new u(n.connection.url)):(0,o.yY)(d(n),"_websocket",t),(0,o.yY)(d(n),"_requests",{}),(0,o.yY)(d(n),"_subs",{}),(0,o.yY)(d(n),"_subIds",{}),(0,o.yY)(d(n),"_detectNetwork",g((d(n),m(e.prototype)),"detectNetwork",d(n)).call(d(n))),n.websocket.onopen=function(){n._wsReady=!0,Object.keys(n._requests).forEach((function(t){n.websocket.send(n._requests[t].payload)}))},n.websocket.onmessage=function(t){var e=t.data,r=JSON.parse(e);if(null!=r.id){var i=String(r.id),a=n._requests[i];if(delete n._requests[i],void 0!==r.result)a.callback(null,r.result),n.emit("debug",{action:"response",request:JSON.parse(a.payload),response:r.result,provider:d(n)});else{var c=null;r.error?(c=new Error(r.error.message||"unknown error"),(0,o.yY)(c,"code",r.error.code||null),(0,o.yY)(c,"response",e)):c=new Error("unknown error"),a.callback(c,void 0),n.emit("debug",{action:"response",error:c,request:JSON.parse(a.payload),provider:d(n)})}}else if("eth_subscription"===r.method){var u=n._subs[r.params.subscription];u&&u.processFunc(r.params.result)}else l.warn("this should not happen")};var i=setInterval((function(){n.emit("poll")}),1e3);return i.unref&&i.unref(),d(n)}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&w(t,e)}(e,t),r=e,c=[{key:"defaultUrl",value:function(){return"ws://localhost:8546"}}],(i=[{key:"websocket",get:function(){return this._websocket}},{key:"detectNetwork",value:function(){return this._detectNetwork}},{key:"pollingInterval",get:function(){return 0},set:function(t){_.throwError("cannot set polling interval on WebSocketProvider",a.Vy.errors.UNSUPPORTED_OPERATION,{operation:"setPollingInterval"})}},{key:"resetEventsBlock",value:function(t){_.throwError("cannot reset events block on WebSocketProvider",a.Vy.errors.UNSUPPORTED_OPERATION,{operation:"resetEventBlock"})}},{key:"poll",value:function(){return k(this,void 0,void 0,h().mark((function t(){return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",null);case 1:case"end":return t.stop()}}),t)})))}},{key:"polling",set:function(t){t&&_.throwError("cannot set polling on WebSocketProvider",a.Vy.errors.UNSUPPORTED_OPERATION,{operation:"setPolling"})}},{key:"send",value:function(t,e){var r=this,n=O++;return new Promise((function(o,i){var a=JSON.stringify({method:t,params:e,id:n,jsonrpc:"2.0"});r.emit("debug",{action:"request",request:JSON.parse(a),provider:r}),r._requests[String(n)]={callback:function(t,e){return t?i(t):o(e)},payload:a},r._wsReady&&r.websocket.send(a)}))}},{key:"_subscribe",value:function(t,e,r){return k(this,void 0,void 0,h().mark((function n(){var o,i,a=this;return h().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return null==(o=this._subIds[t])&&(o=Promise.all(e).then((function(t){return a.send("eth_subscribe",t)})),this._subIds[t]=o),n.next=4,o;case 4:i=n.sent,this._subs[i]={tag:t,processFunc:r};case 6:case"end":return n.stop()}}),n,this)})))}},{key:"_startEvent",value:function(t){var e=this;switch(t.type){case"block":this._subscribe("block",["newHeads"],(function(t){var r=n.gH.from(t.number).toNumber();e._emitted.block=r,e.emit("block",r)}));break;case"pending":this._subscribe("pending",["newPendingTransactions"],(function(t){e.emit("pending",t)}));break;case"filter":this._subscribe(t.tag,["logs",this._getFilter(t.filter)],(function(r){null==r.removed&&(r.removed=!1),e.emit(t.filter,e.formatter.filterLog(r))}));break;case"tx":var r=function(t){var r=t.hash;e.getTransactionReceipt(r).then((function(t){t&&e.emit(r,t)}))};r(t),this._subscribe("tx",["newHeads"],(function(t){e._events.filter((function(t){return"tx"===t.type})).forEach(r)}));break;case"debug":case"poll":case"willPoll":case"didPoll":case"error":break;default:l.log("unhandled:",t)}}},{key:"_stopEvent",value:function(t){var e=this,r=t.tag;if("tx"===t.type){if(this._events.filter((function(t){return"tx"===t.type})).length)return;r="tx"}else if(this.listenerCount(t.event))return;var n=this._subIds[r];n&&(delete this._subIds[r],n.then((function(t){e._subs[t]&&(delete e._subs[t],e.send("eth_unsubscribe",[t]))})))}},{key:"destroy",value:function(){return k(this,void 0,void 0,h().mark((function t(){var e=this;return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.websocket.readyState!==u.CONNECTING){t.next=3;break}return t.next=3,new Promise((function(t){e.websocket.onopen=function(){t(!0)},e.websocket.onerror=function(){t(!1)}}));case 3:this.websocket.close(1e3);case 4:case"end":return t.stop()}}),t,this)})))}}])&&p(r.prototype,i),c&&p(r,c),Object.defineProperty(r,"prototype",{writable:!1}),r;var r,i,c}(i.F)}}]);