/*!
 * Created by skye on 2015/10/23.
 * larui lar-dynamicPage  v0.2
 * Url: www.css.com.cn
 * Copyright (c) 
 * License: none
 * 
 * 参数：
 * @ actionUrl  String
 *   获取数据的服务地址
 * @ searchPara  Object
 *   页面上的个性化查询参数，比如艺术门类，所在地等
 * @ setPcPageSize  int
 *   设置PC浏览器上每页显示的数据量
 * @ setmobilePageSize int
 * 	 设置手机浏览器上每页显示的数据量
 * @ setpageListBgColor
 *   设置按钮区按钮边框和背景颜色,及文字颜色
 * @ buildDom function (必填)
 *   本组件不体统dom结构区构建方法，调用者提供，并传给这个参数
 * @ bulidCallBk
 *   组件回调函数，可以执行调用者提供的回调方法，用来满足更多调用者需求。
 *                   
 * 使用方法：
 *  HTML - 找到需要放置分页内容的div或者section，并拿到该容器的唯一标示，eg:
 *	<section class="specialTopicDynamicContent">
 *	</section>
 *
 *  JS - 初始化
 *	$(".specialTopicDynamicContent").dynamicPage({
		actionUrl:actionUrl,
		searchPara:{firstIndex:'award',secIndex:''},
		buildDom:buildDomForSpecialTopic,
		setPcPageSize:16,
		setPcPageSize:10
	});
 *		
 * 注意事项：
 * 1. buildDom方法由调用者必须提供,是必填项
 * 2. 本组件只提供分页功能，即分页查询，渲染由buildDom方法提供。
 */

(function($){
        /*构造函数*/
        function dynamicPage(element,options){
            var defaults={
                actionUrl:"",
                searchPara:{},
                pageSize:40, 
                setPcPageSize:40,
                setmobilePageSize:10,			//手机端表格 每页显示10条？怎么区分？
                setpageListBgColor:'#cd8802',
                buildDom:"",
                bulidCallBk:"",
                maxPage:97,
                pageHide:false,					// 如果只有一页是否隐藏
                pagingMethod:'manual',
                bottomOffset:255
            };

            this.element = element;
            this.$container=$(this.element);
            this.options = $.extend(true, {}, defaults, options);
            this.pageNums=1;    //总共有多少页,对应静态分页的all
            this.curIndex=1;    //当前显示页码
            this.pageTurn=0;    //当前页码区是第几组翻页（6-10 就是第二组，则pageTurn==1）
            this.isLastTurn=false;
            this.windowWidth=$(window).width();
            if(this.windowWidth<768){
                this.options.pageSize= this.options.setmobilePageSize;  
            }else{
            	this.options.pageSize= this.options.setPcPageSize;
            }
            return this.init();
        }
   

        /*组件：初始化方法*/
    	dynamicPage.prototype.init=function(){
            var _this=this;
            var dtd = $.Deferred();
            $(_this.element).larLoading({ text: "Loading", position: "inside" });
            
            $.when(this.build(dtd)).done(function(){

                _this.css();

                _this.events();
            });

            return dtd.promise();
        }

        /*组件：构建组件所需DOM元素*/
        dynamicPage.prototype.build=function(dtd){
            var _this=this;
            _this.options.searchPara.pageSize =_this.options.pageSize;
            _this.options.searchPara.curPage =_this.curIndex;
            $.ajax({
            	url:_this.options.actionUrl,
            	data:_this.options.searchPara,
                type:"post",
                dataType:"json",
                success:function(data){
                	_this.pageNums=Math.ceil(data.model.allDataCount/_this.options.pageSize);
                	_this.totalNum=data.model.allDataCount;
                	//dom结构整体布局
                	_this.$container.empty();
                	_this.$container.append("<div class='lar-dynamicPage'>" +
                			"<ul class='resultList clearfix'></ul>" +
                			"<ul class='pagesList' style='display:inline;'>" +
                			"	<div class='liList clearfix'>" +
                			"		<ul style='padding-left: 0px;display:" + ((_this.options.pageHide && _this.pageNums<=1) || _this.options.pagingMethod !== 'manual'?'none':'inline-block') + "'></ul>" +
        					"	</div>" +
        					"</ul>" +
        					//"<div class='nextPageContainer' style='display:"+ ((_this.options.pageHide && _this.pageNums<=1) || _this.options.pagingMethod != 'manual'?'none':'block') +"'>" +
							"<div class='nextPageContainer' style='display:none;'>" +
                            "	<span class='nextPageBtn'></span>" +
							"	<span class='mobilePageInfo'></span>" +
							"</div>" +
						"</div>");
                    _this.$containerUl= _this.$container.find(".resultList");
                    _this.$pagesList=_this.$container.find("ul.pagesList .liList ul");
                    
                    //构建内容区
                    buildContentDom.apply(_this,[data]);
                    _this.loaded = true;
                    // 这里要区分加载方式
                	if(_this.options.pagingMethod === 'manual') {	// 手动加载，普通翻页
                        //构建页码区
                		$(window).unbind('scroll');
                        buildPageListDom.apply(_this,[data.model.allDataCount]);
                	} else if(_this.options.pagingMethod === 'scrollDown') { // 滚动翻页
                		var BOTTOM_OFFSET = _this.options.bottomOffset; 
                		_this.options.additional=true;
                		var $loadAll = $('<div class="loadAll">--加载完毕--</div>');
                    	_this.$container.find('.lar-dynamicPage').append($loadAll);
                    	$(window).unbind('scroll');
                    	if(_this.pageNums === 1) {
                    		$loadAll.show();
                    	} else if(_this.pageNums > 1){
                    		$(window).on('scroll',function(evt){
                            	var $currentWindow = $(window);  
                            	var windowHeight = $currentWindow.height();  
                            	var scrollTop = $currentWindow.scrollTop();  
                            	var docHeight = $(document).height();  
                            	
                				if((BOTTOM_OFFSET + scrollTop) >= docHeight - windowHeight && _this.loaded){
                		            if(_this.options.searchPara.curPage<=_this.pageNums-1){
                		            	nextPage.apply(_this);
                		            }else{
                		            	$loadAll.show();
            		            		$( _this.element ).larLoading( "hide" );
                		            	$(window).unbind('scroll');
                		            }
                		        }
                		        evt.stopPropagation();
                			});
                    	}
                        
                	}
                    //完成构建dom操作，修改状态
                    dtd.resolve();
                    $( _this.element ).larLoading( "hide" );
                }});
            
            return dtd.promise();
        }
        
        /*组件：设置DOM页面上组件样式*/
        dynamicPage.prototype.css=function(index){
            var _this=this;
            $(_this.$pagesList).find("li span").css({color:_this.options.setpageListBgColor});
            $(_this.$pagesList).find(".pageNum ").css({border:'1px solid '+_this.options.setpageListBgColor,backgroundColor:'#ffffff',color:_this.options.setpageListBgColor});
            $(_this.$pagesList).find("li .pageNumber").css({border:'1px solid '+_this.options.setpageListBgColor,backgroundColor:'#ffffff',color:_this.options.setpageListBgColor});
            $(_this.$pagesList).find("li.ensure").css({border:'1px solid '+_this.options.setpageListBgColor,backgroundColor:'#ffffff',color:_this.options.setpageListBgColor});           
            $(_this.$pagesList).find(".pageNum ").mouseover(function(){
            	$(this).css({backgroundColor:_this.options.setpageListBgColor,color:'#ffffff'});
            	$(this).find("span").css({color:"#ffffff"});
            }).mouseout(function(){
            	if(!$(this).hasClass('active')){
            		$(this).css({backgroundColor:'#ffffff',color:_this.options.setpageListBgColor});
                	$(this).find("span").css({color:_this.options.setpageListBgColor});
            	}
            	
            });
            $(_this.$pagesList).find("li").removeClass("active");
            if(_this.curIndex % _this.showAllNum === 0){
            	$(_this.$pagesList).find("li :eq("+(_this.showAllNum)+")").parent().addClass("active");
            }else{
            	$(_this.$pagesList).find("li :eq("+(_this.curIndex % _this.showAllNum)+")").parent().addClass("active");
            }
            
            $(_this.$pagesList).find("li.active").css({backgroundColor:_this.options.setpageListBgColor});
            $(_this.$pagesList).find("li.active span").css({color:'#ffffff'});
            var objPrev = $(_this.$pagesList).find("li[index=prev]");
    	    var objNext = $(_this.$pagesList).find("li[index=next]");
    	    var objCurPage = $(_this.$pagesList).find("li.page.active");
            
            var pageNumWidth = '20';
            if(_this.windowWidth >= 768){
                pageNumWidth = '20';
            } else {
                pageNumWidth = '10';
            }

            if(_this.curIndex>=_this.options.maxPage) {	// 如果页数到3位数了，就不显示页数，只显示翻页
        	   objPrev.css({width:'auto'});
        	   objNext.css({width:'auto'});
        	   objCurPage.css({width:'auto'});
        	   objPrev.find('span').text('上一页');
        	   objNext.find('span').text('下一页');
        	   $(_this.$pagesList).find("li.page").hide();
        	   objCurPage.show();
            } else {
        	   objPrev.css({width: pageNumWidth + 'px'});
        	   objNext.css({width: pageNumWidth + 'px'});
        	   objPrev.find('span').text('<');
        	   objNext.find('span').text('>'); 
        	   $(_this.$pagesList).find("li.page").css({width: pageNumWidth + 'px'});
        	   $(_this.$pagesList).find("li.page").show();
            }

        }

        /*组件：给组件绑定各类事件（鼠标旋转）*/
        dynamicPage.prototype.events=function(){
            var _this=this;
            this.$container.css({backgroundColor:"white"});
            $(this.$pagesList).find("li").bind("click",function(){
                    var index=$(this).attr("index");
                    _this.options.additional=false;
//                    scroll(0,400);
                    //上一页，即往下滚动一页
                    if(index === "prev"){
                    	
                    	prevPage.apply(_this);
                       
                    }else if(index ==="next"){
                    	
                    	nextPage.apply(_this);
                    	
                    }else if(index==="ensure"){
                    	if (!/^[0-9]*[1-9][0-9]*$/.test($(_this.$pagesList.find('input.pageNumber')).val())){
                            layer.alert('请输入正确页数！',{title:'温馨提示：'});
                    		return false;
                    	}
                    	gotoPage.apply(_this);
                    	
                    }else if(index==="more" || index==="go"){

                        $(this).unbind("click");

                    }else{
                    	/*查询按钮所示页码数据*/
                        var onIndex=parseInt($(this).find("span").text());
                        _this.curIndex=onIndex;
                        var dtd = $.Deferred();
                        $.when(updateResultDom.apply(_this,[{curPageNum:onIndex,dtd:dtd}])).done(function(){
                            _this.css();
                        });
                    }
            });
            
            $(this.$container).find(".nextPageContainer").bind("click",function(){
            	_this.options.additional=true;
            	nextPage.apply(_this);
            });

            $(_this.$pagesList).find("li.total").off('click');
            $(_this.$pagesList).find("li.totalNum").off('click');
            
        }
        

        /*内容结果区构建*/
        function buildContentDom(data){
        	var myThis=this;
            if(myThis.options.buildDom){
            	var outPut="";
                var buildDom=myThis.options.buildDom;                
                if(data.status==="200" && data.model.curPageData){
                	var dataList=data.model.curPageData;
                	outPut=buildDom(dataList);
                	outPut=(outPut==="" || outPut===" ")?"<div class='tipNoData'>没有符合的数据</div>":outPut;
            		if(outPut==="" || outPut===" "){
            			$(myThis.$container).find('.nextPageContainer span').hide();
            		}
                }else{
            		outPut="<div class='tipNoData'>没有符合的数据</div>";
            		$(myThis.$container).find('.nextPageContainer span').hide();
            	}              
                
                myThis.$containerUl.append(outPut);                
                if(myThis.options.bulidCallBk){
                	myThis.options.bulidCallBk();
                }
            }
        }
        //判断当前屏幕宽度可以放下多少个页码
        function getNumShowCount(myThis) {
            var showAll = 0;
            if(myThis.pageNums > 4){
                showAll = 4;
            } else {
                showAll = myThis.pageNums;
            }

            if(myThis.windowWidth < 768) {
                var liCount = Math.floor((myThis.windowWidth - 80) / 50) - 2;
                if(liCount < showAll) {
                    showAll = liCount;
                }
            } 
            return showAll;
        }

        /*组件：构建页码区*/
        function buildPageListDom(allDataCount){
        	var myThis=this;
            /*构建页码区*/
            if(allDataCount && myThis.pageNums>0){

                myThis.showAllNum = getNumShowCount(myThis);
                $(myThis.$pagesList).append("<li class='pageNum' index=prev><span><</span></li>");
                for(var k = 1; k < (myThis.showAllNum + 2); k++){
                    if(k  === (myThis.showAllNum + 1)){ 
                        $(myThis.$pagesList).append("<li class='pageNum' index=next><span>></span></li>");
                        //手机端不显示以下内容
                        if(myThis.windowWidth >= 768){
                            $(myThis.$pagesList).append("<li class='total'><span>共"+myThis.pageNums+"页</span></li>");

                            $(myThis.$pagesList).append("<li class='go' index=go><span>到第"+"<input class='pageNumber'>"+"页</span></li>");

                            $(myThis.$pagesList).append("<li class='ensure' index=ensure><span>确定</span></li>");
                            
                            $(myThis.$pagesList).append("<li class='totalNum' index=totalNum><span>共"+myThis.totalNum+"条</span></li>");
                        }
                    } else {
                        $(myThis.$pagesList).append("<li class='pageNum page' index="+k+"><span>"+k+"</span></li>");
                    }
                }
            }
        }
        
        function prevPage(){
        	var _this=this;
        	if( _this.curIndex > 1){
                 /*查询下一页数据，刷新数据区*/
                 var dtd = $.Deferred();
                 $.when(updateResultDom.apply(_this,[{curPageNum:_this.curIndex-1,dtd:dtd}])).done(function(){
                         if(_this.curIndex % _this.showAllNum === 1 && _this.pageTurn>0){
                             //页码区该翻页了
                             _this.pageTurn--;
                             _this.isLastTurn=false;
                             $(_this.$pagesList).find("li.page").remove();
                             for(var i=_this.curIndex-1; i>_this.curIndex-_this.showAllNum-1; i--){
                            	 $(_this.$pagesList).find('li[index=prev]').after("<li class='pageNum page' index="+i+"><span>"+i+"</span></li>");
                             }
                     }

                     _this.curIndex--;
                     _this.css('prev');
                   //给页码重新绑定事件
                     $(_this.$pagesList).find("li").unbind("click");
                     _this.events();
                 });
             }
        }
        
        function nextPage(){
        	var _this=this;
        	 if(_this.curIndex < _this.pageNums){
                 /*刷新数据区*/
                 var dtd = $.Deferred();
                 $.when(updateResultDom.apply(_this,[{curPageNum:_this.curIndex+1,dtd:dtd}])).done(function(){
                     //满足一下条件，页码区该翻页了
                     if(_this.curIndex % _this.showAllNum === 0 && _this.pageTurn < Math.ceil(_this.pageNums/_this.showAllNum)){
                         _this.pageTurn++;
                         _this.isLastTurn=false;
                         var lastTurn=_this.pageNums-_this.curIndex;
                         if(lastTurn>=_this.showAllNum){
                             for(var i=0;i<_this.showAllNum;i++){
                                 $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*_this.showAllNum+1);
                             }
                         }else{
                             for(var i=0;i<_this.showAllNum;i++){

                                 if(i<lastTurn){
                                     $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*_this.showAllNum+1);
                                 }else{
                                     $(_this.$pagesList).find("li:eq("+(lastTurn+1)+")").remove();
                                 }
                             }
                         }
                     }
                     _this.curIndex++;
                     _this.css('next');
                 });
             }else{
            	 $(_this.$container).find(".nextPageContainer span.nextPageBtn").css({backgroundPosition:"-328px -324px"});
             }
        }
        
        /*跳转到指定页*/
        function gotoPage(){
        	var _this=this;
        	 var fillPageNum=parseInt($(_this.$pagesList).find("input").val());
             if(fillPageNum>_this.pageNums){
                 fillPageNum=_this.pageNums;
                 $(_this.$pagesList).find("input").val(fillPageNum)
             }             
             var dtd = $.Deferred();
             $.when(updateResultDom.apply(_this,[{curPageNum:fillPageNum,dtd:dtd}])).done(function(){
                 _this.curIndex=fillPageNum;
                 //重置页码区
                 var theIndex=fillPageNum%_this.showAllNum;
                 _this.pageTurn=Math.ceil(fillPageNum/_this.showAllNum)-1;
                 var lastTurn=_this.pageNums-fillPageNum;
                 var turnNums=Math.ceil(_this.pageNums/_this.showAllNum)-1;
                 if(lastTurn>=_this.showAllNum || _this.pageTurn < turnNums){
                     //页码区该翻页了
                     updatePageDom(_this);
                 }else if( !_this.isLastTurn){
                     var lastNums=_this.pageNums-_this.pageTurn*_this.showAllNum;
                     for(var i=0;i<_this.showAllNum;i++){
                         if(i<lastNums){
                             $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*_this.showAllNum+1);
                         }else{
                        	 if($(_this.$pagesList).find("li:eq("+(lastNums+1)+")").attr('index')===(i+1)){
                        		 $(_this.$pagesList).find("li:eq("+(lastNums+1)+")").remove();
                        	 }
                         }
                     }
                     _this.isLastTurn=true;
                 }
                 
                 _this.css();
             });
        }
        

        /*组件方法：构建页面DOM元素;页面初始化和加载更多均用此方法*/
        function updateResultDom(options){
            var _this=this;
            var dtd=options.dtd;
            _this.loaded = false;
            _this.options.searchPara.curPage =options.curPageNum;
            //var async = _this.options.pagingMethod == 'scrollDown' && _this.options.searchPara.curPage >1 ? false: true;
            $('ul.resultList').larLoading({ text: "Loading", position: "bottom" });
            $.ajax({
            	url:_this.options.actionUrl,	//curPageNum 当前显示页码 作为请求 当前页数据参数
            	data:_this.options.searchPara,
            	dataType:"json",
                type:"post",
                //async:async,
                success:function(data){
                    var dataList=data.model.curPageData;
                    var outPut=_this.options.buildDom(dataList);
                    if(!_this.options.additional){
                    	_this.$containerUl.empty();
                    }                    
                    _this.$containerUl.append(outPut);
                    if(_this.options.bulidCallBk){
                    	_this.options.bulidCallBk();
                    }
                    $('.nextPageContainer .mobilePageInfo').html(options.curPageNum + '/' + _this.pageNums);
                    $( 'ul.resultList' ).larLoading( "hide" );
                    _this.loaded = true;
                    dtd.resolve();
                },
                fail:function(){
                	$( '.resultList' ).larLoading( "hide" );
                    layer.alert('数据获取失败！',{title:'温馨提示：'});
                    return false;
                }
            });
            return dtd.promise();
        }

        /*更新构件页面页码区DOM结构*/
        function updatePageDom(obj){
            var _this=obj;
            var liNum=$(_this.$pagesList).find("li").length;
            if(liNum < 10){
                var addNum=10-liNum;
                for(var i=0;i<addNum;i++){
                    $(_this.$pagesList).find("li:first").after("<li class='pageNum'><span></span></li>");
                }
                //给页码重新绑定事件
                $(this.$pagesList).find("li").unbind("click");
                _this.events();
            }
            // 做翻页动作
            for(var i=0;i<4;i++){
                $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*4+1).parent().attr("index",i+1);
            }

            _this.isLastTurn=false;
        }
        
        /*组件绑定到$.fn对象上*/
    $.fn.dynamicPage=function(options){
        this.each(function() {
            if ($.data(this, "plugin_dynamicPage")) {
                $.data(this, "plugin_dynamicPage" ,null);
            }
            return $.data(this, "plugin_dynamicPage" , new dynamicPage(this, options));
        });
    }

})(jQuery)
