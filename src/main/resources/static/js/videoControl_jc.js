jQuery.fn.videoControls = function () {

    var instance = {};

    var startPoint = 0.0;
    var stopPoint = 0.0;
    var duration = 0.0;
    var className = '';
    var i = 0;
    var annotations = [];
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
            .append('<p id="timer">当前时间： </p>'+
                '<button class="button special" id="stepRw1s">退1秒</button>' +
                '<button class="button special" id="stepRw1ms">退0.15秒</button>' +
                '<button class="button special" id="stepFf1ms">进0.15秒</button>' +
                '<button class="button special" id="stepFf1s">进1秒</button>' +
                '</div>' +
                '<div>' +
                '<button class="button blue" id="play">播放</button>' +
                '<button id="btnNoPass" class="button blue" data-toggle="modal" data-target="#modalBack" style="display: none">打回</button>'+
                '<button id="btnPass" class="button blue" data-toggle="modal" data-target="#modalPass" style="display: none">通过</button>'+
                '<table id="annotations">' +
                '<tr>' +
                '<th>开始时间</th>' +
                '<th>结束时间</th>' +
                '<th>标记结果</th>' +
                '</tr>'+
                '</table>' +
                '</div>'
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
        var curTime = instance.player.currentTime;
        instance.wrapper.find('#timer').text("当前时间： "+formatTimer(instance.player.currentTime));
        instance.playhead = Math.round((instance.player.currentTime / instance.player.duration) * (instance.playbar_width - 10));
        instance.wrapper.find('.play_head').css('left', 5 + instance.playhead - (instance.playhead_width / 2) + 'px');
        var index;
        var tabelHead = "<tr><th>开始时间</th><th>结束时间</th><th>标记结果</th></tr>"
        for (var i = 0;i<segaments.length;i++){
            index = "tr_"+i;
            if (curTime>=segaments[i]['start']&&curTime<=segaments[i]['end']){
                document.getElementById(index).style.background = "yellow";
                tabelHead += "<tr><td>"+formatTimer(segaments[i]['start'])+"</td><td>"+formatTimer(segaments[i]['end'])+"</td><td>"+segaments[i]['label']+"</td></tr>"
            }else {
                document.getElementById(index).style.background="transparent";
            }
        }
        document.getElementById("annotations").innerHTML = tabelHead;
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

    //时间格式化
    var formatTimer = function (position) {
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

    var pushIn = function (val) {
        annotations.push(val);
        $('#annotations tr:last').after('<tr><td>' + (i + 1) + '</td><td>' + formatTimer(annotations[i].start) + '</td><td>' + formatTimer(annotations[i].end) + '</td><td>' + annotations[i].label + '</td></tr>');
        i = i + 1;
        return true;
    };


    return $(this).each(function () {
        create(this);
    });
};

var filename = "";
var fileId = "";
var taskid = "";
var segaments;

function checkfiles(id) {
    fileId = id;
    $.ajax({
        type: 'post',
        url: "/casia/video",
        data: '{"fileId":"' + id + '"}',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            document.getElementById("DEMO").src = data.cdnAddress;
            $('#playing').text('正在播放：' + data.fileName);
            filename = data.fileName;
            taskid = data.taskid;
            segaments = data.segaments;
            document.getElementById("resultTable").innerHTML = "<tr>\n" +
                "            <th style=\"text-align: center;\">开始时间</th>\n" +
                "            <th style=\"text-align: center;\">结束时间</th>\n" +
                "            <th width='33%' style=\"text-align: center;\">标注结果</th>\n" +
                "        </tr>";
            segamentsSort();
            $('#annotations tr:not(:first)').html("");
            $('#play').text('播放');
            $('#startP').text("");
            $('#dur').text("");
            $('#endP').text("");
            $('#btnNoPass').show();
            $('#btnPass').show();
            $('#backReason').val(data.backReason);
            if (data.isbad == 0){
                document.getElementById("isbad").innerText="数据类型：好数据";
            }else {
                document.getElementById("isbad").innerText="数据类型：坏数据";
            }
            if (data.checkStatus == 0){
                $('#checkStatus').text("检查状态：待检查");
            }else if (data.checkStatus == 1){
                $('#checkStatus').text("检查状态：通过");
            }else if(data.checkStatus == 2){
                $('#checkStatus').text("检查状态：打回");
                reason = data.backReason;
            }
            document.getElementById("backReason").value=data.backReason;
        },
        error: function () {
        }
    });
}

function jc_button(type) {
    if (type == 1){
        $('#backReason').val("");
    }
    var backReason = document.getElementById("backReason").value;
    if (type == 0){
        if (backReason.length == 0){
            alert("请填写打回原因");
            return;
        }
    }
    var sss = {
        status:type,
        file_id:fileId,
        back_reason:backReason
    };
    sss = JSON.stringify(sss);
    $.ajax({
        type: 'post',
        url: "/casia/check",
        data:sss,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            $('#checkStatus').text("");
            if (data.retcode == "000000"){
                if (type === 0){
                    $('#checkStatus').text("检查状态：打回");
                } else if (type === 1){
                    $('#checkStatus').text("检查状态：通过");
                }
            }

            alert(data.retdesc);
        },
        error: function () {
            alert("操作异常");
        }
    })
}

function segamentsSort() {
    segaments.sort(segamentsSortRule);
    var innerHtmlText = document.getElementById("resultTable").innerHTML;
    for (var i=0;i<segaments.length;i++){
        innerHtmlText += "<tr id=tr_"+i+"><td>"+segaments[i]['start']+"</td><td>"+segaments[i]['end']+"</td><td>"+segaments[i]['label']+"</td></tr>";
    }
    document.getElementById("resultTable").innerHTML = innerHtmlText;
}

function segamentsSortRule(a, b) {
    if (a['start'] == b['start']){
        return a['end']-b['end'];
    } else{
        return a['start']-b['start'];
    }
}
