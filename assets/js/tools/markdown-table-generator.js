/**
 * Markdown 테이블 생성기 - Blog Developer Tools
 *
 * 행/열 수를 지정하고 데이터를 입력하면 Markdown 테이블 코드를 생성한다.
 * 각 열에 대해 정렬 옵션(왼쪽, 가운데, 오른쪽)을 지원한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 순수 로직 함수 (테스트 가능) ───

/**
 * 빈 2차원 문자열 배열을 생성한다.
 * @param {number} rows - 행 수 (1 이상)
 * @param {number} cols - 열 수 (1 이상)
 * @returns {string[][]} rows x cols 크기의 빈 문자열 2차원 배열
 */
function parseTableSize(rows, cols) {
  var result = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) {
      row.push('');
    }
    result.push(row);
  }
  return result;
}

/**
 * 2차원 문자열 배열과 정렬 옵션으로 Markdown 테이블 문자열을 생성한다.
 * data[0]은 헤더 행, data[1..n]은 데이터 행으로 처리된다.
 * @param {string[][]} data - 테이블 데이터 (최소 1행)
 * @param {string[]} alignments - 각 열의 정렬 옵션 ('left', 'center', 'right')
 * @returns {string} Markdown 테이블 문자열
 */
function generateMarkdownTable(data, alignments) {
  if (!data || data.length === 0) {
    return '';
  }

  var cols = data[0].length;
  var lines = [];

  // 헤더 행
  var headerCells = [];
  for (var c = 0; c < cols; c++) {
    headerCells.push(' ' + (data[0][c] || '') + ' ');
  }
  lines.push('|' + headerCells.join('|') + '|');

  // 구분선 행 (정렬 옵션 반영)
  var separators = [];
  for (var c = 0; c < cols; c++) {
    var align = (alignments && alignments[c]) || 'left';
    if (align === 'center') {
      separators.push(' :---: ');
    } else if (align === 'right') {
      separators.push(' ---: ');
    } else {
      separators.push(' :--- ');
    }
  }
  lines.push('|' + separators.join('|') + '|');

  // 데이터 행
  for (var r = 1; r < data.length; r++) {
    var cells = [];
    for (var c = 0; c < cols; c++) {
      cells.push(' ' + ((data[r] && data[r][c]) || '') + ' ');
    }
    lines.push('|' + cells.join('|') + '|');
  }

  return lines.join('\n');
}


// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * 현재 테이블 그리드에서 데이터를 읽어 2차원 배열로 반환한다.
 * @returns {string[][]} 테이블 데이터
 */
function readGridData() {
  var grid = document.getElementById('table-grid');
  if (!grid) return [];

  var table = grid.querySelector('table');
  if (!table) return [];

  var data = [];
  var rows = table.querySelectorAll('tr');
  for (var r = 0; r < rows.length; r++) {
    var cells = rows[r].querySelectorAll('input');
    var rowData = [];
    for (var c = 0; c < cells.length; c++) {
      rowData.push(cells[c].value);
    }
    data.push(rowData);
  }
  return data;
}

/**
 * 현재 정렬 드롭다운에서 정렬 옵션 배열을 읽어 반환한다.
 * @returns {string[]} 정렬 옵션 배열
 */
function readAlignments() {
  var container = document.getElementById('table-alignment-row');
  if (!container) return [];

  var selects = container.querySelectorAll('select');
  var alignments = [];
  for (var i = 0; i < selects.length; i++) {
    alignments.push(selects[i].value);
  }
  return alignments;
}

/**
 * Markdown 미리보기를 갱신한다.
 */
function updateMarkdownPreview() {
  var data = readGridData();
  var alignments = readAlignments();
  var markdown = generateMarkdownTable(data, alignments);

  var output = document.getElementById('table-output');
  if (output) {
    output.textContent = markdown;
  }
}

/**
 * 테이블 그리드를 렌더링한다.
 * @param {string[][]} data - 테이블 데이터 (data[0] = 헤더)
 */
function renderGrid(data) {
  var grid = document.getElementById('table-grid');
  if (!grid || data.length === 0) return;

  var cols = data[0].length;

  var html = '<table class="table-grid-table">';

  // 헤더 행 (첫 번째 행)
  html += '<tr>';
  for (var c = 0; c < cols; c++) {
    html += '<th><input type="text" class="grid-cell grid-header-cell" ' +
      'data-row="0" data-col="' + c + '" ' +
      'value="' + escapeAttr(data[0][c]) + '" ' +
      'placeholder="Header ' + (c + 1) + '"></th>';
  }
  html += '</tr>';

  // 데이터 행
  for (var r = 1; r < data.length; r++) {
    html += '<tr>';
    for (var c = 0; c < cols; c++) {
      html += '<td><input type="text" class="grid-cell" ' +
        'data-row="' + r + '" data-col="' + c + '" ' +
        'value="' + escapeAttr((data[r] && data[r][c]) || '') + '" ' +
        'placeholder=""></td>';
    }
    html += '</tr>';
  }

  html += '</table>';
  grid.innerHTML = html;

  // 셀 입력 이벤트 바인딩
  var inputs = grid.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', updateMarkdownPreview);
  }

  // 정렬 드롭다운 렌더링
  renderAlignmentRow(cols);

  // 미리보기 갱신
  updateMarkdownPreview();
}

/**
 * 정렬 옵션 드롭다운 행을 렌더링한다.
 * @param {number} cols - 열 수
 */
function renderAlignmentRow(cols) {
  var container = document.getElementById('table-alignment-row');
  if (!container) return;

  // 기존 정렬 값 보존
  var existing = readAlignments();

  var html = '';
  for (var c = 0; c < cols; c++) {
    var current = (existing[c]) || 'left';
    html += '<select class="alignment-select" data-col="' + c + '">' +
      '<option value="left"' + (current === 'left' ? ' selected' : '') + '>왼쪽 (:---)</option>' +
      '<option value="center"' + (current === 'center' ? ' selected' : '') + '>가운데 (:---:)</option>' +
      '<option value="right"' + (current === 'right' ? ' selected' : '') + '>오른쪽 (---:)</option>' +
    '</select>';
  }
  container.innerHTML = html;

  // 정렬 변경 이벤트 바인딩
  var selects = container.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    selects[i].addEventListener('change', updateMarkdownPreview);
  }
}

/**
 * HTML 속성 값에 안전하게 삽입하기 위해 특수문자를 이스케이프한다.
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 행/열 수 입력에 따라 그리드를 재생성한다.
 */
function handleSizeChange() {
  var rowsInput = document.getElementById('table-rows');
  var colsInput = document.getElementById('table-cols');
  var errorId = 'table-error';

  if (!rowsInput || !colsInput) return;

  var rows = parseInt(rowsInput.value, 10);
  var cols = parseInt(colsInput.value, 10);

  if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
    showError(errorId, '1 이상의 값을 입력해주세요');
    return;
  }

  clearError(errorId);

  // 기존 데이터 보존 시도
  var oldData = readGridData();
  // rows 입력은 데이터 행 수 (헤더 제외), 총 행 = rows + 1 (헤더 포함)
  var totalRows = rows + 1;
  var newData = parseTableSize(totalRows, cols);

  // 기존 데이터 복사
  for (var r = 0; r < Math.min(oldData.length, totalRows); r++) {
    for (var c = 0; c < Math.min((oldData[r] || []).length, cols); c++) {
      newData[r][c] = oldData[r][c];
    }
  }

  renderGrid(newData);
}

/**
 * 행을 추가한다.
 */
function addRow() {
  var data = readGridData();
  if (data.length === 0) return;

  var cols = data[0].length;
  var newRow = [];
  for (var c = 0; c < cols; c++) {
    newRow.push('');
  }
  data.push(newRow);

  // 행 수 입력 업데이트 (헤더 제외)
  var rowsInput = document.getElementById('table-rows');
  if (rowsInput) {
    rowsInput.value = data.length - 1;
  }

  renderGrid(data);
}

/**
 * 마지막 행을 삭제한다. 헤더 행은 삭제하지 않는다.
 */
function removeRow() {
  var data = readGridData();
  if (data.length <= 1) return; // 헤더만 남으면 삭제 불가

  data.pop();

  var rowsInput = document.getElementById('table-rows');
  if (rowsInput) {
    rowsInput.value = data.length - 1;
  }

  renderGrid(data);
}

/**
 * 열을 추가한다.
 */
function addColumn() {
  var data = readGridData();
  if (data.length === 0) return;

  for (var r = 0; r < data.length; r++) {
    data[r].push('');
  }

  var colsInput = document.getElementById('table-cols');
  if (colsInput) {
    colsInput.value = data[0].length;
  }

  renderGrid(data);
}

/**
 * 마지막 열을 삭제한다. 최소 1열은 유지한다.
 */
function removeColumn() {
  var data = readGridData();
  if (data.length === 0 || data[0].length <= 1) return;

  for (var r = 0; r < data.length; r++) {
    data[r].pop();
  }

  var colsInput = document.getElementById('table-cols');
  if (colsInput) {
    colsInput.value = data[0].length;
  }

  renderGrid(data);
}

/**
 * 생성된 Markdown을 클립보드에 복사한다.
 */
function copyMarkdownTable() {
  var output = document.getElementById('table-output');
  if (!output || !output.textContent) return;
  copyToClipboard(output.textContent);
}


// ─── 초기화 ───

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindTableEvents() {
  var rowsInput = document.getElementById('table-rows');
  var colsInput = document.getElementById('table-cols');

  if (rowsInput) {
    rowsInput.addEventListener('change', handleSizeChange);
    rowsInput.addEventListener('input', handleSizeChange);
  }
  if (colsInput) {
    colsInput.addEventListener('change', handleSizeChange);
    colsInput.addEventListener('input', handleSizeChange);
  }

  // 행/열 추가/삭제 버튼
  var addRowBtn = document.getElementById('btn-add-row');
  var removeRowBtn = document.getElementById('btn-remove-row');
  var addColBtn = document.getElementById('btn-add-col');
  var removeColBtn = document.getElementById('btn-remove-col');
  var copyBtn = document.getElementById('btn-copy-table');

  if (addRowBtn) addRowBtn.addEventListener('click', addRow);
  if (removeRowBtn) removeRowBtn.addEventListener('click', removeRow);
  if (addColBtn) addColBtn.addEventListener('click', addColumn);
  if (removeColBtn) removeColBtn.addEventListener('click', removeColumn);
  if (copyBtn) copyBtn.addEventListener('click', copyMarkdownTable);
}

/**
 * Markdown 테이블 생성기를 초기화한다.
 */
function initMarkdownTableGenerator() {
  bindTableEvents();

  // 기본 3x3 테이블 생성 (헤더 1행 + 데이터 2행)
  var rowsInput = document.getElementById('table-rows');
  var colsInput = document.getElementById('table-cols');

  var defaultRows = (rowsInput && parseInt(rowsInput.value, 10)) || 2;
  var defaultCols = (colsInput && parseInt(colsInput.value, 10)) || 3;

  if (defaultRows >= 1 && defaultCols >= 1) {
    var data = parseTableSize(defaultRows + 1, defaultCols); // +1 for header
    renderGrid(data);
  }
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initMarkdownTableGenerator);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateMarkdownTable: generateMarkdownTable,
    parseTableSize: parseTableSize
  };
}
