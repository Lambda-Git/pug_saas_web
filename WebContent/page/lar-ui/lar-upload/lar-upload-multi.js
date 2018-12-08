/**
 * 
 * 前端多附件上传组件
 * @author lin.lin@css.com.cn
 * 依赖jQuery、bootstrap、WebUploader
 * 多附件上传组件，支持数据初始化（传参或通过方法）、按照类型（增删改）获取数据
 * 以下是下一步要优化和扩展的内容
 * 1. 暂不支持设置特定类型；
 * 2. 暂不支持编辑；
 * 3. 暂不支持排序
 */
;(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD模式
        define([ "jquery" ], factory);
    } else {
        // 全局模式
        factory(jQuery);
    }
}(function ($) {
	//默认选项
	var defaults = {
		// 上传按钮名称
		btnName : '上传文件',
	    // swf文件路径
	    swf: baseUrl + '/js/vendor/webuploader/Uploader.swf',

	    // 文件接收服务端。
	    server: FileUpdateUrl + '/sword?SwordControllerName=fileUploadChunkController',
	    resize: false,
	    // 设置隐藏域获取上传文件信息
	    nameFields:{
	    	id:'attachmentId',  
	    	name:'attachmentName',
	    	path:'attachmentPath',
	    	format:'format',
	    	type:'fileType',
	    	md5: 'attachmentMd5'
	    },
	    multiple : true,
		//是否分片
		chunked:true,
		//初始化数据
		fileDatas:[],
		//成功事件
		onSuccess : null,
		//是否管理
		isManage : false,
		accept:{
			extensions:'gif,jpg,jpeg,bmp,png,tiff,doc,docx,xls,xlsx,ppt,pptx,pdf,mp4,flv,avi,wmv,rmvb,mov,mpg,wma,mp3,wav,zip,rar,7z',
			mimeTypes:'image/*,application/vnd.ms-excel.12,application/vnd.ms-word.document.12,application/vnd.ms-powerpoint.12,application/pdf,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/msword,video/*,application/vnd.rn-realmedia-vbr,audio/*,application/zip,application/x-rar-compressed,application/x-7z-compressed',
			title:'全部文件'
		},
		//验证单个文件大小是否超出限制, 超出则不允许加入队列。1024*1024
		fileSingleSizeLimit : null,
		auto : true,
		fileServer : URL_FILE_SERVER || '/'
	};
	
    $.fn.larUploadMulti = function (method) {
		if (multiMethods[method]) {
			return multiMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return multiMethods.init.apply(this, arguments);
		} else {
			$.error('MultiMethods ' + method + ' does not exist on jQuery.larUploadMulti');
		} 
    };
    
    var multiMethods = {
    	// 初始化方法
    	init : function(options){
    		var settings = $.extend({},defaults,options);
			return this.each(function(){
				var $this = $(this), data = $this.data('larUploadMulti');
				if(!data){
					$(this).data('larUploadMulti', {
						target : $this,
						options : settings
					});
				}
				$this = multiMethods._renderUI($this,settings);
                $this = multiMethods._addEvent($this);
                settings.pick = $this.find('.multi-upload .choose-file')[0];
                $this.data('options', settings);
				multiMethods._loadUploader($this,settings);
				if(settings.fileDatas.length) {
					$this.$table.show();
					$.each(settings.fileDatas,function(i, file){
						multiMethods._addTr($this, file, 'U');
					});
				}
			});	
    	},

        // 按类型获取数据，如果没有传类型代表获取全部数据
        getData : function(status) {
            var $this = $(this);
            if(status) {
                if(!$.isArray(status)){
                    status = [status];
                }
            } else {
                status = ['I', 'U', 'D'];
            }
            var dataList = [];
            $this.find('table tbody tr').each(function(){
                var data = $(this).data('userFile');
                if($.inArray(data.status, status) >= 0) {
                    dataList.push(data);
                }
            });
            return dataList;
        },

        // 初始化数据 -- 数据全部是编辑状态
        setData : function(data){
            var $this = $(this);
            if(data && data.length) {
            	$this.find('table').show();
            	$.each(data,function(i, file){
					multiMethods._addTr($this, file, 'U');
				});
            }
        },

        _addEvent : function($this){
        	$this.off('click', '.multi-upload .file-list table tbody tr td .glyphicon-trash');
            $this.on('click', '.multi-upload .file-list table tbody tr td .glyphicon-trash', function(event){
                var $tr = $(this).parents('tr');
                var userFile = $tr.data('userFile');
                var uploaderFile = $tr.data('uploaderFile');
                if(userFile && userFile.status === 'U') {
                	$tr.hide();
                	userFile.status = 'D';
                } else{
                	if(uploaderFile){
	                	$this.uploader.removeFile(uploaderFile);
	                }
	                $tr.remove();
                } 
            });
            return $this;
        },

        // 初始化组件Dom元素
    	_renderUI : function($this,options){
    		var  lusHtmlArr = [], p = options;
    		$this.empty();
    		$this.addClass('lar-upload-multi');
    		// 上传文件
    		lusHtmlArr.push('<div  class="multi-upload input-group">');
    		lusHtmlArr.push('	<div class="choose-file">');
    		lusHtmlArr.push('		<button type="button" class="btn btn-default" style="margin-top:0">' + p.btnName + '</button>');
    		lusHtmlArr.push('	</div>');
    		lusHtmlArr.push('	<div class="file-list">');
    		lusHtmlArr.push('		<table class="table table-bordered" style="display:none">');	// 应该暂时隐藏，有文件了再显示
    		lusHtmlArr.push('			<thead>');
    		lusHtmlArr.push('				<tr>');
    		lusHtmlArr.push('					<td name="fileName">文件名称</td>');
    		lusHtmlArr.push('					<td name="operation">操作</td>');
    		lusHtmlArr.push('				</tr>');
    		lusHtmlArr.push('			</thead>');
    		lusHtmlArr.push('			<tbody>');
    		lusHtmlArr.push('			</tbody>');
    		lusHtmlArr.push('		</table>');
    		lusHtmlArr.push('	</div');
    		lusHtmlArr.push('</div>');
    		$this.append(lusHtmlArr.join(''));
    		//选择文件
    		$this.$upload = $('.multi-upload',$this);
    		$this.$chooseFile = $('.multi-upload .choose-file button',$this);		// 选择文件按钮
    		$this.$table = $('.multi-upload .file-list table',$this);				// 文件列表表格
    		//$this.$fileContainer = $('.multi-upload .file-list table tbody',$this);	// 文件容器
    		$this.$fileList = $('.multi-upload .file-list table tbody tr',$this);	// 文件列表
    		return $this;
    	},


    	// 添加一条文件
        _addTr : function($this,file,status){
            var _this = this, trHtmlArr = [], p = $this.data('options');
            trHtmlArr.push('<tr>');
            trHtmlArr.push('	<td name="fileName">');
            trHtmlArr.push('	</td>');
            trHtmlArr.push('	<td name="operation">');
            trHtmlArr.push('	</td>');
            trHtmlArr.push('</tr>');
            var $tr = $(trHtmlArr.join(''));
            $this.find('.file-list table').show();
            $this.find('.file-list table tbody').append($tr);
            var name = file.name;
            var path = file.path;
            var id = file.id;
            if(status === 'U') {
            	name = file[p.nameFields.name];
            	path = file[p.nameFields.path];
            	id = file[p.nameFields.id];
            }
            // 文件名
            var $fileName = $('<div class="file-name"><span>' + name + '</span></div>');
            $tr.find('td[name=fileName]').append($fileName);
            // 进度条
            var $progress = $('<div class="file-progress">' +
								'<div class="progress progress-striped active">' + 
									'<div class="progress-bar" role="progressbar" style="width: 0%"></div>'+
								'</div>'+
							  '</div>');
            $tr.find('td[name=fileName]').append($progress);
            if(status === 'U') {	// 如果是编辑状态--已经上传过了，增加链接
            	$progress.hide();
            	$fileName.find('span').wrap('<a target="_blank" href="' + p.fileServer + path + '"></div>');
            	file.status = file.status || 'U';
            	$tr.data('userFile', file);			// 把用户文件挂上去
            } else {
            	$tr.attr('id','row_' + file.id);   
            	$tr.data('uploaderFile', file);	// 把组件文件挂上去，删除的时候需要
            }
            $tr.find('td[name=operation]').append('<i class="glyphicon glyphicon-trash" style="cursor:pointer" title="删除"></i>');
        },

        // 数据转换--把webuploader的数据转换成用户定义的格式
        _translateFile : function($this,file) {
        	var _this = this, p = $this.data('options');
        	var returnData = {};
        	returnData.status = 'I';
        	returnData[p.nameFields.name] = file.name;
        	returnData[p.nameFields.id] = file.larFileId;
        	returnData[p.nameFields.path] = file.larFilePath;
        	returnData[p.nameFields.format] = file.ext;
        	returnData[p.nameFields.md5] = file.larFileMd5
        	returnData[p.nameFields.type] = file.type;
        	return returnData;
        },
        
        // 上传数据及整个上传过程
     	_loadUploader : function($this,options){
            var _this = this, p = options;
			if(p.chunked){	// 分段上传
				multiMethods._register($this);
			}

			$this.uploader = WebUploader.create(options);
            $this.data('uploader', $this.uploader);
			// 当有文件添加进来的时候
			$this.uploader.on('fileQueued', function(file) {
				_this._addTr($this, file);
				file.larProgress = $this.find('.file-progress .progress-bar');
			});
			
	        // 附件上传数据发送之前触发
			$this.uploader.on( 'uploadBeforeSend', function(object,data,headers) {
	            data['chunkSize']   = this.options.chunkSize;       //发送每片大小到后端
	            data['md5']  = object.file.larFileMd5;         		//文件MD5
	            data['filePath'] = object.file.larFilePath;       	//文件路径
	        });	
			
			//当开始上传流程时触发
			$this.uploader.on( 'uploadStart', function( file ) {
	        });

			// 文件上传过程中创建进度条实时显示。
			$this.uploader.on('uploadProgress', function(file, percentage) {
				$this.find('#row_'+file.id).find('.progress-bar').css('width', Math.floor(percentage * 100) + '%').html( Math.floor(percentage * 100) +'%');
			});

			// 文件上传成功，给item添加成功class, 用样式标记上传成功。
			$this.uploader.on('uploadSuccess', function(file) {
                var $tr = $this.find('#row_' + file.id );
                var userFile = _this._translateFile($this, file);
				$tr.find('.file-progress').hide();	// 进度条隐藏
				// 文件名加链接
				$tr.find('.file-name span').wrap('<a target="_blank" href="' + p.fileServer + file.larFilePath + '"></div>');	
				// 文件挂上去
                $tr.data('userFile', userFile);
				p.onSuccess && p.onSuccess();
			});

			// 文件上传失败，显示上传出错。
			$this.uploader.on('uploadError', function(file) {
				// 修改为提示错误
				console.log('error');
			});				
			
			// 文件验证失败，显示上传出错。--- 这里需要优化？？？
			$this.uploader.on('error', function(handler) {
				if(handler === 'F_EXCEED_SIZE') {
					if(this.options.fileSingleSizeLimit) {
						var size = this.options.fileSingleSizeLimit/1024/1024 + 'M';
                        layer.alert('文件大小超过'+size+',不能上传',{title:'温馨提示：'});
					}
				}
				if(handler === 'Q_TYPE_DENIED') {
					if(this.options.accept.length > 0 && this.options.accept[0].extensions) {
						var type = this.options.accept[0].extensions;
                        layer.alert('文件格式不是'+type+',不能上传',{title:'温馨提示：'});
					}
				}
				if(handler === 'F_DUPLICATE') { // 这里有bug，需要修改。如果删除了重新上传会报重复上传，这样不合理
                    layer.alert('不要重复上传',{title:'温馨提示：'});
				}
			});	
    	},
    	_unRegister : function(){
            WebUploader.Uploader.unRegister('beforeSendFile');
            WebUploader.Uploader.unRegister('beforeSend');
            WebUploader.Uploader.unRegister('afterSendFile');
        },
    	_register : function($this){
    		var _this = $this;
    	    //先清除事件注册
    		multiMethods._unRegister();

            var UPLOAD_FILE = null;

            WebUploader.Uploader.register({
                'name': 'beforeSendFile',
                'before-send-file': function( file ) {
                    var deferred = WebUploader.Deferred();
                    var start = new Date().getTime();
                    var owner = this.owner;
                    owner.md5File( file.source )
                        .progress(function(percentage){
                            file.larProgress.css('width', Math.floor(percentage*100) +'%').html('MD5  ' + Math.floor(percentage*100) +'%');
                        })
                        .fail(function() {
                            deferred.reject();
                        })
                        .then(function( md5 ) {
                            $.ajax({
                            	type:'POST',
                                url: FileUpdateUrl + '/sword/fileUpload/beforeSendFile',
                                dataType: 'json',
                                autoWrap : false,
                                data: {
                                    md5: md5,
                                    fileFullName: file.name,
                                    fileMiddleDir:owner.options.fileMiddleDir,
                                    fileSize:file.size,
                                    isManage : owner.options.isManage,
                                    isSearchFlag:true
                                },
                                success: function (response) {
                                    //未配置附件配置
                                    if(response.model.status==='noConfig'){
                                        layer.alert('未找到附件配置，中断上传.',{title:'温馨提示：'});
                                        deferred.reject();
                                    }else{
                                        //每次向后台发送分片时使用
                                        file.larFileMd5     = md5;
                                        file.larFileId	 = response.model.data.id;
                                        file.larFilePath    = response.model.data.filePath;
                                        //已经上传，跳过此文件，秒传
                                        if(response.model.status==='completed'){
                                            owner.skipFile(file);
                                        }else{
                                            UPLOAD_FILE = response.model.data;
                                        }
                                        //webuploader接着往下走。
                                        deferred.resolve();
                                    }
                                }
                            });
                        });

                    return deferred.promise();
                }
            });
            WebUploader.Uploader.register({
                'name': 'beforeSend',
                'before-send': function(block){
                    //是否上传分片验证
                    var checkBlock = function(){
                    	$(UPLOAD_FILE.chunks).each(function(i, chunk) {
    						if (chunk.chunk === block.chunk) {
    							return true;
    						}
    					});
                        return false;
                    };
                    var deferred = WebUploader.Deferred();
                    if(!UPLOAD_FILE.chunks){
                        //第一次上传
                        deferred.resolve();
                    }else{
                        if(checkBlock()){
                            //已经存在跳过上传
                            deferred.reject();
                        }else{
                            deferred.resolve();
                        }
                    }
                    return deferred.promise();
                }
            });
            WebUploader.Uploader.register({
                'name': 'afterSendFile',
                'after-send-file': function(file){
                    //上传完成修改状态
                    $.ajax({
                    	type:'POST',
                    	url: FileUpdateUrl + '/sword/fileUpload/afterSendFile',
                    	dataType: 'json',
                    	autoWrap : false,
                        data: {
                            id : file.larFileId
                        },
                        success: function (response) {
                            if(response.model.success){
                            }
                        }
                    });
                }
            });    		
    	}
    };
}));