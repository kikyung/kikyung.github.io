/**
 * Obsidian Metadata Generator - Blog Developer Tools
 *
 * Obsidian 노트용 YAML Front Matter 메타데이터를 생성한다.
 * title, date, tags, categories, aliases, cssclass 및 커스텀 필드를 지원한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 날짜/시간 유틸리티 ───

/**
 * 현재 날짜/시간을 Asia/Seoul 타임존 기준 ISO 8601 형식으로 반환한다.
 * @returns {string} 예: "2025-01-15T14:30:00+09:00"
 */
function getCurrentDateTimeKST() {
  var now = new Date();
  // Asia/Seoul은 UTC+9 고정
  var kstOffset = 9 * 60; // 분 단위
  var utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  var kstDate = new Date(utcMs + (kstOffset * 60000));

  var year = kstDate.getFullYear();
  var month = String(kstDate.getMonth() + 1).padStart(2, '0');
  var day = String(kstDate.getDate()).padStart(2, '0');
  var hours = String(kstDate.getHours()).padStart(2, '0');
  var minutes = String(kstDate.getMinutes()).padStart(2, '0');
  var seconds = String(kstDate.getSeconds()).padStart(2, '0');

  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '+09:00';
}

// ─── YAML 생성 ───

/**
 * YAML 문자열에서 특수문자가 포함된 값을 안전하게 이스케이프한다.
 * 콜론, 해시, 대괄호 등 YAML 특수문자가 포함되면 따옴표로 감싼다.
 * @param {string} value - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeYamlValue(value) {
  if (typeof value !== 'string') {
    return String(value);
  }
  if (value === '') {
    return '""';
  }
  // YAML 특수문자가 포함되거나, 앞뒤 공백이 있거나, 따옴표가 포함된 경우
  if (/[:#\[\]{}&*!|>'"`,@%\\\n]/.test(value) ||
      value !== value.trim() ||
      value === 'true' || value === 'false' ||
      value === 'null' || value === 'yes' || value === 'no' ||
      /^\d+(\.\d+)?$/.test(value)) {
    // 내부에 큰따옴표가 있으면 이스케이프
    var escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return '"' + escaped + '"';
  }
  return value;
}

/**
 * MetadataFields 객체를 YAML Front Matter 문자열로 변환한다.
 *
 * @param {Object} fields - 메타데이터 필드
 * @param {string} [fields.title] - 노트 제목
 * @param {string} [fields.date] - 날짜/시간 (미지정 시 현재 KST 시간)
 * @param {string[]} [fields.tags] - 태그 배열
 * @param {string[]} [fields.categories] - 카테고리 배열
 * @param {string[]} [fields.aliases] - 별칭 배열
 * @param {string} [fields.cssclass] - CSS 클래스
 * @param {Array<{key: string, value: string}>} [fields.customFields] - 커스텀 필드 배열
 * @returns {string} YAML Front Matter 문자열 (--- 구분자 포함)
 */
function generateYaml(fields) {
  if (!fields || typeof fields !== 'object') {
    fields = {};
  }

  var lines = [];
  lines.push('---');

  // title
  var title = (fields.title !== undefined && fields.title !== null) ? String(fields.title) : '';
  lines.push('title: ' + escapeYamlValue(title));

  // date (자동 채움)
  var date = (fields.date !== undefined && fields.date !== null && fields.date !== '')
    ? String(fields.date)
    : getCurrentDateTimeKST();
  lines.push('date: ' + escapeYamlValue(date));

  // tags (dash list format)
  lines.push('tags:');
  var tags = Array.isArray(fields.tags) ? fields.tags : [];
  if (tags.length === 0) {
    lines[lines.length - 1] = 'tags: []';
  } else {
    for (var i = 0; i < tags.length; i++) {
      var tag = String(tags[i]).trim();
      if (tag !== '') {
        lines.push('  - ' + escapeYamlValue(tag));
      }
    }
  }

  // categories (dash list format)
  lines.push('categories:');
  var categories = Array.isArray(fields.categories) ? fields.categories : [];
  if (categories.length === 0) {
    lines[lines.length - 1] = 'categories: []';
  } else {
    for (var j = 0; j < categories.length; j++) {
      var cat = String(categories[j]).trim();
      if (cat !== '') {
        lines.push('  - ' + escapeYamlValue(cat));
      }
    }
  }

  // aliases (dash list format)
  lines.push('aliases:');
  var aliases = Array.isArray(fields.aliases) ? fields.aliases : [];
  if (aliases.length === 0) {
    lines[lines.length - 1] = 'aliases: []';
  } else {
    for (var k = 0; k < aliases.length; k++) {
      var alias = String(aliases[k]).trim();
      if (alias !== '') {
        lines.push('  - ' + escapeYamlValue(alias));
      }
    }
  }

  // cssclass
  var cssclass = (fields.cssclass !== undefined && fields.cssclass !== null) ? String(fields.cssclass) : '';
  lines.push('cssclass: ' + escapeYamlValue(cssclass));

  // custom fields
  var customFields = Array.isArray(fields.customFields) ? fields.customFields : [];
  for (var m = 0; m < customFields.length; m++) {
    var cf = customFields[m];
    if (cf && cf.key && String(cf.key).trim() !== '') {
      var cfKey = String(cf.key).trim();
      var cfValue = (cf.value !== undefined && cf.value !== null) ? String(cf.value) : '';
      lines.push(cfKey + ': ' + escapeYamlValue(cfValue));
    }
  }

  lines.push('---');

  return lines.join('\n');
}

// ─── YAML 파싱 ───

/**
 * YAML Front Matter 문자열을 파싱하여 MetadataFields 객체로 변환한다.
 * 외부 라이브러리 없이 간단한 파서로 구현한다.
 *
 * 지원 형식:
 * - 문자열 값: key: value
 * - 따옴표 문자열: key: "value" 또는 key: 'value'
 * - 배열 (dash list): key:\n  - item1\n  - item2
 * - 배열 (inline): key: [item1, item2]
 * - 빈 배열: key: []
 *
 * @param {string} yamlString - YAML Front Matter 문자열
 * @returns {Object} 파싱된 MetadataFields 객체
 */
function parseYaml(yamlString) {
  if (typeof yamlString !== 'string') {
    return {};
  }

  // --- 구분자 제거
  var content = yamlString.trim();
  if (content.startsWith('---')) {
    content = content.substring(3);
  }
  if (content.endsWith('---')) {
    content = content.substring(0, content.length - 3);
  }
  content = content.trim();

  if (content === '') {
    return {};
  }

  var lines = content.split('\n');
  var result = {};
  var knownArrayFields = ['tags', 'categories', 'aliases'];
  var customFields = [];
  var knownScalarFields = ['title', 'date', 'cssclass'];

  var currentKey = null;
  var currentIsDashList = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // dash list item (  - value)
    if (/^\s+-\s+/.test(line) && currentKey !== null) {
      var dashValue = line.replace(/^\s+-\s+/, '');
      dashValue = unquoteYamlValue(dashValue.trim());
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(dashValue);
      currentIsDashList = true;
      continue;
    }

    // key: value line
    var colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }

    var key = line.substring(0, colonIndex).trim();
    var rawValue = line.substring(colonIndex + 1).trim();

    if (key === '') {
      continue;
    }

    currentKey = key;
    currentIsDashList = false;

    // 빈 값 (다음 줄에 dash list가 올 수 있음)
    if (rawValue === '') {
      // 배열 필드로 알려진 경우 빈 배열로 초기화
      if (knownArrayFields.indexOf(key) !== -1) {
        result[key] = [];
      } else {
        result[key] = '';
      }
      continue;
    }

    // 빈 배열 []
    if (rawValue === '[]') {
      result[key] = [];
      continue;
    }

    // 인라인 배열 [a, b, c]
    if (rawValue.charAt(0) === '[' && rawValue.charAt(rawValue.length - 1) === ']') {
      var inner = rawValue.substring(1, rawValue.length - 1).trim();
      if (inner === '') {
        result[key] = [];
      } else {
        var items = splitInlineArray(inner);
        var parsed = [];
        for (var j = 0; j < items.length; j++) {
          parsed.push(unquoteYamlValue(items[j].trim()));
        }
        result[key] = parsed;
      }
      continue;
    }

    // 일반 스칼라 값
    result[key] = unquoteYamlValue(rawValue);
  }

  // 결과를 MetadataFields 형태로 정리
  var output = {};

  output.title = result.title !== undefined ? String(result.title) : '';
  output.date = result.date !== undefined ? String(result.date) : '';

  output.tags = Array.isArray(result.tags) ? result.tags : [];
  output.categories = Array.isArray(result.categories) ? result.categories : [];
  output.aliases = Array.isArray(result.aliases) ? result.aliases : [];

  output.cssclass = result.cssclass !== undefined ? String(result.cssclass) : '';

  // 나머지 필드는 customFields로
  output.customFields = [];
  var standardKeys = ['title', 'date', 'tags', 'categories', 'aliases', 'cssclass'];
  for (var prop in result) {
    if (result.hasOwnProperty(prop) && standardKeys.indexOf(prop) === -1) {
      output.customFields.push({
        key: prop,
        value: String(result[prop])
      });
    }
  }

  return output;
}

/**
 * YAML 따옴표를 제거한다.
 * @param {string} value - 따옴표가 포함될 수 있는 값
 * @returns {string} 따옴표가 제거된 값
 */
function unquoteYamlValue(value) {
  if (typeof value !== 'string') {
    return String(value);
  }
  // 큰따옴표
  if (value.length >= 2 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
    var inner = value.substring(1, value.length - 1);
    // 이스케이프된 따옴표와 백슬래시 복원
    return inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  // 작은따옴표
  if (value.length >= 2 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
    return value.substring(1, value.length - 1);
  }
  return value;
}

/**
 * 인라인 배열 문자열을 쉼표로 분리한다.
 * 따옴표 내부의 쉼표는 무시한다.
 * @param {string} str - 인라인 배열 내부 문자열
 * @returns {string[]} 분리된 항목 배열
 */
function splitInlineArray(str) {
  var items = [];
  var current = '';
  var inQuote = false;
  var quoteChar = '';

  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);

    if (inQuote) {
      if (ch === '\\' && i + 1 < str.length) {
        current += ch + str.charAt(i + 1);
        i++;
        continue;
      }
      if (ch === quoteChar) {
        inQuote = false;
      }
      current += ch;
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
        current += ch;
      } else if (ch === ',') {
        items.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }

  if (current.trim() !== '') {
    items.push(current);
  }

  return items;
}


// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * 입력 필드에서 MetadataFields 객체를 수집한다.
 * @returns {Object} MetadataFields 객체
 */
function collectMetadataFields() {
  var titleEl = document.getElementById('meta-title');
  var tagsEl = document.getElementById('meta-tags');
  var categoriesEl = document.getElementById('meta-categories');
  var aliasesEl = document.getElementById('meta-aliases');
  var cssclassEl = document.getElementById('meta-cssclass');

  var title = titleEl ? titleEl.value.trim() : '';
  var tagsRaw = tagsEl ? tagsEl.value.trim() : '';
  var categoriesRaw = categoriesEl ? categoriesEl.value.trim() : '';
  var aliasesRaw = aliasesEl ? aliasesEl.value.trim() : '';
  var cssclass = cssclassEl ? cssclassEl.value.trim() : '';

  // 쉼표 구분 문자열을 배열로 변환
  var tags = parseCommaSeparated(tagsRaw);
  var categories = parseCommaSeparated(categoriesRaw);
  var aliases = parseCommaSeparated(aliasesRaw);

  // 커스텀 필드 수집
  var customFields = collectCustomFields();

  return {
    title: title,
    date: '', // 자동 채움
    tags: tags,
    categories: categories,
    aliases: aliases,
    cssclass: cssclass,
    customFields: customFields
  };
}

/**
 * 쉼표로 구분된 문자열을 배열로 변환한다.
 * 빈 항목은 제거한다.
 * @param {string} str - 쉼표 구분 문자열
 * @returns {string[]} 배열
 */
function parseCommaSeparated(str) {
  if (!str || str.trim() === '') {
    return [];
  }
  var items = str.split(',');
  var result = [];
  for (var i = 0; i < items.length; i++) {
    var trimmed = items[i].trim();
    if (trimmed !== '') {
      result.push(trimmed);
    }
  }
  return result;
}

/**
 * 커스텀 필드 컨테이너에서 모든 커스텀 필드를 수집한다.
 * @returns {Array<{key: string, value: string}>} 커스텀 필드 배열
 */
function collectCustomFields() {
  var container = document.getElementById('meta-custom-fields');
  if (!container) return [];

  var rows = container.querySelectorAll('.custom-field-row');
  var fields = [];

  for (var i = 0; i < rows.length; i++) {
    var keyInput = rows[i].querySelector('.custom-field-key');
    var valueInput = rows[i].querySelector('.custom-field-value');
    if (keyInput && valueInput) {
      var key = keyInput.value.trim();
      var value = valueInput.value.trim();
      if (key !== '') {
        fields.push({ key: key, value: value });
      }
    }
  }

  return fields;
}

/**
 * 커스텀 필드 행을 추가한다.
 */
function addCustomField() {
  var container = document.getElementById('meta-custom-fields');
  if (!container) return;

  var row = document.createElement('div');
  row.className = 'custom-field-row';

  var keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.className = 'custom-field-key';
  keyInput.placeholder = '필드 이름';
  keyInput.addEventListener('input', updateYamlPreview);

  var valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.className = 'custom-field-value';
  valueInput.placeholder = '필드 값';
  valueInput.addEventListener('input', updateYamlPreview);

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove-custom-field';
  removeBtn.textContent = '삭제';
  removeBtn.addEventListener('click', function () {
    row.remove();
    updateYamlPreview();
  });

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

/**
 * YAML 미리보기를 업데이트한다.
 */
function updateYamlPreview() {
  clearError('meta-error');

  var fields = collectMetadataFields();
  var yaml = generateYaml(fields);

  var outputEl = document.getElementById('meta-output');
  if (outputEl) {
    outputEl.textContent = yaml;
  }
}

/**
 * 생성된 YAML을 클립보드에 복사한다.
 */
function handleCopyYaml() {
  var outputEl = document.getElementById('meta-output');
  if (outputEl && outputEl.textContent) {
    copyToClipboard(outputEl.textContent);
  }
}

// ─── 초기화 ───

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindMetadataEvents() {
  var inputIds = ['meta-title', 'meta-tags', 'meta-categories', 'meta-aliases', 'meta-cssclass'];
  for (var i = 0; i < inputIds.length; i++) {
    var el = document.getElementById(inputIds[i]);
    if (el) {
      el.addEventListener('input', updateYamlPreview);
    }
  }

  var addBtn = document.getElementById('btn-add-custom-field');
  if (addBtn) {
    addBtn.addEventListener('click', addCustomField);
  }

  var copyBtn = document.getElementById('btn-copy-yaml');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyYaml);
  }
}

/**
 * Metadata Generator를 초기화한다.
 */
function initMetadataGenerator() {
  bindMetadataEvents();
  // 초기 YAML 미리보기 생성
  updateYamlPreview();
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', initMetadataGenerator);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateYaml: generateYaml,
    parseYaml: parseYaml,
    escapeYamlValue: escapeYamlValue,
    unquoteYamlValue: unquoteYamlValue,
    splitInlineArray: splitInlineArray,
    parseCommaSeparated: parseCommaSeparated,
    getCurrentDateTimeKST: getCurrentDateTimeKST
  };
}
