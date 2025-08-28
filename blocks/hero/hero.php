<?php
/**
 * Hero Block Template
 * 
 * @param array $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool $is_preview True during backend preview render.
 * @param int $post_id The post ID this block is saved to.
 * @param WP_Block $wp_block The block instance (since WP 5.5).
 * @param array $context The block context array.
 */

// Create id attribute allowing for custom "anchor" value
$id = 'hero-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values
$className = 'wp-block-asari-hero';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}
if (!empty($block['align'])) {
    $className .= ' align' . $block['align'];
}

// Get ACF fields
$top_text = get_field('top_text');
$bottom_text = get_field('bottom_text');
$image = get_field('image');
$text_alignment = get_field('text_alignment') ?: 'center';

// Prepare background image URL
$bg_url = '';
$bg_alt = '';
if ($image) {
    if (is_array($image)) {
        $bg_url = esc_url($image['url']);
        $bg_alt = esc_attr($image['alt']);
    } else {
        $bg_url = esc_url(wp_get_attachment_image_url($image, 'full'));
        $bg_alt = esc_attr(get_post_meta($image, '_wp_attachment_image_alt', true));
    }
}

// Build data attributes for styling
$data_attrs = array(
    'data-text-alignment="' . esc_attr($text_alignment) . '"',
);

if ($bg_url) {
    $data_attrs[] = 'data-bg-url="' . $bg_url . '"';
}

// If no content and not in preview mode, show placeholder
if (!$top_text && !$bottom_text && !$is_preview) {
    echo '<div class="' . esc_attr($className) . ' is-empty-placeholder">';
    echo '<p>' . __('Hero Block - Add content in the editor', 'asari-legal-theme') . '</p>';
    echo '</div>';
    return;
}
?>

<section 
    id="<?php echo esc_attr($id); ?>" 
    class="<?php echo esc_attr($className); ?>"
    <?php echo implode(' ', $data_attrs); ?>
    <?php if ($bg_alt): ?>aria-label="<?php echo $bg_alt; ?>"<?php endif; ?>
>
    <div class="hero-content">

        <?php if ($top_text) : ?>
            <div class="hero-top-text bg-white">
                <span class="hero-top-text-inner font-manege">
                    <?php echo wp_kses_post($top_text); ?>
                </span>
            </div>
        <?php endif; ?>

        <div class="hero-middle-reveal"></div>

        <?php if ($bottom_text) : ?>
            <div class="hero-bottom-text bg-white">
                <span class="hero-bottom-text-inner font-cofo">
                    <?php echo wp_kses_post($bottom_text); ?>
                </span>
            </div>
        <?php endif; ?>
    </div>
</section>