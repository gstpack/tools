/**
 * Created by xieyihao on 2016/9/2.
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var Cookie = require("s-cookie");

/**
 * @desc 链接数组对象里的某个属性,并返回一个数组，如 [{mis_doctor_id:123},{mis_doctor_id:3497}] 返回数组[123, 3497]
 * @param arr
 * @param prop
 * @returns {Array}
 */
function getArrProp(arr, prop) {
  var result = [];
  if (!arr) return result;
  for (var i = 0; i < arr.length; i++) {
    result.push(arr[i][prop]);
  }
  return result;
}
//按位与解析医生标签，返回Boolean值 sign: 十进制; num:移位的位数
function decodeSign(sign, num) {
  var _sign = sign & Math.pow(2, num);
  return _sign > 0;
}
//按位或返回医生标签值，返回number
function encodeSign(num) {
  return 0 | Math.pow(2, num);
}
//按位解析位和,返回array
function decodeSignList(signSum, map) {
  var result = [];
  Object.keys(map).forEach(function (item) {
    if (decodeSign(signSum, item)) {
      result.push(map[item]);
    }
  });
  return result;
}
//价格转换 digit:精确到小数点后多少位,不传精确到元, 传则精确到相关位, 最大4位
function convertPrice(price) {
  var digit = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var tarPrice = parseInt(price);
  if (price < 100) {
    return tarPrice.toFixed(digit);
  } else {
    return (tarPrice / 10000).toFixed(digit);
  }
}
//性别转换
function convertGender(genderCode) {
  switch (genderCode) {
    case '0':
      return '未填写';
      break;
    case '1':
      return '男';
      break;
    case '2':
      return '女';
      break;
    default:
      return '';
  }
}
/**
 * @description 时间转换,处理13位的时间戳(毫秒)
 * @param timeStamp 13位的时间戳(毫秒)
 * @param fmt 输出的时间格式 string 'yyyy-MM-dd hh:mm:ss'
 */
function convertTimeToStr(timeStamp) {
  var fmt = arguments.length <= 1 || arguments[1] === undefined ? 'yyyy-MM-dd hh:mm:ss' : arguments[1];

  var date = void 0,
      k = void 0,
      o = void 0,
      tmp = void 0;
  if (!timeStamp) {
    return false;
  }
  if (typeof timeStamp == 'string') {
    timeStamp = parseInt(timeStamp);
  }
  //如果是10位数,则乘以1000转换为毫秒
  if (timeStamp.toString().length == 10) {
    timeStamp = timeStamp * 1000;
  }
  date = new Date(timeStamp);
  o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        tmp = RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length);
        fmt = fmt.replace(RegExp.$1, tmp);
      }
    }
  }
  return fmt;
}
/**
 * @description 时间转换,将时间字符串转为时间戳
 * @param dateStr 日期字符串
 * @param isSecond 为true则输出10位时间戳(秒),默认为13位(毫秒)
 * @returns {number}
 */
function convertStrToStamp(dateStr) {
  var isSecond = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  if (!dateStr) {
    return '';
  }
  var date = new Date(dateStr);
  if (date.toString() == 'Invalid Date') {
    console.error('[convertStrToStamp]: 日期格式错误.');
  } else {
    return isSecond ? Math.round(date.getTime() / 1000) : date.getTime();
  }
}
/**
 * @description 参数处理,处理一个对象,剔除其中值为空的项,返回有值的项.用在发送参数的时候处理参数对象.
 * @param object 输入的参数对象
 * @returns {*}
 */
function handleParams(object) {
  if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') return false;
  var keys = Object.keys(object),
      res = {};
  if (keys.length) {
    keys.forEach(function (item) {
      if (object[item] && object[item] != '') {
        //目标参数value存在(不为null/undefined/false,或空字符串)
        res[item] = object[item];
      }
    });
  }
  return res;
}
/**
 * @description 本地存储包装器
 * @param type不传默认为 localStorage, 传 session 为 sessionStorage
 */
var storage = {
  checkWindow: function checkWindow() {
    if (!window) {
      console.warn("[Storage] === Storage can ONLY used in browser.");
      return false;
    }
    return true;
  },
  checkSupport: function checkSupport(type) {
    var winFlag = this.checkWindow();
    if (winFlag && window[type]) {
      return true;
    } else {
      console.warn('[Storage] === ' + type + ' Storage is NOT supported.');
      return false;
    }
  },
  checkType: function checkType(type) {
    if (type && type == 'session') {
      return 'sessionStorage';
    } else {
      return 'localStorage';
    }
  },
  setObj: function setObj(obj, type) {
    var _this = this;

    Object.keys(obj).forEach(function (item) {
      _this.set(item, obj[item], type);
    });
  },
  set: function set(key, value, type) {
    var target = this.checkType(type);
    if (this.checkSupport(target)) {
      return window[target].setItem(key, JSON.stringify(value));
    }
  },
  get: function get(key, type) {
    var target = this.checkType(type);
    if (this.checkSupport(target)) {
      if (window[target][key] && window[target][key] !== 'undefined') {
        return JSON.parse(window[target][key]);
      } else {
        return window[target][key];
      }
    }
  },
  removeArr: function removeArr(arr, type) {
    var _this2 = this;

    if (Array.isArray(arr) && arr.length) {
      arr.forEach(function (item) {
        _this2.remove(item, type);
      });
    } else {
      console.warn("[Storage] === Params must be an array.");
    }
  },
  remove: function remove(key, type) {
    var target = this.checkType(type);
    if (this.checkSupport(target)) {
      if (window[target][key] && window[target][key] !== 'undefined') {
        return window[target].removeItem(key);
      }
    }
  }
};
/**
  * @description 将对象转换为URL字符串,方便发送或存储
  * @param o 将要转为URL参数字符串的对象
  * @param key URL参数字符串的前缀
  * @param encode true/false 是否进行URL编码,默认为true
  * @return string URL参数字符串
 **/
function objToUrlString(o, key, encode) {
  if (o == null) return '';
  var fn = function fn(obj, key, encode) {
    var paramStr = '',
        t = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    if (t == 'string' || t == 'number' || t == 'boolean') {
      paramStr += '&' + key + '=' + (encode == null || encode ? encodeURIComponent(obj) : obj);
    } else {
      for (var i in obj) {
        var k = key == null ? i : key + (obj instanceof Array ? '[' + i + ']' : '.' + i);
        paramStr += fn(obj[i], k, encode);
      }
    }
    return paramStr;
  };
  var result = fn(o, key, encode);
  return result.substr(1);
}
/**
 * @description url字符串转换成对象
 * @param string
 * @returns {{}}
 */
function urlStringToObj(string) {
  'use strict';

  var params = {},
      q = string ? string : window.location.search.substring(1),
      e = q.split('&'),
      l = e.length,
      f,
      i = 0;
  for (i; i < l; i += 1) {
    f = e[i].split('=');
    params[f[0]] = decodeURIComponent(f[1]);
  }
  return params;
}

/**
 * @description 判断是否登录,没有登录则自动登录
 */
function isLogin() {
  var callBackUrl = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

  if (typeof window == "undefined") return;

  var _getUser = getUser();

  var user_id = _getUser.user_id; //获取用户id

  if (user_id) {
    return user_id;
  } else {
    goLogin(callBackUrl);
    return false;
  }
}

/**
 * @description 跳转去登录
 * @param tarUrl 跳转到登录并重定向的目标地址
 * @param clean 传true则会清理用户信息(调用cleanUser)后再去登录
 * @returns {*}
 */
function goLogin() {
  var tarUrl = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var clean = arguments[1];

  if (typeof window == "undefined") return;
  if (clean) {
    cleanUser();
  }
  if (tarUrl == '') {
    window.location.href = '/user/login';
  } else {
    window.location.href = '/user/login?ref=' + tarUrl;
  }
}

/**
 * @description 从cookie中取用户信息,返回用户对象
 * @returns {{user_id: (*|boolean), login_id: (*|boolean), open_id: (*|boolean), user_role: (*|boolean), cur_role: (*|boolean)}}
 */
function getUser() {
  return {
    user_id: _jsCookie2.default.get('user_id') || false,
    user_name: _jsCookie2.default.get('user_name') || false,
    login_account: _jsCookie2.default.get('login_account') || false,
    clinic_id: _jsCookie2.default.get('clinic_id') || false,
    clinic_name: _jsCookie2.default.get('clinic_name') || false,
    pharmacy_id: _jsCookie2.default.get('pharmacy_id') || false,
    pharmacy_name: _jsCookie2.default.get('pharmacy_name') || false,
    pharmacy_type: _jsCookie2.default.get('pharmacy_type') || false
  };
}
/**
 * @description 清理当前用户信息
 */
function cleanUser() {
  _jsCookie2.default.remove("user_id", { domain: '.gstzy.cn' });_jsCookie2.default.remove("user_id");
  _jsCookie2.default.remove("user_name", { domain: '.gstzy.cn' });_jsCookie2.default.remove("user_name");
  _jsCookie2.default.remove("login_account", { domain: '.gstzy.cn' });_jsCookie2.default.remove("login_account");
  _jsCookie2.default.remove("clinic_id", { domain: '.gstzy.cn' });_jsCookie2.default.remove("clinic_id");
  _jsCookie2.default.remove("clinic_name", { domain: '.gstzy.cn' });_jsCookie2.default.remove("clinic_name");
  _jsCookie2.default.remove("pharmacy_id", { domain: '.gstzy.cn' });_jsCookie2.default.remove("pharmacy_id");
  _jsCookie2.default.remove("pharmacy_name", { domain: '.gstzy.cn' });_jsCookie2.default.remove("pharmacy_name");
  _jsCookie2.default.remove("pharmacy_type", { domain: '.gstzy.cn' });_jsCookie2.default.remove("pharmacy_type");
  storage.removeArr(["user_id", "user_name", "login_account", "clinic_id", "clinic_name", "pharmacy_id", "pharmacy_name", "pharmacy_type"]);
}
/**
 * @desc 格式化一个对象为字符串如 name=pat&city_no=020&old=99;
 * @param data string
 **/
function parseParams(data) {
  if (data == null) {
    return '';
  }
  var list = [];
  for (var item in data) {
    list.push(item + '=' + data[item]);
  }
  return list.join("&");
}

/**
 * @desc 门店项目选项装换
 * @num 小于15的数字
 * @return object 是否为理疗、公医、医保、直营店。
 */
function hospitalOption() {
  var num = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  var binaryArray = [],
      dividend = num,
      opt = {
    "hasPhysicalTherapy": false, //理疗
    "isFreeMedicalService": false, //公医
    "hasMedicalInsurance": false, //医保
    "idDirectSaleStore": false //直营店
  };
  if (num > 15) {
    return opt;
  }
  //转换成二进制
  for (var i = 0; i < Math.ceil(num / 2); i++) {
    if (dividend != 1) {
      binaryArray.unshift(dividend % 2);
      dividend = parseInt(dividend / 2);
    } else {
      binaryArray.unshift(1);
      break;
    }
  }
  //转换成二进制后补全4位
  switch (binaryArray.length) {
    case 1:
      binaryArray = [0, 0, 0].concat(binaryArray);
      break;
    case 2:
      binaryArray = [0, 0].concat(binaryArray);
      break;
    case 3:
      binaryArray = [0].concat(binaryArray);
      break;
    default:
  }
  if (binaryArray[0] == 1) {
    opt["idDirectSaleStore"] = true;
  }
  if (binaryArray[1] == 1) {
    opt["hasMedicalInsurance"] = true;
  }
  if (binaryArray[2] == 1) {
    opt["isFreeMedicalService"] = true;
  }
  if (binaryArray[3] == 1) {
    opt["hasPhysicalTherapy"] = true;
  }
  return opt;
}

var Tools = {
  cookie: _jsCookie2.default,
  getArrProp: getArrProp,
  decodeSign: decodeSign,
  encodeSign: encodeSign,
  decodeSignList: decodeSignList,
  convertPrice: convertPrice,
  convertGender: convertGender,
  convertTimeToStr: convertTimeToStr,
  convertStrToStamp: convertStrToStamp,
  handleParams: handleParams,
  storage: storage,
  isLogin: isLogin,
  goLogin: goLogin,
  getUser: getUser,
  objToUrlString: objToUrlString,
  urlStringToObj: urlStringToObj,
  hospitalOption: hospitalOption
};

module.exports = {
  Tools: Tools,
  cookie: _jsCookie2.default,
  getArrProp: getArrProp,
  decodeSign: decodeSign,
  encodeSign: encodeSign,
  decodeSignList: decodeSignList,
  convertPrice: convertPrice,
  convertGender: convertGender,
  convertTimeToStr: convertTimeToStr,
  convertStrToStamp: convertStrToStamp,
  handleParams: handleParams,
  storage: storage,
  isLogin: isLogin,
  goLogin: goLogin,
  getUser: getUser,
  objToUrlString: objToUrlString,
  urlStringToObj: urlStringToObj,
  hospitalOption: hospitalOption
};