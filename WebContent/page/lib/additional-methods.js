/*===================产品中目前用到的===================*/
//手机号码验证
jQuery.validator.addMethod("PD_mobile", function (value, element) {
    var length = value.length;
    //return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/.test(value));
    return this.optional(element) || (length == 11);
}, "手机号码格式错误!");
//字母、数字、点、下划线
jQuery.validator.addMethod("PD_ZSDX", function (value, element) {
    return this.optional(element) || /^[a-zA-Z0-9\._]+$/.test(value);
}, "只能包括英文字母、数字、点、下划线");
//邮箱验证，原生的mail如果前后出现空格验证不通过
jQuery.validator.addMethod("PD_mail", function (value, element) {
    return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value.replace(/(^\s*)|(\s*$)/g,'') );
}, "请输入正确的邮箱地址");

//正则表达式校验
jQuery.validator.addMethod("PD_regex", function (value, element, params) {
    var exp = new RegExp(params);
    return exp.test(value);
}, "正则校验格式错误");

/*===================产品中未使用到的===================*/
/**
 * 校验中文长度
 */
jQuery.validator.addMethod("PD_chineseLength", function (value, element, param) {
    var tempValue = value;
    tempValue = tempValue.replace(/[^\x00-\xff]/g, 'xx');
    tempValue = tempValue.replace(/[\r\n]/g, 'xx');
    var length = tempValue.length;
    return this.optional(element) || length <= param;
},"超过指定长度.");

//字母数字
jQuery.validator.addMethod("PD_ZS", function (value, element) {
    return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
}, "只能包括英文字母和数字");

//邮政编码验证
jQuery.validator.addMethod("zipcode", function (value, element) {
    var tel = /^[0-9]{6}$/;
    return this.optional(element) || (tel.test(value));
}, "请正确填写邮政编码");

//汉字
jQuery.validator.addMethod("PD_chinese", function (value, element) {
    var tel = /^[\u4e00-\u9fa5]+$/;
    return this.optional(element) || (tel.test(value));
}, "请输入汉字");

//字符最小长度验证（一个中文字符长度为2）
jQuery.validator.addMethod("PD_stringMinLength", function (value, element, param) {
    var length = value.length;
    for (var i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) > 127) {
            length++;
        }
    }
    return this.optional(element) || (length >= param);
}, jQuery.validator.format("长度不能小于{0}!"));

//字符最大长度验证（一个中文字符长度为2）
jQuery.validator.addMethod("PD_stringMaxLength", function (value, element, param) {
    var length = value.length;
    for (var i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) > 127) {
            length++;
        }
    }
    return this.optional(element) || (length <= param);
}, jQuery.validator.format("长度不能大于{0}!"));

//字符验证
jQuery.validator.addMethod("string", function (value, element) {
    return this.optional(element) || /^[\Α-\￥\w]+$/.test(value);
}, "不允许包含特殊符号!");


//电话号码验证
jQuery.validator.addMethod("PD_officePhone", function (value, element) {
    var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
    return this.optional(element) || (tel.test(value));
}, "办公电话格式错误!");

//传真号码验证
jQuery.validator.addMethod("PD_fax", function (value, element) {
    var tel = /^(\d{2,4}-?)?(\d{3,4}-?)?\d{7,9}$/g;
    return this.optional(element) || (tel.test(value));
}, "传真号码格式错误!");//[格式如86-010-111122222,86-010-1111122222]

//邮政编码验证
jQuery.validator.addMethod("zipCode", function (value, element) {
    var tel = /^[0-9]{6}$/;
    return this.optional(element) || (tel.test(value));
}, "邮政编码格式错误!");

//必须以特定字符串开头验证
jQuery.validator.addMethod("begin", function (value, element, param) {
    var begin = new RegExp("^" + param);
    return this.optional(element) || (begin.test(value));
}, jQuery.validator.format("必须以 {0} 开头!"));

//验证两次输入值是否不相同
jQuery.validator.addMethod("notEqualTo", function (value, element, param) {
    return value != $(param).val();
}, jQuery.validator.format("两次输入不能相同!"));

//验证值不允许与特定值等于
jQuery.validator.addMethod("notEqual", function (value, element, param) {
    return value != param;
}, jQuery.validator.format("输入值不允许为{0}!"));

//验证值必须大于特定值(不能等于)
jQuery.validator.addMethod("gt", function (value, element, param) {
    return value > param;
}, jQuery.validator.format("输入值必须大于{0}!"));

//小数验证
jQuery.validator.addMethod("validateNumber", function (value, element, param) {
    var decimal = '^\\d{1,' + param[0] + '}(\\.\\d{1,' + param[1] + '})?$';
    var reg = new RegExp(decimal);
    return this.optional(element) || reg.exec(value) != null;
}, "请输入整数位最长为{0} ,小数位最长为{1}的数字");

//时间比较:当前日期必须大于前一个日期
jQuery.validator.addMethod("compareDate", function (value, element, param) {
    var assigntime = jQuery(param).val();
    var deadlinetime = value;
    if (isnull(assigntime) && isnull(deadlinetime))return true;
    var reg = new RegExp('-', 'g');
    assigntime = assigntime.replace(reg, '/');//正则替换
    deadlinetime = deadlinetime.replace(reg, '/');
    assigntime = new Date(parseInt(Date.parse(assigntime), 10));
    deadlinetime = new Date(parseInt(Date.parse(deadlinetime), 10));
    return assigntime <= deadlinetime;
}, "当前日期必须大于前一个日期");

//验证手动填写时间框是否符合时间格式
jQuery.validator.addMethod("ymdDate", function (value, element, param) {
    var y = jQuery(param[0]).val();
    var m = jQuery(param[1]).val();
    var dateStr;
    if (y && m && value) {
        dateStr = y + "-" + m + "-" + value;
        if (!Date.parse(dateStr)) {
            return false;
        }
    } else if (y && m) {
        dateStr = y + "-" + m
        if (!Date.parse(dateStr)) {
            return false;
        }
    }
    return true;
}, "请填写正确时间");

//身份证号码验证
$.validator.addMethod("idCard", function(value, element) {
	return this.optional(element) || isIdCardNo(value);
}, "身份证号码格式错误!");

function isIdCardNo(num) {
    var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
    var parityBit = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");
    var varArray = new Array();
    var intValue;
    var lngProduct = 0;
    var intCheckDigit;
    var intStrLen = num.length;
    var idNumber = num;
    // initialize
    if ((intStrLen != 15) && (intStrLen != 18)) {
        return false;
    }
    // check and set value
    for (i = 0; i < intStrLen; i++) {
        varArray[i] = idNumber.charAt(i);
        if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
            return false;
        } else if (i < 17) {
            varArray[i] = varArray[i] * factorArr[i];
        }
    }
    if (intStrLen == 18) {
        //check date
        var date8 = idNumber.substring(6, 14);
        if (isDate8(date8) == false) {
            return false;
        }
        // calculate the sum of the products
        for (i = 0; i < 17; i++) {
            lngProduct = lngProduct + varArray[i];
        }
        // calculate the check digit
        intCheckDigit = parityBit[lngProduct % 11];
        // check last digit
        if (varArray[17] != intCheckDigit) {
            return false;
        }
    }
    else {        //length is 15
        //check date
        var date6 = idNumber.substring(6, 12);
        if (isDate6(date6) == false) {
            return false;
        }
    }
    return true;
}
function isDate6(sDate) {
    if (!/^[0-9]{6}$/.test(sDate)) {
        return false;
    }
    var year, month, day;
    year = sDate.substring(0, 4);
    month = sDate.substring(4, 6);
    if (year < 1700 || year > 2500) return false
    if (month < 1 || month > 12) return false
    return true
}

function isDate8(sDate) {
    if (!/^[0-9]{8}$/.test(sDate)) {
        return false;
    }
    var year, month, day;
    year = sDate.substring(0, 4);
    month = sDate.substring(4, 6);
    day = sDate.substring(6, 8);
    var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (year < 1700 || year > 2500) return false
    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
    if (month < 1 || month > 12) return false
    if (day < 1 || day > iaMonthDays[month - 1]) return false
    return true
}

//手机号验证
jQuery.validator.addMethod("mobile", function(value, element) {
	var length = value.length;
	return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/.test(value));
}, "手机号码格式错误!");

//验证几个字段中必填一个
jQuery.validator.addMethod("require_from_group", function (value, element, options) {
    var $fields = $(options[1], element.form),
        $fieldsFirst = $fields.eq(0),
        validator = $fieldsFirst.data("valid_req_grp") ? $fieldsFirst.data("valid_req_grp") : $.extend({}, this),
        isValid = $fields.filter(function () {
            return validator.elementValue(this);
        }).length >= options[0];

    // Store the cloned validator for future validation
    $fieldsFirst.data("valid_req_grp", validator);

    // If element isn't being validated, run each require_from_group field's validation rules
    if (!$(element).data("being_validated")) {
        $fields.data("being_validated", true);
        $fields.each(function () {
            validator.element(this);
        });
        $fields.data("being_validated", false);
    }
    return isValid;
}, $.validator.format("{0}"));