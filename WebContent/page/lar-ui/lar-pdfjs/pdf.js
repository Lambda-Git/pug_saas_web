// 读取pdf文档
var pdfReader = function(pdfUrl){
	var length = pdfUrl.length;
	var type = pdfUrl.substring(length-3, length).toLowerCase();
	if(type != 'pdf'){
		alert('只支持pdf格式！');
		return false;
	}
	window.open(baseUrl + '/lar-ui/lar-pdfjs/web/viewer.html?&file='+pdfUrl, '_blank');
}