/**
* lar-loading组件测试版
* version: Beta 1.0
*
*
* selector loading方式:
* - 在某个div完成异步加载前加载:                 $( selector ).larLoading({ text: "Loading", position:'inside'});
* - 加载完毕后loading消失:                   $( selector ).larLoading( "hide" );
* 
* 全页面覆盖 loading方式
* - 初始化页面loading:                     	$.larLoading(); 
* - 加载完毕后loading消失      				$.larLoading( "hide" );
*
*
* 组件日志
* 2016.3.2 Beta 1.0
* 2016.3.7 修复了全页面覆盖模式下旋转icon不居中的问题
* 		   修复了同一页面多个组件同时初始化的缓存问题
*          根据lar-ui模板规范重构
* 
**/

(function($){	

    // Create the defaults once
    var defaults = {

        };

    // The actual plugin constructor
    function LarLoading( element, options ) {
        this.element = element;

        // Merge user options with default ones
        this.options = $.extend(true,{},this.defaults,options); //必须有
        //this.options = $.extend( {}, defaults, options );

        //this._defaults     = defaults;
        this._loader       = null;                // Contain the loading tag element
        
        // private variable 内部变量
        this.__textAlignAttr    = false; 
        this.init();
    }

/*    // Contructor function for the plugin (only once on page load)
    function contruct() {

        if ( !$[pluginName] ) {
            $.larLoading = function( opts ) {
                $( "body" ).larLoading( opts );
            };
        }
    }
*/
    LarLoading.prototype = {

        init: function() {

            if( $( this.element ).is( "body") ) {
                this.options.position = "overlay";
            }
            this.show();
        },

		defaults : {  //必须有
            'position': "right",        // right | inside | overlay
            'text': "",                 // Text to display next to the loader
            'class': "glyphicon glyphicon-refresh",    // loader CSS class
            'transparency': 0.5,        // background transparency for using with overlay
            'tpl': '<span class="larLoading-wrapper %wrapper%">%text%<i class="%class% glyphicon-spin lar-spin"></i></span>',    // loader base Tag. Change to support bootstrap > 3.x
            'disableSource': true,      // true | false
            'disableOthers': []
		},
		
        show: function() {

            var self = this;
            
            /*self.__textAlignAttr = $(self.element).css('text-align');
            
            if( $(self.element).css('text-align') != 'center' ){
            	$(self.element).css('text-align', 'center');
            }*/
        	
            var tpl = self.options.tpl.replace( '%wrapper%', ' larLoading-show ' + ' larLoading-' + self.options.position );
            tpl = tpl.replace( '%class%', self.options['class'] );
            tpl = tpl.replace( '%text%', ( self.options.text !== "" ) ? self.options.text + ' ' : '' );
            self._loader = $( tpl );

            // Disable the element
            if( $( self.element ).is( "input, textarea" ) && true === self.options.disableSource ) {

                $( self.element ).attr( "disabled", "disabled" );

            }
            else if( true === self.options.disableSource ) {

                $( self.element ).addClass( "disabled" );

            }

            // Set position
            switch( self.options.position ) {

                case "inside":
                    //$( self.element ).html( self._loader );
                	if($( self.element ).find('.larLoading-show').length>0) {
                		$( self.element ).find('.larLoading-show').parent('div').remove();
                	}
                	self._loader.wrap('<div style="width:100%; text-align:center;"></div>');
                	self._loader.parent('div').prependTo($( self.element )).css({
                	    /*'padding-top': '10px',
                	    'padding-bottom': '10px',
                	    'background-color': '#d0dde4',
                	    'border': '1px solid #a0aac4',
                	    'margin-bottom': '10px'*/
                	});
                	
                	/*$( self.element ).prepend( self._loader );*/
                    break;
                case "bottom":
                	if($( self.element ).find('.larLoading-show').length>0) {
                		$( self.element ).find('.larLoading-show').parent('div').remove();
                	}
                	self._loader.wrap('<div style="width:100%; text-align:center;"></div>');
                	self._loader.parent('div').appendTo($( self.element ));
                	break;
                case "overlay":
                    var $wrapperTpl = null;

                    if( $( self.element ).is( "body") ) {
                        $wrapperTpl = $('<div class="larLoading-overlay" style="position:fixed; left:0; top:0; z-index: 10000; background: rgba(0,0,0,' + self.options.transparency + '); width: 100%; height: ' + $(window).height() + 'px;" />');
                        $( "body" ).prepend( $wrapperTpl );

                        $( window ).on('resize', function() {
                            $wrapperTpl.height( $(window).height() + 'px' );
                            self._loader.css({top: ($(window).height()/2 - self._loader.outerHeight()/2) + 'px' });
                            self._loader.css({position: 'absolute'});
                        });
                    } else {
                        var cssPosition = $( self.element ).css('position'),
                            pos = {},
                            height = $( self.element ).outerHeight() + 'px',
                            width = $(self.element).css("width"); // $( self.element ).outerWidth() + 'px;

                        if( 'relative' === cssPosition || 'absolute' === cssPosition) {
                            pos = { 'top': 0,  'left': 0 };
                        } else {
                            pos = $( self.element ).position();
                        }
                        $wrapperTpl = $('<div class="larLoading-overlay" style="position:absolute; top: ' + pos.top + 'px; left: ' + pos.left + 'px; z-index: 10000; background: rgba(0,0,0,' + self.options.transparency + '); width: ' + width + '; height: ' + height + ';" />');
                        $( self.element ).prepend( $wrapperTpl );

                        $( window ).on('resize', function() {
                            $wrapperTpl.height( $( self.element ).outerHeight() + 'px' );
                            self._loader.css({top: ($wrapperTpl.outerHeight()/2 - self._loader.outerHeight()/2) + 'px' });
                        });
                    }

                    $wrapperTpl.html( self._loader );
                    self._loader.css({top: ($wrapperTpl.outerHeight()/2 - self._loader.outerHeight()/2) + 'px' });
                    self._loader.css({position: 'absolute'});
                    break;

                default:
                	if($( self.element ).find('.larLoading-show').length>0) {
                		$( self.element ).find('.larLoading-show').parent('div').remove();
                	}
                	self._loader.wrap('<div></div>');
            		self._loader.parent('div').prependTo($( self.element )).css({
            	    /*'padding-top': '10px',
            	    'padding-bottom': '10px',
            	    'background-color': '#d0dde4',
            	    'border': '1px solid #a0aac4',
            	    'margin-bottom': '10px'*/
            	});
                    break;
            }

            self.disableOthers();
        },

        hide: function() {

            if( "overlay" === this.options.position ) {

                $( this.element ).find( ".larLoading-overlay" ).first().remove();

            } else {

                $( this._loader.parent('div') ).remove();
                //$( this.element ).text( $( this.element ).attr( "data-larLoading-label" ) );

            }

            $( this.element ).removeAttr("disabled").removeClass("disabled");

            //$( this.element ).css('text-align' , this.__textAlignAttr);
            
            this.enableOthers();
        },

        disableOthers: function() {
            $.each(this.options.disableOthers, function( i, e ) {
                var elt = $( e );
                if( elt.is( "button, input, textarea" ) ) {
                    elt.attr( "disabled", "disabled" );
                }
                else {
                    elt.addClass( "disabled" );
                }
            });
        },

        enableOthers: function() {
            $.each(this.options.disableOthers, function( i, e ) {
                var elt = $( e );
                if( elt.is( "button, input, textarea" ) ) {
                    elt.removeAttr( "disabled" );
                }
                else {
                    elt.removeClass( "disabled" );
                }
            });
        }
    };

    // Constructor
    $.fn.larLoading = function ( options ) {
        return this.each(function () {
        	if( options === "hide"){
        		//当初始化参数为隐藏时，取到当天
        		var instance = $.data( this, "plugin_larloading" );
        		instance && instance.hide();
        	}else{
        		return $.data(this, "plugin_larloading" , new LarLoading(this, options));
        	}
        	
/*            if (!$.data(this, "plugin_larloading")) {
                return $.data(this, "plugin_larloading" , new Plugin(this, options));
            }*/
            /*if ( options && "hide" !== options || !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            } else {
                var elt = $.data( this, "plugin_" + pluginName );

                if( "hide" === options )    { elt.hide(); }
                else                        { elt.show(); }
            }*/
        });
    };

    //contruct();

}(jQuery));
