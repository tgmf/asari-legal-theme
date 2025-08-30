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
// Get block wrapper attributes (includes spacing styles)
$wrapper_attributes = get_block_wrapper_attributes([
    'id' => $id,
    'class' => $className,
    'data-accordion-id' => isset($accordion_id) ? $accordion_id : '',
    'aria-label' => $bg_alt ?: ''
]);

// Add custom data attributes
foreach ($data_attrs as $attr) {
    $wrapper_attributes .= ' ' . $attr;
}
?>

<section <?php echo $wrapper_attributes; ?>>
    <div class="hero-content">

        <?php if ($top_text) : ?>
            <div class="hero-top-text bg-white">
                <span class="hero-top-text-inner font-manege line-height-tight mb-medium">
                    <?php echo wp_kses_post($top_text); ?>
                </span>
            </div>
        <?php endif; ?>

        <div class="hero-middle-reveal"></div>

        <?php if ($bottom_text) : ?>
            <div class="hero-bottom-text bg-white">
                <span class="hero-bottom-text-inner font-cofo line-height-tight mt-medium">
                    <?php echo wp_kses_post($bottom_text); ?>
                </span>
            </div>
        <?php endif; ?>
    </div>
</section>