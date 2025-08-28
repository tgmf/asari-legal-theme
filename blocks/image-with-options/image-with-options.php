<?php
/**
 * Split Content Block Template
 * 
 * @param array $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool $is_preview True during backend preview render.
 * @param int $post_id The post ID this block is saved to.
 * @param WP_Block $wp_block The block instance (since WP 5.5).
 * @param array $context The block context array.
 */

// Create id attribute allowing for custom "anchor" value
$id = 'split-content-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values
$className = 'wp-block-asari-split-content';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}
if (!empty($block['align'])) {
    $className .= ' align' . $block['align'];
}

// Get ACF fields
$title = get_field('title');
$subtitle = get_field('subtitle');
$button_text = get_field('button_text');
$button_link = get_field('button_link');
$description = get_field('description');
$accordion_items = get_field('accordion_items');
$image = get_field('image');

// Prepare image data
$img_url = '';
$img_alt = '';
if ($image) {
    if (is_array($image)) {
        $img_url = esc_url($image['url']);
        $img_alt = esc_attr($image['alt']);
    } else {
        $img_url = esc_url(wp_get_attachment_image_url($image, 'full'));
        $img_alt = esc_attr(get_post_meta($image, '_wp_attachment_image_alt', true));
    }
}

// Generate unique accordion ID
$accordion_id = 'accordion-' . $block['id'];

// If no content and not in preview mode, show placeholder
if (!$title && !$subtitle && !$description && !$is_preview) {
    echo '<div class="' . esc_attr($className) . ' is-empty-placeholder">';
    echo '<p>' . __('Split Content Block - Add content in the editor', 'asari-legal-theme') . '</p>';
    echo '</div>';
    return;
}
?>

<section 
    id="<?php echo esc_attr($id); ?>" 
    class="<?php echo esc_attr($className); ?>"
    data-accordion-id="<?php echo esc_attr($accordion_id); ?>"
>
    <div class="split-content-container">
        
        <!-- Left Content -->
        <div class="split-content-left">
            <div class="split-content-inner">
                
                <?php if ($title || $subtitle) : ?>
                    <div class="split-content-header">
                        <?php if ($title) : ?>
                            <h1 class="split-content-title font-cofo text-h1">
                                <?php echo wp_kses_post($title); ?>
                            </h1>
                        <?php endif; ?>
                        
                        <?php if ($subtitle) : ?>
                            <p class="split-content-subtitle font-cofo text-h3 text-gray">
                                <?php echo wp_kses_post($subtitle); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if ($button_text && $button_link) : ?>
                    <div class="split-content-button">
                        <a href="<?php echo esc_url($button_link); ?>" 
                           class="btn-asari">
                            <?php echo esc_html($button_text); ?>
                            <span class="btn-icon text-gold">→</span>
                        </a>
                    </div>
                <?php endif; ?>

                <?php if ($description) : ?>
                    <div class="split-content-description">
                        <p class="text-b1"><?php echo wp_kses_post($description); ?></p>
                    </div>
                <?php endif; ?>

                <?php if ($accordion_items && is_array($accordion_items)) : ?>
                    <div class="split-content-accordion" id="<?php echo esc_attr($accordion_id); ?>">
                        <div class="accordion-header">
                            <p class="accordion-label text-b2">Варианты ответа</p>
                        </div>
                        
                        <div class="accordion-tabs">
                            <?php foreach ($accordion_items as $index => $item) : 
                                if (!$item || !isset($item['tab_title'])) continue;
                                $tab_id = $accordion_id . '-tab-' . $index;
                                $is_active = $index === 0;
                            ?>
                                <button 
                                    class="accordion-tab <?php echo $is_active ? 'active' : ''; ?>"
                                    data-tab="<?php echo esc_attr($tab_id); ?>"
                                    aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
                                    role="tab"
                                >
                                    <span class="tab-radio"></span>
                                    <span class="tab-text"><?php echo esc_html($item['tab_title']); ?></span>
                                </button>
                            <?php endforeach; ?>
                        </div>

                        <div class="accordion-content">
                            <?php foreach ($accordion_items as $index => $item) : 
                                if (!$item || !isset($item['tab_content'])) continue;
                                $tab_id = $accordion_id . '-tab-' . $index;
                                $is_active = $index === 0;
                            ?>
                                <div 
                                    class="accordion-panel <?php echo $is_active ? 'active' : ''; ?>"
                                    id="<?php echo esc_attr($tab_id); ?>"
                                    role="tabpanel"
                                    <?php if (!$is_active) echo 'aria-hidden="true"'; ?>
                                >
                                    <p class="text-b3"><?php echo wp_kses_post($item['tab_content']); ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>

            </div>
        </div>

        <!-- Right Image -->
        <div class="split-content-right">
            <?php if ($img_url) : ?>
                <div class="split-content-image">
                    <img src="<?php echo $img_url; ?>" 
                         alt="<?php echo $img_alt; ?>"
                         loading="lazy">
                </div>
            <?php else : ?>
                <div class="split-content-image-placeholder">
                    <div class="placeholder-content">
                        <p>Image Placeholder</p>
                    </div>
                </div>
            <?php endif; ?>
        </div>

    </div>
</section>