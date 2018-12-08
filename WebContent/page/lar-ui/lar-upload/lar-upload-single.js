/**
 * 
 * 检索工程上传组件<br/>
 * @author gaodsh@css.com.cn
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
	//插件代码
	
	//默认选项
	var defaults = {
	    // swf文件路径
	    swf: baseUrl + '/lib/webuploader/Uploader.swf',

	    // 文件接收服务端。
	    //server: baseUrl + '/sword?SwordControllerName=fileUploadChunkController',
	    server: FileUpdateUrl + '/sword?SwordControllerName=fileUploadChunkController',
	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
	    // pick: '#pick',

	    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
	    resize: false,
	    // 设置隐藏域获取上传文件信息
	    nameFields:{
	    	id:'fileId',  //fileId，attachmentId
	    	name:'fileName',  //fileName，attachmentName
	    	path:'filePath'  //filePath，attachmentPath
	    },
		//是否分片
		chunked:true,
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
        // 是否单步上传，true的时候选择文件自动上传，false的时候需要点击上传按钮才能上传
        isAutoUpload : true
	};
	
    $.fn.larUploadSingle = function (method) {
		if (singleMethods[method]) {
			return singleMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return singleMethods.init.apply(this, arguments);
		} else {
			$.error('SingleMethods ' + method + ' does not exist on jQuery.larUploadSingle');
		} 
    };
    
    var singleMethods = {
    	init : function(options){
    		var settings = $.extend({},defaults,options);
			return this.each(function(){
				var $this = $(this),data = $this.data('larUploadSingle');
				if(!data){
					 $(this).data('larUploadSingle', {
						target : $this,
						options : settings
					 });
				}
				$this = singleMethods._renderUI($this,settings);
				settings.pick = $this.find('.single-upload .choose-file')[0];
				singleMethods._loadUploader($this,settings);
				
			});	
    	},
    	getVal : function(){
			var $this = $(this);
			var val = {};
			$this.find('.single-oper input').each(function(i,item){
				val[item.name] = item.value;
			});
			return val;
    	},



    	//data:{attachmentId:xx,attachmentName:xx,attachmentPath:xx}
    	setData : function(data){
    		var $this = $(this);
			if(!$.isEmptyObject(data)){
				$this.find('.single-oper input').each(function(i,item){
					$(item).val(data[item.id]);
				});
				$this.find('.single-upload').hide();
				$this.find('.single-oper').show();
				$this.find('.single-oper div a').text($this.find('.single-oper input[class="fields-name"]').val());
				$this.find('.single-oper div a').attr('href', URL_FILE_SERVER + $this.find('.single-oper input[class="fields-path"]').val());
				$this.find('.single-oper div a').attr('target', '_blank');
			}
    	},

        clearData : function() {
            var $this = $(this);
            $this.find('.glyphicon-remove').click();    
        },

    	_renderUI : function($this,options){
    		var  lusHtmlArr = [], p = options;
    		$this.addClass('lar-upload-single');
    		
    		lusHtmlArr.push('<div  class="single-upload input-group">                                                            ');
    		lusHtmlArr.push('	<div class="choose-file">                                                          ');
    		lusHtmlArr.push('		<input type="text" class="form-control" placeholder="点击选择文件"/>                ');
    		lusHtmlArr.push('	</div>                                                                                ');
    		lusHtmlArr.push('	<span class="input-group-addon">                                                    ');
    		lusHtmlArr.push('		<i class="glyphicon glyphicon-cloud-upload"></i>                                ');
    		lusHtmlArr.push('		<i class="glyphicon glyphicon-upload" style="cursor:pointer" title="上传"></i>   ');
    		lusHtmlArr.push('	</span>                                                                                ');
    		lusHtmlArr.push('	<div class="file-info"></div>                                                           ');
    		lusHtmlArr.push('</div>                                                                                   ');

    		lusHtmlArr.push('<div class="single-progress">                                                         ');
    		lusHtmlArr.push('	<div class="progress progress-striped active">                                         ');
    		lusHtmlArr.push('		<div class="progress-bar" role="progressbar" style="width: 0%"></div>               ');
    		lusHtmlArr.push('	</div>                                                                                ');
    		lusHtmlArr.push('</div>                                                                                   ');
    		
    		lusHtmlArr.push('<div  class="single-oper input-group">                                                            ');
    		lusHtmlArr.push('	<div class="form-control">                                                        ');
    		lusHtmlArr.push('		<a href="#"></a>                                                       ');
    		if(p.nameFields && p.nameFields.id){
    			lusHtmlArr.push('	<input type="hidden" class="fields-id" id="'+p.nameFields.id+'" name="'+p.nameFields.id+'" />         ');
    		}
    		if(p.nameFields && p.nameFields.name){
    			lusHtmlArr.push('	<input type="hidden" class="fields-name" id="'+p.nameFields.name+'" name="'+p.nameFields.name+'" />         ');
    		}
    		if(p.nameFields && p.nameFields.path){
    			lusHtmlArr.push('	<input type="hidden" class="fields-path" id="'+p.nameFields.path+'" name="'+p.nameFields.path+'" />         ');
    		}    		
    		lusHtmlArr.push('	</div>                                                        ');
    		lusHtmlArr.push('	<span class="input-group-addon">                                                  ');
    		lusHtmlArr.push('		<i class="glyphicon glyphicon-remove" style="cursor:pointer" title="删除"></i>               ');
    		lusHtmlArr.push('	</span>                                                                                ');
    		lusHtmlArr.push('</div>                                                                                  ');
    		
    		$this.append(lusHtmlArr.join(''));
    		
    		//选择文件
    		$this.$upload = $('.single-upload',$this);
    		$this.$chooseFile = $('.single-upload .choose-file',$this);
    		//上传图标
    		$this.$cloud = $('.single-upload .glyphicon-cloud-upload',$this);
    		$this.$uploadIcon = $('.single-upload .glyphicon-upload',$this).hide(); 
    		$this.$uploadIcon.click(function(){
    			$this.uploader.upload();
    		});
    		//文件数据
    		$this.$fileInfo = $('.single-upload .file-info',$this).hide();  
    		
    		//进度条
    		$this.$progress = $('.single-progress',$this).hide();
    		
    		//操作
    		$this.$oper  = $('.single-oper',$this).hide();
    		// 操作-删除
    		$this.$remove = $('.single-oper .glyphicon-remove',$this);
    		
    		$this.$remove.click(function(){
    			$this.uploader.reset();
    			$this.$oper.hide();
    			$this.$chooseFile.find('input')[0].value = '';
    			$this.$oper.find('input').val('');
    			$this.$uploadIcon.hide();
    			$this.$cloud.show();
    			$this.$upload.show();			
    		});
    		
    		return $this;
    		  		
    	},
    	_loadUploader : function($this,options){
			var p = options;
			
			if(p.chunked){
				singleMethods._register($this);
			}

			$this.uploader = WebUploader.create(options);

			$this.uploader.on('beforeFileQueued', function(file) {
				$this.uploader.reset();
			});

			// 当有文件添加进来的时候
			$this.uploader.on('fileQueued', function(file) {
				$this.$chooseFile.find('input')[0].value = file.name;
				$this.$cloud.hide();
                if(p.isAutoUpload) {  // 单步上传
                    $this.uploader.upload();
                } else {
                   $this.$uploadIcon.show(); 
                }
				file.larProgress = $this.$progress.find('div[class="progress-bar"]');
			});
			
	         //附件上传数据发送之前触发
			$this.uploader.on( 'uploadBeforeSend', function(object,data,headers) {
	            data['chunkSize']   = this.options.chunkSize;                 //发送每片大小到后端
	            data['md5']  = object.file.larFileMd5;         //文件MD5
	            data['filePath'] = object.file.larFilePath;       //文件路径
	        });	
			
			//当开始上传流程时触发
			$this.uploader.on( 'uploadStart', function( file ) {
				$this.$upload.hide();
				$this.$progress.show();
	        });

			// 文件上传过程中创建进度条实时显示。
			$this.uploader.on('uploadProgress', function(file, percentage) {
				$this.$progress.find('.progress-bar').css('width', Math.floor(percentage * 100) + '%').html( Math.floor(percentage * 100) +'%');
			});

			// 文件上传成功，给item添加成功class, 用样式标记上传成功。
			$this.uploader.on('uploadSuccess', function(file) {
				$this.$progress.hide();
				$this.$oper.show();
				$this.$oper.find('div a').text(file.name).attr('href',URL_FILE_SERVER + file.larFilePath);
				$this.$oper.find('.fields-id').val(file.larFileId);
				$this.$oper.find('.fields-name').val(file.name);
				$this.$oper.find('.fields-path').val(file.larFilePath);
				p.onSuccess && p.onSuccess();
			});

			// 文件上传失败，显示上传出错。
			$this.uploader.on('uploadError', function(file) {
				console.log('error');
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
    		singleMethods._unRegister();

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
                            //MD5计算完毕，向服务器端验证该文件上传状态（未上传[包含已上传一部分]、成功）
//                            console.log('总耗时: '+((new Date().getTime()) - start)/1000);
                            $.ajax({
                            	type:'POST',
                                //url: baseUrl + '/sword/fileUpload/beforeSendFile',
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
                    	//url: baseUrl + '/sword/fileUpload/afterSendFile',
                    	url: FileUpdateUrl + '/sword/fileUpload/afterSendFile',
                        dataType: 'json',
                        autoWrap : false,
                        data: {
                            id : file.larFileId
                        },
                        success: function (response) {
                            if(response.model.success){
                                //console.log("========"+file.name+"上传完成========");
                                //console.log(file);
                            }
                        }
                    });
                }
            });    		
    	}	
    };
}));