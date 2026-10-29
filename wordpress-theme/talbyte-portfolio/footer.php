<?php
/**
 * Theme footer.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d            = talbyte_defaults();
$brand_first  = talbyte_option( 'brand_first', $d['brand_first'] );
$brand_last   = talbyte_option( 'brand_last', $d['brand_last'] );
$display      = talbyte_option( 'display_name', $d['display_name'] );
$logo         = talbyte_image_url( talbyte_option( 'logo', null ), $d['logo_fallback'] );
$github_url   = talbyte_option( 'github_url', $d['github_url'] );
$linkedin_url = talbyte_option( 'linkedin_url', $d['linkedin_url'] );
?>
    <footer class="footer" data-animate="fade-up">
      <div class="footer-inner">
        <a class="footer-brand" href="#home">
          <img src="<?php echo esc_url( $logo ); ?>" alt="" />
          <span><strong><?php echo esc_html( $brand_first ); ?></strong> <?php echo esc_html( $brand_last ); ?></span>
        </a>

        <nav class="footer-nav" aria-label="Footer">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>

        <div class="footer-meta">
          <p class="footer-copy">© <span id="year"><?php echo esc_html( gmdate( 'Y' ) ); ?></span> <?php echo esc_html( $display ); ?></p>
          <div class="footer-socials">
            <a href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
              <i class="bx bxl-github"></i>
            </a>
            <a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
              <i class="bx bxl-linkedin-square"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>

<?php wp_footer(); ?>
</body>
</html>
