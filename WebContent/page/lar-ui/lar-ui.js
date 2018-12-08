//工作流常量
var workflowConstant = {
		// 应用模块代码
		appCode: {
			//会员登记
			MEMBER_REGISTER: '9'
		},
		// 流程发起来源 代码
		source: {
			// 采集端
			INSIDE: '1',
			// 检索端
			OUTSIDE: '2'
		},
		// 业务类型
		businessType: {
				// 新建
				NEW: '1',
				// 编辑
				EDIT: '2',
				// 删除
				DELETE: '3'
		}
}

//维护公共报错变量
CONST_ERROR = "系统报错！请联系管理员。";
//城市机构码
//var systemId ='';
//
var DEFAULT_IMAGE = baseUrl + '/lar-ui/images/noImageAlert/errorImage.jpg';

$.fn.serializeJson=function(){
    var serializeObj={};  
    var array=this.serializeArray();  
    var str=this.serialize();  
    $(array).each(function(){  
        if(serializeObj[this.name]){  
            if($.isArray(serializeObj[this.name])){  
                serializeObj[this.name].push(this.value);  
            }else{  
                serializeObj[this.name]=[serializeObj[this.name],this.value];  
            }  
        }else{  
            serializeObj[this.name]=this.value;   
        }  
    });  
    return serializeObj;  
};  

//获取工程访问地址 返回结果形如:   http://localhost:8080/lar-region-search-web
function getServerPath(){
	     var curWwwPath = window.document.location.href;  
	    //获取主机地址之后的目录，如： cis/website/meun.htm  
	    var pathName = window.document.location.pathname;  
	    var pos = curWwwPath.indexOf(pathName); //获取主机地址，如： http://localhost:8080  
	    var localhostPath = curWwwPath.substring(0, pos); //获取带"/"的项目名，如：/cis  
	    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);  
	    return localhostPath + projectName;  
}

