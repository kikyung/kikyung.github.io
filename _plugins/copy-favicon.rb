# frozen_string_literal: true

# Jekyll 플러그인: 빌드 후 favicon.ico를 루트 디렉토리로 복사
# 이 플러그인은 Jekyll 빌드가 완료된 후 favicon.ico 파일을
# assets/img/favicons/에서 _site/ 루트로 복사합니다.

Jekyll::Hooks.register :site, :post_write do |site|
  source_file = File.join(site.source, 'assets', 'img', 'favicons', 'favicon.ico')
  dest_file = File.join(site.dest, 'favicon.ico')

  if File.exist?(source_file)
    FileUtils.mkdir_p(File.dirname(dest_file))
    FileUtils.cp(source_file, dest_file)
    Jekyll.logger.info('Favicon:', "favicon.ico copied to #{dest_file}")
  else
    Jekyll.logger.warn('Favicon:', "Source file not found: #{source_file}")
  end
rescue StandardError => e
  Jekyll.logger.error('Favicon:', "Error copying favicon: #{e.message}")
end

