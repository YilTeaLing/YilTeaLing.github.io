var __objid = 0;
function defMessage(title, content, time, bgcolor) {
    var _obj = new Object();
    _obj.id = __objid;
    __objid += 1;
    _obj.title = title;
    _obj.content = content;
    if (bgcolor) {
        _obj.bgcolor = bgcolor;
    } else {
        _obj.bgcolor = "rgba(0,0,0,.8)"
    }
    $(".message-container").append("<div class='message-item' id='message-object-" + _obj.id + "' style='background-color:" + _obj.bgcolor + ";'><div class='message-title'>" + title + "</div><div class='message-content'>" + content + "</div></div>");
    _obj._jQuery = $("#message-object-" + _obj.id);
    if (!time) {
        _obj.time = 3000;
    } else {
        _obj.time = time;
    }
    _obj.removeself = function () {
        _obj._jQuery.css({ right: "-520px", opacity: "0" });
        setTimeout(function () {
            _obj._jQuery.remove();
        }, 1000);
    }
    setTimeout(function () {
        _obj._jQuery.css({ right: "0", opacity: "1" });
        if (_obj.time > 0) {
            setTimeout(function () {
                _obj.removeself();
            }, _obj.time);
        }
    }, 10);
    return (_obj);
}

BG_BLUE = "rgba(20, 70, 200, .8)";
BG_YELLOW = "rgba(207, 207, 76, 0.8)";
BG_RED = "rgba(200, 70, 70, .8);";

/* 这里_title不是必须要输入的，默认为“信息” */
/* 至于_args，这一项以后再作打算，相当于Python里用*_args吧 */
function showInfo(content, _title, _args) {
    __title = "信息";
    if (_title) {
        __title = _title;
    }
    return (defMessage(__title, content, 3000, BG_BLUE));
}
function showWarn(content, _title, _args) {
    __title = "警告";
    if (_title) {
        __title = _title;
    }
    return (defMessage(__title, content, 3000, BG_YELLOW));
}
function showError(content, _title, _args) {
    __title = "错误";
    if (_title) {
        __title = _title;
    }
    return (defMessage(__title, content, 3000, BG_RED));
}
