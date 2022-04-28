const isEffective = (target: any) => {
  return target !== undefined && target !== null;
};

const isObject = (target: any) =>
  Object.prototype.toString.call(target) === '[object Object]';

const isObjectOrArray = (target: any) => {
  return Object.prototype.toString.call(target) === '[object Array]' || isObject(target);
};

/**
 * 写入panel多语言文本
 * @param obj :{} 字段所在对象
 * @param label : string 字段名字
 * @param value  : string 值
 * @param lang : string 语言
 */
const setI18n = (obj: any, label: string, value: any, lang: string) => {
  if (lang && isObject(obj)) {
    if (!obj.i18n) {
      obj.i18n = {};
    }
    if (!obj.i18n[lang]) {
      obj.i18n[lang] = {};
    }
    obj.i18n[lang][label] = value;
  }
};

/**
 * 获取panel多语言文本
 * @param obj : {}, 字段所属对象
 * @param label : string, 字段名字
 * @param lang : string, 语言
 */
const getI18n = (obj: any, label: string, lang: string) => {
  if (
    lang &&
    isObject(obj) &&
    isObject(obj.i18n) &&
    isObject(obj.i18n[lang]) &&
    obj.i18n[lang].hasOwnProperty(label)
  ) {
    return obj.i18n[lang][label];
  }
  return isEffective(obj[label]) ? obj[label] : '';
};

/**
 * 初始化所有国际化字段
 * @param obj : {}, 字段所属根对象，一般传this.panel
 * @param lang : string, 语言
 * @param depth : number, 对象递归的最深层级，默认4
 */
const initI18n = (obj: any, lang: string, depth = 4) => {
  if (!isObjectOrArray(obj) || !lang) {
    return;
  }
  for (const key in obj) {
    if (typeof obj.hasOwnProperty === 'function' && obj.hasOwnProperty(key)) {
      if (key === 'i18n' && isObjectOrArray(obj[key])) {
        if (isObjectOrArray(obj[key][lang])) {
          for (const attr in obj[key][lang]) {
            if (obj[key][lang].hasOwnProperty(attr)) {
              obj[attr] = obj[key][lang][attr];
            }
          }
        }
      } else if (isObjectOrArray(obj[key])) {
        if (depth > 0) {
          initI18n(obj[key], lang, --depth);
          ++depth;
        }
      }
    }
  }
};

/**
 * 初始化时判断字段如果未经国际化，则生成对应的国际化数据
 * @param obj 字段所属对象
 * @param label 字段名称
 * @param lang 语言
 */
const initAttrI18n = (obj: any, label: string, lang: string) => {
  if (isObject(obj) && lang) {
    if (!obj.hasOwnProperty('i18n')) {
      obj.i18n = {};
      obj.i18n[lang] = {};
      obj.i18n[lang][label] = obj[label];
    } else {
      if (!isEffective(obj.i18n[lang])) {
        obj.i18n[lang] = {};
        obj.i18n[lang][label] = obj[label];
      } else {
        if (!isEffective(obj.i18n[lang][label])) {
          obj.i18n[lang][label] = obj[label];
        }
      }
    }
  }
};

const initAttrArrayI18n = (obj: any, labels: string[], lang: string) => {
  if (Array.isArray(labels)) {
    labels.forEach((label: string) => {
      initAttrI18n(obj, label, lang);
    });
  }
};

export {setI18n, getI18n, initI18n, initAttrI18n, initAttrArrayI18n};
