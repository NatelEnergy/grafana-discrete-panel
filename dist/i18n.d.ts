/**
 * 写入panel多语言文本
 * @param obj :{} 字段所在对象
 * @param label : string 字段名字
 * @param value  : string 值
 * @param lang : string 语言
 */
declare const setI18n: (obj: any, label: string, value: any, lang: string) => void;
/**
 * 获取panel多语言文本
 * @param obj : {}, 字段所属对象
 * @param label : string, 字段名字
 * @param lang : string, 语言
 */
declare const getI18n: (obj: any, label: string, lang: string) => any;
/**
 * 初始化所有国际化字段
 * @param obj : {}, 字段所属根对象，一般传this.panel
 * @param lang : string, 语言
 * @param depth : number, 对象递归的最深层级，默认4
 */
declare const initI18n: (obj: any, lang: string, depth?: number) => void;
/**
 * 初始化时判断字段如果未经国际化，则生成对应的国际化数据
 * @param obj 字段所属对象
 * @param label 字段名称
 * @param lang 语言
 */
declare const initAttrI18n: (obj: any, label: string, lang: string) => void;
declare const initAttrArrayI18n: (obj: any, labels: string[], lang: string) => void;
export { setI18n, getI18n, initI18n, initAttrI18n, initAttrArrayI18n };
