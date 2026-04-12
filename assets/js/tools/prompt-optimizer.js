/**
 * AI 프롬프트 최적화 도구 - Blog Developer Tools
 *
 * AI 프롬프트를 역할(Role), 맥락(Context), 지시(Instruction),
 * 형식(Format), 제약(Constraints) 섹션으로 구조화하고,
 * Chain of Thought, Few-shot, Zero-shot 기법을 적용한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 프롬프트 기법 데이터 ───

var PROMPT_TECHNIQUES = [
  { id: 'chain-of-thought', name: 'Chain of Thought', description: '단계별 추론을 유도하여 복잡한 문제를 해결합니다.' },
  { id: 'few-shot', name: 'Few-shot', description: '예시를 제공하여 원하는 출력 형식을 안내합니다.' },
  { id: 'zero-shot', name: 'Zero-shot', description: '예시 없이 직접 지시하여 응답을 생성합니다.' }
];

// ─── 섹션 가이드 데이터 ───

var SECTION_GUIDES = {
  role: { label: '역할 (Role)', placeholder: '예: 당신은 10년 경력의 시니어 백엔드 개발자입니다.', guide: 'AI에게 부여할 역할이나 전문성을 정의합니다.' },
  context: { label: '맥락 (Context)', placeholder: '예: Spring Boot 기반 REST API를 개발하고 있습니다.', guide: '현재 상황이나 배경 정보를 제공합니다.' },
  instruction: { label: '지시 (Instruction)', placeholder: '예: 사용자 인증 API의 설계를 검토해주세요.', guide: 'AI에게 수행할 구체적인 작업을 지시합니다.' },
  format: { label: '형식 (Format)', placeholder: '예: Markdown 형식으로, 코드 블록을 포함하여 작성해주세요.', guide: '원하는 출력 형식이나 구조를 지정합니다.' },
  constraints: { label: '제약 (Constraints)', placeholder: '예: 한국어로 답변하고, 500자 이내로 작성해주세요.', guide: '답변의 제약 조건이나 제한 사항을 명시합니다.' }
};

// ─── 섹션 헤더 매핑 ───

var SECTION_HEADERS = {
  role: '[역할]',
  context: '[맥락]',
  instruction: '[지시]',
  format: '[형식]',
  constraints: '[제약]'
};

// ─── 핵심 프롬프트 구조화 로직 ───

/**
 * PromptSections 객체를 하나의 프롬프트 문자열로 조합한다.
 * 비어있지 않은 섹션만 섹션 헤더와 함께 포함한다.
 *
 * @param {Object} sections - 프롬프트 섹션
 * @param {string} [sections.role] - 역할
 * @param {string} [sections.context] - 맥락
 * @param {string} [sections.instruction] - 지시
 * @param {string} [sections.format] - 형식
 * @param {string} [sections.constraints] - 제약
 * @returns {string} 조합된 프롬프트 문자열
 */
function buildPrompt(sections) {
  if (!sections || typeof sections !== 'object') {
    return '';
  }

  var sectionKeys = ['role', 'context', 'instruction', 'format', 'constraints'];
  var parts = [];

  for (var i = 0; i < sectionKeys.length; i++) {
    var key = sectionKeys[i];
    var value = sections[key];
    if (value && typeof value === 'string' && value.trim() !== '') {
      parts.push(SECTION_HEADERS[key] + '\n' + value.trim());
    }
  }

  return parts.join('\n\n');
}

/**
 * 프롬프트 기법을 적용하여 수정된 PromptSections를 반환한다.
 * 원래 섹션의 내용은 보존하면서 기법에 맞는 추가 구조를 포함한다. (Property 14)
 *
 * - 'chain-of-thought': instruction에 "단계별로 생각해주세요" 추가
 * - 'few-shot': instruction에 예시 템플릿 추가
 * - 'zero-shot': 원본 그대로 반환 (예시 없이 직접 지시)
 *
 * @param {string} technique - 기법 ID ('chain-of-thought', 'few-shot', 'zero-shot')
 * @param {Object} sections - 원본 PromptSections
 * @returns {Object} 기법이 적용된 새로운 PromptSections
 */
function applyTechnique(technique, sections) {
  if (!sections || typeof sections !== 'object') {
    sections = {};
  }

  // 원본 보존을 위해 얕은 복사
  var result = {
    role: sections.role || '',
    context: sections.context || '',
    instruction: sections.instruction || '',
    format: sections.format || '',
    constraints: sections.constraints || ''
  };

  if (technique === 'chain-of-thought') {
    var cotSuffix = '\n\n단계별로 생각해주세요.';
    if (result.instruction.indexOf('단계별로 생각해주세요') === -1) {
      result.instruction = result.instruction + cotSuffix;
    }
  } else if (technique === 'few-shot') {
    var fewShotTemplate = '\n\n[예시]\n입력: (예시 입력을 작성하세요)\n출력: (예시 출력을 작성하세요)';
    if (result.instruction.indexOf('[예시]') === -1) {
      result.instruction = result.instruction + fewShotTemplate;
    }
  }
  // 'zero-shot': 원본 그대로 반환

  return result;
}

// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * 입력 필드에서 PromptSections 객체를 수집한다.
 * @returns {Object} PromptSections 객체
 */
function collectPromptSections() {
  var roleEl = document.getElementById('prompt-role');
  var contextEl = document.getElementById('prompt-context');
  var instructionEl = document.getElementById('prompt-instruction');
  var formatEl = document.getElementById('prompt-format');
  var constraintsEl = document.getElementById('prompt-constraints');

  return {
    role: roleEl ? roleEl.value : '',
    context: contextEl ? contextEl.value : '',
    instruction: instructionEl ? instructionEl.value : '',
    format: formatEl ? formatEl.value : '',
    constraints: constraintsEl ? constraintsEl.value : ''
  };
}

/**
 * 현재 선택된 기법 ID를 반환한다.
 * @returns {string|null} 기법 ID 또는 null
 */
function getSelectedTechnique() {
  var selectEl = document.getElementById('prompt-technique');
  if (!selectEl) return null;
  var value = selectEl.value;
  return (value && value !== '') ? value : null;
}

/**
 * 프롬프트 미리보기를 업데이트한다.
 */
function updatePromptPreview() {
  clearError('prompt-error');

  var sections = collectPromptSections();
  var prompt = buildPrompt(sections);

  var outputEl = document.getElementById('prompt-output');
  if (outputEl) {
    outputEl.textContent = prompt || '섹션을 입력하면 여기에 조합된 프롬프트가 표시됩니다.';
  }
}

/**
 * 선택된 기법을 현재 섹션에 적용한다.
 */
function handleApplyTechnique() {
  clearError('prompt-error');

  var technique = getSelectedTechnique();
  if (!technique) {
    showError('prompt-error', '적용할 프롬프트 기법을 선택해주세요.');
    return;
  }

  var sections = collectPromptSections();
  var modified = applyTechnique(technique, sections);

  // instruction 필드에 수정된 내용 반영
  var instructionEl = document.getElementById('prompt-instruction');
  if (instructionEl) {
    instructionEl.value = modified.instruction;
  }

  // 미리보기 업데이트
  updatePromptPreview();
}

/**
 * 조합된 프롬프트를 클립보드에 복사한다.
 */
function handleCopyPrompt() {
  var sections = collectPromptSections();
  var prompt = buildPrompt(sections);

  if (!prompt || prompt.trim() === '') {
    showError('prompt-error', '복사할 프롬프트가 없습니다. 섹션을 입력해주세요.');
    return;
  }

  copyToClipboard(prompt);
}

// ─── 초기화 ───

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindPromptEvents() {
  // 입력 필드 변경 시 미리보기 자동 업데이트
  var inputIds = ['prompt-role', 'prompt-context', 'prompt-instruction', 'prompt-format', 'prompt-constraints'];
  for (var i = 0; i < inputIds.length; i++) {
    var el = document.getElementById(inputIds[i]);
    if (el) {
      el.addEventListener('input', updatePromptPreview);
    }
  }

  // 기법 적용 버튼
  var applyBtn = document.getElementById('btn-apply-technique');
  if (applyBtn) {
    applyBtn.addEventListener('click', handleApplyTechnique);
  }

  // 복사 버튼
  var copyBtn = document.getElementById('btn-copy-prompt');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyPrompt);
  }
}

/**
 * 프롬프트 최적화 도구를 초기화한다.
 */
function initPromptOptimizer() {
  bindPromptEvents();
  updatePromptPreview();
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', initPromptOptimizer);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildPrompt: buildPrompt,
    applyTechnique: applyTechnique,
    PROMPT_TECHNIQUES: PROMPT_TECHNIQUES,
    SECTION_GUIDES: SECTION_GUIDES,
    SECTION_HEADERS: SECTION_HEADERS
  };
}
