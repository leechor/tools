
console.log("start")

selectfile()

function selectfile() {

    var mo = new MutationObserver((records) => {
        for (const record of records) {
            for (const no of record.addedNodes) {
                if (no.innerText == undefined || no.innerText == "") {
                    continue;
                }

                if (no.innerText.indexOf(".pdf") != -1) {
                    no.querySelector("[node-type]").click()
                }
            }
        }
    })

    mo.observe(document.querySelector(".frame-all"), {
        childList: true,
        subtree: true
    });
}

