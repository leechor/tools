let $response = {
    body: "{}"
}

let $request = {
    url: "shaanxi/getSxNucListNew"
}

const $done = (any) => {
    return any;
}

////////////////////////////////////////////////

const lastRecordCollectTime = new Date("2022-11-05 07:21:03");
const delLastRecordTime = new Date("2022-11-05 15:01:03");
const todayCollectTime = new Date("2022-11-06 07:21:03");
const timeFormatFirst = 'yyyy/MM/dd hh:mm:ss';
const timeFormatSecond = 'yyyy-MM-dd hh:mm:ss';

const personName = "孙*超";
const detOrg = "西安华曦医学检验实验室";
const cardNum = "2***************32";

const isXian = (url) => {
    return url.indexOf("shaanxi") != -1;
};

function dateFormat(date, fmt) {
    let ret;
    const opt = {
        "y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "h+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

const createNucP = (detTime, collectTime, format) => {
    const tem = `{
        "detTime": "${dateFormat(detTime, format)}",
        "collectTime":"${dateFormat(collectTime, format)}",
        "detOrg":"${detOrg}",
        "detResult":"1",
        "name":"${personName}",
        "cardNum":"${cardNum}",
        "relation":"1",
        "currentTime":"${dateFormat(new Date(), format)}"
    }`;
    return JSON.parse(tem);
}

const createNuc = () => {
    const tem = createNucP(delLastRecordTime, lastRecordCollectTime, timeFormatFirst);
    return tem;
}

const createResultSuc = (data) => {
    const r = {
        "msg": "结果获取成功",
        "code": "0",
        "data": null
    };

    r["data"] = data;
    return r;
}

const getRecentNuc = () => {
    const tem = createResultSuc(createNuc());
    tem["data"]["todayCollectTime"] = `${dateFormat(todayCollectTime, timeFormatFirst)}`;
    return tem;
};

const windowOpen = () => {
    const tem = createResultSuc();
    return tem;
}

const getNucCollect = () => {
    const tem = createResultSuc(createNucP(delLastRecordTime, lastRecordCollectTime, timeFormatFirst));
    return tem;
}

const getSxNucListNew = () => {
    const nucList = {};
    nucList["nucList"] = [];

    for (let i = 0; i < 9; i++) {
        delLastRecordTime.setDate(delLastRecordTime.getDate() - i);
        lastRecordCollectTime.setDate(lastRecordCollectTime.getDate() - i);
        const nuc = createNucP(delLastRecordTime, lastRecordCollectTime, timeFormatsecond);
        nucList["nucList"].push(nuc);
    }

    const tem = createResultSuc();
    tem["data"] = nucList;
    return tem;
}

const createResult = (value) => {
    if (value == null) {
        return {};
    }
    return { body: JSON.stringify(value) };
};

let body = JSON.parse($response.body);

const url = $request.url;

let result = {};
if (isXian(url)) {
    result = url;
    if (url.indexOf("getSxNucListNew") != -1) {
        result = getSxNucListNew();
    } else if (url.indexOf("getNucCollect") != -1) {
        result = getNucCollect();
    } else if (url.indexOf("getRecentNuc") != -1) {
        result = getRecentNuc();
    } else if (url.indexOf("window/open") != -1) {
        result = windowOpen();
    }
    else {
        result = null;
    }
};
$done(createResult(result));
// result = JSON.stringify(result);
console.log(result);
