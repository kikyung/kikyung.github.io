/**
 * 공통 유틸리티 모듈 단위 테스트
 * Requirements: 11.1 (다크/라이트 모드), 11.5 (토스트 알림)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// JSDOM 환경에서 common.js를 CommonJS로 로드
let common;

beforeEach(async () => {
  // DOM 초기화
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-mode');

  // sessionStorage mock
  const store = {};
  vi.stubGlobal('sessionStorage', {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
  });

  // 모듈 캐시 초기화 후 재로드
  vi.resetModules();
  common = await import('../../assets/js/tools/common.js');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── showError / clearError ───

describe('showError', () => {
  it('요소에 오류 메시지를 표시하고 visible 클래스를 추가한다', () => {
    document.body.innerHTML = '<span id="err"></span>';

    common.showError('err', '유효하지 않은 입력입니다');

    const el = document.getElementById('err');
    expect(el.textContent).toBe('유효하지 않은 입력입니다');
    expect(el.classList.contains('tool-error')).toBe(true);
    expect(el.classList.contains('visible')).toBe(true);
  });

  it('존재하지 않는 요소 ID에 대해 에러 없이 무시한다', () => {
    expect(() => common.showError('nonexistent', 'msg')).not.toThrow();
  });
});

describe('clearError', () => {
  it('오류 메시지를 제거하고 visible 클래스를 제거한다', () => {
    document.body.innerHTML = '<span id="err" class="tool-error visible">에러</span>';

    common.clearError('err');

    const el = document.getElementById('err');
    expect(el.textContent).toBe('');
    expect(el.classList.contains('visible')).toBe(false);
  });

  it('존재하지 않는 요소 ID에 대해 에러 없이 무시한다', () => {
    expect(() => common.clearError('nonexistent')).not.toThrow();
  });
});

// ─── isDarkMode ───

describe('isDarkMode', () => {
  it('html[data-mode="dark"]이면 true를 반환한다', () => {
    document.documentElement.setAttribute('data-mode', 'dark');
    expect(common.isDarkMode()).toBe(true);
  });

  it('html[data-mode="light"]이면 false를 반환한다', () => {
    document.documentElement.setAttribute('data-mode', 'light');
    expect(common.isDarkMode()).toBe(false);
  });

  it('data-mode 없고 sessionStorage에 "dark"이면 true를 반환한다', () => {
    sessionStorage.setItem('mode', 'dark');
    sessionStorage.getItem.mockReturnValue('dark');
    expect(common.isDarkMode()).toBe(true);
  });

  it('data-mode 없고 sessionStorage에 "light"이면 false를 반환한다', () => {
    sessionStorage.setItem('mode', 'light');
    sessionStorage.getItem.mockReturnValue('light');
    expect(common.isDarkMode()).toBe(false);
  });
});

// ─── showToast ───

describe('showToast', () => {
  it('토스트 요소를 DOM에 추가한다', () => {
    common.showToast('테스트 메시지');

    const toast = document.getElementById('tool-toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('테스트 메시지');
    expect(toast.classList.contains('visible')).toBe(true);
  });

  it('기존 토스트가 있으면 교체한다', () => {
    common.showToast('첫 번째');
    common.showToast('두 번째');

    const toasts = document.querySelectorAll('#tool-toast');
    expect(toasts.length).toBe(1);
    expect(toasts[0].textContent).toBe('두 번째');
  });

  it('접근성 속성(role, aria-live)을 포함한다', () => {
    common.showToast('접근성 테스트');

    const toast = document.getElementById('tool-toast');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
  });
});
