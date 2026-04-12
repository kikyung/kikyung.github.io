/**
 * 타임스탬프 변환기 - Blog Developer Tools
 *
 * Unix 타임스탬프와 날짜/시간 형식 간 양방향 변환을 수행한다.
 * Asia/Seoul 타임존 기준으로 사람이 읽을 수 있는 날짜/시간을 표시한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 순수 로직 함수 (테스트 가능) ───

/**
 * 타임스탬프 값의 단위를 자동 감지한다.
 * 10자리 이하 = seconds, 13자리 = milliseconds
 * @param {number} value - 타임스탬프 값
 * @returns {'seconds'|'milliseconds'} 감지된 단위
 */
function detectTimestampUnit(value) {
  var absValue = Math.abs(value);
  var digits = String(absValue).length;
  if (digits <= 10) {
    return 'seconds';
  }
  return 'milliseconds';
}

/**
 * Unix 타임스탬프를 날짜 정보 객체로 변환한다.
 * 초/밀리초 단위를 자동 감지하여 처리한다.
 * @param {number} timestamp - Unix 타임스탬프 (초 또는 밀리초)
 * @returns {{ iso: string, readable: string, ms: number, sec: number }|null}
 *   변환 결과 객체 또는 유효하지 않은 경우 null
 */
function timestampToDate(timestamp) {
  if (typeof timestamp !== 'number' || isNaN(timestamp) || !isFinite(timestamp)) {
    return null;
  }

  var unit = detectTimestampUnit(timestamp);
  var ms;
  var sec;

  if (unit === 'seconds') {
    sec = Math.floor(timestamp);
    ms = sec * 1000;
  } else {
    ms = Math.floor(timestamp);
    sec = Math.floor(ms / 1000);
  }

  var date = new Date(ms);
  if (isNaN(date.getTime())) {
    return null;
  }

  var iso = date.toISOString();

  var readable;
  try {
    readable = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch (e) {
    readable = date.toLocaleString('ko-KR');
  }

  return {
    iso: iso,
    readable: readable,
    ms: ms,
    sec: sec
  };
}

/**
 * 날짜/시간 문자열을 Unix 타임스탬프로 변환한다.
 * @param {string} dateString - 날짜/시간 문자열 (ISO 8601 등 Date.parse 가능한 형식)
 * @returns {{ sec: number, ms: number }|null}
 *   변환 결과 객체 또는 유효하지 않은 경우 null
 */
function dateToTimestamp(dateString) {
  if (typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }

  var ms = Date.parse(dateString.trim());
  if (isNaN(ms)) {
    return null;
  }

  return {
    sec: Math.floor(ms / 1000),
    ms: ms
  };
}


// ─── DOM 조작 함수 (브라우저 전용) ───

var _currentTimeInterval = null;

/**
 * 현재 시각을 실시간으로 표시한다.
 * 1초마다 갱신되며, 타임스탬프(초/밀리초)와 읽기 쉬운 날짜를 표시한다.
 */
function startCurrentTimeDisplay() {
  var secEl = document.getElementById('current-timestamp-sec');
  var msEl = document.getElementById('current-timestamp-ms');
  var readableEl = document.getElementById('current-time-readable');

  if (!secEl && !msEl && !readableEl) return;

  function update() {
    var now = new Date();
    var ms = now.getTime();
    var sec = Math.floor(ms / 1000);

    if (secEl) secEl.textContent = sec;
    if (msEl) msEl.textContent = ms;
    if (readableEl) {
      try {
        readableEl.textContent = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      } catch (e) {
        readableEl.textContent = now.toLocaleString('ko-KR');
      }
    }
  }

  update();
  _currentTimeInterval = setInterval(update, 1000);
}

/**
 * 현재 시각 표시를 중지한다.
 */
function stopCurrentTimeDisplay() {
  if (_currentTimeInterval) {
    clearInterval(_currentTimeInterval);
    _currentTimeInterval = null;
  }
}

/**
 * 타임스탬프 → 날짜 변환을 수행하고 결과를 DOM에 렌더링한다.
 */
function handleTimestampInput() {
  var input = document.getElementById('timestamp-input');
  var outputArea = document.getElementById('timestamp-output');
  var errorId = 'timestamp-error';

  if (!input || !outputArea) return;

  var raw = input.value.trim();
  if (raw === '') {
    clearError(errorId);
    outputArea.innerHTML = '';
    return;
  }

  var num = Number(raw);
  if (isNaN(num) || !isFinite(num)) {
    showError(errorId, '유효하지 않은 입력입니다');
    return;
  }

  var result = timestampToDate(num);
  if (!result) {
    showError(errorId, '유효하지 않은 입력입니다');
    return;
  }

  clearError(errorId);
  renderTimestampResult(outputArea, result);
}

/**
 * 날짜 → 타임스탬프 변환을 수행하고 결과를 DOM에 렌더링한다.
 */
function handleDateInput() {
  var input = document.getElementById('date-input');
  var outputArea = document.getElementById('date-output');
  var errorId = 'date-error';

  if (!input || !outputArea) return;

  var raw = input.value.trim();
  if (raw === '') {
    clearError(errorId);
    outputArea.innerHTML = '';
    return;
  }

  var result = dateToTimestamp(raw);
  if (!result) {
    showError(errorId, '유효하지 않은 입력입니다');
    return;
  }

  clearError(errorId);
  renderDateResult(outputArea, result);
}

/**
 * 타임스탬프 변환 결과를 DOM에 렌더링한다.
 * @param {HTMLElement} container - 결과를 표시할 컨테이너
 * @param {{ iso: string, readable: string, ms: number, sec: number }} result
 */
function renderTimestampResult(container, result) {
  container.innerHTML =
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">ISO 8601</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.iso + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.iso + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">날짜/시간 (KST)</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.readable + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.readable.replace(/'/g, "\\'") + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">초 (seconds)</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.sec + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.sec + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">밀리초 (milliseconds)</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.ms + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.ms + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>';
}

/**
 * 날짜 변환 결과를 DOM에 렌더링한다.
 * @param {HTMLElement} container - 결과를 표시할 컨테이너
 * @param {{ sec: number, ms: number }} result
 */
function renderDateResult(container, result) {
  container.innerHTML =
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">초 (seconds)</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.sec + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.sec + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="tool-result-card">' +
      '<div class="tool-result-card-header">밀리초 (milliseconds)</div>' +
      '<div class="tool-result-card-body">' +
        '<span class="tool-result-card-value">' + result.ms + '</span>' +
        '<button class="tool-copy-btn tool-copy-btn-icon" onclick="copyToClipboard(\'' + result.ms + '\')" title="복사">' +
          '<i class="fas fa-copy"></i>' +
        '</button>' +
      '</div>' +
    '</div>';
}

// ─── 초기화 ───

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindTimestampEvents() {
  var tsInput = document.getElementById('timestamp-input');
  var dateInput = document.getElementById('date-input');

  if (tsInput) {
    tsInput.addEventListener('input', handleTimestampInput);
  }
  if (dateInput) {
    dateInput.addEventListener('input', handleDateInput);
  }
}

/**
 * 타임스탬프 변환기를 초기화한다.
 */
function initTimestampConverter() {
  startCurrentTimeDisplay();
  bindTimestampEvents();
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initTimestampConverter);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectTimestampUnit: detectTimestampUnit,
    timestampToDate: timestampToDate,
    dateToTimestamp: dateToTimestamp
  };
}
