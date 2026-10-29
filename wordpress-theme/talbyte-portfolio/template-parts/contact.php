<?php
/**
 * Contact section.
 *
 * @package Talbyte_Portfolio
 */

defined( 'ABSPATH' ) || exit;

$d              = talbyte_defaults();
$title          = talbyte_option( 'contact_title', $d['contact_title'] );
$lead           = talbyte_option( 'contact_lead', $d['contact_lead'] );
$aside          = talbyte_option( 'contact_aside', $d['contact_aside'] );
$email          = talbyte_option( 'email', $d['email'] );
$github_url     = talbyte_option( 'github_url', $d['github_url'] );
$github_label   = talbyte_option( 'github_label', $d['github_label'] );
$linkedin_url   = talbyte_option( 'linkedin_url', $d['linkedin_url'] );
$linkedin_label = talbyte_option( 'linkedin_label', $d['linkedin_label'] );
$name_label     = talbyte_option( 'form_name_label', $d['form_name_label'] );
$email_label    = talbyte_option( 'form_email_label', $d['form_email_label'] );
$message_label  = talbyte_option( 'form_message_label', $d['form_message_label'] );
$submit         = talbyte_option( 'form_submit', $d['form_submit'] );
?>
    <section class="contact-section" id="contact">
      <h1 class="section-title" data-aos="fade-down" data-aos-duration="900" data-reveal data-split><?php echo esc_html( $title ); ?></h1>
      <p class="contact-lead" data-aos="fade-up" data-aos-duration="900">
        <?php echo esc_html( $lead ); ?>
      </p>

      <div class="contact-layout">
        <aside class="social-box" data-aos="fade-right" data-aos-duration="1000">
          <h2 class="contact-aside-title" data-split><?php echo esc_html( $aside ); ?></h2>
          <a href="mailto:<?php echo esc_attr( $email ); ?>" data-aos="fade-up" data-aos-delay="100">
            <i class="bx bxs-envelope"></i>
            <span>
              <strong>Email</strong>
              <small><?php echo esc_html( $email ); ?></small>
            </span>
          </a>
          <a href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noreferrer noopener" data-aos="fade-up" data-aos-delay="200">
            <i class="bx bxl-github"></i>
            <span>
              <strong>GitHub</strong>
              <small><?php echo esc_html( $github_label ); ?></small>
            </span>
          </a>
          <a href="<?php echo esc_url( $linkedin_url ); ?>" target="_blank" rel="noreferrer noopener" data-aos="fade-up" data-aos-delay="300">
            <i class="bx bxl-linkedin-square"></i>
            <span>
              <strong>LinkedIn</strong>
              <small><?php echo esc_html( $linkedin_label ); ?></small>
            </span>
          </a>
        </aside>

        <form class="contact-box" id="contact-form" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="150" novalidate>
          <div class="contact-field">
            <label for="name"><?php echo esc_html( $name_label ); ?></label>
            <input id="name" name="name" placeholder="Your full name" type="text" autocomplete="name" required />
          </div>

          <div class="contact-field">
            <label for="email"><?php echo esc_html( $email_label ); ?></label>
            <input id="email" name="email" placeholder="Your email" type="email" autocomplete="email" required />
          </div>

          <div class="contact-field contact-field--full">
            <label for="message"><?php echo esc_html( $message_label ); ?></label>
            <textarea id="message" name="message" class="input-message" placeholder="Share your thoughts..." required></textarea>
          </div>

          <input class="contact-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <p class="contact-status" id="contact-status" role="status" aria-live="polite" hidden></p>

          <button type="submit" id="contact-submit" data-magnetic data-aos="bounce" data-aos-delay="200">
            <?php echo esc_html( $submit ); ?> <i class="bx bx-mail-send"></i>
          </button>
        </form>
      </div>
    </section>
