
/** 
 * js链式调用:
 * 1.函数方法全部返回this;
 * 2.将执行函数依次加入队列(绑定this)，依次执行，函数最后都要执行下一个函数，返回this
*/

let globalDelay = (function(){
    function Delay(){
        this.state = 0;//设置一个初始状态
        this.query = [];//函数队列
    }
    
    Delay.prototype = {
        wait : function(time){
            let waitFn = function(){
                setTimeout(function(){
                    console.log("wait")
                    this.state = 0;
                    this.__next()
                }.bind(this),time)
            }
            
            this.query.push(waitFn)
            return this.__next();
        },
        fn : function(fun){
            let typeFun = typeof fun
            if(typeFun == 'function' || typeFun == 'string') {
                this.query.push(function(){
                    
                    let func = typeFun=='function' ? fun : (new Function(fun))

                    func.bind(this)()
                    this.state = 0
                    this.__next();
                })
            }
            
            return this
        },
        __next: function(){
            if(this.state==1) return this
            this.state = 1;
            let fn = this.query.shift()
            fn && fn.bind(this)()

            return this
        }
    }

    return {
        wait: function(time){
            return (new Delay()).wait(time)
        },
        fn: function(fun){
            return (new Delay()).fn(fun)
        }
    }
})()

console.log(globalDelay.wait(200).fn("fd"))