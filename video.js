window.onerror = function () {
    return true
}

window.onload = function () {
    this.setTimeout(check, 5000)
}

var paused = 0

function check() {

    var now = document.getElementsByClassName("currentTime")[0].innerHTML
    var total = document.getElementsByClassName("duration")[0].innerHTML
    // console.log(now, "=", total)
    if (now === total) {
        document.getElementsByClassName("tm_next_lesson")[0].click()
    }

    var boxes = document.getElementsByClassName("wrap_popboxes")
    if (boxes.length > 0) {
        var options = document.getElementsByClassName("answerOption")
        var frame = document.getElementById("tmDialog_iframe")
        if (document.getElementsByClassName("exam_correct").length > 0 || 
        (frame !==null && frame.contentWindow !== null && frame.contentWindow.document !== null && frame.contentWindow.document.getElementsByClassName("exam_correct").length > 0)) {
            document.getElementsByClassName("popbtn_cancel")[0].click()
        }

        if (options.length === 0 && frame !==null && frame.contentWindow !== null && frame.contentWindow.document !== null) {
            options = frame.contentWindow.document.getElementsByClassName("answerOption")
        }
        if (options.length > 0) {
            options[0].children[0].click()
            var corrects = document.getElementsByClassName("correctAnswer")
            if (corrects.length === 0 && frame !==null && frame.contentWindow !== null && frame.contentWindow.document !== null) {
                corrects = frame.contentWindow.document.getElementsByClassName("correctAnswer")
            }
            options[0].children[0].click()
            
            var ans = corrects[0].innerHTML
            for (let i = 0; i < ans.length; i++) {
                const c = ans[i];
                var index = c.charCodeAt() - "A".charCodeAt()
                options[index].children[0].click()
            }
        }
        // for (let i = 0; i < options.length; i++) {
        //     const op = options[i]
        //     op.children[0].click()
        //     if (document.getElementsByClassName("exam_correct").length > 0 || 
        //         (frame !== null && frame.contentWindow.document.getElementsByClassName("exam_correct").length > 0)) {
        //         break;
        //     }
        // }

    } else {
        if (paused != 2 && document.getElementsByClassName("playButton").length > 0) {
            paused++
        } else if (document.getElementsByClassName("playButton").length > 0) {
            document.getElementsByClassName("playButton")[0].click()
            paused = 0
        }
    }
    
    if (document.getElementById("j-assess-criteria_popup").style.display !== "none") {
        document.getElementsByClassName("j-popup-close")[0].click()
    }

    if (document.getElementsByClassName("speedBox")[0].style.backgroundImage.indexOf("1.5") < 0) {
        document.getElementsByClassName("speedTab15")[0].click()
    }

    this.setTimeout(check, 5000)
}