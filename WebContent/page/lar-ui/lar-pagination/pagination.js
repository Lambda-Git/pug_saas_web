/**
 * Created by skye on 2015/10/23.
 * actionUrl    //数据地址，必填项
 * searchPara	//页面上的查询参数，eg：一级门类，耳机门类，字母。
 * buildDom     //action返回数据构件页面方法。暂时没有默认方法，由调用者提供。必填项
 */
(function($){
    var pagination=(function(){
        /*构造函数*/
        function _pagination(element,options){
            //默认参数
            var defaults={
                actionUrl:"",
                searchPara:{},
                pageSize:50,  //150
                setPcPageSize:50,
                setmobilePageSize:10,//手机端表格 每页显示10条？怎么区分？
                buildDom:"",
                bulidCallBk:""
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
//            this.init();
            return this.init();
        }

        /*类的私有方法,暂时没用，保留*/
        function extendMethod(){

        }

        return _pagination;
    })();

    /*组件方法*/
    pagination.fn=pagination.prototype={
        /*组件：初始化方法*/
        init:function(){
            var _this=this;
            var dtd = $.Deferred();

            $.when(this.build(dtd)).done(function(){

                _this.getDom();

                _this.css();

                _this.events();
            });

            return dtd.promise();
        },

        /*组件：构建组件所需DOM元素*/
        build:function(dtd){
            var _this=this;
            _this.options.searchPara.pageSize =_this.options.pageSize;
            _this.options.searchPara.curPage =_this.curIndex;
            $.ajax({
            	url:_this.options.actionUrl,
            	data:_this.options.searchPara,
                type:"post",
                dataType:"json",
                success:function(data){
                	var dataList=null;
                	if(data.model){
                		dataList=data.model.curPageData;
                	}
                    if(_this.options.buildDom){
                    	_this.$container.empty();
                        _this.$container.append("<div class='lar-pagination'><ul class='resultList'></ul><ul class='pagesList'></ul></div>");
                        _this.$containerUl= _this.$container.find(".resultList");
                        _this.$pagesList=_this.$container.find("ul.pagesList");

                        var buildDom=_this.options.buildDom;
                        var outPut=buildDom(dataList);
                        if(outPut===""){
                        	outPut="<div class='tipNoData'>没有符合的数据</div>";
                        }
                        _this.$containerUl.append(outPut);
                        if(_this.options.bulidCallBk){
                        	_this.options.bulidCallBk();
                        }
                    }
                    _this.buildPageList(data.model.allDataCount);

                    dtd.resolve();

                }});

            return dtd.promise();

        },

        /*组件：构建页码区*/
        buildPageList:function(allDataCount){
            var _this=this;
            _this.pageNums=Math.ceil(allDataCount/_this.options.pageSize);

            /*构建页码区*/
            if(allDataCount && _this.pageNums>1){
                if(_this.windowWidth<768){
                    $(_this.$pagesList).append("<li class='pageNum' index=prev><span><</span></li>");
                    $(_this.$pagesList).append("<li class='pageNum' index=next><span>></span></li>");
                }else{                    
                    var showAll=0;
                    if(_this.pageNums>5){
                        showAll=5;
                    }else{
                        showAll=_this.pageNums;
                    }

                    $(_this.$pagesList).append("<li class='pageNum' index=prev><span><</span></li>");
                    for(var k=1;k<(showAll+2);k++){

                        if(k===(showAll+1)){
                            $(_this.$pagesList).append("<li class='pageNum' index=next><span>></span></li>");

                            $(_this.$pagesList).append("<li class='total'><span>共"+_this.pageNums+"页</span></li>");

                            $(_this.$pagesList).append("<li class='go' index=go><span>到第"+"<input class='pageNumber'>"+"页</span></li>");

                            $(_this.$pagesList).append("<li class='ensure' index=ensure><span>确定</span></li>");

                        }else{
                            $(_this.$pagesList).append("<li class='pageNum' index="+k+"><span>"+k+"</span></li>");
                        }
                    }
                }
            }else{
            }

        },

        /*组件：存储经常遍历的DOM元素到变量里*/
        getDom:function(){

        },

        /*组件：设置DOM页面上组件样式*/
        css:function(index){
            var _this=this;
            
            if(_this.windowWidth<768){            	
            	if(index === "prev"){
            		$(_this.$pagesList).find("li").removeClass("active");
            		$(_this.$pagesList).find("li :eq(0)").parent().addClass("active");
                }else if(index === "next"){
                	$(_this.$pagesList).find("li").removeClass("active");
                	$(_this.$pagesList).find("li :eq(1)").parent().addClass("active");
                }
            }else{
            	 $(_this.$pagesList).find("li").removeClass("active");
                 if(_this.curIndex % 5 === 0){
                     $(_this.$pagesList).find("li :eq(5)").parent().addClass("active");
                 }else{
                     $(_this.$pagesList).find("li :eq("+(_this.curIndex % 5)+")").parent().addClass("active");
                 }
            }
            
            
           
        },

        /*组件：给组件绑定各类事件（鼠标旋转）*/
        events:function(){
            var _this=this;
            this.$container.css({backgroundColor:"white"});
            $(this.$pagesList).find("li").bind("click",function(){
                    var index=$(this).attr("index");
                    //上一页，即往下滚动一页
                    if(index === "prev"){

                        if( _this.curIndex > 1){
                            /*查询下一页数据，刷新数据区*/
                            var dtd = $.Deferred();
                            $.when(_this.updateResultDom({curPageNum:_this.curIndex-1,dtd:dtd})).done(function(){
                                    if(_this.windowWidth>768 && _this.curIndex % 5 === 1 && _this.pageTurn>0){
                                        //页码区该翻页了
                                        _this.pageTurn--;
                                        _this.updatePageDom(_this.pageTurn);
                                        _this.isLastTurn=false;
                                }

                                _this.curIndex--;
                                _this.css(index);

                            });
                        }
                    }else if(index === "next"){
                        if(_this.curIndex < _this.pageNums){
                            /*刷新数据区*/
                            var dtd = $.Deferred();
                            $.when(_this.updateResultDom({curPageNum:_this.curIndex+1,dtd:dtd})).done(function(){
                                //满足一下条件，页码区该翻页了
                                if(_this.windowWidth>768 && _this.curIndex % 5 === 0 && _this.pageTurn < Math.ceil(_this.pageNums/5)){
                                    _this.pageTurn++;
                                    _this.isLastTurn=false;
                                    var lastTurn=_this.pageNums-_this.curIndex;
                                    if(lastTurn>=5){
                                        for(var i=0;i<5;i++){
                                            $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*5+1);
                                        }
                                    }else{
                                        for(var i=0;i<5;i++){

                                            if(i<lastTurn){
                                                $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*5+1);
                                            }else{
                                                $(_this.$pagesList).find("li:eq("+(lastTurn+1)+")").remove();
                                            }
                                        }
                                    }
                                }
                                _this.curIndex++;
                                _this.css(index);
                            });
                        }
                    }else if(index==="ensure"){
                        var fillPageNum=parseInt($(this).prev(".go").find("input").val());
                        if(fillPageNum>_this.pageNums){
                            fillPageNum=_this.pageNums;
                            $(this).prev(".go").find("input").val(fillPageNum);
                        }

                        /*刷新数据区*/
                        var dtd = $.Deferred();
                        $.when(_this.updateResultDom({curPageNum:fillPageNum,dtd:dtd})).done(function(){
                            _this.curIndex=fillPageNum;
                            //重置页码区
                            var theIndex=fillPageNum%5;
                            _this.pageTurn=Math.ceil(fillPageNum/5)-1;
                            var lastTurn=_this.pageNums-fillPageNum;
                            var turnNums=Math.ceil(_this.pageNums/5)-1;
                            if(lastTurn>=5 || _this.pageTurn < turnNums){
                                //页码区该翻页了
                                _this.updatePageDom(_this.pageTurn);
                            }else if( !_this.isLastTurn){
                                var lastNums=_this.pageNums-_this.pageTurn*5;
                                for(var i=0;i<5;i++){
                                    if(i<lastNums){
                                        $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+_this.pageTurn*5+1);
                                    }else if($(_this.$pagesList).find("li span:eq("+(lastNums+1)+")").text()===(i+1)){
                                        $(_this.$pagesList).find("li:eq("+(lastNums+1)+")").remove();
                                    }
                                }
                                _this.isLastTurn=true;
                            }


                            _this.css();
                        });
                    }else if(index==="more" || index==="go"){

                        $(this).unbind("click");

                    }else{
                        var onIndex=parseInt($(this).find("span").text());
                        _this.curIndex=onIndex;
                        /*刷新数据区*/
                        var dtd = $.Deferred();
                        $.when(_this.updateResultDom({curPageNum:onIndex,dtd:dtd})).done(function(){
                            _this.css();
                        });
                    }
            });

        },

        /*组件方法：构建页面DOM元素;页面初始化和加载更多均用此方法*/
        updateResultDom:function(options){
            var _this=this;
            var dtd=options.dtd;
            _this.options.searchPara.curPage =options.curPageNum;
            
            $.ajax({
            	url:_this.options.actionUrl,	//curPageNum 当前显示页码 作为请求 当前页数据参数
            	data:_this.options.searchPara,
            	dataType:"json",
                type:"post",
                success:function(data){
                    var dataList=data.model.curPageData;
                    var outPut=_this.options.buildDom(dataList);
                    _this.$containerUl.empty();
                    _this.$containerUl.append(outPut);
                    if(_this.options.bulidCallBk){
                    	_this.options.bulidCallBk();
                    }
                    dtd.resolve();
                },
                fail:function(){
                    layer.alert('数据获取失败！',{title:'温馨提示：'});
                    return false;
                }
            });

            return dtd.promise();

        },

        /*更新构件页面页码区DOM结构*/
        updatePageDom:function(pageTurn){
            var _this=this;
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
            for(var i=0;i<5;i++){
                $(_this.$pagesList).find("li span:eq("+(i+1)+")").text(i+pageTurn*5+1).parent().attr("index",i+1);
            }

            _this.isLastTurn=false;
        },

        /*组件DOM元素添加样式--PC端*/
        addPcCss:function(wiait){

        },

        /*组件DOM元素添加动画样式--手机端*/
        addMobileCss:function(wiait){

        },

        /*组件方法：添加DOM事件*/
        addMore:function(options){

        }

    }

    /*组件绑定到$.fn对象上*/
    $.fn.pagination=function(options){
        this.each(function() {
            if ($.data(this, "plugin_pagination")) {

                $.data(this, "plugin_pagination" ,null);

            }
            
            return $.data(this, "plugin_pagination" , new pagination(this, options));
        });
    }

})(jQuery)
