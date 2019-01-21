
jQuery.fn.videoControls = function () {

    var instance = {};

    var startPoint = 0.0;
    var stopPoint = 0.0;
    var duration = 0.0;
    var className = '';
    var isClick = false;
    var isA = false;
    var isB = false;

    //创建一个播放器
    create = function (src) {

        //实例相关信息，包括播放器实体（video），文件名，帧率和源路径，以及剪切点。
        instance.playerj = $(src);
        instance.player = instance.playerj[0];
        instance.src_url = instance.playerj.attr('src');
        instance.file_name = instance.src_url.split('/')[2];
        instance.frame_rate = instance.playerj.attr('data-framerate');
        instance.current_position = 0;
        instance.player.file_name = instance.file_name;
        instance.player.cutin = 0;
        instance.player.cutout = -1;

        //用div标签对video进行包装，类别为video-player，后续对video-player而非video进行操作
        instance.playerj.wrap('<div class="video_player"/>');
        instance.wrapper = instance.playerj.parent();


        //播放进度条
        instance.wrapper
            .append('<div class="playbar">' +
                '<div class="play_head"></div>' +
                '<div class="track_bg"></div>' +
                '<div id="pointA"></div>' +
                '<div id="pointB"></div>' +
                '</div>');

        //按钮区
        instance.wrapper
            .append('<div id="buttons">' +
                '<button class="button special" id="stepRw1s">退1秒</button>' +
                '<button class="button special" id="stepRw1ms">退0.15秒</button>' +
                '<button class="button special" id="stepFf1ms">进0.15秒</button>' +
                '<button class="button special" id="stepFf1s">进1秒</button>' +
                '</div>' +
                '<div>' +
                '<button class="button blue" id="play">播放</button>' +
                '<button class="button blue" id="A">放置裁切点</button>' +
                '<select style="height: 40px" id="isBad"><option value="0" >好数据</option><option value="1">坏数据</option></select>'+
                '</div>' +
                '<table>' +
                '<tr><td colspan=5>当前时间</td><td colspan=10 id="timer"></td></tr>' +
                '<tr><td colspan=5>开始点</td><td colspan=10 id="startP"></td></tr>' +
                '<tr><td colspan=5>结束点</td><td colspan=10 id="endP"></td></tr>' +
                '<tr><td colspan=5>总时长</td><td colspan=10 id="dur"></td></tr>' +
                '</table>' +
                '<table>' +
                '<tr><td colspan=5>标注类别</td><td><input style="width: 100%;height: 30px;" type="text" name="type" id="type" maxlength="50"></td><td colspan=5><input class="button special" type="submit" value="裁切" id="cut"></td></tr>' +
                '</table>' +
                '</table>' +
                '<table>' +
                '<tr><td colspan=5>删除标注</td><td><input style="width: 100%;height: 30px;" type="text" name="type" id="delNum" placeholder="填写删除序号" maxlength="10"></td><td colspan=5><input class="button special" type="submit" value="删除" onclick="delType()"></td></tr>' +
                '</table>' +
                '<h3>已标注内容</h3>' +
                '<table id="annotations">' +
                '<th>序号</th>' +
                '<th>开始点</th>' +
                '<th>结束点</th>' +
                '<th>标记</th>' +
                '</table>' +
                '<input class="button blue" type="submit" value="提交结果" id="submitAll">'
            );
        //更新时间
        instance.player.addEventListener('timeupdate', function () {
            display_timecode();
        }, false);
        //设置播放进度条的元数据，为了美观，让整个条更长一点
        instance.player.addEventListener('loadedmetadata', function () {
            instance.wrapper.find('.playbar').css('width', (instance.playerj.width() + 10) + 'px');
            instance.playbar_width = parseInt(instance.wrapper.find('.playbar').css('width'), 10);
            instance.playhead_width = parseInt(instance.wrapper.find('.play_head').css('width'), 10);
        }, false);
        //按键逻辑
        instance.wrapper.find('#play').click(function () {
            playpause();
            return false;
        });
        instance.wrapper.find('#A').click(function () {
            cutA();
            return false;
        });
        instance.wrapper.find('#B').click(function () {
            cutB();
            return false;
        });
        instance.wrapper.find('#stepRw1s').click(function () {
            instance.player.currentTime = instance.player.currentTime - 1;
            return false;
        });
        instance.wrapper.find('#stepRw1ms').click(function () {
            instance.player.currentTime = instance.player.currentTime - 0.15;
            return false;
        });
        instance.wrapper.find('#stepFf1ms').click(function () {
            instance.player.currentTime = instance.player.currentTime + 0.15;
            return false;
        });
        instance.wrapper.find('#stepFf1s').click(function () {
            instance.player.currentTime = instance.player.currentTime + 1;
            return false;
        });
        //小圆点控制
        instance.wrapper.find('.play_head').mousedown(function (e) {
            playHeadDrag(e);
            return false;
        });
        //提交控制
        instance.wrapper.find('#cut').click(function () {
            if (instance.wrapper.find('#type').val() === "") {
                alert("标签不可为空");
            } else if (isA === false) {
                alert("未设置开始时间");
            } else if (isB === false) {
                alert("未设置结束时间");
            } else {
                pushIn({
                    label: instance.wrapper.find('#type').val(),
                    start: startPoint,
                    end: stopPoint

                });
                instance.wrapper.find('#type').val("");
                alert("标注成功");
            }
            return false;
        });

        instance.wrapper.find('#submitAll').click(function () {
            var r = confirm("确认提交本文件结果吗");
            var isBad = $("#isBad option:selected").val();
            if (r === true) {
                if (annotations.length === 0&&isBad == 0) {
                    alert("未标记任何结果提交失败");
                } else {
                    var sss = {
                        taskid : taskid,
                        filename : filename,
                        size : {
                            width : instance.playerj.context.videoWidth,
                            height : instance.playerj.context.videoHeight,
                            duration : instance.playerj.context.duration
                        },
                        segaments: annotations,
                        isBad:$("#isBad option:selected").val()
                    };
                    sss = JSON.stringify(sss);
                    $.ajax({
                        type:'POST',
                        url:'/casia/result',
                        data:sss,
                        contentType: 'application/json;charset=utf-8',
                        success: function (data) {
                            if (data.retcode == "000000"){
                                $('#markStatus').text("标注状态：已标注");
                            }
                            alert(data.retdesc);
                        },
                        error: function (data) {
                            alert("操作失败");
                        }
                    })
                }
            }
        });

        instance.player.addEventListener("ended", function () {
            instance.wrapper.find('#play').removeClass('play').addClass('pause').text('重播');
        });
    };

    //播放和暂停
    var playpause = function () {
        if (instance.player.ended) {
            //instance.player.load();
            playMovie();
            instance.playing = true;
        } else if (instance.playing) {
            stopMovie();
            instance.playing = false;
        } else {
            playMovie();
            instance.playing = true;
        }
    };
    //播放
    var playMovie = function () {
        instance.player.play();
        instance.wrapper.find('#play').removeClass('play').addClass('pause').text('暂停');
    };
    //停止
    var stopMovie = function () {
        instance.player.pause();
        instance.wrapper.find('#play').removeClass('pause').addClass('play').text('播放');
    };

    //AB点裁切
    var cutA = function () {
        if (!isClick) {
            isA = true;
            isB = false;
            startPoint = instance.player.currentTime;
            instance.wrapper.find('#startP').text(formatTimer(startPoint));
            instance.wrapper.find('#dur').text('');
            instance.wrapper.find('#endP').text('');

        } else {
            isB = true;
            stopPoint = instance.player.currentTime;
            if (stopPoint < startPoint) {
                var temp = stopPoint;
                stopPoint = startPoint;
                startPoint = temp;
            }
            duration = stopPoint - startPoint;
            instance.wrapper.find('#startP').text(formatTimer(startPoint));
            instance.wrapper.find('#dur').text(formatTimer(duration));
            instance.wrapper.find('#endP').text(formatTimer(stopPoint));
        }
        isClick = !isClick;
    };

    var cutB = function () {
        stopPoint = instance.player.currentTime;
        if (stopPoint < startPoint) {
            var temp = stopPoint;
            stopPoint = startPoint;
            startPoint = temp;
        }
        duration = stopPoint - startPoint;
        instance.wrapper.find('#startP').text(formatTimer(startPoint));
        instance.wrapper.find('#dur').text(formatTimer(duration));
        instance.wrapper.find('#endP').text(formatTimer(stopPoint));
    };

    //进度条拖拽
    var playHead = {
        mdown: false
    };

    var playHeadDrag = function (e) {
        playHead.mdown = true;
        if (instance.playing) {
            instance.startAgain = true;
            stopMovie();
        }
    };

    $(document).mouseup(function (e) {
        if (playHead.mdown) {
            playHead.mdown = false;
            if (instance.startAgain) {
                instance.startAgain = false;
                playMovie();
            }
        }
    });

    $(document).mousemove(function (e) {
        if (playHead.mdown) {
            position_to_time(e);
        }
    });

    //显示时间
    var display_timecode = function () {
        instance.wrapper.find('#timer').text(formatTimer(instance.player.currentTime));
        instance.playhead = Math.round((instance.player.currentTime / instance.player.duration) * (instance.playbar_width - 10));
        instance.wrapper.find('.play_head').css('left', 5 + instance.playhead - (instance.playhead_width / 2) + 'px');
    };


    // Utilities

    var position_to_time = function (e) {
        var pos;
        var clickx = e.clientX - instance.playerj.offset().left;
        if (clickx >= (instance.playbar_width)) {
            pos = instance.player.duration;
        } else if (clickx <= 0) {
            pos = Math.floor(0);
        } else {
            pos = instance.player.duration * (clickx / instance.playbar_width);
        }
        instance.player.currentTime = pos;
    };



    return $(this).each(function () {
        create(this);
    });
};

var filename = "";
var taskid = "";
var segaments;
var i = 0;
var annotations = [];
var reason;

function pushIn (val) {
    annotations.push(val);
    $('#annotations tr:last').after('<tr><td>' + (i + 1) + '</td><td>' + formatTimer(annotations[i].start) + '</td><td>' + formatTimer(annotations[i].end) + '</td><td>' + annotations[i].label + '</td></tr>');
    i = i + 1;
    return true;
};

//时间格式化
function formatTimer (position) {
    var ft_hours = Math.floor((position / (60 * 60)) % 24);
    var ft_minutes = Math.floor((position / (60)) % 60);
    var ft_seconds = Math.floor((position) % 60);
    var ft_microseconds = position - Math.floor(position) + ft_seconds;
    ft_hours += '';
    ft_hours = pad(ft_hours);
    ft_minutes += '';
    ft_minutes = pad(ft_minutes);
    ft_seconds += '';
    ft_seconds = pad(ft_seconds);
    ft_microseconds = ft_microseconds.toFixed(3);
    ft_microseconds += '';
    ft_microseconds = pad(ft_microseconds);
    return ft_hours + ':' + ft_minutes + ':' + ft_microseconds;
};

//补零
var pad = function (val) {
    if (val < 10) {
        val = '0' + val;
    }
    return val;
};


function checkfiles(id) {

    $.ajax({
        type: 'post',
        url: "/casia/video",
        data: '{"fileId":"' + id + '"}',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            document.getElementById("DEMO").src = data.cdnAddress;
            if (data.markStatus == 0){
                document.getElementById("markStatus").innerText="标注状态：未标注";
            } else {
                if(data.checkStatus == 2){
                    document.getElementById("markStatus").innerText="标注状态：打回重新标注"
                }else {
                    document.getElementById("markStatus").innerText="标注状态：已标注"
                }

            }
            if (data.checkStatus == 0){
                document.getElementById("checkStatus").innerText="检查状态：待检查";
                $('#displayStatus').hide();
            }else if (data.checkStatus == 1){
                document.getElementById("checkStatus").innerText="检查状态：通过";
                $('#displayStatus').hide();
            }else if(data.checkStatus == 2){
                document.getElementById("checkStatus").innerText="检查状态：打回";
                reason = data.backReason;
                $('#displayStatus').show();
            }
            document.getElementById("isBad").options[0].selected=false;
            document.getElementById("isBad").options[1].selected=false;
            document.getElementById("isBad").options[data.isbad].selected=true;
            $('#playing').text('正在播放：' + data.fileName);
            filename = data.fileName;
            taskid = data.taskid;
            $('#annotations tr:not(:first)').html("");
            $('#play').text('播放');
            $('#startP').text("");
            $('#dur').text("");
            $('#endP').text("");
            $('#backReason').val(reason);
            annotations = [];
            i = 0;
            segaments = data.segaments;
            segamentsSort();
        },
        error: function () {

        }
    });
}

function segamentsSort() {
    segaments.sort(segamentsSortRule);
    for (; i < segaments.length; ) {
        pushIn({
            label: segaments[i]['label'],
            start: segaments[i]['start'],
            end: segaments[i]['end']
        });
    }
}

function segamentsSortRule(a, b) {
    if (a['start'] == b['start']){
        return a['end']-b['end'];
    } else{
        return a['start']-b['start'];
    }
}

function delType() {
    let delNum = document.getElementById("delNum").value-1;
    let flag = 0;
    for (let j = 0; j < annotations.length; j++) {
        if (j == delNum){
            annotations.splice(j,1);
            flag = 1;
            $('#annotations tr:not(:first)').html("");
            let temp = annotations;
            annotations = [];
            i = 0;
            for (; i < temp.length; ) {
                pushIn({
                    label: temp[i]['label'],
                    start: temp[i]['start'],
                    end: temp[i]['end']
                });
            }
        }
    }
    if (!flag){
        alert("无此标注");
    }else {
        alert("删除成功");
    }
}

function displayReason() {
    alert(reason);
}