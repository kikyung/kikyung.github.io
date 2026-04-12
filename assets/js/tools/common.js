/**
 * 공통 유틸리티 모듈 - Blog Developer Tools
 *
 * Chirpy 테마 블로그의 개발자 도구 페이지에서 공유하는
 * 클립보드 복사, 토스트 알림, 오류 표시, 테마 감지 기능을 제공한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 클립보드 복사 ───

/**
 * 텍스트를 클립보드에 복사하고 토스트 알림을 표시한다.
 * @param {string} text - 복사할 텍스트
 * @param {string} [toastMessage='복사 완료'] - 토스트에 표시할 메시지
 * @returns {Promise<boolean>} 복사 성공 여부
 */
function copyToClipboard(text, toastMessage) {
  if (toastMessage === undefined) {
    toastMessage = '복사 완료';
  }
  return navigator.clipboard.writeText(text).then(function () {
    showToast(toastMessage);
    return true;
  }).catch(function () {
    showToast('복사에 실패했습니다');
    return false;
  });
}

// ─── 토스트 알림 ───

/**
 * 화면 하단 중앙에 토스트 알림을 표시한다.
 * duration(ms) 후 자동으로 사라진다.
 * @param {string} message - 표시할 메시지
 * @param {number} [duration=2000] - 표시 시간(ms)
 */
function showToast(message, duration) {
  if (duration === undefined) {
    duration = 2000;
  }

  // 기존 토스트가 있으면 제거
  var existing = document.getElementById('tool-toast');
  if (existing) {
    existing.remove();
  }

  var toast = document.createElement('div');
  toast.id = 'tool-toast';
  toast.className = 'tool-toast visible';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.classList.remove('visible');
    setTimeout(function () {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300); // fade-out 애니메이션 시간
  }, duration);
}

// ─── 인라인 오류 표시 ───

/**
 * 지정된 요소에 오류 메시지를 표시한다.
 * @param {string} elementId - 오류 메시지를 표시할 요소의 ID
 * @param {string} message - 오류 메시지
 */
function showError(elementId, message) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('tool-error', 'visible');
}

/**
 * 지정된 요소의 오류 메시지를 제거한다.
 * @param {string} elementId - 오류 메시지를 제거할 요소의 ID
 */
function clearError(elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
}

// ─── Chirpy 테마 다크/라이트 모드 감지 ───

/**
 * 현재 다크 모드 여부를 반환한다.
 * Chirpy 테마는 html 요소의 [data-mode] 속성 또는
 * sessionStorage의 'mode' 값으로 테마를 관리한다.
 * @returns {boolean} 다크 모드이면 true
 */
function isDarkMode() {
  // 1) html[data-mode] 속성 확인
  var htmlMode = document.documentElement.getAttribute('data-mode');
  if (htmlMode) {
    return htmlMode === 'dark';
  }

  // 2) sessionStorage 확인 (Chirpy 테마 기본 저장소)
  try {
    var stored = sessionStorage.getItem('mode');
    if (stored) {
      return stored === 'dark';
    }
  } catch (e) {
    // sessionStorage 접근 불가 시 무시
  }

  // 3) OS 설정 확인
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}

/**
 * 테마 변경 시 콜백을 호출한다.
 * html[data-mode] 속성 변경을 MutationObserver로 감시한다.
 * @param {function} callback - 테마 변경 시 호출될 함수. isDark(boolean) 인자를 받는다.
 * @returns {function} 감시를 중단하는 disconnect 함수
 */
function onThemeChange(callback) {
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'data-mode') {
        callback(isDarkMode());
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mode']
  });

  return function () {
    observer.disconnect();
  };
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    copyToClipboard: copyToClipboard,
    showToast: showToast,
    showError: showError,
    clearError: clearError,
    isDarkMode: isDarkMode,
    onThemeChange: onThemeChange
  };
}
