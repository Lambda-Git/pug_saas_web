$(document).ready(function(){
	// 设置body区高度
	var bodyHeight = $(window).height();
	var headerHeight = $('.center-header').outerHeight(true);
	var footerHeight = $('.center-footer').outerHeight(true);
	$('.errorInfo').css('height', (bodyHeight-headerHeight-footerHeight) + 'px');
	 
});