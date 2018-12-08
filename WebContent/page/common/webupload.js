//end document.ready
function registerUploadEvents() {
    var UPLOAD_FILE = null;
    WebUploader.Uploader.unRegister('beforeSendFile');
    WebUploader.Uploader.unRegister('beforeSend');
    WebUploader.Uploader.unRegister('afterSendFile');
    WebUploader.Uploader.register({
        'name': 'beforeSendFile',
        'before-send-file': function(file) {
            var deferred = WebUploader.Deferred();
            var start = new Date().getTime();
            var owner = this.owner;
            owner.md5File(file.source).progress(function(percentage) {}).fail(function() {
                deferred.reject();
            }).then(function(md5) {
                $.ajax({
                    type: 'POST',
                    url: baseUrl + '/sword/fileUpload/beforeSendFile',
                    dataType: 'json',
                    data: {
                        md5: md5,
                        fileFullName: file.name,
                        fileMiddleDir: owner.options.fileMiddleDir,
                        fileSize: file.size,
                        isManage: owner.options.isManage,
                        isSearchFlag: true
                    },
                    success: function(response) {
                        //未配置附件配置
                        if (response.status === 'noConfig') {
                            Util.alert('未找到附件配置，中断上传.');
                            deferred.reject();
                        } else {
                            //每次向后台发送分片时使用
                            file.larFileMd5 = md5;
                            file.larFileId = response.model.data.id;
                            file.larFilePath = response.model.data.filePath;
                            //已经上传，跳过此文件，秒传
                            if (response.status === 'completed') {
                                owner.skipFile(file);
                            } else {
                                UPLOAD_FILE = response.model.data;
                            }
                            console.info('beforeSend');
                            console.info(response);
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
        'before-send': function(block) {
            //是否上传分片验证
            var checkBlock = function() {
                $(UPLOAD_FILE.chunks).each(function(i, chunk) {
                    if (chunk.chunk === block.chunk) {
                        return true;
                    }
                });
                return false;
            };
            var deferred = WebUploader.Deferred();
            if (!UPLOAD_FILE.chunks) {
                //第一次上传
                deferred.resolve();
            } else {
                if (checkBlock()) {
                    //已经存在跳过上传
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            }
            return deferred.promise();
        }
    });
    WebUploader.Uploader.register({
        'name': 'afterSendFile',
        'after-send-file': function(file) {
            //上传完成修改状态
            $.ajax({
                type: 'POST',
                url: baseUrl + '/sword/fileUpload/afterSendFile',
                dataType: 'json',
                data: {
                    id: file.larFileId
                },
                success: function(response) {
                    console.info('afterSend');
                    console.info(response);
                    if (response.success) {}
                }
            });
        }
    });
}