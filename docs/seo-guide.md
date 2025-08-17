# Jekyll 블로그 SEO 가이드

## 📋 개요

이 문서는 Jekyll 블로그의 SEO(Search Engine Optimization) 설정과 검색엔진 등록 방법을 설명합니다.

## 🎯 현재 설정된 SEO 기능

### 1. jekyll-seo-tag 플러그인 (자동 활성화)
- 메타 태그 자동 생성
- Open Graph 태그 (소셜 미디어 공유용)
- Twitter Card 태그
- JSON-LD 구조화 데이터

### 2. 기본 SEO 설정
```yaml
# _config.yml
title: "KiKyung's blog"
description: "A minimal, responsive and feature-rich Jekyll theme for technical writing."
lang: "ko-KR"
timezone: "Asia/Seoul"
```

## 🚀 검색엔진 등록을 위한 추가 설정

### 1. Google Search Console 등록

1. [Google Search Console](https://search.google.com/search-console) 접속
2. 도메인 또는 URL 접두어 추가
3. HTML 태그 방식으로 인증 코드 받기
4. `_config.yml`에 추가:

```yaml
webmaster_verifications:
  google: "your-verification-code"  # Google Search Console에서 받은 코드
```

### 2. Naver Webmaster Tools 등록

1. [Naver Webmaster Tools](https://searchadvisor.naver.com/) 접속
2. 사이트 등록
3. HTML 태그 방식으로 인증 코드 받기
4. `_config.yml`에 추가:

```yaml
webmaster_verifications:
  naver: "your-verification-code"   # 네이버 웹마스터 도구에서 받은 코드
```

### 3. sitemap.xml 생성

1. `_config.yml`에 플러그인 추가:

```yaml
plugins:
  - jekyll-sitemap
```

2. 또는 수동으로 `sitemap.xml` 생성:

```xml
---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% for post in site.posts %}
  <url>
    <loc>{{ site.url }}{{ post.url }}</loc>
    <lastmod>{{ post.last_modified_at | date_to_xmlschema }}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  {% endfor %}
  {% for page in site.pages %}
  {% if page.layout != null %}
  <url>
    <loc>{{ site.url }}{{ page.url }}</loc>
    <lastmod>{{ site.time | date_to_xmlschema }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  {% endif %}
  {% endfor %}
</urlset>
```

### 4. robots.txt 생성

루트 디렉토리에 `robots.txt` 파일 생성:

```txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://kikyung.github.io/sitemap.xml

# Disallow specific paths (선택사항)
# Disallow: /admin/
# Disallow: /_layouts/
# Disallow: /_includes/
```

## 📝 포스트별 SEO 최적화

### Front Matter 설정

각 포스트의 상단에 다음 정보를 추가:

```yaml
---
title: "포스트 제목"
description: "포스트 설명 (검색 결과에 표시될 내용)"
keywords: "키워드1, 키워드2, 키워드3"
image: "/assets/img/featured-image.jpg"
author: "김기경"
date: 2025-01-XX
last_modified_at: 2025-01-XX
categories: [개발, 기술]
tags: [jekyll, seo, 블로그]
---
```

### 이미지 최적화

```yaml
---
image:
  path: "/assets/img/featured-image.jpg"
  alt: "이미지 설명 (SEO에 중요)"
  lqip: "data:image/jpeg;base64,..."  # 저화질 이미지 미리보기
---
```

## 🔍 검색엔진 등록 순서

### 1단계: 기본 설정
- [ ] `_config.yml`의 `url` 설정 확인
- [ ] `title`, `description` 최적화
- [ ] `lang`, `timezone` 설정 확인

### 2단계: 검색엔진 등록
- [ ] Google Search Console 등록
- [ ] Naver Webmaster Tools 등록
- [ ] 기타 검색엔진 등록 (Bing, Yandex 등)

### 3단계: 기술적 SEO
- [ ] sitemap.xml 생성 및 제출
- [ ] robots.txt 설정
- [ ] 메타 태그 최적화

### 4단계: 콘텐츠 최적화
- [ ] 포스트별 front matter 설정
- [ ] 이미지 alt 태그 설정
- [ ] 내부 링크 구조 최적화

## 📊 SEO 성과 측정

### Google Analytics 설정
```yaml
analytics:
  google:
    id: "G-DLMQN5MNCD"  # Google Analytics 4 측정 ID
```

### Google Search Console
- 검색 성과 모니터링
- 색인 생성 상태 확인
- 검색 쿼리 분석
- 모바일 사용성 테스트

## 🚨 주의사항

1. **중복 콘텐츠 방지**
   - 동일한 내용을 여러 URL에 게시하지 않기
   - canonical URL 설정

2. **로딩 속도 최적화**
   - 이미지 압축
   - CSS/JS 최소화
   - CDN 사용 고려

3. **모바일 최적화**
   - 반응형 디자인 확인
   - 모바일 친화적 테스트

## 🔗 유용한 도구

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Markup Validator](https://validator.schema.org/)
- [Meta Tags Checker](https://metatags.io/)

## 📚 추가 자료

- [Jekyll SEO Tag 공식 문서](https://github.com/jekyll/jekyll-seo-tag)
- [Google SEO 가이드](https://developers.google.com/search/docs)
- [Naver 검색 최적화 가이드](https://searchadvisor.naver.com/guide)

---

**마지막 업데이트**: 2025년 1월
**작성자**: 김기경

