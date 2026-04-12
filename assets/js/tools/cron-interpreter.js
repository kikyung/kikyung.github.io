/**
 * Cron 표현식 해석기 - Blog Developer Tools
 *
 * Cron 표현식(5필드 리눅스 crontab / 6필드 Spring @Scheduled)을
 * 파싱하여 한국어 설명으로 변환하고, 다음 실행 시각을 계산한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 상수 ───

var CRON_EXAMPLES = [
  { expression: '* * * * *', label: '매분' },
  { expression: '*/5 * * * *', label: '5분마다' },
  { expression: '0 * * * *', label: '매시 정각' },
  { expression: '0 0 * * *', label: '매일 자정' },
  { expression: '0 9 * * MON', label: '매주 월요일 오전 9시' },
  { expression: '0 0 1 * *', label: '매월 1일 자정' },
  { expression: '0 0 0 * * *', label: '매일 자정 (Spring 6필드)' },
  { expression: '0 */10 * * * *', label: '10분마다 (Spring 6필드)' }
];

var FIELD_RANGES = {
  second:     { min: 0, max: 59 },
  minute:     { min: 0, max: 59 },
  hour:       { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month:      { min: 1, max: 12 },
  dayOfWeek:  { min: 0, max: 7 }
};

var DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토', '일'];

var MONTH_NAMES = ['', '1월', '2월', '3월', '4월', '5월', '6월',
                   '7월', '8월', '9월', '10월', '11월', '12월'];

var DAY_NAME_MAP = {
  'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3,
  'THU': 4, 'FRI': 5, 'SAT': 6
};

// ─── 필드 파싱 ───

/**
 * 요일 이름(SUN-SAT)을 숫자로 변환한다.
 * @param {string} token
 * @returns {string} 숫자 문자열 또는 원본
 */
function replaceDayNames(token) {
  var upper = token.toUpperCase();
  var result = upper;
  var names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  for (var i = 0; i < names.length; i++) {
    // 전체 토큰이 이름인 경우와 범위/리스트 내 이름 모두 처리
    var re = new RegExp('\\b' + names[i] + '\\b', 'g');
    result = result.replace(re, String(DAY_NAME_MAP[names[i]]));
  }
  return result;
}

/**
 * 단일 Cron 필드 토큰을 파싱하여 값 배열을 반환한다.
 * 지원 형식: *, N, N-M, N/step, N-M/step, star/step, N,M,O
 * @param {string} token - 필드 토큰
 * @param {string} fieldType - 필드 타입 (second, minute, hour, dayOfMonth, month, dayOfWeek)
 * @returns {number[]} 파싱된 값 배열
 * @throws {Error} 유효하지 않은 토큰
 */
function parseFieldToken(token, fieldType) {
  var range = FIELD_RANGES[fieldType];
  if (!range) {
    throw new Error('알 수 없는 필드 타입: ' + fieldType);
  }

  // 요일 필드인 경우 이름을 숫자로 변환
  var processed = token;
  if (fieldType === 'dayOfWeek') {
    processed = replaceDayNames(token);
  }

  var values = [];

  // 쉼표로 구분된 리스트 처리
  var parts = processed.split(',');
  for (var p = 0; p < parts.length; p++) {
    var part = parts[p].trim();
    if (part === '') continue;

    var stepParts = part.split('/');
    var rangePart = stepParts[0];
    var step = stepParts.length > 1 ? parseInt(stepParts[1], 10) : null;

    if (step !== null && (isNaN(step) || step <= 0)) {
      throw new Error('유효하지 않은 step 값: ' + stepParts[1]);
    }

    var start, end;

    if (rangePart === '*') {
      start = range.min;
      end = range.max;
    } else if (rangePart.indexOf('-') !== -1) {
      var rangeBounds = rangePart.split('-');
      start = parseInt(rangeBounds[0], 10);
      end = parseInt(rangeBounds[1], 10);
      if (isNaN(start) || isNaN(end)) {
        throw new Error('유효하지 않은 범위: ' + rangePart);
      }
    } else {
      var val = parseInt(rangePart, 10);
      if (isNaN(val)) {
        throw new Error('유효하지 않은 값: ' + rangePart);
      }
      if (step !== null) {
        start = val;
        end = range.max;
      } else {
        // 단일 값 - 범위 검증
        if (fieldType === 'dayOfWeek' && val === 7) {
          val = 0; // 7 = Sunday
        }
        if (val < range.min || val > range.max) {
          throw new Error(fieldType + ' 값이 범위를 벗어났습니다: ' + val +
            ' (허용: ' + range.min + '-' + range.max + ')');
        }
        values.push(val);
        continue;
      }
    }

    // step이 있는 범위 또는 * 처리
    if (step === null) step = 1;
    for (var i = start; i <= end; i += step) {
      var normalized = i;
      if (fieldType === 'dayOfWeek' && normalized === 7) {
        normalized = 0;
      }
      if (normalized >= range.min && normalized <= range.max) {
        if (values.indexOf(normalized) === -1) {
          values.push(normalized);
        }
      }
    }
  }

  values.sort(function (a, b) { return a - b; });
  return values;
}

// ─── 필드 설명 생성 ───

/**
 * 개별 Cron 필드에 대한 한국어 설명을 생성한다.
 * @param {{ raw: string, type: string, values: number[] }} field - CronField 객체
 * @param {string} type - 필드 타입
 * @returns {string} 한국어 설명
 */
function describeField(field, type) {
  var raw = field.raw;
  var values = field.values;
  var range = FIELD_RANGES[type];

  if (!range) return raw;

  // 모든 값인 경우 (*)
  var allValues = [];
  for (var i = range.min; i <= range.max; i++) {
    allValues.push(i);
  }
  var isAll = values.length === allValues.length;

  // */N 패턴 감지
  var stepMatch = raw.match(/^\*\/(\d+)$/);

  if (raw === '*') {
    switch (type) {
      case 'second': return '매초';
      case 'minute': return '매분';
      case 'hour': return '매시';
      case 'dayOfMonth': return '매일';
      case 'month': return '매월';
      case 'dayOfWeek': return '매요일';
      default: return '모든 값';
    }
  }

  if (stepMatch) {
    var stepVal = parseInt(stepMatch[1], 10);
    switch (type) {
      case 'second': return '매 ' + stepVal + '초마다';
      case 'minute': return '매 ' + stepVal + '분마다';
      case 'hour': return '매 ' + stepVal + '시간마다';
      case 'dayOfMonth': return '매 ' + stepVal + '일마다';
      case 'month': return '매 ' + stepVal + '개월마다';
      case 'dayOfWeek': return '매 ' + stepVal + '요일마다';
      default: return '매 ' + stepVal + '마다';
    }
  }

  // 범위 패턴 (N-M)
  var rangeMatch = raw.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return formatRangeDescription(type, parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
  }

  // 단일 값 또는 리스트
  if (values.length === 1) {
    return formatSingleValue(type, values[0]);
  }

  // 리스트
  var descriptions = [];
  for (var j = 0; j < values.length; j++) {
    descriptions.push(formatValueForType(type, values[j]));
  }
  return descriptions.join(', ');
}

/**
 * 범위 설명을 생성한다.
 */
function formatRangeDescription(type, start, end) {
  switch (type) {
    case 'second': return start + '초에서 ' + end + '초';
    case 'minute': return start + '분에서 ' + end + '분';
    case 'hour': return start + '시에서 ' + end + '시';
    case 'dayOfMonth': return start + '일에서 ' + end + '일';
    case 'month': return MONTH_NAMES[start] + '에서 ' + MONTH_NAMES[end];
    case 'dayOfWeek': return DAY_NAMES[start] + '요일에서 ' + DAY_NAMES[end] + '요일';
    default: return start + '-' + end;
  }
}

/**
 * 단일 값 설명을 생성한다.
 */
function formatSingleValue(type, value) {
  switch (type) {
    case 'second': return value + '초';
    case 'minute': return value + '분';
    case 'hour': return value + '시';
    case 'dayOfMonth': return value + '일';
    case 'month': return MONTH_NAMES[value] || (value + '월');
    case 'dayOfWeek': return DAY_NAMES[value] + '요일';
    default: return String(value);
  }
}

/**
 * 타입에 맞는 값 포맷을 반환한다.
 */
function formatValueForType(type, value) {
  switch (type) {
    case 'dayOfWeek': return DAY_NAMES[value] + '요일';
    case 'month': return MONTH_NAMES[value] || (value + '월');
    default: return String(value);
  }
}

// ─── 전체 설명 생성 ───

/**
 * 파싱된 Cron 필드 배열로부터 전체 한국어 설명을 생성한다.
 * @param {Array} fields - CronField 배열
 * @param {string} cronType - '5-field' 또는 '6-field'
 * @returns {string} 한국어 설명
 */
function buildDescription(fields, cronType) {
  var fieldMap = {};
  for (var i = 0; i < fields.length; i++) {
    fieldMap[fields[i].type] = fields[i];
  }

  var sec = fieldMap.second;
  var min = fieldMap.minute;
  var hour = fieldMap.hour;
  var dom = fieldMap.dayOfMonth;
  var mon = fieldMap.month;
  var dow = fieldMap.dayOfWeek;

  var parts = [];

  // 특수 패턴 감지
  // 매분: * * * * * 또는 0 * * * * *
  if (isAllStar(min) && isAllStar(hour) && isAllStar(dom) && isAllStar(mon) && isAllStar(dow)) {
    if (!sec || sec.raw === '0') {
      return '매분 실행';
    }
    if (isAllStar(sec)) {
      return '매초 실행';
    }
  }

  // 월 필터
  if (!isAllStar(mon)) {
    parts.push(describeField(mon, 'month'));
  }

  // 요일 필터
  if (!isAllStar(dow)) {
    parts.push('매주 ' + describeField(dow, 'dayOfWeek'));
  }

  // 일 필터
  if (!isAllStar(dom)) {
    if (isAllStar(dow)) {
      parts.push('매월 ' + describeField(dom, 'dayOfMonth'));
    } else {
      parts.push(describeField(dom, 'dayOfMonth'));
    }
  } else if (isAllStar(dow) && isAllStar(mon)) {
    parts.push('매일');
  }

  // 시간
  if (!isAllStar(hour)) {
    if (hour.values.length === 1) {
      var h = hour.values[0];
      // 자정 특수 처리: hour=0, minute=0
      if (h === 0 && min && min.values.length === 1 && min.values[0] === 0) {
        parts.push('자정');
      } else {
        var period = h < 12 ? '오전' : '오후';
        var displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        parts.push(period + ' ' + displayHour + '시');
      }
    } else if (hour.raw.indexOf('/') !== -1) {
      parts.push(describeField(hour, 'hour'));
    } else {
      parts.push(describeField(hour, 'hour'));
    }
  }

  // 분
  if (!isAllStar(min)) {
    if (min.raw.indexOf('/') !== -1) {
      parts.push(describeField(min, 'minute'));
    } else if (min.values.length === 1 && min.values[0] === 0) {
      // 정각 - 이미 시간에 포함
      if (isAllStar(hour)) {
        parts.push('정각');
      }
    } else {
      parts.push(describeField(min, 'minute'));
    }
  } else {
    // 분이 *인 경우
    if (!isAllStar(hour)) {
      parts.push('매분');
    }
  }

  // 초 (6필드)
  if (sec && !isAllStar(sec) && sec.raw !== '0') {
    if (sec.raw.indexOf('/') !== -1) {
      parts.push(describeField(sec, 'second'));
    } else {
      parts.push(describeField(sec, 'second'));
    }
  }

  if (parts.length === 0) {
    return '매분 실행';
  }

  return parts.join(' ') + ' 실행';
}

/**
 * 필드가 모든 값(*)인지 확인한다.
 */
function isAllStar(field) {
  if (!field) return true;
  return field.raw === '*';
}

// ─── 핵심 파싱 함수 ───

/**
 * Cron 표현식을 파싱하여 구조화된 결과를 반환한다.
 * 5필드(리눅스 crontab)와 6필드(Spring @Scheduled)를 자동 감지한다.
 *
 * @param {string} expression - Cron 표현식
 * @returns {{ type: string, fields: Array, description: string }}
 * @throws {Error} 유효하지 않은 표현식
 */
function parseCron(expression) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    throw new Error('유효하지 않은 Cron 표현식입니다. 형식: "분 시 일 월 요일" (5필드) 또는 "초 분 시 일 월 요일" (6필드)');
  }

  var tokens = expression.trim().split(/\s+/);
  var cronType;
  var fieldTypes;

  if (tokens.length === 5) {
    cronType = '5-field';
    fieldTypes = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  } else if (tokens.length === 6) {
    cronType = '6-field';
    fieldTypes = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  } else {
    throw new Error('유효하지 않은 Cron 표현식입니다. 형식: "분 시 일 월 요일" (5필드) 또는 "초 분 시 일 월 요일" (6필드)');
  }

  var fields = [];
  for (var i = 0; i < tokens.length; i++) {
    var type = fieldTypes[i];
    var raw = tokens[i];
    var values;

    try {
      values = parseFieldToken(raw, type);
    } catch (e) {
      throw new Error('유효하지 않은 Cron 표현식입니다. ' + e.message +
        '. 형식: "분 시 일 월 요일" (5필드) 또는 "초 분 시 일 월 요일" (6필드)');
    }

    if (values.length === 0) {
      throw new Error('유효하지 않은 Cron 표현식입니다. 필드 "' + raw + '"에서 유효한 값을 찾을 수 없습니다.' +
        ' 형식: "분 시 일 월 요일" (5필드) 또는 "초 분 시 일 월 요일" (6필드)');
    }

    fields.push({
      raw: raw,
      type: type,
      values: values,
      description: ''
    });
  }

  // 각 필드의 설명 생성
  for (var j = 0; j < fields.length; j++) {
    fields[j].description = describeField(fields[j], fields[j].type);
  }

  var description = buildDescription(fields, cronType);

  return {
    type: cronType,
    fields: fields,
    description: description
  };
}

// ─── 다음 실행 시각 계산 ───

/**
 * Cron 표현식의 다음 N회 실행 시각을 계산한다.
 *
 * @param {string} expression - Cron 표현식
 * @param {number} [count] - 반환할 실행 시각 수 (기본: 5)
 * @param {string} [timezone] - 타임존 (기본: 'Asia/Seoul')
 * @returns {Date[]} 다음 실행 시각 배열
 */
function getNextExecutions(expression, count, timezone) {
  if (count === undefined || count === null) count = 5;
  if (timezone === undefined || timezone === null) timezone = 'Asia/Seoul';

  var parsed = parseCron(expression);
  var fields = parsed.fields;
  var cronType = parsed.type;

  var fieldMap = {};
  for (var i = 0; i < fields.length; i++) {
    fieldMap[fields[i].type] = fields[i].values;
  }

  var secValues = fieldMap.second || [0];
  var minValues = fieldMap.minute;
  var hourValues = fieldMap.hour;
  var domValues = fieldMap.dayOfMonth;
  var monValues = fieldMap.month;
  var dowValues = fieldMap.dayOfWeek;

  var results = [];
  var now = new Date();

  // 타임존 오프셋 계산을 위해 현재 시각을 해당 타임존으로 변환
  var candidate = new Date(now.getTime() + 1000); // 1초 후부터 시작

  var maxIterations = 366 * 24 * 60 * 60; // 최대 1년치 초 탐색
  var iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    var tzDate = getDateInTimezone(candidate, timezone);
    var year = tzDate.year;
    var month = tzDate.month; // 1-12
    var day = tzDate.day;     // 1-31
    var hour = tzDate.hour;   // 0-23
    var minute = tzDate.minute; // 0-59
    var second = tzDate.second; // 0-59
    var dayOfWeek = tzDate.dayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat

    // 월 체크
    if (monValues.indexOf(month) === -1) {
      // 다음 달 1일 0시 0분 0초로 이동
      candidate = advanceToNextMonth(candidate, timezone);
      continue;
    }

    // 일/요일 체크
    var domMatch = domValues.indexOf(day) !== -1;
    var dowMatch = dowValues.indexOf(dayOfWeek) !== -1;

    // 일과 요일 모두 *가 아닌 경우 OR 조건, 둘 다 *이면 AND
    var dayMatch;
    var domIsAll = isAllValues(domValues, FIELD_RANGES.dayOfMonth);
    var dowIsAll = isAllValues(dowValues, FIELD_RANGES.dayOfWeek);

    if (domIsAll && dowIsAll) {
      dayMatch = true;
    } else if (domIsAll) {
      dayMatch = dowMatch;
    } else if (dowIsAll) {
      dayMatch = domMatch;
    } else {
      // 둘 다 지정된 경우 OR 조건 (cron 표준)
      dayMatch = domMatch || dowMatch;
    }

    if (!dayMatch) {
      candidate = advanceToNextDay(candidate, timezone);
      continue;
    }

    // 시간 체크
    if (hourValues.indexOf(hour) === -1) {
      candidate = advanceToNextHour(candidate, timezone);
      continue;
    }

    // 분 체크
    if (minValues.indexOf(minute) === -1) {
      candidate = advanceToNextMinute(candidate, timezone);
      continue;
    }

    // 초 체크
    if (secValues.indexOf(second) === -1) {
      candidate = new Date(candidate.getTime() + 1000);
      continue;
    }

    // 매칭! 결과에 추가
    results.push(new Date(candidate.getTime()));

    // 다음 초로 이동
    candidate = new Date(candidate.getTime() + 1000);
  }

  return results;
}

/**
 * 주어진 타임존에서의 날짜 구성 요소를 반환한다.
 * @param {Date} date
 * @param {string} timezone
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number, second: number, dayOfWeek: number }}
 */
function getDateInTimezone(date, timezone) {
  try {
    var parts = {};
    var formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    var formatted = formatter.formatToParts(date);
    for (var i = 0; i < formatted.length; i++) {
      var p = formatted[i];
      if (p.type === 'year') parts.year = parseInt(p.value, 10);
      if (p.type === 'month') parts.month = parseInt(p.value, 10);
      if (p.type === 'day') parts.day = parseInt(p.value, 10);
      if (p.type === 'hour') parts.hour = parseInt(p.value, 10);
      if (p.type === 'minute') parts.minute = parseInt(p.value, 10);
      if (p.type === 'second') parts.second = parseInt(p.value, 10);
    }

    // hour가 24인 경우 0으로 보정 (일부 환경)
    if (parts.hour === 24) parts.hour = 0;

    // dayOfWeek 계산 - 타임존 기반 날짜로 계산
    var tzDateStr = parts.year + '-' +
      String(parts.month).padStart(2, '0') + '-' +
      String(parts.day).padStart(2, '0') + 'T12:00:00';
    var tempDate = new Date(tzDateStr);
    parts.dayOfWeek = tempDate.getUTCDay();

    return parts;
  } catch (e) {
    // Intl 미지원 시 로컬 시간 사용
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      dayOfWeek: date.getDay()
    };
  }
}

/**
 * 값 배열이 해당 범위의 모든 값을 포함하는지 확인한다.
 */
function isAllValues(values, range) {
  var count = range.max - range.min + 1;
  // dayOfWeek의 경우 0과 7이 모두 Sunday이므로 특별 처리
  if (range.min === 0 && range.max === 7) {
    count = 7; // 0-6
  }
  return values.length >= count;
}

/**
 * 다음 달 1일 00:00:00으로 이동한다.
 */
function advanceToNextMonth(date, timezone) {
  var tz = getDateInTimezone(date, timezone);
  var nextMonth = tz.month + 1;
  var nextYear = tz.year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }
  var target = new Date(nextYear + '-' +
    String(nextMonth).padStart(2, '0') + '-01T00:00:00');
  // 타임존 보정: 대략적으로 이동
  return adjustToTimezone(target, timezone, nextYear, nextMonth, 1, 0, 0, 0);
}

/**
 * 다음 날 00:00:00으로 이동한다.
 */
function advanceToNextDay(date, timezone) {
  var tz = getDateInTimezone(date, timezone);
  var next = new Date(tz.year, tz.month - 1, tz.day + 1, 0, 0, 0);
  return adjustToTimezone(next, timezone, next.getFullYear(), next.getMonth() + 1, next.getDate(), 0, 0, 0);
}

/**
 * 다음 시간 00분 00초로 이동한다.
 */
function advanceToNextHour(date, timezone) {
  var tz = getDateInTimezone(date, timezone);
  var next = new Date(tz.year, tz.month - 1, tz.day, tz.hour + 1, 0, 0);
  return adjustToTimezone(next, timezone, next.getFullYear(), next.getMonth() + 1, next.getDate(), next.getHours(), 0, 0);
}

/**
 * 다음 분 00초로 이동한다.
 */
function advanceToNextMinute(date, timezone) {
  var tz = getDateInTimezone(date, timezone);
  var next = new Date(tz.year, tz.month - 1, tz.day, tz.hour, tz.minute + 1, 0);
  return adjustToTimezone(next, timezone, next.getFullYear(), next.getMonth() + 1, next.getDate(), next.getHours(), next.getMinutes(), 0);
}

/**
 * 타임존에 맞게 Date 객체를 보정한다.
 * 간단한 구현: 로컬 시간 기준으로 생성 후 반환
 */
function adjustToTimezone(date, timezone, year, month, day, hour, minute, second) {
  // 타임존 오프셋을 계산하여 UTC Date 생성
  try {
    // 목표 타임존 시간으로 Date 생성
    var isoStr = year + '-' +
      String(month).padStart(2, '0') + '-' +
      String(day).padStart(2, '0') + 'T' +
      String(hour).padStart(2, '0') + ':' +
      String(minute).padStart(2, '0') + ':' +
      String(second).padStart(2, '0');

    // 임시 Date로 오프셋 추정
    var tempDate = new Date(isoStr + 'Z');
    var tzParts = getDateInTimezone(tempDate, timezone);

    // 오프셋 차이 계산 (분 단위)
    var targetMinutes = hour * 60 + minute;
    var actualMinutes = tzParts.hour * 60 + tzParts.minute;
    var diffMs = (targetMinutes - actualMinutes) * 60 * 1000;

    // 날짜 차이도 고려
    if (tzParts.day !== day) {
      if (tzParts.day > day || (tzParts.month > month)) {
        diffMs -= 24 * 60 * 60 * 1000;
      } else {
        diffMs += 24 * 60 * 60 * 1000;
      }
    }

    return new Date(tempDate.getTime() + diffMs);
  } catch (e) {
    return date;
  }
}

// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * Cron 표현식 입력을 처리하고 결과를 렌더링한다.
 */
function handleCronInput() {
  var input = document.getElementById('cron-input');
  var outputArea = document.getElementById('cron-output');
  var errorId = 'cron-error';

  if (!input || !outputArea) return;

  var raw = input.value.trim();
  if (raw === '') {
    if (typeof clearError === 'function') clearError(errorId);
    outputArea.innerHTML = '';
    return;
  }

  try {
    var result = parseCron(raw);
    if (typeof clearError === 'function') clearError(errorId);
    renderCronResult(outputArea, result, raw);
  } catch (e) {
    if (typeof showError === 'function') showError(errorId, e.message);
  }
}

/**
 * Cron 해석 결과를 DOM에 렌더링한다.
 */
function renderCronResult(container, result, expression) {
  var html = '';

  // 타입 표시
  html += '<div class="result-item">';
  html += '<span class="result-label">형식: </span>';
  html += '<span class="result-value">' +
    (result.type === '5-field' ? '5필드 (리눅스 crontab)' : '6필드 (Spring @Scheduled)') +
    '</span>';
  html += '</div>';

  // 한국어 설명
  html += '<div class="result-item">';
  html += '<span class="result-label">설명: </span>';
  html += '<span class="result-value" id="cron-description">' + result.description + '</span>';
  html += '</div>';

  // 필드별 분석
  html += '<div class="result-section"><h4>필드 분석</h4>';
  for (var i = 0; i < result.fields.length; i++) {
    var f = result.fields[i];
    html += '<div class="result-item field-analysis">';
    html += '<span class="result-label">' + getFieldLabel(f.type) + '</span>';
    html += '<span class="result-value"><code>' + f.raw + '</code> → ' + f.description + '</span>';
    html += '</div>';
  }
  html += '</div>';

  // 다음 실행 시각
  try {
    var nextExecs = getNextExecutions(expression, 5, 'Asia/Seoul');
    if (nextExecs.length > 0) {
      html += '<div class="result-section"><h4>다음 5회 실행 시각 (KST)</h4>';
      for (var j = 0; j < nextExecs.length; j++) {
        var dateStr;
        try {
          dateStr = nextExecs[j].toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        } catch (e) {
          dateStr = nextExecs[j].toLocaleString('ko-KR');
        }
        html += '<div class="result-item">';
        html += '<span class="result-value">' + (j + 1) + '. ' + dateStr + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
  } catch (e) {
    // 다음 실행 시각 계산 실패 시 무시
  }

  container.innerHTML = html;
}

/**
 * 필드 타입의 한국어 라벨을 반환한다.
 */
function getFieldLabel(type) {
  switch (type) {
    case 'second': return '초';
    case 'minute': return '분';
    case 'hour': return '시';
    case 'dayOfMonth': return '일';
    case 'month': return '월';
    case 'dayOfWeek': return '요일';
    default: return type;
  }
}

/**
 * 예시 Cron 표현식을 입력 필드에 설정한다.
 */
function setCronExample(expression) {
  var input = document.getElementById('cron-input');
  if (input) {
    input.value = expression;
    handleCronInput();
  }
}

// ─── 초기화 ───

function bindCronEvents() {
  var cronInput = document.getElementById('cron-input');
  if (cronInput) {
    cronInput.addEventListener('input', handleCronInput);
  }
}

function initCronInterpreter() {
  bindCronEvents();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCronInterpreter);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCron: parseCron,
    getNextExecutions: getNextExecutions,
    describeField: describeField,
    parseFieldToken: parseFieldToken,
    CRON_EXAMPLES: CRON_EXAMPLES,
    FIELD_RANGES: FIELD_RANGES
  };
}
