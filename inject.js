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
let retry = -1
let option_retry = -1;
let long_pause = null

console.log(global.notice)
console.log('Injected')

function get_obj() {
    if (PlayerStarter.playerArray.length > 0) {
        obj = PlayerStarter.playerArray[0]
        ori_onPause = obj.callback.onPause
        ori_onPlay = obj.callback.onPlay
        ori_onReady = obj.callback.onReady
        ori_onComplete = obj.callback.onComplete

        obj.callback.onReady = function () {
            ready_bind()
            ori_onReady()
        }
        obj.callback.onPlay = function () {
            play_bind()
            ori_onPlay()
        }
        obj.callback.onPause = function () {
            pause_bind()
            ori_onPause()
        }
        obj.callback.onComplete = function () {
            complete_bind()
            ori_onComplete()
        }
    } else {
        setTimeout(get_obj, 500)
    }
}

function ready_bind() {
    video_status = 0
    retry = -1
    if (long_pause) {
        clearTimeout(long_pause)
        long_pause = null
    }
}

function play_bind() {
    video_status = video_status >= 3 ? 4 : 2
    if (long_pause) {
        clearTimeout(long_pause)
        long_pause = null
    }
    if (obj.player.playbackRate() < 1.5)
    {
        setTimeout(function () {
            $('.speedTab15').click()
        }, 1000)
        console.log('Set speed 1.5')
    }
}

function pause_bind() {
    video_status = video_status >=3 ? 3 : 1
    if ($('.wrap_popboxes.wrap_popchapter').length > 0) {
        let check_option = function () {
            let frame = $(window.frames["tmDialog_iframe"].contentDocument)
            ++option_retry
            if (!option_retry && frame.find('.answerOption').length === 0) {
                setTimeout(check_option, 500)
                return
            }
            frame.find('.answerOption').each(function () {
                let type = $(this).attr('_type')
                let ans = $(this).find('input').attr('_correctanswer')
                if(type == 'radio') {
                    if(ans == 1) {
                        $(this).find('input').click()
                    }
                } else {
                    $(this).find('input').attr('checked', ans == 1 ? true : false)
                }
            })
            setTimeout(function () {
                $('.popbtn_cancel').click()
            }, 3000)
        }
        check_option()
    } else {
        long_pause = setTimeout(function () {
            ipcRenderer.send('shownotice', 'Notice', 'Pasued 10 seconds', true)
            long_pause = null
        }, 10000);
    }
}

function complete_bind() {
    video_status = video_status >=3 ? video_status : video_status + 2
    ++retry
    if (!retry && $('.progressbar').length > 0 && $('.progressbar')[0].style.width != '100%')
    {
        console.log('Not complete, retry')
        obj.player.play()
    }
    if (retry || video_status >= 3 && $('.progressbar').length > 0 && $('.progressbar')[0].style.width == '100%') {
        console.log('Play next')
        obj.callback.playerNext()
        setTimeout(get_obj, 1000)
    }
}

$(get_obj)
