const {ipcRenderer} = require('electron')

let obj //= PlayerStarter.playerArray[0]
let ori_onPause //= obj.callback.onPause
let ori_onPlay //= obj.callback.onPlay
let ori_onReady //= obj.callback.onReady
let ori_onComplete //= obj.callback.onComplete
// -1: not ready
// 0: ready
// 1: pause
// 2: play
// 3: pause(complete)
// 4: play(complete)
let video_status = -1
let retry = 0
let option_retry = -1;
let long_pause = null
let progress = 'null'
let iscycle = null

console.log('Injected')

window.addEventListener('error', function (msg, url, line) {
    if (typeof(url) === 'undefined') {
        // window,location.reload()
    }
    return false
})

function get_obj() {
    if (PlayerStarter.playerArray.length > 0) {
        obj = PlayerStarter.playerArray[0]
        ori_onPause = obj.callback.onPause
        ori_onPlay = obj.callback.onPlay
        ori_onReady = obj.callback.onReady
        ori_onComplete = obj.callback.onComplete

        obj.callback.onReady = function () {
            try {
                ready_bind()
                ori_onReady()
            } catch (e) {
                console.log(e)
            }
        }
        obj.callback.onPlay = function () {
            try {
                play_bind()
                ori_onPlay()
            } catch (e) {
                console.log(e)
            }
        }
        obj.callback.onPause = function () {
            try {
                pause_bind()
                ori_onPause()
            } catch (e) {
                console.log(e)
            }
        }
        obj.callback.onComplete = function () {
            try {
                complete_bind()
                ori_onComplete()
            } catch (e) {
                console.log(e)
            }
        }
        if (long_pause) {
            clearTimeout(long_pause)
            long_pause = null
        }
    } else {
        setTimeout(get_obj, 500)
    }
}

function get_progress() {
    try {
        let text = $('.progressbar_box_tip span').text()
        if (text == null) {
            console.log('get progress failed')
            progress = 'null'
        } if (text == '历史累计观看时间,给力加载中') {
            progress = '-1'
        } else {
            progress = text.replace('本节视频,累计观看时间『','').replace('』','').replace('%','')
        }
    } catch (e) {
        console.log('get progress failed')
        progress = 'null'
    }
}

function cycle() {
    console.log('Cycle')
    try {
        if (video_status >= 0 && obj.player.playbackRate() < 1.5) {
            setTimeout(function () {
                $('.speedTab15').click()
            }, 1000)
            console.log('Set speed 1.5')
        }
    } catch {
        console.log('Reget_obj')
        get_obj()
    }
    get_progress()
    // if (video_status >= 0 && (video_status < 3 || retry) && progress == '100') {
    //     obj.callback.onComplete()
    // }
}

function ready_bind() {
    console.log('Ready')
    video_status = 0
    retry = 0
    if (long_pause) {
        clearTimeout(long_pause)
        long_pause = null
    }
    if (iscycle == null) {
        iscycle = setInterval(cycle, 3000)
    }
}

function play_bind() {
    console.log('Play')
    video_status = video_status >= 3 ? 4 : 2
    if (long_pause) {
        clearTimeout(long_pause)
        long_pause = null
    }
}

function pause_bind() {
    console.log('Pause')
    video_status = video_status >=3 ? 3 : 1
    if ($('.wrap_popboxes').length > 0) {
        console.log('Popup!')
        const check_option = function () {
            ++option_retry
            if (option_retry < 5 && $(window.frames["tmDialog_iframe"].contentDocument).find('.answerOption').length === 0) {
                console.log('No options found!' + option_retry)
                setTimeout(check_option, 500)
            } else {
                option_retry = -1
                let ansa = []
                let i = 0
                $(window.frames["tmDialog_iframe"].contentDocument).find('.answerOption').each(function () {
                    // let type = $(this).attr('_type')
                    let input = $(this).find('input')
                    let ans = input.attr('_correctanswer')
                    ansa[i++] = ans
                    // console.log('Option ' + input.val() + ' choose ' + ans)
                    // if(type == 'radio') {
                    //     if(ans == 1) {
                    //         input.click()
                    //     }
                    // } else {
                    //     input.attr('checked', ans == 1 ? true : false)
                    // }
                })
                let click_option = function (i) {
                    let ans_option = $(window.frames["tmDialog_iframe"].contentDocument).find('.answerOption')
                    if (i < ans_option.length) {
                        let type = $(ans_option[i]).attr('_type')                    
                        let input = $(ans_option[i]).find('input')
                        console.log('Option ' + input.val() + ' choose ' + ansa[i])
                        if(type == 'radio') {
                            if(ansa[i] == 1) {
                                input.click()
                            }
                        } else {
                            if(ansa[i] == 1 && !input.attr('checked')) {
                                input.click()
                            }
                            // input.attr('checked', ansa[i] == 1 ? true : false)
                        }
                        setTimeout(() => {
                            click_option(i + 1)
                        }, 500)
                    } else {
                        setTimeout(function () {
                            $('.popbtn_cancel').click()
                            console.log('Popup Cancel')
                        }, 1000)
                    }
                }
                setTimeout(() => {
                    click_option(0)
                }, 1000)
            }
        }
        check_option()
    } else {
        long_pause = setTimeout(function () {
            ipcRenderer.send('shownotice', 'Notice', 'Pasued 20 seconds', true)
            long_pause = null
        }, 20000);
    }
}

function complete_bind() {
    console.log('Complete')
    video_status = video_status >=3 ? video_status : video_status + 2

    get_progress()

    if (progress == 'null') {
        setTimeout(complete_bind, 1000)
        console.log('progress is null')
    } if (progress == '-1') {
        setTimeout(complete_bind, 1000)
        console.log('progress is loading')
    } else {
        console.log('Complete ' + progress)

        if (progress == '100') {
            if ($('.tm_next_lesson').css('display') === 'none') {
                ipcRenderer.send('shownotice', 'Finish', 'Finished!', true)
            } else if (video_status >= 3) {
                console.log('Play next')
                clearInterval(iscycle)
                iscycle = null
                retry = 0
                obj.callback.playerNext()
                video_status = -1
                setTimeout(get_obj, 1000)
            }
        } else {
            console.log('Not complete, retry')
            retry = 1
            obj.player.play()
        }
    }

    if (long_pause) {
        clearTimeout(long_pause)
        long_pause = null
    }
}


$(get_obj)
