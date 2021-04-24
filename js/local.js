// ==UserScript==
// @name         hospital
// @namespace    http://licho.net/
// @version      0.1
// @description  hospital
// @author       licho
// @match        https://webapp.cmu1h.com/*
// @grant        none
// @require      file:///Users/sunlichao/project/code/tools/js/local.js
// @run-at document-body
// ==/UserScript==

console.log("start")
const continuationKey = "_my_script_continuation_key";

// Check continuation
const continuationActions = {
    "payConfirm": payConfirm
};

const _continuation = sessionStorage.getItem(continuationKey);
if (_continuation) {
    sessionStorage.removeItem(continuationKey);
    const action = continuationActions[_continuation]
    console.log(action)
    if (action) { action(); }
} else {
    sessionStorage.removeItem(continuationKey)
    selectOrder()

    setInterval(function () {

        const days = getDoctorWorkDay()
        console.log(days)
        for (let index = 0; index < days.length; index++) {
            const i = ((index + 1) + days.length) % days.length
            if (days[i].querySelector("p.mt5.f10.font-blue").innerText == "有号") {
                days[index].click()
                days[i].click()
                break;
            }

        }
    }, 2000)

}

function throttle(fn, delay) {
    var timer;
    return function () {
        var _this = this;
        if (timer) {
            return;
        }
        timer = setTimeout(function () {
            fn.apply(_this, arguments);
            timer = null; // 在delay后执行完fn之后清空timer，此时timer为假，throttle触发可以进入计时器
        }, delay)
    }
}

function selectOrder() {
    window.addEventListener('load', function () {
        const _continuation = sessionStorage.getItem(continuationKey);
        if (_continuation) {
            sessionStorage.removeItem(continuationKey);
        }
        for (const wd of getDoctorWorkDay()) {
            var mo = new MutationObserver((records) => {
                // console.log('Previous attribute value: ' + record[0].type);

                for (const record of records) {
                    for (const no of record.addedNodes) {
                        if (no.isEqualNode(document.querySelector("#one_schedule > div.weui-panel.mt5"))) {
                            for (const d of no.querySelectorAll("div > div > div > a.open-popup")) {
                                d.click()
                                break;
                            }
                        }

                        if (no.isEqualNode(document.querySelector("#time_list > p:nth-child(1)"))) {
                            no.click()
                            const ok = document.querySelector("#half > div.weui-popup__modal.pt0 > div > div.weui-form-preview > div > button")
                            ok.click()
                            sessionStorage.setItem(continuationKey, "payConfirm");
                            break;
                        }
                    }
                }
            })


            mo.observe(document.querySelector("#one_schedule"), {
                childList: true,
                subtree: true
            });
        }
    }, false);
}

function payConfirm() {
    window.addEventListener('load', function () {
        var mo = new MutationObserver((records) => {
            for (const record of records) {
                console.log(record.target.style["display"])
                if (record.attributeName == "style" && record.target.style["display"] == "") {
                    document.querySelector("#submitPay").click()
                    pushMessageQQ(new Date().toLocaleString() + "准备付款")
                }
            }
        })

        mo.observe(document.querySelector("#submitPay"), {
            attributes: true
        })

        document.querySelector("#chooseCard").click()
        // console.log(document.querySelector("#chooseCard")) 
    })
}


function pushMessageQQ(message) {
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://qmsg.zendee.cn/send/682c940385a570499044d144c01d1199?msg=" + message,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        },
        msg: "message",
        onload: function (response) {
            console.log("请求成功");
            console.log(response.responseText);
        },
        onerror: function (response) {
            console.log("请求失败");
        }

    })
}

function pushMessageWeixin(message) {
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://sctapi.ftqq.com/SCT27465TNbCSzkpKq98WpbY4dasMxERb.send?title=message",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        },
        data: "content=" + message,
        onload: function (response) {
            console.log("请求成功");
            console.log(response.responseText);
        },
        onerror: function (response) {
            console.log("请求失败");
        }

    })
}

function getDoctorWorkDay() {
    let days = document.querySelector("#dummybodyid > div.bgw.pt10").children
    return days
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


