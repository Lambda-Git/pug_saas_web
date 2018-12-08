/**
 * Created by sky on 2015/12/2.
 * select 一级下拉列表
 * 调用方式： $(selector).selectDict({data:[]});
 * 参数封装在一个对象中传递给组件，只有data参数是必填项，其余参数均有默认值
 * data //是必填项,默认值是空，不填就没有下拉数据显示
 * dictCode //option的value,默认值是dictCode
 * dictName //option的显示名称，默认值是dictName
 * onSelect //选中事件后的回调函数，组件只提供接口
 */
(function($){
    function selectDict(element,options){
        var defaults={
            dictCode:"dictCode",
            dictName:"dictName",
            data:[],
            onSelect:null
        };

        /*私有变量*/
        var _defaults={};

        this.options = $.extend(true, {},defaults,options);
        this.element = element;
        this.$container=$(this.element);

        selectDict.init.call(this);
    }

    /*组件私有方法*/
    selectDict.init=function(){
        if( this.options.data.length>0 ){
            var output="";
            for(var i=0;i<this.options.data.length;i++){
                output+="<option value="+this.options.data[i].dictCode+">"+this.options.data[i].dictName+"</option>";
            }
            this.$container.append(output);
        }
    }

    /*暂时没有对外开放的接口*/
    selectDict.fn=selectDict.prototype={
            
    };
    
    /*执行回调事件*/
    selectDict.bindEvent=function(){
        if(typeof (this.options.onSelect) ==='function'){
            this.options.onSelect();
            }
    }   

    $.fn.selectDict=function(options){
        $.data(this, "plugin_selectDict" , new selectDict(this, options));
    }
})(jQuery)