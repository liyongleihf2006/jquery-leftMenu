/**
 * Created by LiYonglei on 2017/4/25.
 * 无限级联自定制左侧导航条
 * params:
 *    id:"id",数据的id
 *    cascadeKey:"children",级联子元素的键名
 *    ulCls:"leftMenu-ul",导航中的ul的class
 *    liCls:"leftMenu-li",导航中的li的class
 *    itemCls:"leftMenu-item",导航中的每节点的容器的class
 *    expandCaretCls:"expandCaret",折叠控件的class
 *    expandCls:"expand",被展开元素的class
 *    activeCls:"active",被选中元素的class
 *    datas: [],传入的数据
 *    expandFormatter:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas){打开关闭的样式
 *           if(isExpand){
 *              return "-";
 *           }
 *           return "+";
 *    },
 *    formatter:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas)
 *             定制每个展示节点的格式函数,返回生成的节点
 *                  this是调用该插件的jquery对象
 *                  currentData当前的数据
 *                  isLeaf是否是叶子节点
 *                  isActive是否是选中的数据
 *                  isExpand是否是被展开的节点
 *                  level当前节点所在的层级
 *                  idx当前数据在同组数据中的位置
 *                  currentDatas当前数据所在的组数据
 *                  upperData当前数据的父数据
 *                  datas传入插件的所有的数据
 *    onSelected:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas)
 *             节点被选中事件
 *                  注入的参数同formatter
 *    rowEvents: {}
 *             以键值对的形式传入事件,跟jquery的事件绑定相同,如
 *             rowEvents:{click:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas,event)}
 *                  注入的参数同formatter
 *                  event是事件对象,同jquery的事件对象
 * methods:
 *    refresh()刷新
 *    setDatas(datas,reset)
 *              重新向组件中传入datas
 *              datas 重新传入的数据
 *              reset:boolean,default:false,是否重置数据;当不设置或为false的时候，不重置数据，这就意味着原来的插件数据中有数据跟新插入的数据的id值是相同的，那么新的值将继承原来的数据的状态；
 *                                          当设置为true的时候；不会继承原来数据的状态。
 *                                          所谓的状态只的是每条数据的以"_"开头的属性，比如实际上被选中的节点的_active=true,被打开的节点的_expand=true,在使用的时候也可以自定义状态属性,只要以"_"开始即可
 *    select(data)
 *             选中传入的数据对应的节点
 *    selectById(id)
 *             根据传入的id选中对应的节点
 *    getSelected
 *             获取当前被选中的节点的数据
 */
(function ($) {
    if ($.fn.leftMenu) {
        return;
    }
    var setMethods = {
        setDatas: setDatas,
        select:select,
        selectById:selectById,
        refresh:refresh
    };
    var getMethods = {
        getSelected: getSelected
    };
    $.fn.leftMenu = function () {
        var args = arguments, params, method;
        if (!args.length || typeof args[0] == 'object') {
            return this.each(function (idx) {
                var $self = $(this);
                $self.data('leftMenu', $.extend(true, {}, $.fn.leftMenu.default, args[0]));
                params = $self.data('leftMenu');
                _init.call($self, params);
                _render.call($self);
            });
        } else {
            if (!$(this).data('leftMenu')) {
                throw new Error('You has not init leftMenu!');
            }
            params = Array.prototype.slice.call(args, 1);
            if (setMethods.hasOwnProperty(args[0])) {
                method = setMethods[args[0]];
                return this.each(function (idx) {
                    var $self = $(this);
                    method.apply($self, params);
                    _render.call($self);
                });
            } else if (getMethods.hasOwnProperty(args[0])) {
                method = getMethods[args[0]];
                return method.apply(this, params);
            } else {
                throw new Error('There is no such method');
            }
        }
    };
    $.fn.leftMenu.default = {
        id:"id",
        cascadeKey:"children",
        ulCls:"leftMenu-ul",
        liCls:"leftMenu-li",
        itemCls:"leftMenu-item",
        expandCaretCls:"expandCaret",
        expandCls:"expand",
        activeCls:"active",
        datas: [],
        showExpand:true,
        expandFormatter:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas){
            if(isExpand){
                return "-";
            }
            return "+";
        },
        formatter:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas){
            return $("<span/>",{
                "text":currentData.text
            })
        },
        onSelected:function(currentData,isLeaf,isActive,isExpand,level,idx,currentDatas,upperData,datas){},
        rowEvents: {}
    };
    function _init(params) {
        return this;
    }
    function setDatas(datas,reset) {
        var params = this.data('leftMenu'),
        id=params.id,
        cascadeKey=params.cascadeKey,
        prevDatas=params.datas;
        if(!reset){
            _recursiveProcessing(datas,function(currentData){
                _recursiveProcessing(prevDatas,function(currentPrevData){
                    if(currentData[id]===currentPrevData[id]){
                        Object.keys(currentPrevData).forEach(function(key){
                           if(key.charAt(0)==="_"){
                               currentData[key]=currentPrevData[key]||currentData[key];
                           }
                        });
                    }
                },cascadeKey);
            },cascadeKey);
        }
        params.datas = datas;
    }
    function select(currentData){
        var params = this.data('leftMenu'),
            datas=params.datas,
            cascadeKey=params.cascadeKey,
            id=params.id;
        changeActive(datas);
        function changeActive(datas){
            datas.forEach(function(data){
                data._active=currentData[id]==data[id]?true:false;
                if(data[cascadeKey]){
                    changeActive(data[cascadeKey])
                }
            });
        }
    }
    function selectById(idx){
        var params = this.data('leftMenu'),
            datas=params.datas,
            cascadeKey=params.cascadeKey,
            id=params.id;
        changeActive(datas);
        function changeActive(datas){
            datas.forEach(function(data){
                data._active=idx==data[id]?true:false;
                if(data[cascadeKey]){
                    changeActive(data[cascadeKey])
                }
            });
        }
    }
    function refresh(){}
    function getSelected() {
        var params = this.data("leftMenu"),
            datas=params.datas,
            cascadeKey=params.cascadeKey,
            currentData=null;
        _getSelected(datas);
        return currentData;
        function _getSelected(datas){
            (datas||[]).forEach(function(data){
                if(data._active){
                    currentData=data;
                }else{
                    _getSelected(data[cascadeKey]);
                }
            })
        }
    }
    function _render(doExpand) {
        var $self = this,
            params = $self.data("leftMenu"),
            datas=params.datas,
            showExpand=params.showExpand;
        $self.addClass(function(){
            return "leftMenu"+(showExpand?" showExpand":"");
        }).html(
            _recursiveGenerate.call($self,datas,-1,null,doExpand)
        );
    }
    function _recursiveGenerate(currentDatas,level,upperData,doExpand){
        var $self = this,
            params = $self.data("leftMenu"),
            datas = params.datas,
            cascadeKey=params.cascadeKey,
            ulCls=params.ulCls,
            liCls=params.liCls,
            itemCls=params.itemCls,
            expandCaretCls=params.expandCaretCls,
            expandCls=params.expandCls,
            activeCls=params.activeCls,
            formatter=params.formatter,
            onSelected=params.onSelected,
            rowEvents=params.rowEvents,
            showExpand=params.showExpand,
            expandFormatter=params.expandFormatter;
        return $("<ul/>",{
            "class":ulCls
        }).html(
            currentDatas.map(function(currentData,idx){
                if(!idx){
                    level++;
                }
                var isLeaf=!(currentData[cascadeKey]||[]).length,
                isExpand=function(){
                    if(!showExpand){
                        return _isActiveAncestor.call($self,currentData);
                    }else{
                        return !!currentData._expand;
                    }
                }();
                if(currentData._active&&!doExpand){
                    onSelected.call($self,currentData,isLeaf,!!currentData._active,isExpand,level,idx,currentDatas,upperData,datas);
                }
                return $("<li/>",{
                        "class":function(){
                            var cls = liCls;
                            if(currentData._active){
                                cls+=" "+activeCls;
                            }
                            if(!showExpand){
                                if(_isActiveAncestor.call($self,currentData)){
                                    cls+=" "+expandCls;
                                }
                            }else{
                                if(currentData._expand){
                                    cls+=" "+expandCls;
                                }
                            }
                            return cls;
                        }
                    })
                    .html([
                        $("<div/>",{
                            "class":itemCls
                        }).append(
                            function(){
                                if(showExpand){
                                    if(!isLeaf){
                                        return $("<span/>",{
                                            "class":expandCaretCls,
                                            "click":function(){
                                                currentData._expand=!currentData._expand;
                                                _render.call($self,true);
                                            }
                                        }).append(
                                            expandFormatter.call($self,currentData,isLeaf,!!currentData._active,isExpand,level,idx,currentDatas,upperData,datas)
                                        )
                                    }
                                }
                            }(),
                            function(){
                                var content= formatter.call($self,currentData,isLeaf,!!currentData._active,isExpand,level,idx,currentDatas,upperData,datas);
                                var events=Object.keys(rowEvents).reduce(function(result,key){
                                    result[key]=rowEvents[key].bind($self,currentData,isLeaf,!!currentData._active,isExpand,level,idx,currentDatas,upperData,datas);
                                    return result;
                                },{});
                                $.each(content,function(idx,ele){
                                    $(ele).on(events);
                                });
                                return content;
                            }()
                        ),
                        function(){
                            if(!isLeaf){
                                return _recursiveGenerate.call($self,currentData[cascadeKey],level,currentData,upperData);
                            }
                        }()
                    ])
            })
        )
    }
    function _isActiveAncestor(data){
        var $self = this,
            params = $self.data("leftMenu"),
            cascadeKey=params.cascadeKey,
            isActiveAncestorStatus=false;
        var datas=data[cascadeKey];
        if(!datas){
            return isActiveAncestorStatus;
        }
        isActiveAncestor(datas);
        return isActiveAncestorStatus;
        function isActiveAncestor(datas){
            datas.forEach(function(data){
                if(data._active){
                    isActiveAncestorStatus=true;
                }else{
                    isActiveAncestor(data[cascadeKey]||[]);
                }
            })
        }
    }
    function _recursiveProcessing(datas,handler,lowerLevelKey){
        lowerLevelKey=lowerLevelKey||"children";
        recursive(datas,null,-1);
        function recursive(currentDatas,upperData,level){
            currentDatas.forEach(function(currentData,idx){
                if(!idx){level++};
                handler(currentData,level,idx,currentDatas,upperData,datas);
                var lowerDatas=currentData[lowerLevelKey];
                if(lowerDatas&&lowerDatas instanceof Array){
                    recursive(lowerDatas,currentData,level);
                }
            });
        }
    };
})(jQuery);