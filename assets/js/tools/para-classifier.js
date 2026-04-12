/**
 * PARA 분류 도우미 - Blog Developer Tools
 *
 * PARA(Projects, Areas, Resources, Archives) 방법론에 따라
 * 노트나 정보를 키워드 및 체크리스트 기반으로 분류한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── PARA 카테고리 데이터 ───

var PARA_CATEGORIES = [
  { name: 'Projects', prefix: '1_Projects/', icon: 'fas fa-project-diagram', description: '마감일과 결과물이 있는 단기 프로젝트', criteria: ['명확한 마감일이 있다', '구체적인 결과물/산출물이 있다', '완료 시점이 정해져 있다'] },
  { name: 'Areas', prefix: '2_Areas/', icon: 'fas fa-layer-group', description: '지속적으로 관리해야 하는 책임 영역', criteria: ['마감일 없이 지속된다', '일정 수준을 유지해야 한다', '정기적인 관리가 필요하다'] },
  { name: 'Resources', prefix: '3_Resources/', icon: 'fas fa-book', description: '관심 주제에 대한 참고 자료', criteria: ['나중에 참고할 정보이다', '특정 주제에 대한 자료이다', '언제든 검색/활용 가능하다'] },
  { name: 'Archives', prefix: '4_Archives/', icon: 'fas fa-archive', description: '완료되었거나 비활성화된 항목', criteria: ['더 이상 활성 상태가 아니다', '완료된 프로젝트이다', '보관 목적으로 유지한다'] }
];

// ─── 키워드 사전 ───

var PARA_KEYWORDS = {
  Projects: ['프로젝트', '마감', 'deadline', '출시', '릴리즈', 'release', '런칭', 'launch', '완성', '제출', '납품', '개발 완료', '목표'],
  Areas: ['관리', '유지', '루틴', '습관', '건강', '재정', '운동', '학습', '역량', '책임', '반복', '정기', '매일', '매주', '매월'],
  Resources: ['참고', '자료', '레퍼런스', 'reference', '정리', '메모', '노트', '가이드', '튜토리얼', 'tutorial', '문서', '리서치', '조사', '공부'],
  Archives: ['완료', '종료', '보관', '중단', '폐기', '아카이브', 'archive', '끝', '마무리', '지난', '과거', '비활성']
};

// ─── 핵심 분류 로직 ───

/**
 * 카테고리 이름에 해당하는 폴더 접두사를 반환한다.
 * @param {string} category - 카테고리 이름
 * @returns {string} 폴더 접두사
 */
function getCategoryPrefix(category) {
  for (var i = 0; i < PARA_CATEGORIES.length; i++) {
    if (PARA_CATEGORIES[i].name === category) {
      return PARA_CATEGORIES[i].prefix;
    }
  }
  return '3_Resources/';
}

/**
 * 텍스트에서 각 카테고리별 키워드 매칭 점수를 계산한다.
 * @param {string} text - 검색 대상 텍스트 (제목 + 설명)
 * @returns {Object} 카테고리별 매칭 키워드 수 { Projects: n, Areas: n, Resources: n, Archives: n }
 */
function scoreKeywords(text) {
  var lowerText = text.toLowerCase();
  var scores = { Projects: 0, Areas: 0, Resources: 0, Archives: 0 };

  var categories = ['Projects', 'Areas', 'Resources', 'Archives'];
  for (var c = 0; c < categories.length; c++) {
    var cat = categories[c];
    var keywords = PARA_KEYWORDS[cat];
    for (var k = 0; k < keywords.length; k++) {
      if (lowerText.indexOf(keywords[k].toLowerCase()) !== -1) {
        scores[cat]++;
      }
    }
  }

  return scores;
}

/**
 * 제목, 설명, 체크리스트를 기반으로 PARA 카테고리를 분류한다.
 *
 * 분류 우선순위:
 * 1. 체크리스트 기반 (high confidence)
 *    - Projects: hasDeadline=true AND hasDeliverable=true
 *    - Areas: isOngoing=true AND !hasDeadline
 *    - Resources: isReference=true
 *    - Archives: isInactive=true
 * 2. 키워드 기반 (medium confidence)
 * 3. 기본값: Resources (low confidence)
 *
 * @param {string} title - 노트 제목
 * @param {string} description - 노트 설명
 * @param {Object} checklist - 체크리스트 상태
 * @param {boolean} checklist.hasDeadline - 마감일이 있는가
 * @param {boolean} checklist.hasDeliverable - 결과물이 있는가
 * @param {boolean} checklist.isOngoing - 지속적인 활동인가
 * @param {boolean} checklist.isReference - 참고 자료인가
 * @param {boolean} checklist.isInactive - 비활성 상태인가
 * @returns {Object} 분류 결과 { category, confidence, reasoning, folderPath, checklist }
 */
function classifyPARA(title, description, checklist) {
  // 입력 정규화
  var safeTitle = (title && typeof title === 'string') ? title.trim() : '';
  var safeDesc = (description && typeof description === 'string') ? description.trim() : '';
  var safeChecklist = normalizeChecklist(checklist);

  var category = 'Resources';
  var confidence = 'low';
  var reasoning = '';

  // 1단계: 체크리스트 기반 분류 (high confidence)
  if (safeChecklist.isInactive) {
    category = 'Archives';
    confidence = 'high';
    reasoning = '비활성 상태로 표시되어 Archives로 분류됩니다.';
  } else if (safeChecklist.hasDeadline && safeChecklist.hasDeliverable) {
    category = 'Projects';
    confidence = 'high';
    reasoning = '마감일과 결과물이 모두 있어 Projects로 분류됩니다.';
  } else if (safeChecklist.isOngoing && !safeChecklist.hasDeadline) {
    category = 'Areas';
    confidence = 'high';
    reasoning = '마감일 없이 지속되는 활동이므로 Areas로 분류됩니다.';
  } else if (safeChecklist.isReference) {
    category = 'Resources';
    confidence = 'high';
    reasoning = '참고 자료로 표시되어 Resources로 분류됩니다.';
  }

  // 2단계: 체크리스트로 결정되지 않은 경우 키워드 기반 분류 (medium confidence)
  if (confidence === 'low') {
    var combinedText = safeTitle + ' ' + safeDesc;
    var scores = scoreKeywords(combinedText);

    // 가장 높은 점수의 카테고리 찾기
    var maxScore = 0;
    var maxCategory = 'Resources';
    var categories = ['Projects', 'Areas', 'Resources', 'Archives'];

    for (var i = 0; i < categories.length; i++) {
      if (scores[categories[i]] > maxScore) {
        maxScore = scores[categories[i]];
        maxCategory = categories[i];
      }
    }

    if (maxScore > 0) {
      category = maxCategory;
      confidence = 'medium';
      reasoning = '키워드 분석 결과 ' + category + ' 카테고리와 가장 관련이 높습니다 (매칭 키워드 ' + maxScore + '개).';
    } else {
      category = 'Resources';
      confidence = 'low';
      reasoning = '명확한 분류 기준이 없어 기본값인 Resources로 분류됩니다.';
    }
  }

  // 폴더 경로 생성
  var folderName = safeTitle !== '' ? safeTitle : 'Untitled';
  var folderPath = getCategoryPrefix(category) + folderName;

  return {
    category: category,
    confidence: confidence,
    reasoning: reasoning,
    folderPath: folderPath,
    checklist: safeChecklist
  };
}

/**
 * 체크리스트 객체를 정규화한다. 누락된 필드는 false로 채운다.
 * @param {Object} checklist - 원본 체크리스트
 * @returns {Object} 정규화된 체크리스트
 */
function normalizeChecklist(checklist) {
  if (!checklist || typeof checklist !== 'object') {
    return {
      hasDeadline: false,
      hasDeliverable: false,
      isOngoing: false,
      isReference: false,
      isInactive: false
    };
  }
  return {
    hasDeadline: !!checklist.hasDeadline,
    hasDeliverable: !!checklist.hasDeliverable,
    isOngoing: !!checklist.isOngoing,
    isReference: !!checklist.isReference,
    isInactive: !!checklist.isInactive
  };
}


// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * DOM 체크박스에서 체크리스트 상태를 수집한다.
 * @returns {Object} 체크리스트 상태
 */
function collectPARAChecklist() {
  var deadlineEl = document.getElementById('para-checklist-deadline');
  var deliverableEl = document.getElementById('para-checklist-deliverable');
  var ongoingEl = document.getElementById('para-checklist-ongoing');
  var referenceEl = document.getElementById('para-checklist-reference');
  var inactiveEl = document.getElementById('para-checklist-inactive');

  return {
    hasDeadline: deadlineEl ? deadlineEl.checked : false,
    hasDeliverable: deliverableEl ? deliverableEl.checked : false,
    isOngoing: ongoingEl ? ongoingEl.checked : false,
    isReference: referenceEl ? referenceEl.checked : false,
    isInactive: inactiveEl ? inactiveEl.checked : false
  };
}

/**
 * 분류 결과를 DOM에 렌더링한다.
 * @param {Object} result - classifyPARA 반환 결과
 */
function renderPARAResult(result) {
  var outputEl = document.getElementById('para-output');
  if (!outputEl) return;

  // 카테고리 정보 찾기
  var catInfo = null;
  for (var i = 0; i < PARA_CATEGORIES.length; i++) {
    if (PARA_CATEGORIES[i].name === result.category) {
      catInfo = PARA_CATEGORIES[i];
      break;
    }
  }

  var confidenceLabel = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  };

  var confidenceClass = 'confidence-' + result.confidence;

  var html = '';
  html += '<div class="para-result">';
  html += '  <div class="para-result-category">';
  if (catInfo) {
    html += '    <i class="' + catInfo.icon + '"></i> ';
  }
  html += '    <strong>' + result.category + '</strong>';
  html += '    <span class="para-confidence ' + confidenceClass + '">';
  html += '      신뢰도: ' + (confidenceLabel[result.confidence] || result.confidence);
  html += '    </span>';
  html += '  </div>';
  if (catInfo) {
    html += '  <p class="para-result-description">' + catInfo.description + '</p>';
  }
  html += '  <div class="para-result-reasoning">';
  html += '    <strong>분류 근거:</strong> ' + result.reasoning;
  html += '  </div>';
  html += '  <div class="para-result-folder">';
  html += '    <strong>추천 폴더 경로:</strong> <code>' + result.folderPath + '</code>';
  html += '  </div>';
  html += '</div>';

  outputEl.innerHTML = html;
}

/**
 * 분류를 실행하고 결과를 렌더링한다.
 */
function runPARAClassification() {
  clearError('para-error');

  var titleEl = document.getElementById('para-title');
  var descEl = document.getElementById('para-description');

  var title = titleEl ? titleEl.value.trim() : '';
  var description = descEl ? descEl.value.trim() : '';

  if (title === '' && description === '') {
    showError('para-error', '제목 또는 설명을 입력해주세요.');
    return;
  }

  var checklist = collectPARAChecklist();
  var result = classifyPARA(title, description, checklist);
  renderPARAResult(result);
}

/**
 * 분류 결과를 클립보드에 복사한다.
 */
function handleCopyPARAResult() {
  var titleEl = document.getElementById('para-title');
  var descEl = document.getElementById('para-description');

  var title = titleEl ? titleEl.value.trim() : '';
  var description = descEl ? descEl.value.trim() : '';

  if (title === '' && description === '') {
    return;
  }

  var checklist = collectPARAChecklist();
  var result = classifyPARA(title, description, checklist);

  var text = '';
  text += '카테고리: ' + result.category + '\n';
  text += '신뢰도: ' + result.confidence + '\n';
  text += '근거: ' + result.reasoning + '\n';
  text += '폴더 경로: ' + result.folderPath;

  copyToClipboard(text);
}

// ─── 초기화 ───

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindPARAEvents() {
  // 입력 필드 변경 시 자동 분류
  var inputIds = ['para-title', 'para-description'];
  for (var i = 0; i < inputIds.length; i++) {
    var el = document.getElementById(inputIds[i]);
    if (el) {
      el.addEventListener('input', runPARAClassification);
    }
  }

  // 체크박스 변경 시 자동 분류
  var checkboxIds = [
    'para-checklist-deadline',
    'para-checklist-deliverable',
    'para-checklist-ongoing',
    'para-checklist-reference',
    'para-checklist-inactive'
  ];
  for (var j = 0; j < checkboxIds.length; j++) {
    var cb = document.getElementById(checkboxIds[j]);
    if (cb) {
      cb.addEventListener('change', runPARAClassification);
    }
  }

  // 복사 버튼
  var copyBtn = document.getElementById('btn-copy-para');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyPARAResult);
  }
}

/**
 * PARA 분류 도우미를 초기화한다.
 */
function initPARAClassifier() {
  bindPARAEvents();
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', initPARAClassifier);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    classifyPARA: classifyPARA,
    normalizeChecklist: normalizeChecklist,
    scoreKeywords: scoreKeywords,
    getCategoryPrefix: getCategoryPrefix,
    PARA_CATEGORIES: PARA_CATEGORIES,
    PARA_KEYWORDS: PARA_KEYWORDS
  };
}
