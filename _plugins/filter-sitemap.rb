# frozen_string_literal: true

# Jekyll 플러그인: 사이트맵에서 특정 URL 제거
# jekyll-sitemap 플러그인이 생성한 사이트맵에서
# /admin/과 /auth.html을 제거합니다.

Jekyll::Hooks.register :site, :post_write do |site|
  sitemap_path = File.join(site.dest, 'sitemap.xml')
  
  if File.exist?(sitemap_path)
    content = File.read(sitemap_path)
    
    # 제거할 URL 패턴
    patterns_to_remove = [
      %r{<url>\s*<loc>https://kikyung\.github\.io/admin/</loc>.*?</url>}m,
      %r{<url>\s*<loc>https://kikyung\.github\.io/auth\.html</loc>.*?</url>}m,
      %r{<url>\s*<loc>https://kikyung\.github\.io/admin</loc>.*?</url>}m
    ]
    
    patterns_to_remove.each do |pattern|
      content.gsub!(pattern, '')
    end
    
    # 빈 줄 정리
    content.gsub!(/\n\s*\n\s*\n/, "\n\n")
    
    File.write(sitemap_path, content)
    Jekyll.logger.info('Sitemap:', 'Removed /admin/ and /auth.html from sitemap.xml')
  end
rescue StandardError => e
  Jekyll.logger.error('Sitemap:', "Error filtering sitemap: #{e.message}")
end

