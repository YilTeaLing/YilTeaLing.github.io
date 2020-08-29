$(document).ready(function () {
    // 以后在添加覆盖全屏（或一部分pad）的元素时
    // 一定要在CSS里加上pointer-events: none;
    // （除非该元素需要监听点击事件）
    $(".window-head").dblclick(function () {
        $(this).parent().css("left", "0");
        $(this).parent().css("top", "0");
        $(this).parent().removeClass("window-stick-left");
        $(this).parent().removeClass("window-stick-top");
        $(this).parent().removeClass("window-stick-bottom");
        $(this).parent().removeClass("window-stick-right");
        $(this).parent().toggleClass("window-stick-fullscreen");
    });
    $(".window-head").mousedown(function (event) {
        // 仍然存在一些问题
        $(".window-item").css("z-index", "10000");
        $(this).parent().css("z-index", "10001");
        if (!$(this).parent().hasClass("window-stick-fullscreen")) {
            var reachL = false;
            var reachR = false;
            var reachT = false; 
            var reachB = false; 
            _box = $(this).parent();
            _box.css({
                top: _box.position().top, 
                left: _box.position().left, 
            });
            // 窗口
            var old_position_left = _box.position().left;
            var old_position_top = _box.position().top;
            var _pad = document.getElementById("pad");
            // 鼠标
            var _begin_x = event.clientX - _pad.clientLeft;
            var _begin_y = event.clientY - _pad.clientTop;
            $(this).parent().removeClass("window-stick-left");
            $(this).parent().removeClass("window-stick-top");
            $(this).parent().removeClass("window-stick-bottom");
            $(this).parent().removeClass("window-stick-right");
            $(document).mousemove(_fmove = function (event) {
                // 计算相对偏移量
                var _new_x = event.clientX - _pad.clientLeft;
                var _new_y = event.clientY - _pad.clientTop;
                var _deltaX = _new_x - _begin_x;
                var _deltaY = _new_y - _begin_y;
                // 计算现在应该的位置
                var new_position_left = old_position_left + _deltaX;
                var new_position_top = old_position_top + _deltaY;
                // 添加限制条件，不能超过边界
                // L
                reachL = false;
                if (new_position_left < 0) {
                    new_position_left = 0;
                    reachL = true
                }
                // R
                reachR = false;
                if (new_position_left + _box.width() > $("#pad").width()) {
                    new_position_left = $("#pad").width() - _box.width();
                    reachR = true
                }
                // T
                reachT = false;
                if (new_position_top < 0) {
                    new_position_top = 0;
                    reachT = true
                }
                // B
                reachB = false;
                if (new_position_top + _box.height() > $("#pad").height()) {
                    new_position_top = $("#pad").height() - _box.height();
                    reachB = true
                }
                // 应用位置
                _box.css({
                    left: new_position_left,
                    top: new_position_top,
                });
            });
            $(document).mouseup(_fup = function (event) {
                $(document).unbind("mousemove", _fmove);
                // 避免事件重复
                $(document).unbind("mouseup", _fup);
                // 检测是否要贴紧边缘
                // 先清空
                _box.removeClass("window-stick-left");
                _box.removeClass("window-stick-top");
                _box.removeClass("window-stick-bottom");
                _box.removeClass("window-stick-right");
                // 再判断
                if ((reachR && reachT) || (reachL && reachT) || (reachB && reachL) || (reachB && reachR)) {
                    _box.css("left", "");
                    _box.css("top", "");
                    _box.addClass("window-stick-fullscreen"); 
                } else if (reachR) {
                    _box.css("left", "");
                    _box.css("top", "");
                    _box.addClass("window-stick-right"); 
                } else if (reachL) {
                    _box.css("left", "");
                    _box.css("top", "");
                    _box.addClass("window-stick-left"); 
                } else if (reachT) {
                    _box.css("left", "");
                    _box.css("top", "");
                    _box.addClass("window-stick-top"); 
                } else if (reachB) {
                    _box.css("left", "");
                    _box.css("top", "");
                    _box.addClass("window-stick-bottom"); 
                }
            });
        }
    });
    $(".window-close-btn").click(function (){
        $(this).parent().parent().remove();
    });
});
