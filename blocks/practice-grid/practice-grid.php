<?php
/**
 * Practice Grid Block Template
 * 
 * @param array $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool $is_preview True during backend preview render.
 * @param int $post_id The post ID this block is saved to.
 * @param WP_Block $wp_block The block instance (since WP 5.5).
 * @param array $context The block context array.
 */

// Create id attribute allowing for custom "anchor" value
$id = 'practice-grid-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values
$className = 'wp-block-asari-practice-grid';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}
if (!empty($block['align'])) {
    $className .= ' align' . $block['align'];
}

// Get ACF fields
$title = get_field('title');
$subtitle = get_field('subtitle');
$link = get_field('link');

// Query all practices in menu order
$practices_query = new WP_Query(array(
    'post_type' => 'practice',
    'posts_per_page' => -1,
    'orderby' => 'menu_order',
    'order' => 'ASC',
    'post_status' => 'publish'
));

// If no content and not in preview mode, show placeholder
if (!$title && !$subtitle && !$practices_query->have_posts() && !$is_preview) {
    echo '<div class="' . esc_attr($className) . ' is-empty-placeholder">';
    echo '<p>' . __('Practice Grid Block - Add content in the editor', 'asari-legal-theme') . '</p>';
    echo '</div>';
    return;
}

// Get block wrapper attributes (includes spacing styles)
$wrapper_attributes = get_block_wrapper_attributes([
    'id' => $id,
    'class' => $className
]);
?>

<section <?php echo $wrapper_attributes; ?>>
    <div class="practice-grid-header-wrapper mb-2x-large d-flex items-end justify-between">
        <?php if ($title || $subtitle) : ?>
            <div class="practice-grid-header m-0">
                <?php if ($title) : ?>
                    <h2 class="practice-grid-title font-manege text-h2 line-height-tight mb-0">
                        <?php echo wp_kses_post($title); ?>
                    </h2>
                <?php endif; ?>
                <?php if ($subtitle) : ?>
                    <p class="practice-grid-subtitle font-cofo text-h2 line-height-tight m-0">
                        <?php echo wp_kses_post($subtitle); ?>
                    </p>
                <?php endif; ?>
            </div>
        <?php endif; ?>
        <?php if ($link) : 
            // Get the page title for the link
            $link_text = '';
            // If link is a URL string
            $post_id = url_to_postid($link);
            if ($post_id) {
                $link_text = get_the_title($post_id);
            } else {
                $link_text = 'Подробнее'; // Fallback for external URLs
            }
            $link_url = $link;
            
            // Fallback if no title found
            if (empty($link_text)) {
                $link_text = 'Подробнее';
            }
        ?>
            <div class="practice-grid-link">
                <a href="<?php echo esc_url($link_url); ?>" class="asari-btn">
                    <?php echo esc_html($link_text); ?>
                    <span class="btn-icon text-gold">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="9.5" stroke="currentColor"/>
                            <path d="M13.9863 9.70581L8.91895 14.7732L8.21191 14.0662L12.5723 9.70581L8.21191 5.34546L8.91895 4.63843L13.9863 9.70581Z" fill="currentColor"/>
                        </svg>
                    </span>
                </a>
            </div>
        <?php endif; ?>
    </div>

    <?php if ($practices_query->have_posts()) : ?>
        <div class="practice-grid-container">
            <?php 
            $card_index = 0;
            while ($practices_query->have_posts()) : 
                $practices_query->the_post();
                
                // Get practice data
                $practice_id = get_the_ID();
                $practice_title = get_the_title();
                $practice_excerpt = get_the_excerpt();
                $practice_url = get_permalink();
                $featured_image = get_the_post_thumbnail_url($practice_id, 'medium');
                $short_description = get_field('короткое_описание', $practice_id) ?: $practice_excerpt;
                
                // Calculate row for parallax (0-based)
                $row_index = floor($card_index / 4); // 4 cards per row on desktop
            ?>
                <article class="practice-card" 
                         data-row="<?php echo esc_attr($row_index); ?>"
                         data-index="<?php echo esc_attr($card_index); ?>">
                    <a href="<?php echo esc_url($practice_url); ?>" class="practice-card-link">
                        
                        <?php if ($featured_image) : ?>
                            <div class="practice-card-image">
                                <img src="<?php echo esc_url($featured_image); ?>" 
                                     alt="<?php echo esc_attr($practice_title); ?>"
                                     loading="lazy">
                            </div>
                        <?php else : ?>
                            <div class="practice-card-image practice-card-placeholder">
                                <div class="placeholder-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
                                        <path d="M16 20l8 8 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        <?php endif; ?>
                        
                        <div class="practice-card-content">
                            <h3 class="practice-card-title font-cofo text-b1 line-height-snug">
                                <?php echo esc_html($practice_title); ?>
                            </h3>
                            
                            <?php if ($short_description) : ?>
                                <div class="practice-card-description">
                                    <p class="text-b4 line-height-relaxed">
                                        <?php echo wp_kses_post($short_description); ?>
                                    </p>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                    </a>
                </article>
            <?php 
                $card_index++;
            endwhile; 
            wp_reset_postdata();
            ?>
        </div>
    <?php else : ?>
        <div class="practice-grid-empty">
            <p class="text-center text-gray">
                <?php _e('No practice areas found.', 'asari-legal-theme'); ?>
            </p>
        </div>
    <?php endif; ?>

</section>