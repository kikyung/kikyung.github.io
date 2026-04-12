/**
 * 색상 변환기 - Blog Developer Tools
 *
 * HEX, RGB, HSL 색상 형식 간 양방향 변환을 수행한다.
 * 색상 미리보기와 클립보드 복사 기능을 제공한다.
 *
 * 이 파일은 ES Module이 아닌 전통적인 <script> 태그로 로드된다.
 * 테스트 환경(Node/Vitest)에서는 CommonJS export를 통해 접근 가능하다.
 */

// ─── 유효성 검사 함수 ───

/**
 * HEX 색상 코드의 유효성을 검사한다.
 * @param {string} hex - HEX 색상 코드
 * @returns {string|null} 오류 메시지 또는 null (유효한 경우)
 */
function validateHex(hex) {
  if (typeof hex !== 'string') {
    return '유효하지 않은 HEX 색상 코드입니다';
  }
  var trimmed = hex.trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return '유효하지 않은 HEX 색상 코드입니다';
  }
  return null;
}

/**
 * RGB 값의 유효성을 검사한다.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string|null} 오류 메시지 또는 null (유효한 경우)
 */
function validateRgb(r, g, b) {
  if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
    return 'RGB 값은 0~255 범위여야 합니다';
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return 'RGB 값은 0~255 범위여야 합니다';
  }
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return 'RGB 값은 0~255 범위여야 합니다';
  }
  if (r !== Math.floor(r) || g !== Math.floor(g) || b !== Math.floor(b)) {
    return 'RGB 값은 0~255 범위여야 합니다';
  }
  return null;
}

/**
 * HSL 값의 유효성을 검사한다.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string|null} 오류 메시지 또는 null (유효한 경우)
 */
function validateHsl(h, s, l) {
  if (typeof h !== 'number' || typeof s !== 'number' || typeof l !== 'number') {
    return 'HSL 값이 유효 범위를 벗어났습니다';
  }
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    return 'HSL 값이 유효 범위를 벗어났습니다';
  }
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    return 'HSL 값이 유효 범위를 벗어났습니다';
  }
  return null;
}

// ─── 순수 변환 함수 (테스트 가능) ───

/**
 * HEX 색상 코드를 RGB 객체로 변환한다.
 * #RGB 및 #RRGGBB 형식을 지원한다.
 * @param {string} hex - HEX 색상 코드 (예: "#FF5733", "#F53")
 * @returns {{ r: number, g: number, b: number }|null} RGB 객체 또는 null
 */
function hexToRgb(hex) {
  var error = validateHex(hex);
  if (error) {
    return null;
  }

  var trimmed = hex.trim();
  var hexStr = trimmed.slice(1);

  // #RGB → #RRGGBB 확장
  if (hexStr.length === 3) {
    hexStr = hexStr[0] + hexStr[0] + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2];
  }

  var r = parseInt(hexStr.substring(0, 2), 16);
  var g = parseInt(hexStr.substring(2, 4), 16);
  var b = parseInt(hexStr.substring(4, 6), 16);

  return { r: r, g: g, b: b };
}

/**
 * RGB 값을 HEX 색상 코드로 변환한다.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX 색상 코드 (#RRGGBB 대문자)
 * @throws {Error} RGB 값이 유효하지 않은 경우
 */
function rgbToHex(r, g, b) {
  var error = validateRgb(r, g, b);
  if (error) {
    throw new Error(error);
  }

  function toHex(value) {
    var hex = value.toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  }

  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * RGB 값을 HSL 값으로 변환한다.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{ h: number, s: number, l: number }} HSL 객체 (h: 0-360, s: 0-100, l: 0-100)
 * @throws {Error} RGB 값이 유효하지 않은 경우
 */
function rgbToHsl(r, g, b) {
  var error = validateRgb(r, g, b);
  if (error) {
    throw new Error(error);
  }

  var rNorm = r / 255;
  var gNorm = g / 255;
  var bNorm = b / 255;

  var max = Math.max(rNorm, gNorm, bNorm);
  var min = Math.min(rNorm, gNorm, bNorm);
  var delta = max - min;

  var h = 0;
  var s = 0;
  var l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta) + 2;
    } else {
      h = ((rNorm - gNorm) / delta) + 4;
    }

    h = h * 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * HSL 값을 RGB 값으로 변환한다.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{ r: number, g: number, b: number }} RGB 객체 (각 0-255)
 * @throws {Error} HSL 값이 유효하지 않은 경우
 */
function hslToRgb(h, s, l) {
  var error = validateHsl(h, s, l);
  if (error) {
    throw new Error(error);
  }

  var sNorm = s / 100;
  var lNorm = l / 100;

  var c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = lNorm - c / 2;

  var rPrime = 0;
  var gPrime = 0;
  var bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255)
  };
}

// ─── DOM 조작 함수 (브라우저 전용) ───

/**
 * 현재 입력 소스를 추적하여 무한 루프를 방지한다.
 */
var _colorUpdating = false;

/**
 * 색상 미리보기 박스를 업데이트한다.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 */
function updateColorPreview(r, g, b) {
  var preview = document.getElementById('color-preview');
  if (!preview) return;
  preview.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
  preview.style.backgroundImage = 'none';
}

/**
 * 변환 결과를 결과 표시 영역에 렌더링한다.
 * @param {string} hex - HEX 색상 코드
 * @param {{ r: number, g: number, b: number }} rgb - RGB 객체
 * @param {{ h: number, s: number, l: number }} hsl - HSL 객체
 */
function updateColorResults(hex, rgb, hsl) {
  var hexResult = document.getElementById('color-hex-result');
  var rgbResult = document.getElementById('color-rgb-result');
  var hslResult = document.getElementById('color-hsl-result');

  if (hexResult) hexResult.textContent = hex;
  if (rgbResult) rgbResult.textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
  if (hslResult) hslResult.textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
}

/**
 * HEX 입력 변경 시 RGB/HSL로 변환하고 결과를 업데이트한다.
 */
function handleHexInput() {
  if (_colorUpdating) return;
  _colorUpdating = true;

  var hexInput = document.getElementById('color-hex');
  if (!hexInput) { _colorUpdating = false; return; }

  var hex = hexInput.value.trim();
  if (hex === '') {
    clearError('color-error');
    _colorUpdating = false;
    return;
  }

  var error = validateHex(hex);
  if (error) {
    showError('color-error', error);
    _colorUpdating = false;
    return;
  }

  clearError('color-error');
  var rgb = hexToRgb(hex);
  var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  var normalizedHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // RGB 입력 필드 업데이트
  setInputValue('color-r', rgb.r);
  setInputValue('color-g', rgb.g);
  setInputValue('color-b', rgb.b);

  // HSL 입력 필드 업데이트
  setInputValue('color-h', hsl.h);
  setInputValue('color-s', hsl.s);
  setInputValue('color-l', hsl.l);

  updateColorPreview(rgb.r, rgb.g, rgb.b);
  updateColorResults(normalizedHex, rgb, hsl);
  syncColorPicker(normalizedHex);

  _colorUpdating = false;
}

/**
 * RGB 입력 변경 시 HEX/HSL로 변환하고 결과를 업데이트한다.
 */
function handleRgbInput() {
  if (_colorUpdating) return;
  _colorUpdating = true;

  var rInput = document.getElementById('color-r');
  var gInput = document.getElementById('color-g');
  var bInput = document.getElementById('color-b');

  if (!rInput || !gInput || !bInput) { _colorUpdating = false; return; }

  var r = parseInt(rInput.value, 10);
  var g = parseInt(gInput.value, 10);
  var b = parseInt(bInput.value, 10);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    _colorUpdating = false;
    return;
  }

  var error = validateRgb(r, g, b);
  if (error) {
    showError('color-error', error);
    _colorUpdating = false;
    return;
  }

  clearError('color-error');
  var hex = rgbToHex(r, g, b);
  var hsl = rgbToHsl(r, g, b);

  // HEX 입력 필드 업데이트
  setInputValue('color-hex', hex);

  // HSL 입력 필드 업데이트
  setInputValue('color-h', hsl.h);
  setInputValue('color-s', hsl.s);
  setInputValue('color-l', hsl.l);

  updateColorPreview(r, g, b);
  updateColorResults(hex, { r: r, g: g, b: b }, hsl);
  syncColorPicker(hex);

  _colorUpdating = false;
}

/**
 * HSL 입력 변경 시 HEX/RGB로 변환하고 결과를 업데이트한다.
 */
function handleHslInput() {
  if (_colorUpdating) return;
  _colorUpdating = true;

  var hInput = document.getElementById('color-h');
  var sInput = document.getElementById('color-s');
  var lInput = document.getElementById('color-l');

  if (!hInput || !sInput || !lInput) { _colorUpdating = false; return; }

  var h = parseInt(hInput.value, 10);
  var s = parseInt(sInput.value, 10);
  var l = parseInt(lInput.value, 10);

  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    _colorUpdating = false;
    return;
  }

  var error = validateHsl(h, s, l);
  if (error) {
    showError('color-error', error);
    _colorUpdating = false;
    return;
  }

  clearError('color-error');
  var rgb = hslToRgb(h, s, l);
  var hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // HEX 입력 필드 업데이트
  setInputValue('color-hex', hex);

  // RGB 입력 필드 업데이트
  setInputValue('color-r', rgb.r);
  setInputValue('color-g', rgb.g);
  setInputValue('color-b', rgb.b);

  updateColorPreview(rgb.r, rgb.g, rgb.b);
  updateColorResults(hex, rgb, { h: h, s: s, l: l });
  syncColorPicker(hex);

  _colorUpdating = false;
}

/**
 * 입력 필드 값을 설정하는 헬퍼 함수.
 * @param {string} elementId - 입력 요소 ID
 * @param {*} value - 설정할 값
 */
function setInputValue(elementId, value) {
  var el = document.getElementById(elementId);
  if (el) {
    el.value = value;
  }
}

/**
 * 복사 버튼 클릭 핸들러.
 * @param {string} format - 복사할 형식 ('hex', 'rgb', 'hsl')
 */
function handleColorCopy(format) {
  var resultEl;
  if (format === 'hex') {
    resultEl = document.getElementById('color-hex-result');
  } else if (format === 'rgb') {
    resultEl = document.getElementById('color-rgb-result');
  } else if (format === 'hsl') {
    resultEl = document.getElementById('color-hsl-result');
  }

  if (resultEl && resultEl.textContent) {
    copyToClipboard(resultEl.textContent);
  }
}

// ─── 초기화 ───

/**
 * 컬러피커 변경 시 HEX 입력에 값을 설정하고 변환을 트리거한다.
 */
function handleColorPickerInput() {
  var picker = document.getElementById('color-picker');
  var hexInput = document.getElementById('color-hex');
  if (!picker || !hexInput) return;

  hexInput.value = picker.value.toUpperCase();
  handleHexInput();
}

/**
 * 컬러피커를 현재 색상으로 동기화한다.
 * @param {string} hex - HEX 색상 코드
 */
function syncColorPicker(hex) {
  var picker = document.getElementById('color-picker');
  if (!picker || !hex) return;
  // 컬러피커는 #RRGGBB 6자리만 지원
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    picker.value = hex.toLowerCase();
  }
}

/**
 * 이벤트 리스너를 바인딩한다.
 */
function bindColorEvents() {
  var hexInput = document.getElementById('color-hex');
  var rInput = document.getElementById('color-r');
  var gInput = document.getElementById('color-g');
  var bInput = document.getElementById('color-b');
  var hInput = document.getElementById('color-h');
  var sInput = document.getElementById('color-s');
  var lInput = document.getElementById('color-l');
  var colorPicker = document.getElementById('color-picker');

  if (hexInput) {
    hexInput.addEventListener('input', handleHexInput);
  }

  if (colorPicker) {
    colorPicker.addEventListener('input', handleColorPickerInput);
  }

  var rgbInputs = [rInput, gInput, bInput];
  for (var i = 0; i < rgbInputs.length; i++) {
    if (rgbInputs[i]) {
      rgbInputs[i].addEventListener('input', handleRgbInput);
    }
  }

  var hslInputs = [hInput, sInput, lInput];
  for (var j = 0; j < hslInputs.length; j++) {
    if (hslInputs[j]) {
      hslInputs[j].addEventListener('input', handleHslInput);
    }
  }
}

/**
 * 색상 변환기를 초기화한다.
 */
function initColorConverter() {
  bindColorEvents();
}

// DOMContentLoaded 이벤트에서 초기화
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initColorConverter);
}

// ─── CommonJS export (테스트 환경용) ───

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    rgbToHsl: rgbToHsl,
    hslToRgb: hslToRgb,
    validateHex: validateHex,
    validateRgb: validateRgb,
    validateHsl: validateHsl
  };
}
