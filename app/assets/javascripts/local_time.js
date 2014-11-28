var CalendarDate, RelativeTime, browserIsCompatible, domLoaded, iso8601, months, pad, parse, process, relativeDate, relativeTimeAgo, relativeTimeOrDate, relativeWeekday, run, strftime, update, weekdays;
browserIsCompatible = function() {
  return document.querySelectorAll && document.addEventListener;
};
if (!browserIsCompatible()) {
  return;
}
if (isNaN(Date.parse("2011-01-01T12:00:00-05:00"))) {
  parse = Date.parse;
  iso8601 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[-+]?[\d:]+)$/;
  Date.parse = function(dateString) {
    var day, hour, matches, minute, month, offset, second, year, zone, _;
    dateString = dateString.toString();
    if (matches = dateString.match(iso8601)) {
      _ = matches[0], year = matches[1], month = matches[2], day = matches[3], hour = matches[4], minute = matches[5], second = matches[6], zone = matches[7];
      if (zone !== "Z") {
        offset = zone.replace(":", "");
      }
      dateString = "" + year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second + " GMT" + [offset];
    }
    return parse(dateString);
  };
}
weekdays = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");
months = "January February March April May June July August September October November December".split(" ");
pad = function(num) {
  return ('0' + num).slice(-2);
};
strftime = function(time, formatString) {
  var date, day, hour, minute, month, second, year;
  day = time.getDay();
  date = time.getDate();
  month = time.getMonth();
  year = time.getFullYear();
  hour = time.getHours();
  minute = time.getMinutes();
  second = time.getSeconds();
  return formatString.replace(/%([%aAbBcdeHIlmMpPSwyYZ])/g, function(_arg) {
    var match, modifier, _ref, _ref2;
    match = _arg[0], modifier = _arg[1];
    switch (modifier) {
      case '%':
        return '%';
      case 'a':
        return weekdays[day].slice(0, 3);
      case 'A':
        return weekdays[day];
      case 'b':
        return months[month].slice(0, 3);
      case 'B':
        return months[month];
      case 'c':
        return time.toString();
      case 'd':
        return pad(date);
      case 'e':
        return date;
      case 'H':
        return pad(hour);
      case 'I':
        return pad(strftime(time, '%l'));
      case 'l':
        if (hour === 0 || hour === 12) {
          return 12;
        } else {
          return (hour + 12) % 12;
        }
        break;
      case 'm':
        return pad(month + 1);
      case 'M':
        return pad(minute);
      case 'p':
        if (hour > 11) {
          return 'PM';
        } else {
          return 'AM';
        }
        break;
      case 'P':
        if (hour > 11) {
          return 'pm';
        } else {
          return 'am';
        }
        break;
      case 'S':
        return pad(second);
      case 'w':
        return day;
      case 'y':
        return pad(year % 100);
      case 'Y':
        return year;
      case 'Z':
        return (_ref = (_ref2 = time.toString().match(/\((\w+)\)$/)) != null ? _ref2[1] : void 0) != null ? _ref : '';
    }
  });
};
CalendarDate = (function() {
  CalendarDate.fromDate = function(date) {
    return new this(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };
  CalendarDate.today = function() {
    return this.fromDate(new Date);
  };
  function CalendarDate(year, month, day) {
    this.date = new Date(Date.UTC(year, month - 1));
    this.date.setUTCDate(day);
    this.year = this.date.getUTCFullYear();
    this.month = this.date.getUTCMonth() + 1;
    this.day = this.date.getUTCDate();
    this.value = this.date.getTime();
  }
  CalendarDate.prototype.equals = function(calendarDate) {
    return (calendarDate != null ? calendarDate.value : void 0) === this.value;
  };
  CalendarDate.prototype.is = function(calendarDate) {
    return this.equals(calendarDate);
  };
  CalendarDate.prototype.isToday = function() {
    return this.is(this.constructor.today());
  };
  CalendarDate.prototype.occursOnSameYearAs = function(date) {
    return this.year === (date != null ? date.year : void 0);
  };
  CalendarDate.prototype.occursThisYear = function() {
    return this.occursOnSameYearAs(this.constructor.today());
  };
  CalendarDate.prototype.daysSince = function(date) {
    if (date) {
      return (this.date - date.date) / (1000 * 60 * 60 * 24);
    }
  };
  CalendarDate.prototype.daysPassed = function() {
    return this.constructor.today().daysSince(this);
  };
  return CalendarDate;
})();
RelativeTime = (function() {
  function RelativeTime(date) {
    this.date = date;
    this.calendarDate = CalendarDate.fromDate(this.date);
  }
  RelativeTime.prototype.toString = function() {
    var ago, day;
    if (ago = this.timeElapsed()) {
      return "" + ago + " ago";
    } else if (day = this.relativeWeekday()) {
      return "" + day + " at " + (this.formatTime());
    } else {
      return "on " + (this.formatDate());
    }
  };
  RelativeTime.prototype.toTimeOrDateString = function() {
    if (this.calendarDate.isToday()) {
      return this.formatTime();
    } else {
      return this.formatDate();
    }
  };
  RelativeTime.prototype.timeElapsed = function() {
    var hr, min, ms, sec;
    ms = new Date().getTime() - this.date.getTime();
    sec = Math.round(ms / 1000);
    min = Math.round(sec / 60);
    hr = Math.round(min / 60);
    if (ms < 0) {
      return null;
    } else if (sec < 10) {
      return "a second";
    } else if (sec < 45) {
      return "" + sec + " seconds";
    } else if (sec < 90) {
      return "a minute";
    } else if (min < 45) {
      return "" + min + " minutes";
    } else if (min < 90) {
      return "an hour";
    } else if (hr < 24) {
      return "" + hr + " hours";
    } else {
      return null;
    }
  };
  RelativeTime.prototype.relativeWeekday = function() {
    var daysPassed;
    daysPassed = this.calendarDate.daysPassed();
    if (daysPassed > 6) {
      return null;
    } else if (daysPassed === 0) {
      return "today";
    } else if (daysPassed === 1) {
      return "yesterday";
    } else {
      return strftime(this.date, "%A");
    }
  };
  RelativeTime.prototype.formatDate = function() {
    var format;
    format = "%b %e";
    if (!this.calendarDate.occursThisYear()) {
      format += ", %Y";
    }
    return strftime(this.date, format);
  };
  RelativeTime.prototype.formatTime = function() {
    return strftime(this.date, '%l:%M%P');
  };
  return RelativeTime;
})();
relativeDate = function(date) {
  return new RelativeTime(date).formatDate();
};
relativeTimeAgo = function(date) {
  return new RelativeTime(date).toString();
};
relativeTimeOrDate = function(date) {
  return new RelativeTime(date).toTimeOrDateString();
};
relativeWeekday = function(date) {
  var day;
  if (day = new RelativeTime(date).relativeWeekday()) {
    return day.charAt(0).toUpperCase() + day.substring(1);
  }
};
domLoaded = false;
update = function(callback) {
  if (domLoaded) {
    callback();
  }
  document.addEventListener("time:elapse", callback);
  if (typeof Turbolinks !== "undefined" && Turbolinks !== null ? Turbolinks.supported : void 0) {
    return document.addEventListener("page:update", callback);
  } else {
    return typeof jQuery === "function" ? jQuery(document).on("ajaxSuccess", function(event, xhr) {
      if (jQuery.trim(xhr.responseText)) {
        return callback();
      }
    }) : void 0;
  }
};
process = function(selector, callback) {
  return update(function() {
    var element, _i, _len, _ref, _results;
    _ref = document.querySelectorAll(selector);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      _results.push(callback(element));
    }
    return _results;
  });
};
document.addEventListener("DOMContentLoaded", function() {
  var textProperty;
  domLoaded = true;
  textProperty = "textContent" in document.body ? "textContent" : "innerText";
  return process("time[data-local]:not([data-localized])", function(element) {
    var datetime, format, local, time;
    datetime = element.getAttribute("datetime");
    format = element.getAttribute("data-format");
    local = element.getAttribute("data-local");
    time = new Date(Date.parse(datetime));
    if (isNaN(time)) {
      return;
    }
    if (!element.hasAttribute("title")) {
      element.setAttribute("title", strftime(time, "%B %e, %Y at %l:%M%P %Z"));
    }
    return element[textProperty] = (function() {
      var _ref;
      switch (local) {
        case "date":
          element.setAttribute("data-localized", true);
          return relativeDate(time);
        case "time":
          element.setAttribute("data-localized", true);
          return strftime(time, format);
        case "time-ago":
          return relativeTimeAgo(time);
        case "time-or-date":
          return relativeTimeOrDate(time);
        case "weekday":
          return (_ref = relativeWeekday(time)) != null ? _ref : "";
      }
    })();
  });
});
run = function() {
  var event;
  event = document.createEvent("Events");
  event.initEvent("time:elapse", true, true);
  return document.dispatchEvent(event);
};
setInterval(run, 60 * 1000);
this.LocalTime = {
  relativeDate: relativeDate,
  relativeTimeAgo: relativeTimeAgo,
  relativeTimeOrDate: relativeTimeOrDate,
  relativeWeekday: relativeWeekday,
  run: run,
  strftime: strftime
};