
console.log("start")

selectfile()

function selectfile() {
    console.log("start selectFile")
    sex_path = "div > div > div.resume-item__content > div.resume-item__basic > div.resume-item__basic-info > div > div.talent-basic-info__basic > span:nth-child(1)"
    activity_path = "div > div > div.resume-item__content > div.resume-item__basic > div.resume-item__basic-info > div > div.talent-basic-info__title > div > span"
    city_path = "div > div > div.resume-item__content > div.resume-item__basic > div.resume-item__basic-info > div > div.talent-basic-info__extra > span:nth-child(1)"
    is_read_path = "div > div"
    activity_statuses = ["talent-basic-info__state is-latest", "talent-basic-info__state is-today"]

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
                                || (!no.querySelector(activity_path) && activity_statuses.indexOf(no.querySelector(activity_path).className) < 0)
                                || no.querySelector(city_path).innerText != '西安') {
                                no.style.display = "none"
                            }
                        } else if (no.className == "recommend-item__inner is-read") {                            
                            no.parentNode.parentNode.style.display = "none"
                        }
                    }
                    break;
                case "childList": {
                    // console.log(no)
                    // if (no.querySelector() == "recommend-list__inner v-enter-to") {
                    //     // console.log(no)
                    //     if (no.querySelector(is_read_path).classList.contains("is-read")) {
                    //         no.parentNode.parentNode.style.display = "none"
                    //     }
                    // }
                    break;
                }
                case "subtree": { }
            }
        }
    })

    mo.observe(document.querySelector(".recommend-list"), {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
    });
}

