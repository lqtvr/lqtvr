;
(function($) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function(m, i, o, n) {
            return args[i];
        });
    };

    Date.prototype.Format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    $.fn.extend({
        calendar: function(opt) {
            if (!$('.calendar').length) {
                $(document.body).append('<div class="calendar" style="display:none;"></div>')
            }

            var now = new Date(),
                today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                currentYear = now.getFullYear(),
                currentMonth = now.getMonth(),
                dateInput = this,
                weeks = ['日', '一', '二', '三', '四', '五', '六'],
                html = '',
                calendarElement = $('.calendar');
            var selectedDays = [];

            var options = $.extend({
                format: 'yyyy-MM-dd',
                startDate: new Date(currentYear - 100, 0, 1).Format('yyyy-MM-dd'),
                endDate: new Date(currentYear + 100, 0, 1).Format('yyyy-MM-dd'),
                mode: 'single', //single || range || multiple
                onSelectedDay: null //选中日期时
                    // onSelectedDay: function(selectedElem,calendarElem) { //example
                    // }
            }, opt);
            $(dateInput).val(now.Format(options.format));

            var calendarStartDate = new Date(options.startDate),
                calendarEndDate = new Date(options.endDate);

            //修补
            calendarStartDate = new Date(calendarStartDate.getFullYear(), calendarStartDate.getMonth(), calendarStartDate.getDate());
            calendarEndDate = new Date(calendarEndDate.getFullYear(), calendarEndDate.getMonth(), calendarEndDate.getDate());

            var _ = {
                showCalendar: function() {
                    var o = $(dateInput).offset();
                    var h = $(dateInput).height();
                    calendarElement.html(html);
                    calendarElement.css({
                        top: o.top + h + 10,
                        left: o.left,
                        opacity: 1
                    })
                    calendarElement.show();
                },
                renderDaysHtml: function(year, month) {
                    html = '<table class="days">';
                    html += [
                        '<thead>',
                        '<tr class="t-head">',
                        new Date(year, month, 1) < calendarStartDate ? '<th>&nbsp;</th>' :
                        '<th class="prev"><a><i class="iconfont icon-left"></i></a></th>',
                        '<th class="s-year" colspan="5"><a>{0}年{1}月</a></th>',
                        year == calendarEndDate.getFullYear() && month == calendarEndDate.getMonth() ? '<th>&nbsp;</th>' :
                        '<th class="next"><a><i class="iconfont icon-right"></i></a></th>',
                        '</tr>',
                        '<tr class="week">{2}</tr>',
                        '</thead>'
                    ].join('');

                    var weeksHtml = '';
                    for (i in weeks) {
                        weeksHtml += '<th>' + weeks[i] + '</th>'
                    }

                    html = html.format(year, month + 1, weeksHtml);

                    var startDay = new Date(year, month, 1);
                    var endDay = new Date(year, month + 1, 0);
                    //本月多少天
                    var howManyDays = endDay.getDate();
                    //第一天星期几 星期天 = 0
                    var startWeek = startDay.getDay();

                    var prevMonth = new Date(year, month, 0);
                    if (month == 0) {
                        prevMonth = new Date(year - 1, 11, 0);
                    }
                    var prevMonthEndDay = prevMonth.getDate();

                    var nextMonth = new Date(year, month + 1, 1);
                    if (month == 11) {
                        nextMonth = new Date(year + 1, 0, 1);
                    }

                    var daysHtml = '';
                    for (var i = -startWeek + 1, j = 0; j <= 41; i++, j++) {
                        if (j % 7 === 0) {
                            daysHtml += '<tr>'
                        }
                        var _time = 0;
                        var _class = '';
                        var _day = 0;

                        if (i <= 0) {
                            _day = prevMonthEndDay + i;
                            _time = +new Date(prevMonth.getFullYear(), prevMonth.getMonth(), _day);
                        } else {
                            if (i <= howManyDays) {
                                _day = i;
                                _time = +new Date(currentYear, currentMonth, i);
                            } else {
                                _day = i - howManyDays;
                                _time = +new Date(nextMonth.getFullYear(), nextMonth.getMonth(), _day);
                            }
                        }

                        //计算样式，优先禁用状态，其次选择状态
                        if (_time < +calendarStartDate || _time > +calendarEndDate) {
                            _class = 'disabled';
                        } else {
                            if (i <= 0 || i > howManyDays) {
                                _class = 'gray';
                            }
                            if (selectedDays.length) {
                                var selectedDaysStr = selectedDays.join(',');
                                if (selectedDaysStr.indexOf(_time + '') != -1) {
                                    _class = 'current'
                                }

                                if (options.mode == 'range' && selectedDays.length == 2) {
                                    if (selectedDays[0] < _time && selectedDays[1] > _time) {
                                        _class = 'join';
                                    }
                                }
                            }
                            if (_class != 'current') {
                                if (+today == _time) {
                                    _class = 'today';
                                }
                            }
                        }

                        daysHtml += '<td class="{0}" data-date="{1}">{2}</td>'.format(_class, _time, _day);

                        if (j % 7 === 6) {
                            daysHtml += '</tr>'
                        }
                    }

                    html += '<tbody>' + daysHtml + '</tbody>';
                    html += '</tbody>'

                    _.showCalendar();
                },
                renderMonthsHtml: function() {
                    html = '<table class="months">';
                    html += [
                        '<thead>',
                        '<tr class="t-head">',
                        currentYear <= calendarStartDate.getFullYear() ? '<th>&nbsp;</th>' :
                        '<th class="prev"><a><i class="iconfont icon-left"></i></a></th>',
                        '<th class="s-year" colspan="2"><a>{0}年</a></th>',
                        currentYear >= calendarEndDate.getFullYear() ? '<th>&nbsp;</th>' :
                        '<th class="next"><a><i class="iconfont icon-right"></i></a></th>',
                        '</tr>',
                        '</thead>'

                    ].join('').format(currentYear);

                    html += '<tbody>'

                    for (var i = 0; i < 16; i++) {
                        if (i % 4 === 0) {
                            html += '<tr>';
                        }

                        var _class = '';
                        if (new Date(currentYear, i, 1) < new Date(calendarStartDate.getFullYear(), calendarStartDate.getMonth(), 1) || new Date(currentYear, i, 1) > new Date(calendarEndDate.getFullYear(), calendarEndDate.getMonth(), 1)) {
                            _class = 'disabled';
                        } else {
                            if (i > 11) {
                                _class = 'gray';
                            } else {
                                if (today.getFullYear() === currentYear && today.getMonth() == i) {
                                    _class = 'today';
                                }
                            }
                        }

                        html += '<td class="{1}" data-month="{2}">{0}月</td>'.format((i % 12) + 1, _class, i);
                        if (i % 4 === 3) {
                            html += '</tr>'
                        }
                    }

                    html += '</tr>';
                    html += '</tbody>';
                    html += '</table>'

                    _.showCalendar();
                },
                //参考win 10 操作系统时间显示，推测出如下规律
                renderYearsHtml: function() {
                    //此年的段索引
                    var yearIndex = currentYear % 10;
                    //开始年段，2016年：表示2010 - 2019
                    var startYear = currentYear - yearIndex;
                    //16格（4x4) 开始的索引，win 10 日期选择以1916年开始 1916 表10宫格的第一格
                    //但是 每次10个一轮训需要再 模8一下
                    var cellIndex = (startYear - 1915) % 12 % 8;

                    var firstYear = startYear - cellIndex;
                    var lastYear = firstYear + 16 + 1;
                    html = '<table class="years">';

                    html += [
                        '<thead>',
                        '<tr class="t-head">',
                        calendarStartDate.getFullYear() > firstYear ? '<th>&nbsp;</th>' :
                        '<th class="prev"><a><i class="iconfont icon-left"></i></a></th>',
                        '<th class="s-year" colspan="2">{0} - {1}</th>',
                        calendarEndDate.getFullYear() < lastYear ? '<th>&nbsp;</th>' :
                        '<th class="next"><a><i class="iconfont icon-right"></i></a></th>',
                        '</tr>',
                        '</thead>'
                    ].join('').format(startYear, startYear + 9);


                    html += '<tbody>';
                    var yearshtml = '';
                    for (var i = startYear - cellIndex + 1, j = 0; j < 16; i++, j++) {
                        if (j % 4 === 0) {
                            yearshtml += '<tr>';
                        }
                        var _class = '';
                        if (i < calendarStartDate.getFullYear() || i > calendarEndDate.getFullYear()) {
                            _class = 'disabled';
                        } else {
                            if (i < startYear || i >= startYear + 10) {
                                _class = 'gray';
                            } else {

                                if (today.getFullYear() === i) {
                                    _class = 'today';
                                }
                            }
                        }
                        yearshtml += '<td class={0}>{1}</td>'.format(_class, i);
                        if (j % 4 === 3) {
                            yearshtml += '</tr>';
                        }
                    }

                    html += yearshtml;
                    html += '</tbody>';
                    html += '</table>';
                    _.showCalendar();
                },
                prevClick: function() {
                    if ($('.calendar table.days').length) {
                        if (currentMonth > 0) {
                            currentMonth--;
                            _.renderDaysHtml(currentYear, currentMonth);
                        } else {
                            currentYear--;
                            currentMonth = 11;
                            _.renderDaysHtml(currentYear, 11);
                        }
                    } else if ($('.calendar table.months').length) {
                        currentYear--;
                        _.renderMonthsHtml();
                    } else {
                        currentYear -= 10;
                        _.renderYearsHtml();
                    }
                    return false;
                },
                nextClick: function() {
                    if ($('.calendar table.days').length) {
                        if (currentMonth < 11) {
                            currentMonth++;
                            _.renderDaysHtml(currentYear, currentMonth);
                        } else {
                            currentYear++;
                            currentMonth = 0;
                            _.renderDaysHtml(currentYear, 0);
                        }
                    } else if ($('.calendar table.months').length) {
                        currentYear++;
                        _.renderMonthsHtml();
                    } else {
                        currentYear += 10;
                        _.renderYearsHtml();
                    }
                    return false;
                },
                middleClick: function() {
                    $('.calendar>table').removeClass('animated zoomIn');

                    if ($('.calendar .years').length)
                        return;

                    $('.calendar>table').addClass('animated zoomOut');
                    setTimeout(function() {
                        if ($('.calendar table.days').length) {
                            _.renderMonthsHtml();
                        } else {
                            _.renderYearsHtml();
                        }
                    }, 300);
                },
                tdClick: function() {
                    if ($(this).hasClass('disabled')) {
                        return false;
                    }
                    if ($('.calendar table.days').length) {
                        var _thisDay = $(this).data('date');
                        if (options.mode == 'single' && selectedDays.length) {
                            selectedDays.pop();
                        } else if (options.mode == 'range') {
                            if (selectedDays.length > 1) {
                                selectedDays = [];
                            } else if (selectedDays.length == 1) {
                                if (selectedDays[0] > _thisDay) {
                                    selectedDays = [];
                                } else if (selectedDays[0] == _thisDay) {
                                    if (options.onSelectedDay) {
                                        options.onSelectedDay(this, calendarElement);
                                    } else {
                                        calendarElement.hide();
                                    }
                                    return;
                                }
                            }
                        } else if (options.mode == 'multiple') {
                            selectedDays.push(_thisDay);
                            if (options.onSelectedDay) {
                                options.onSelectedDay(this, calendarElement);
                            } else {
                                $(this).removeClass();
                                $(this).addClass('current')
                            }
                            return;
                        }
                        selectedDays.push(_thisDay);
                        if (options.onSelectedDay) {
                            options.onSelectedDay(this, calendarElement);
                        } else {
                            if (options.mode == 'range' && selectedDays.length > 1) {
                                $(dateInput).val(new Date(selectedDays[0]).Format(options.format) + " 至 " + new Date(selectedDays[selectedDays.length - 1]).Format(options.format));
                            } else {
                                $(dateInput).val(new Date(_thisDay).Format(options.format));
                            }
                            calendarElement.hide();
                        }
                    } else {
                        if ($('.calendar table.months').length) {
                            var month = $(this).data('month');
                            if (month > 11) {
                                currentMonth = month - 12;
                                currentYear++;
                            } else {
                                currentMonth = month;
                            }
                            _.renderDaysHtml(currentYear, currentMonth);
                        } else {
                            var year = ~~$(this).text();
                            currentYear = year;
                            _.renderMonthsHtml();
                        }
                        $('.calendar>table').addClass('animated zoomIn');
                    }
                    return false;
                },
                mousewheel: function(e) {
                    if (e.originalEvent.deltaY > 50) {
                        $('.calendar .next').click();
                    } else {
                        $('.calendar .prev').click();
                    }
                    return false;
                }
            }

            //前一按钮
            $(document.body).on('click', '.calendar .prev', _.prevClick);
            //后一按钮
            $(document.body).on('click', '.calendar .next', _.nextClick);
            //中间按钮
            $(document.body).on('click', '.calendar .s-year', _.middleClick);
            //点击单元格（选择年份/月份/日）
            calendarElement.on('click', 'tr td', _.tdClick);
            //鼠标滚轮
            calendarElement.on('mousewheel', _.mousewheel);

            $(dateInput).on('click', function() {
                if (calendarElement.is(':visible'))
                    return;
                _.renderDaysHtml(currentYear, currentMonth);
            });

            $(document.body).on('click', function(e) {
                if (dateInput[0] != e.target && e.target != calendarElement && !calendarElement.has(e.target).length) {
                    calendarElement.hide();
                    return false;
                }
            })

            //重载
            $.fn.extend($, {
                calendar: function(elem, opt) {
                    return $(elem).calendar(opt);
                }
            });
            //扩展
            $.fn.extend($.calendar, {
                elem: '.calendar',
                selectedDays: function () {
                    return selectedDays;
                }
            });
            $.fn.extend($.calendar, {
                elem: '.calendar',
                getDays: function () {
                    if (selectedDays.length == 0) {
                        return [new Date().Format('yyyy-MM-dd'), new Date().Format('yyyy-MM-dd')];
                    } else if (selectedDays.length == 1) {
                        return [new Date(selectedDays[0]).Format('yyyy-MM-dd'), new Date(selectedDays[0]).Format('yyyy-MM-dd')];
                    } else {
                        return [new Date(selectedDays[0]).Format('yyyy-MM-dd'), new Date(selectedDays[selectedDays.length - 1]).Format('yyyy-MM-dd')];
                    }
                }
            });
        }
    });

}(jQuery))