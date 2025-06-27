import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface UrlAnalysisResult {
  title: string;
  content: string;
  excerpt: string;
  siteName?: string;
  length: number;
}

export interface UrlAnalysisError {
  error: string;
  details?: string;
}

/**
 * URL이 유효한지 검증하는 함수
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * HTML에서 메타데이터를 추출하는 함수
 */
function extractMetadata($: cheerio.CheerioAPI) {
  const getMetaContent = (name: string): string => {
    return (
      $(`meta[name="${name}"]`).attr('content') ||
      $(`meta[property="og:${name}"]`).attr('content') ||
      $(`meta[property="twitter:${name}"]`).attr('content') ||
      ''
    );
  };

  return {
    title:
      $('title').text() ||
      getMetaContent('title') ||
      $('h1').first().text() ||
      '제목 없음',
    description: getMetaContent('description'),
    siteName:
      getMetaContent('site_name') ||
      $('meta[property="og:site_name"]').attr('content'),
  };
}

/**
 * HTML에서 불필요한 요소들을 제거하는 함수
 */
function cleanHtml($: cheerio.CheerioAPI) {
  // 불필요한 태그들 제거
  const unnecessarySelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.sidebar',
    '.advertisement',
    '.ads',
    '.social-share',
    '.comments',
    '.related-posts',
    '.popup',
    '.modal',
    '.cookie-notice',
    '[class*="banner"]',
    '[class*="popup"]',
    '[id*="popup"]',
    '[class*="share"]',
    '[class*="social"]',
  ];

  unnecessarySelectors.forEach((selector) => {
    $(selector).remove();
  });

  return $;
}

/**
 * URL에서 HTML을 가져오고 파싱하는 함수
 */
export async function analyzeUrl(
  url: string
): Promise<UrlAnalysisResult | UrlAnalysisError> {
  try {
    // URL 유효성 검증
    if (!isValidUrl(url)) {
      return { error: '유효하지 않은 URL입니다.' };
    }

    console.log(`🔍 URL 분석 시작: ${url}`);

    // HTML 가져오기 (타임아웃 처리)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        error: `HTTP 오류: ${response.status}`,
        details: response.statusText,
      };
    }

    const html = await response.text();

    if (!html || html.length === 0) {
      return { error: '빈 페이지입니다.' };
    }

    console.log(`✅ HTML 다운로드 완료 (${html.length}자)`);

    // Cheerio로 기본 파싱
    const $ = cheerio.load(html);
    const cleanedDoc = cleanHtml($);
    const metadata = extractMetadata(cleanedDoc);

    // Mozilla Readability로 본문 추출
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document, {
      charThreshold: 500, // 최소 문자 수
      classesToPreserve: ['highlight', 'code', 'pre'], // 보존할 클래스
    });

    const article = reader.parse();

    if (
      !article ||
      !article.textContent ||
      article.textContent.trim().length < 200
    ) {
      // Readability 실패시 fallback: Cheerio로 직접 추출
      console.log('⚠️ Readability 실패, Cheerio로 fallback');

      // 본문 후보 선택자들
      const contentSelectors = [
        'article',
        '.content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.main-content',
        'main',
        '.container',
        'body',
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const element = cleanedDoc(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 200) break;
        }
      }

      if (content.length < 200) {
        return { error: '충분한 텍스트 내용을 찾을 수 없습니다.' };
      }

      return {
        title: metadata.title,
        content: content,
        excerpt:
          content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        siteName: metadata.siteName,
        length: content.length,
      };
    }

    console.log(`✅ 본문 추출 완료 (${article.textContent.length}자)`);

    return {
      title: article.title || metadata.title,
      content: article.textContent.trim(),
      excerpt:
        article.excerpt ||
        article.textContent.substring(0, 300) +
          (article.textContent.length > 300 ? '...' : ''),
      siteName: metadata.siteName,
      length: article.textContent.length,
    };
  } catch (error) {
    console.error('❌ URL 분석 오류:', error);

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return { error: '요청 시간이 초과되었습니다.' };
      }
      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return { error: '네트워크 연결 오류가 발생했습니다.' };
      }
    }

    return {
      error: 'URL 분석 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
