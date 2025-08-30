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
$id = 'image-with-options-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values
$className = 'wp-block-asari-image-with-options';
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
$accordion_title = get_field('accordion_title') ?: 'Options';
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

// Get block wrapper attributes (includes spacing styles)
$wrapper_attributes = get_block_wrapper_attributes([
    'id' => $id,
    'class' => $className,
    'data-accordion-id' => $accordion_id
]);
?>

<section <?php echo $wrapper_attributes; ?>>
    <div class="image-with-options-container">
        
        <!-- Left Content -->
        <div class="image-with-options-left px-x-large h-full d-flex flex-1">
            <div class="image-with-options-inner w-full d-flex flex-column">

                <?php if ($title || $subtitle) : ?>
                    <div class="image-with-options-header mb-2x-large">
                        <?php if ($title) : ?>
                            <h1 class="image-with-options-title font-manege text-h2 mt-0">
                                <?php echo wp_kses_post($title); ?>
                            </h1>
                        <?php endif; ?>
                        
                        <?php if ($subtitle) : ?>
                            <p class="image-with-options-subtitle font-cofo text-h2">
                                <?php echo wp_kses_post($subtitle); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if ($button_text && $button_link) : ?>
                    <div class="image-with-options-button">
                        <a href="<?php echo esc_url($button_link['url']); ?>" 
                        class="asari-btn"
                        <?php if ($button_link['target']) echo 'target="' . esc_attr($button_link['target']) . '"'; ?>>
                            <?php echo esc_html($button_text); ?>
                            <span class="btn-icon text-gold">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="9.5" stroke="currentColor"/>
                                    <path d="M13.9863 9.70581L8.91895 14.7732L8.21191 14.0662L12.5723 9.70581L8.21191 5.34546L8.91895 4.63843L13.9863 9.70581Z" fill="currentColor"/>
                                </svg>
                            </span>
                        </a>
                    </div>
                <?php endif; ?>

                <?php if ($description) : ?>
                    <div class="image-with-options-description mt-auto mb-0">
                        <p class="text-h3 mt-0 mb-large line-height-snug"><?php echo wp_kses_post($description); ?></p>
                    </div>
                <?php endif; ?>

                <?php if ($accordion_items && is_array($accordion_items)) : ?>
                    <div class="image-with-options-accordion rounded-lg p-large" id="<?php echo esc_attr($accordion_id); ?>">
                        <div class="accordion-header">
                            <p class="text-h3 mt-0 line-height-snug"><?php echo esc_html($accordion_title); ?></p>
                        </div>
                        
                        <div class="accordion-tabs">
                            <?php foreach ($accordion_items as $index => $item) : 
                                if (!$item || !isset($item['tab_title'])) continue;
                                $tab_id = $accordion_id . '-tab-' . $index;
                                $is_active = false; // No tabs active on page load
                            ?>
                                <button 
                                    class="accordion-tab asari-btn <?php echo $is_active ? 'active' : ''; ?>"
                                    data-tab="<?php echo esc_attr($tab_id); ?>"
                                    aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
                                    role="tab"
                                >
                                    <span class="tab-radio btn-icon"></span>
                                    <span class="tab-text"><?php echo esc_html($item['tab_title']); ?></span>
                                </button>
                            <?php endforeach; ?>
                        </div>

                        <div class="accordion-content">
                            <?php foreach ($accordion_items as $index => $item) : 
                                if (!$item || !isset($item['tab_content'])) continue;
                                $tab_id = $accordion_id . '-tab-' . $index;
                                $is_active = false; // No tabs active on page load
                            ?>
                                <div 
                                    class="accordion-panel bg-soft-gray rounded-lg px-large <?php echo $is_active ? 'active' : ''; ?>"
                                    id="<?php echo esc_attr($tab_id); ?>"
                                    role="tabpanel"
                                    <?php if (!$is_active) echo 'aria-hidden="true"'; ?>
                                >
                                    <p class="text-b2"><?php echo wp_kses_post($item['tab_content']); ?></p>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endif; ?>

            </div>
        </div>

        <!-- Right Image -->
        <div class="image-with-options-right">
            <?php if ($img_url) : ?>
                <div class="image-with-options-image">
                    <img src="<?php echo $img_url; ?>" 
                         alt="<?php echo $img_alt; ?>"
                         loading="lazy">
                </div>
            <?php else : ?>
                <div class="image-with-options-image-placeholder">
                    <div class="placeholder-content">
                        <p>Image Placeholder</p>
                    </div>
                </div>
            <?php endif; ?>
        </div>

    </div>
</section>