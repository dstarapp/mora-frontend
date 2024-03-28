import bus from "vue3-eventbus";

(function flexible(window, document) {
    let isFlexibleDisabled = false
    bus.on("isFlexibleDisabled", (e) => {
        isFlexibleDisabled = e
        setRemUnit()
        setBodyFontSize()
    });

    var docEl = document.documentElement
    var dpr = window.devicePixelRatio || 1

    // adjust body font size
    function setBodyFontSize() {
        if (document.body) {
            if (isFlexibleDisabled) {
                document.body.style.fontSize = 'inherit'
            } else {
                document.body.style.fontSize = (12 * dpr) + 'px'
            }
        }
        else {
            document.addEventListener('DOMContentLoaded', setBodyFontSize)
        }
    }
    setBodyFontSize();

    function setRemUnit() {
        if (isFlexibleDisabled) {
            docEl.style.fontSize = 'inherit'
        } else {
            var rem = docEl.clientWidth / 10
            docEl.style.fontSize = rem + 'px'
        }
    }

    setRemUnit()

    // reset rem unit on page resize
    window.addEventListener('resize', setRemUnit)
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            setRemUnit()
        }
    })

    // detect 0.5px supports
    if (dpr >= 2) {
        var fakeBody = document.createElement('body')
        var testElement = document.createElement('div')
        testElement.style.border = '.5px solid transparent'
        fakeBody.appendChild(testElement)
        docEl.appendChild(fakeBody)
        if (testElement.offsetHeight === 1) {
            docEl.classList.add('hairlines')
        }
        docEl.removeChild(fakeBody)
    }
}(window, document))

