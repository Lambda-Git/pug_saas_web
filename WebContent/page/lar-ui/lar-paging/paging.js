/**
* lar-paging组件
* version: Beta 1.0
*
*
* 组件说明:
* 	1. 分页组件适用于PC和手机端，各有两种方式：瀑布流的方式和手动加载的方式（由于页面布局不确定，所以PC和手机端分别设置）
	2. 组件依赖JQuery、bootstrap、lar-loading
* 参数说明：
*	@ pcPageSize  int
*		PC端每页个数
*	@ mPageSize  int
*		移动端每页个数
*	@ actionUrl  String (必填)
*   	获取数据的服务地址
* 	@ searchPara  Object
*   	页面上的个性化查询参数
*	@ color String
*		分页区基本颜色
* 	@ buildDom function (必填)
*   	构建内容区方法
*	@ onChange function
*		页数有变动调用方法
*	@ pcAutoLoad boolean
*		PC端是否自动加载
*	@ mAutoLoad boolean
*		移动端是否自动加载
*	@ pcLoadMore boolean
*		PC端是否通过按钮加载更多
*	@ mLoadMore boolean
*		移动端是否通过按钮加载更多
*	@ showPage int
*		页码区显示页数按钮
* 组件日志
* 2017.4.20 Beta 1.0
* 
**/

(function($){	
    function Paging( element, options ) {
        this.element = element;
        this.$container = $(element);
        this.options = $.extend(true,{},this.defaults,(options || {})); 
        this.options.searchPara = this.options.searchPara || {};
        this.options.searchPara.curPage = 1;
        this.init();
    }

    Paging.prototype = {
		defaults : {  // 默认参数
            pcPageSize	: 10,
            mPageSize	: 10,
            color		: '#db2033',
            pcAutoLoad	: false,
            mAutoLoad	: false,
            showPage	: 7
		},

        init: function() {
        	var _this = this, p = _this.options;
        	_this.getWidth();
        	_this.buildDom();
        	_this.addEvent();
        	_this.loadContent(function(){	// 首次加载，构建页码区
        		if(p.allDataCount) {
        			_this.buildPage();	// 创建页码区
        		}
        	});
        },

        buildDom : function() {	// 创建Dom对象
        	var _this = this, p = _this.options;
        	p.searchPara.pageSize = p.pageSize;	// 每页搜索个数
        	_this.$container.empty();	// 清空分页区内容
        	_this.$container.addClass('lar-paging');
        	_this.$content = $('<div class="lar-paging-content"></div>');
        	_this.$paging = $('<div class="lar-paging-page"></div>');
        	_this.$paging.css('color', p.color);
        	_this.$container.append(_this.$content).append(_this.$paging);
        },

        loadContent : function(callback) {
        	var _this = this, p = _this.options;
        	$.ajax({
            	url		: p.actionUrl,
            	data	: p.searchPara,
                type	: 'post',
                dataType: 'json',
                success	: function(data){
                	_this.$content.find('.tipNoData').remove();
                	if(!p.autoLoad && !p.loadMore) {	// 如果不是向下加载的话就清空内容
                		_this.$content.empty();	// 清空内容
                	}
                	// 计算数据量
                	p.pageCount = Math.ceil(data.model.allDataCount/_this.options.pageSize);	// 总页数
                	p.allDataCount = data.model.allDataCount;	// 总个数
                	if(!p.allDataCount) {
                		var strHtml = p.buildDom(data.model.curPageData);
                		_this.$content.append(strHtml);
                	} else { // 没有数据或者数据没获取到
                		_this.$content.html('<div class="tipNoData">没有符合的数据</div>');
                	}
                	callback && callback();	// 构建完成后执行
                	_this.onPageChange();
                }
            });
        },

        // 构建页码区
        buildPage : function() {
        	var _this = this, p = _this.options;
        	if(!p.autoLoad) {
				if(p.loadMore) {	// 向下加载
	        		_this.$paging.append('<div class="loadMore"><button type="button" name="nextPage">加载更多</button></div>');
	        	} else {
	        		var html = [];
	        		html.push('<div class="page">');
	        		html.push('	<div class="p-num">');	// 页码
	        		html.push('		<ul>');	// 页码
	        		html.push('			<li class="item prev" name = "prevPage">上一页</li>');
	        		html.push('			<li class="item total">第<span></span>页/共' + p.pageCount + '页</li>');
	        		html.push('			<li class="item next" name = "nextPage">下一页</li>');
	        		html.push('		</ul>');	// 页码
					html.push('	</div>');
					html.push('	<div class="p-total">');	// 总页数和跳转页数
					html.push('		共' + p.pageCount + '页');
					html.push('	</div>');
					html.push('	<div class="p-jump">');
					html.push('		<span class="text">到第</span>');
					html.push('		<input type="number" aria-label="页码输入框" name="pageNum">');
					html.push('		<span class="text">页</span>');
					html.push('		<button class="btn" role="button" name="pageJump">确定</span>');
					html.push('	</div>');
	        		html.push('</div>');
	        		_this.$paging.append(html.join(''));
	        	}
        	}
        },

        setPageItem : function(beginPage, endPage){
        	var html=[];
        	for(var i=beginPage; i<=endPage; i++) {
        		html.push('<li class="item pageNum" data-page="' + i + '"><span>' + i + '</span></li>');
        	}
        	return html.join('');
        },

        setDot : function() {
        	return '<li class="item dot"><span>...</span></li>';
        },

        // 添加页码内容--根据当前页数、总页数、显示页数添加页码--只PC端
        onPageChange : function() {
        	var _this = this, p = _this.options;
        	var $prev = _this.$paging.find('.page .p-num ul li.prev');
        	var $next = _this.$paging.find('.page .p-num ul li.next');
        	var $total = _this.$paging.find('.page .p-num ul li.total');
        	_this.$paging.find('.page .p-num ul li.total span').text(p.searchPara.curPage);	
        	if(p.windowWidth > 768) {
        		var html = [];
        		if(p.pageCount <= p.showPage) {	// 页数小于设置的显示页数，全部显示出来
        			$total.prepend(_this.setPageItem(1, p.pageCount));
	        	} else {
	        		if(p.searchPara.curPage < p.showPage) {	// 当前页数在最大显示页数范围内
	        			$total.prepend(_this.setPageItem(1, p.showPage - 2));
	        			$total.prepend(_this.setDot());
	        		} else {	// 当前页数大于或等于最大显示页数
	        			_this.setPageItem($prev, 1, 1);	// 先把首页放上
	        			$total.prepend(_this.setDot());
	        			$total.prepend(_this.setPageItem(p.searchPara.curPage, p.searchPara.curPage +  p.showPage - 5));
	        		}
	        		$total.prepend(_this.setDot());
        			$total.prepend(_this.setPageItem(p.pageCount, p.pageCount));
	        	}
        	}
        	if(p.searchPara.curPage === 1) {	// 第一页，禁用上一页
        		$prev.addClass('disabled');
        	} else {
        		$prev.removeClass('disabled');
        	}
        	if(p.searchPara.curPage === p.pageCount) {	// 最后一页，禁用下一页
        		$next.addClass('disabled');
        	} else {
        		$next.removeClass('disabled');
        	}
        },

		addEvent : function() {	// 设置页码区各按钮事件
			var _this = this;
			$(window).resize(function(){	// 屏幕宽度发生变化重新计算容器宽度？？？
			   _this.getWidth();
			});
			_this.$paging.on('click', '[name=prevJump]', function(){ // 上一页
				p.searchPara.curPage -= 1;
				_this.loadContent();
			}).on('click', '[name=nextJump]', function(){	// 下一页
				p.searchPara.curPage += 1;
				_this.loadContent();
			}).on('click', '[name=pageJump]', function(){	// 跳转至某页
				_this.loadContent(_this.$paging.find('.p-jump input[name=pageNum]').val());
			}).on('click', '.p-num ul li.pageNum', function(){	// 点击某页
				_this.loadContent($(this).attr('data-page'));
			});
		},

		getWidth : function() {	// 获取分页区宽度; 考虑下如何做到响应式？？？
			var _this = this, p = _this.options;
			_this.width = _this.$container.width();
			_this.windowWidth=$(window).width();
			if(_this.windowWidth > 768) {
				p.autoLoad = p.pcAutoLoad;
				p.pageSize = p.pcPageSize;
				p.loadMore = p.pcLoadMore;
			} else {
				p.autoLoad = p.mAutoLoad;
				p.pageSize = p.mPageSize;
				p.loadMore = p.mLoadMore;
			}
		}
    };

    $.fn.paging = function ( options ) {
        return this.each(function () {
        	return $.data(this, 'plugin_paging' , new Paging(this, options));
        });
	};
}(jQuery));