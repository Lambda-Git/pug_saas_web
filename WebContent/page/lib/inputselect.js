/**
 * Created by linlin on 2017/2/24.
 * select 一级下拉列表
 * 调用方式： $(selector).InputSelect({data:[]});
 * 说明：
    1. 暂不支持多选
    2. 暂不支持搜索
    3. 暂不支持输入
 */
;(function($){
    function InputSelect( element, options ) {
        this.$element = $(element);
        this.options = $.extend(true,{},this.defaults,(options || {}));
        this.init();
    }
    InputSelect.prototype = {
        defaults : {
            inputId:'',
            code:'dictCode',
            name:'dictName',
            inputClass: '',     // 输入框的样式
            placeholder:'',     // 输入框的placeholder属性
            data:[],            // 可选数据，支持url可以是{url:'',queryParam:{}}
            input:true,         // 是否可编辑
            delete: true,       // 是否可删除
            onSelect:null       // 回调函数
        },
        init: function() {  //初始化方法
            this.buildDom();
            this.getData();
            this.addEvent();
        },

        buildDom : function() { // 先把框架搭出来
            this.$Container = $('<div class="form-group plugin-inputSelect"></div>');
            this.$element.append(this.$Container);
            var html = [];
            html.push('<span class="glyphicon glyphicon-chevron-down selectBtn"></span>')
            html.push('<input readonly type="text" id="' + this.options.inputId + '" placeholder="' + this.options.placeholder + '" class="form-control ' + this.options.inputClass + '" />');
            html.push('<div class="plugin-select-container"  style="display:none;"><ul></ul></div>');
            this.$Container.append(html.join(''));
        },

        getData : function() {  // 获取数据
            var _this = this;
            if(_this.options.data.url) {    // 需要请求数据
                $.ajax({
                   url: _this.options.data.url,
                   data: _this.options.data.queryParam,
                   type:"get",
                   dataType:"json",
                   success:function(data){
                       var dataList=data.model;
                       _this.addItem(dataList);
                   }});
            } else {
                _this.addItem(_this.options.data);
            }
        },

        addItem : function(dataList) {  // 添加选项
            var _this = this;
            var html = [];
            $.each(dataList, function(i, item){
                html.push('<li><span data-code="' + item[_this.options.code] + '">' + item[_this.options.name] + '</span></li>');
            });
            _this.$Container.find('ul').append(html.join(''));
        },

        addEvent : function() { // 设置选择效果和删除效果
            var _this = this;
            _this.$Container.on('click','.selectBtn',function(){    // 选择按钮
                _this.$Container.find('.plugin-select-container').slideDown(500);
            }).on('click','.deleteBtn',function(){  // 删除按钮
                _this.$Container.find('.plugin-select-container').hide();
                _this.$Container.find('input').val('').data('selected',{});
                $(this).removeClass('deleteBtn glyphicon-trash').addClass('.selectBtn glyphicon-chevron-down');
            }).on('click','ul li',function(){    // 选项
                var selectData = {};
                selectData[_this.options.code] = $(this).find('span').data('code');
                selectData[_this.options.name] = $(this).find('span').text();
                _this.$Container.find('input').val(selectData[_this.options.name]).data('selected',selectData);
                if(_this.options.delete) {
                    _this.$Container.find('.glyphicon').removeClass('.selectBtn glyphicon-chevron-down').addClass('deleteBtn glyphicon-trash');
                }
                _this.$Container.find('.plugin-select-container').slideUp(500);
                _this.options.onSelect && _this.options.onSelect(selectData); // 执行回调函数
            }).on('click','input',function(event){   // input
                _this.$Container.find('.plugin-select-container').slideToggle(500);
            });

            $(document).bind("click",function(e){ 
                var target = $(e.target); 
                if(target.closest(_this.$Container).length == 0){ 
                    _this.$Container.find('.plugin-select-container').slideUp(500);
                } 
            });
        }
    };
    $.fn.inputSelect = function ( options ) {
        return this.each(function () {
            return $.data(this, 'plugin_inputSelect' , new InputSelect(this, options));
        });
    };
})(jQuery);