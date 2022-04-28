const operationUrl: any = {};

operationUrl.getUrlParame = (name: string, url?: string) => {
    //All URL
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r = url || window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};

operationUrl.getParame = (name: string, urlParam: any) => {
    //? the following URL
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const r = urlParam.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    } else {
        return null;
    }
};

operationUrl.updateQueryStringParameter = (uri: any, key: any, value: any) => {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        if (value) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri.replace(re, '$1' + key + '$2');
        }
    } else {
        if (value) {
            return uri + separator + key + "=" + value;
        } else {
            return uri + separator + key;
        }
    }
};

operationUrl.getUrl = (uri: any) => {
    if (!uri) { return; }
    /* const index = uri.lastIndexOf("\/");
    let url = uri.substring(index + 1, uri.length); */
    if (uri.indexOf("?") !== -1) {
        uri = uri.split("?")[0];
    }

    let url = uri.replace(/(^\s*)|(\s*$)/g, "");

    if (url.charAt(url.length - 1) === "\/") {
        url = url.substring(0, url.length - 1);
    }
    return url;
};

export default operationUrl;
