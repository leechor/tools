
console.log("start")

var items = []
current_url = window.location.href
if (current_url.indexOf("recommend") > 0) {
    console.log("start renCai")
    renCai()
} else if (current_url.indexOf("detail") > 0) {
    console.log("start jianli")
    jianli()

}

function renCai() {
    b_path = "div > div > div.resume-item__content > div.resume-item__basic"
    path = b_path + " > div.resume-item__basic-info > div >"

    basic_path = path + " div.talent-basic-info__basic"
    basic_info__title_path = path + " div.talent-basic-info__title"
    basic_info__extra = path + " div.talent-basic-info__extra"

    sex_path = basic_path + " > span:nth-child(1)"
    activity_path = basic_info__title_path + " > div > span"
    city_path = basic_info__extra + " > span:nth-child(1)"
    work_status_path = basic_path + " > span:nth-child(5)"
    is_read_path = "div > div"
    activity_statuses = ["talent-basic-info__state is-latest", "talent-basic-info__state is-today"]

    setInterval(function () {
        console.log("scroll down")
        window.scrollBy(0, document.body.scrollHeight)
    }, 4000)

    setInterval(function () {
        no = items.shift();
        if (!no) {
            return;
        }
        // console.log("click")
        // console.log(no.querySelector("div > div"))
        no.querySelector("div > div").click();
    }, 1000)

    var mo = new MutationObserver((records, observer) => {
        for (const record of records) {
            no = record.target

            switch (record.type) {
                case 'attributes':
                    if (record.attributeName) {
                        if (no.className == "recommend-list__inner v-enter-to") {
                            // if (no.querySelector(sex_path).innerText == "女"
                            //     || (no.querySelector(activity_path) && activity_statuses.indexOf(no.querySelector(activity_path).className) < 0)
                            //     || no.querySelector(city_path).innerText != '西安') {
                            //     no.style.display = "none"
                            // }                            
                        } else if (no.className == "recommend-list__inner v-enter") {
                            if (no.querySelector("div > div").querySelector("div").classList.contains("is-read")
                                || no.querySelector(sex_path).innerText == "女"
                                || no.querySelector(city_path).innerText != '西安'
                                || (!no.querySelector(activity_path) || activity_statuses.indexOf(no.querySelector(activity_path).className) < 0)
                                || (!no.querySelector(work_status_path) || no.querySelector(work_status_path).innerText != "正在找工作")) {
                                // no.style.display = "none" 
                                n = no.querySelector(basic_info__title_path + " > div.talent-basic-info__name > div.talent-basic-info__name--inner")
                                n.innerText = n.innerText + "不符合"
                                // console.log(no.querySelector("div > div").querySelector("div").classList.contains("is-read"))                                                   
                                // console.log(no.querySelector(sex_path).innerText)
                                // console.log(no.querySelector(city_path).innerText)
                                // console.log((!no.querySelector(activity_path) || activity_statuses.indexOf(no.querySelector(activity_path).className) < 0))
                                // console.log((!no.querySelector(work_status_path) || no.querySelector(work_status_path).innerText != "正在找工作"))                                
                            } else {
                                if (items.indexOf(no) < 0) {
                                    items.push(no)
                                    n = no.querySelector(basic_info__title_path + " > div.talent-basic-info__name > div.talent-basic-info__name--inner")
                                    console.log(n.innerText)
                                }
                            }
                        } else if (no.className == "recommend-item__inner is-read") {
                            // console.log(no)
                            // no.parentNode.parentNode.style.display = "none"
                        }
                    }
                    break;
                case "childList": {
                    // for (const no of record.addedNodes) {
                    //     console.log(no.className)
                    // }
                    break;
                }
                case "subtree": { }
            }
        }
    })

    mo.observe(document.querySelector(".recommend-list"), {
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
    });
}

function jianli() {
    e = "#root > div.app-main > div.app-main__content > div.resume-detail-container > div > div.resume-sidebar.no-print > div > div.resume-sidebar__main > div.resume-sidebar__actions.is-operate > a"
    if(document.querySelector(e + " > div > span").innerText == "收藏") {
        document.querySelector(e).click()
    }    
    window.close();
}