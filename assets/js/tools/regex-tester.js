/**
 * 정규표현식 테스터 - Blog Developer Tools
 *
 * 정규표현식 패턴과 테스트 문자열을 입력받아 실시간으로
 * 매칭 결과를 하이라이트하고 매칭 그룹 정보를 표시한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 자주 사용되는 정규표현식 예시 ───

var REGEX_EXAMPLES = [
  { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', label: '이메일', testString: 'user@example.com, test@test.co.kr' },
  { pattern: 'https?://[\\w.-]+(?:\\.[\\w.-]+)+[\\w.,@?^=%&:/~+#-]*', flags: 'g', label: 'URL', testString: 'Visit https://example.com or http://test.org/path' },
  { pattern: '01[016789]-\\d{3,4}-\\d{4}', flags: 'g', label: '전화번호', testString: '010-1234-5678, 011-123-4567' },
  { pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g', label: 'IP 주소', testString: '192.168.1.1, 10.0.0.1' }
];

// ─── 핵심 매칭 로직 (순수 함수) ───

/**
 * 정규표현식 패턴과 테스트 문자열로 매칭을 수행한다.
 *
 * @param {string} pattern - 정규표현식 패턴 문자열
 * @param {string} flags - 플래그 문자열 (예: 'gi')
 * @param {string} testString - 테스트 대상 문자열
 * @returns {Array<{fullMatch: string, groups: Array<{index: number, name: string|null, value: string}>, start: number, end: number}>}
 * @throws {SyntaxError} 유효하지 않은 정규표현식 패턴
 */
function testRegex(pattern, flags, testString) {
  if (typeof pattern !== 'string' || pattern === '') {
    return [];
  }
  if (typeof testString !== 'string') {
    return [];
  }

  var regex = new RegExp(pattern, flags || '');
  var results = [];
  var isGlobal = regex.global;

  if (isGlobal) {
    var match;
    while ((match = regex.exec(testString)) !== null) {
      results.push(buildMatchResult(match));
      // 빈 문자열 매칭 시 무한 루프 방지
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
  } else {
    var singleMatch = regex.exec(testString);
    if (singleMatch) {
      results.push(buildMatchResult(singleMatch));
    }
  }

  return results;
}

/**
 * RegExp exec 결과로부터 MatchResult 객체를 생성한다.
 * @param {RegExpExecArray} match - exec 결과
 * @returns {{ fullMatch: string, groups: Array<{index: number, name: string|null, value: string}>, start: number, end: number }}
 */
function buildMatchResult(match) {
  var groups = [];

  // 명명된 캡처 그룹 이름 맵 생성
  var namedGroups = match.groups || {};
  var nameByValue = {};
  var keys = Object.keys(namedGroups);
  for (var k = 0; k < keys.length; k++) {
    nameByValue[keys[k]] = namedGroups[keys[k]];
  }

  // 캡처 그룹 추출 (인덱스 1부터)
  for (var i = 1; i < match.length; i++) {
    var value = match[i];
    if (value === undefined) {
      value = '';
    }
    var groupName = null;

    // 명명된 그룹 이름 찾기
    for (var j = 0; j < keys.length; j++) {
      if (namedGroups[keys[j]] === value && groupName === null) {
        groupName = keys[j];
        // 같은 이름이 다시 매칭되지 않도록 제거하지 않음 (동일 값 가능)
      }
    }

    groups.push({
      index: i,
      name: groupName,
      value: value
    });
  }

  return {
    fullMatch: match[0],
    groups: groups,
    start: match.index,
    end: match.index + match[0].length
  };
}

// ─── 하이라이트 렌더링 ───

/**
 * 매칭 결과를 기반으로 테스트 문자열에 하이라이트 HTML을 생성한다.
 * 매칭된 부분을 <span class="regex-highlight"> 태그로 감싼다.
 *
 * @param {string} testString - 원본 테스트 문자열
 * @param {Array} matches - testRegex 반환 결과
 * @returns {string} 하이라이트된 HTML 문자열
 */
function renderHighlight(testString, matches) {
  if (!matches || matches.length === 0 || !testString) {
    return escapeHtml(testString || '');
  }

  // 매칭 위치를 start 기준으로 정렬
  var sorted = matches.slice().sort(function (a, b) {
    return a.start - b.start;
  });

  var html = '';
  var lastIndex = 0;

  for (var i = 0; i < sorted.length; i++) {
    var m = sorted[i];
    // 겹치는 매칭 건너뛰기
    if (m.start < lastIndex) continue;

    // 매칭 전 텍스트
    if (m.start > lastIndex) {
      html += escapeHtml(testString.substring(lastIndex, m.start));
    }

    // 매칭된 텍스트
    html += '<span class="regex-highlight">' + escapeHtml(m.fullMatch) + '</span>';
    lastIndex = m.end;
  }

  // 나머지 텍스트
  if (lastIndex < testString.length) {
    html += escapeHtml(testString.substring(lastIndex));
  }

  return html;
}

/**
 * HTML 특수문자를 이스케이프한다.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── 매칭 상세 렌더링 ───

/**
 * 매칭 결과 상세 목록 HTML을 생성한다.
 * @param {Array} matches - testRegex 반환 결과
 * @returns {string} HTML 문자열
 */
function renderMatchDetails(matches) {
  if (!matches || matches.length === 0) {
    return '<p class="no-match">매칭 결과가 없습니다.</p>';
  }

  var html = '';
  for (var i = 0; i < matches.length; i++) {
    var m = matches[i];
    html += '<div class="match-item">';
    html += '<div class="match-header">매칭 #' + (i + 1) + '</div>';
    html += '<div class="match-detail">';
    html += '<span class="detail-label">전체 매칭:</span> ';
    html += '<code>' + escapeHtml(m.fullMatch) + '</code>';
    html += '</div>';
    html += '<div class="match-detail">';
    html += '<span class="detail-label">위치:</span> ';
    html += 'index ' + m.start + ' ~ ' + m.end;
    html += '</div>';

    if (m.groups.length > 0) {
      html += '<div class="match-groups">';
      html += '<span class="detail-label">캡처 그룹:</span>';
      for (var j = 0; j < m.groups.length; j++) {
        var g = m.groups[j];
        var label = '그룹 ' + g.index;
        if (g.name) {
          label += ' (' + g.name + ')';
        }
        html += '<div class="group-item">';
        html += '<span class="group-label">' + label + ':</span> ';
        html += '<code>' + escapeHtml(g.value) + '</code>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
  }

  return html;
}

/**
 * 매칭 요약 정보 HTML을 생성한다.
 * @param {Array} matches - testRegex 반환 결과
 * @returns {string} HTML 문자열
 */
function renderSummary(matches) {
  if (!matches || matches.length === 0) {
    return '';
  }

  var totalMatches = matches.length;
  var totalGroups = 0;
  for (var i = 0; i < matches.length; i++) {
    totalGroups += matches[i].groups.length;
  }

  return '총 <strong>' + totalMatches + '</strong>개 매칭, ' +
    '캡처 그룹 <strong>' + totalGroups + '</strong>개';
}

// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * 현재 선택된 플래그 문자열을 반환한다.
 * @returns {string} 플래그 문자열 (예: 'gi')
 */
function getSelectedFlags() {
  var flagIds = ['regex-flags-g', 'regex-flags-i', 'regex-flags-m', 'regex-flags-s', 'regex-flags-u'];
  var flagChars = ['g', 'i', 'm', 's', 'u'];
  var result = '';

  for (var i = 0; i < flagIds.length; i++) {
    var checkbox = document.getElementById(flagIds[i]);
    if (checkbox && checkbox.checked) {
      result += flagChars[i];
    }
  }

  return result;
}

/**
 * 정규표현식 입력을 처리하고 결과를 렌더링한다.
 */
function handleRegexInput() {
  var patternInput = document.getElementById('regex-pattern');
  var testStringInput = document.getElementById('regex-test-string');
  var errorEl = 'regex-error';
  var highlightOutput = document.getElementById('regex-output-highlight');
  var matchesOutput = document.getElementById('regex-output-matches');
  var summaryOutput = document.getElementById('regex-output-summary');

  if (!patternInput || !testStringInput) return;

  var pattern = patternInput.value;
  var testString = testStringInput.value;
  var flags = getSelectedFlags();

  // 패턴이 비어있으면 초기화
  if (pattern === '') {
    if (typeof clearError === 'function') clearError(errorEl);
    if (highlightOutput) highlightOutput.innerHTML = escapeHtml(testString);
    if (matchesOutput) matchesOutput.innerHTML = '';
    if (summaryOutput) summaryOutput.innerHTML = '';
    return;
  }

  try {
    var matches = testRegex(pattern, flags, testString);
    if (typeof clearError === 'function') clearError(errorEl);

    if (highlightOutput) {
      highlightOutput.innerHTML = renderHighlight(testString, matches);
    }
    if (matchesOutput) {
      matchesOutput.innerHTML = renderMatchDetails(matches);
    }
    if (summaryOutput) {
      summaryOutput.innerHTML = renderSummary(matches);
    }
  } catch (e) {
    if (typeof showError === 'function') showError(errorEl, e.message);
    // 오류 시 하이라이트는 원본 텍스트 표시
    if (highlightOutput) {
      highlightOutput.innerHTML = escapeHtml(testString);
    }
    if (matchesOutput) matchesOutput.innerHTML = '';
    if (summaryOutput) summaryOutput.innerHTML = '';
  }
}

/**
 * 예시 정규표현식을 입력 필드에 설정한다.
 * @param {number} index - REGEX_EXAMPLES 배열 인덱스
 */
function setRegexExample(index) {
  if (index < 0 || index >= REGEX_EXAMPLES.length) return;

  var example = REGEX_EXAMPLES[index];
  var patternInput = document.getElementById('regex-pattern');
  var testStringInput = document.getElementById('regex-test-string');

  if (patternInput) patternInput.value = example.pattern;
  if (testStringInput) testStringInput.value = example.testString;

  // 플래그 설정
  var flagIds = ['regex-flags-g', 'regex-flags-i', 'regex-flags-m', 'regex-flags-s', 'regex-flags-u'];
  var flagChars = ['g', 'i', 'm', 's', 'u'];
  for (var i = 0; i < flagIds.length; i++) {
    var checkbox = document.getElementById(flagIds[i]);
    if (checkbox) {
      checkbox.checked = example.flags.indexOf(flagChars[i]) !== -1;
    }
  }

  handleRegexInput();
}

// ─── 이벤트 바인딩 ───

function bindRegexEvents() {
  var patternInput = document.getElementById('regex-pattern');
  var testStringInput = document.getElementById('regex-test-string');
  var flagIds = ['regex-flags-g', 'regex-flags-i', 'regex-flags-m', 'regex-flags-s', 'regex-flags-u'];

  if (patternInput) {
    patternInput.addEventListener('input', handleRegexInput);
  }
  if (testStringInput) {
    testStringInput.addEventListener('input', handleRegexInput);
  }

  for (var i = 0; i < flagIds.length; i++) {
    var checkbox = document.getElementById(flagIds[i]);
    if (checkbox) {
      checkbox.addEventListener('change', handleRegexInput);
    }
  }
}

// ─── 초기화 ───

function initRegexTester() {
  bindRegexEvents();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initRegexTester);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testRegex: testRegex,
    buildMatchResult: buildMatchResult,
    renderHighlight: renderHighlight,
    renderMatchDetails: renderMatchDetails,
    renderSummary: renderSummary,
    escapeHtml: escapeHtml,
    REGEX_EXAMPLES: REGEX_EXAMPLES
  };
}
