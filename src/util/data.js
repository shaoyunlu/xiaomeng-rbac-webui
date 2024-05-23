// 判断数据是否为空
export function isEmpty(obj ,withZero = false){

    if (obj == undefined){
        return true
    }
    else if(typeof obj == "string"){
        return !obj
    }
    else if(typeof obj == "object"){
        if (obj instanceof Array)
            return obj.length == 0
        else
            return !obj
    }else if(typeof obj == "number"){
      if (withZero){
          return obj == 0
      }
      return false
    }
}

/** 返回一个树形结构  */
export function tranListToTreeDate(listData, rootValue, idKey, pIdKey) {
    let list = Object.assign([], listData)
    const arr = []
    list.forEach(itemD => {
        let item = Object.assign({}, itemD)
        if (item[pIdKey] == rootValue) {
            const children = tranListToTreeDate(list, item[idKey], idKey, pIdKey)
            if (children.length) {
                item.hasChildren = true
                item.xmvIsExpand = true
                //item.isExpanded = true
                item.children = children
            }
            arr.push(item)
        }
    })
    return arr
}

/** 树形结构平铺为一维数组 */
export function flattenNodes(node){
    if (Array.isArray(node)){
        let arr = []
        node.forEach(tmp=>{
            arr.push(...flattenNodes(tmp))
        })
        return arr
    }else{
        let arr = [];
        function traverse(currentNode) {
            arr.push(currentNode);
            
            if (currentNode.children && currentNode.children.length) {
                currentNode.children.forEach(child => traverse(child));
            }
        }
        traverse(node);
        return arr;
    }
}

/** 深拷贝一个数组 */
export function deepClone(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    let clone;
    if (Array.isArray(obj)) {
      clone = [];
      for (let i = 0; i < obj.length; i++) {
        clone[i] = deepClone(obj[i]);
      }
    } else {
      clone = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clone[key] = deepClone(obj[key]);
        }
      }
    }
  
    return clone;
}

export function findNode(nestedArray, value ,type = 'value'){
    for (let item of nestedArray) {
      if (item[type] === value) {
        return item;
      }
  
      if (item.children && item.children.length > 0) {
        let found = findNode(item.children, value ,type);
        if (found) {
          return found;
        }
      }
    }
  
    return null;
  }