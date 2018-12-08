/**
 * Created by skye on 2016/1/15.
 *使用方式:$("#Id").inputSelect({zNodes:zTreeData,isMultiselect:false});
 *zNodes:必填参数，下拉树的数据
 *isMultiselect，可选参数，是否多选，默认值false
 *默认下拉树的每个节点的键值对是 dictCode，dictName ，父级元素的通过 dictPcode来定位，如需改变名字，对应传参即可，eg:$().inputSelect({setting.data.key:"",setting.data.simpleData:{idKey: "newIdKey",pIdKey: "newPidKey"}});
 *
 */
(function($){
    var inputSelect=function(element,options){
        /*默认参数，可对API开放，外部可传的参数*/
        var defaults={
            setting:{
                check: {         
                },
                view: {
                    dblClickExpand: false
                },
                data: {
                    key: {
                        name: "dictName"
                    },
                    simpleData: {
                        enable: true,
                        idKey: "dictCode",
                        pIdKey: "dictPcode",
                    }
                },
                callback: {
                    beforeClick: this.beforeClick,
                    onClick: this.selectClick
                }
            },
            initData : null
        };
        /*私有参数，组件内部使用，不对外开放，外部不可修改*/
        this._defaults={};
        /*合并所有参数*/
        this.options = $.extend(true, {}, defaults, options);
        var _this=this;
        this.element =$(element).selector;
        this.options.element=this.element;
        this.element=this.element.substring(1,this.element.length)
        this.containerSelect=this.element+'_treeDemo';
        this.menuContent=this.element+"_menuContent";

        _this.initDom();

        this.selectContainer=$("#"+this.containerSelect);
        if(this.options.isMultiselect){
            this.options.setting.callback.beforeClick=this.mulBeforeClick;
            this.options.setting.callback.onClick=null;
            this.options.setting.callback.onCheck=this.onCheck;
            this.options.setting.check.enable=true;
            this.options.setting.check.chkboxType={"Y":"", "N":""};
        }

        t = $.fn.zTree.init($(this.selectContainer), this.options.setting, this.options.zNodes);

        _this.bindEvent();

    }

    /*支持2次扩展的方法*/
    inputSelect.fn=inputSelect.prototype={
        /*初始化所需要的Dom结构*/
        initDom:function(){
            var $container = $('<div class="form-group" style:"position:relative;"></div>');
            $("#"+this.element).wrap($container);
            // 创建树
            var eleWidth=parseInt($("#"+this.element).width(), 10);
            var outPut='<div id="'+this.menuContent+'" class="menuContent" style="display:none; position: absolute;z-index:100;">'
                + '<ul id="'+ this.containerSelect+'" class="ztree" style="margin-top:0; width:'+eleWidth+'px"></ul>'
                +'</div>';
            $("#"+this.element).prop({readonly: 'readonly'});
            $("#"+this.element).after(outPut);

            // 创建选择和删除按钮
            this.$delBtn = $('<span class="glyphicon glyphicon-trash delBtn" style="position: absolute;right: 25px; top: 10px; cursor: pointer;display:none"></span>');
            $("#"+this.element).before(this.$delBtn).css("padding-right", "25px");
            if(this.options.initData) { // 有初始化数据
                $("#"+this.element).val(this.options.initData.value);
                $("#"+this.element).attr({
                    codeVal : this.options.initData.codeVal,
                    codeId : this.options.initData.codeId
                });
                this.$delBtn.show();
            }
        },

        /*input框绑定显示树的事件*/
        bindEvent:function(){
            var _this=this;
            $("#"+this.element).bind("click",function(){
                inputSelect.showMenu(_this);
            });
            $("#"+this.element).prev('span').on('click', function(event){
                $("#"+_this.element).val('');
                $("#"+_this.element).attr({
                    value: '',
                    codeval: '',
                    dictid: ''
                });
                $(this).hide();
            });

        },

        /*单选按钮*/
        beforeClick:function(treeId, treeNode) {
            var check = (treeNode); // && !treeNode.isParent
            if (!check) {
                layer.alert('请选择具体...',{title:'温馨提示：'});
            }
                
            return check;
        },

        /*单选选中事件*/
        selectClick:function(e, treeId, treeNode){
            var zTree = $.fn.zTree.getZTreeObj(treeId),
                nodes = zTree.getSelectedNodes(),
                v = "",
                codeV="",
                codeId="";
            var selCompare = function(a,b) {
                return a.id-b.id;
            };
            nodes.sort(selCompare);
            for (var i=0, l=nodes.length; i<l; i++) {
                v += nodes[i].dictName + ",";
                codeV+= nodes[i].dictCode + ",";
                codeId+= nodes[i].dictId + ",";
            }
            if (v.length > 0 ) v = v.substring(0, v.length-1);
            if (codeV.length > 0 ) codeV = codeV.substring(0, codeV.length-1);
            if (codeId.length > 0 ) codeId = codeId.substring(0, codeId.length-1);
            var element=treeId.substring(0,treeId.indexOf("_treeDemo"))
            var cityObj = $("#"+element);
            cityObj.val(v);
            cityObj.attr("value", v);
            cityObj.attr("codeVal", codeV);
            cityObj.attr("dictId", codeId);
            cityObj.prev('span').show();
            cityObj.next('.menuContent').fadeOut("fast");
        },

          /*多选，选中前事件*/
        mulBeforeClick:function(treeId, treeNode) {
            var check = (treeNode); // && !treeNode.isParent
            if (!check) {
                layer.alert('请选择具体...',{title:'温馨提示：'});
            }
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            zTree.checkNode(treeNode, !treeNode.checked, null, true);
            return false;
        },

        /*多选，选中事件*/
         onCheck:function(e, treeId, treeNode) {
             var zTree = $.fn.zTree.getZTreeObj(treeId),
                  nodes = zTree.getCheckedNodes(true),
                  v = "",
                  codeV="",
                  codeId="";
            for (var i=0, l=nodes.length; i<l; i++) {
                   v += nodes[i].dictName + ",";
                codeV+= nodes[i].dictCode + ",";
                codeId+= nodes[i].dictId + ",";
             }
            if (v.length > 0 ) v = v.substring(0, v.length-1);
             if (codeV.length > 0 ) codeV = codeV.substring(0, codeV.length-1);
             if (codeId.length > 0 ) codeId = codeId.substring(0, codeId.length-1);
             var element=treeId.substring(0,treeId.indexOf("_treeDemo"))
             var cityObj = $("#"+element);
             cityObj.attr("value", v);
             cityObj.attr("codeVal", codeV);
             cityObj.attr("dictId", codeId);
         },

        // 初始化数据方法
        initData: function(data) {
            var _this = this;
            if(!data) {
                data = {
                    value : '',
                    codeVal : '',
                    dictId : ''
                }
                $("#"+_this.element).prev('span').hide();
            } else {
                $("#"+_this.element).prev('span').show();
            }
            $("#"+_this.element).val(data.value);
            $("#"+_this.element).attr({
                value: data.value,
                codeval: data.codeVal,
                dictid: data.dictId
            });
        },

        // 获取数据的方法
        getData : function() {
            var _this = this;
            var $element = $("#"+_this.element);
            return {
                value : $element.attr('value'),
                codeVal : $element.attr('codeval'),
                dictId : $element.attr('dictId')
            }
        }

    }

    /*显示菜单*/
    inputSelect.showMenu=function(myThis){
        var _this=myThis;
        var selectedObj = $("#"+_this.element);
        var inputOffset = $("#"+_this.element).offset();
        $("#"+_this.menuContent).slideDown("fast");
        $("body").bind("mousedown",{myThis:_this}, inputSelect.onBodyDown);
    }

    /*隐藏菜单*/
    inputSelect.hideMenu=function(_this) {
        $("#"+_this.menuContent).fadeOut("fast");
        $("body").unbind("mousedown", _this.onBodyDown);
    }

    /*点击页面其他位置就隐藏树*/
    inputSelect.onBodyDown=function(options) {
        var _this=options.data.myThis;
        if (!(event.target.id === "menuBtn" || event.target.id === _this.menuContent || $(event.target).parents("#"+_this.menuContent).length>0)) {
            inputSelect.hideMenu(_this);
        }
    }

    $.fn.inputSelect=function(options){
        if($.data(this,"plugin_inputSelect")){
            $.data(this,"plugin_inputSelect",null)
        }
        return $.data(this, "plugin_inputSelect" , new inputSelect(this, options));
    }
})(jQuery);