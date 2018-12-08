/**
* lar-openAndClose组件
* version: Beta 1.0
*
*
* 调用方式及作用:
* 	
*
*
* 组件日志
* 2016.11.11 Beta 1.0
* 
**/

(function($){	
    function OpenAndClose( element, options ) {
        this.element = element;
        this.$Container = $(element);
        this.options = $.extend(true,{},this.defaults,(options || {})); //必须有
        this.init();
    }
    OpenAndClose.prototype = {
		defaults : {  //必须有
            height : 12, 
            lineHeight : 2,
            top : 0
		},
        init: function() {
        	this.buildDom();
        	this.addEvent();
        	this.setHide();
        },
        buildDom : function() {	// 创建Dom对象
        	this.object && this.object.remove();
        	this.object = $('<div class="larOpenAndClose"><span data-status="close">[展开]</span></div>');
			this.$Container.after(this.object);
        },
		setHide : function() {	// 计算是否需要隐藏展开
			var offsetHeight = this.$Container.height();
			var scrollHeight = this.$Container[0].scrollHeight;
			if(scrollHeight <= offsetHeight) {
				this.object.hide();
				this.$Container.css('height','auto');
			}
		},
		addEvent : function() {	// 设置展开收缩的方法
			var _this = this;
			var height = this.options.height.toString() + 'rem';
			var lineHeight = this.options.lineHeight.toString() + 'rem';
			var top = this.options.top
			this.$Container.css({height:height,lineHeight:lineHeight,overflow: 'hidden'});
			this.object.on('click', 'span', function(){
				if($(this).attr('data-status') == 'close') {	// 要展开
					$(this).attr('data-status','open').text('[收缩]');
					_this.$Container.css('height','auto');
				} else {	// 要收缩
					$(this).attr('data-status','close').text('[展开]');
					_this.$Container.css('height',height);
					var scrollTarget = Math.floor(_this.$Container.offset().top);
					scrollTarget -= top;
					scrollTarget = (scrollTarget < 0 ? 0 : scrollTarget);
					$('html, body').animate({
		                scrollTop: scrollTarget
		            }, 500, 'linear');
				}
			});
		}
    };
    
    $.fn.OpenAndClose = function ( options ) {
        return this.each(function () {
        	return $.data(this, 'plugin_openAndClose' , new OpenAndClose(this, options));
        });
	};
    
}(jQuery));
