/**
 * Created by LiYonglei on 2017/4/25.
 * 无限级联自定制左侧导航条
 * params:
 *    id:"id",数据的id
 *    cascadeKey:"children",级联子元素的键名
 *    ulCls:"leftMenu-ul",导航中的ul的class
 *    liCls:"leftMenu-li",导航中的li的class
 *    itemCls:"leftMenu-item",导航中的每节点的容器的class
 *    expandCls:"expand",被展开元素的class
 *    activeCls:"active",被选中元素的class
 *    datas: [],传入的数据
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
 *    setDatas(datas)
*              重新向组件中传入datas
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
        selectById:selectById
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
        expandCls:"expand",
        activeCls:"active",
        datas: [],
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
    function setDatas(datas) {
        params = this.data('leftMenu'),
        id=params.id,
        cascadeKey=params.cascadeKey,
        prevDatas=params.datas;
        _recursiveProcessing(datas,function(currentData){
            _recursiveProcessing(prevDatas,function(currentPrevData){
                if(currentData[id]===currentPrevData[id]){
                    currentData._active=currentPrevData._active||currentData._active;
                }
            },cascadeKey);
        },cascadeKey);
        params.datas = datas;
    }
    function select(currentData){
        params = this.data('leftMenu'),
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
        params = this.data('leftMenu'),
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
    function getSelected() {
        var $self = this,
            params = $self.data("leftMenu"),
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
    function _render() {
        var $self = this,
            params = $self.data("leftMenu"),
            datas=params.datas;
        $self.addClass("leftMenu").html(
            _recursiveGenerate.call($self,datas,-1,null)
        );
    }
    function _recursiveGenerate(currentDatas,level,upperData){
        var $self = this,
            params = $self.data("leftMenu"),
            datas = params.datas,
            cascadeKey=params.cascadeKey,
            ulCls=params.ulCls,
            liCls=params.liCls,
            itemCls=params.itemCls,
            expandCls=params.expandCls,
            activeCls=params.activeCls,
            formatter=params.formatter,
            onSelected=params.onSelected,
            rowEvents=params.rowEvents;
        return $("<ul/>",{
            "class":ulCls
        }).html(
            currentDatas.map(function(currentData,idx){
                if(!idx){
                    level++;
                }
                var option=Object.keys(rowEvents).reduce(function(result,key){
                    result[key]=rowEvents[key].bind($self,currentData,!(currentData[cascadeKey]||[]).length,!!currentData._active,_isActiveAncestor.call($self,currentData),level,idx,currentDatas,upperData,datas);
                    return result;
                },{
                    "class":function(){
                        var cls = liCls;
                        if(currentData._active){
                            cls+=" "+activeCls;
                        }else if(_isActiveAncestor.call($self,currentData)){
                            cls+=" "+expandCls;
                        }
                        return cls;
                    }
                });
                if(currentData._active){
                    onSelected.call($self,currentData,!(currentData[cascadeKey]||[]).length,!!currentData._active,_isActiveAncestor.call($self,currentData),level,idx,currentDatas,upperData,datas);
                }
                return $("<li/>",option)
                    .html([
                        $("<div/>",{
                            "class":itemCls
                        }).append(
                            formatter.call($self,currentData,!(currentData[cascadeKey]||[]).length,!!currentData._active,_isActiveAncestor.call($self,currentData),level,idx,currentDatas,upperData,datas)
                        ),
                        function(){
                            if((currentData[cascadeKey]||[]).length){
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