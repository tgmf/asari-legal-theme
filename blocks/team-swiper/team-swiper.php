<?php
/**
 * Team Swiper Block Template
 * 
 * @param array $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool $is_preview True during backend preview render.
 * @param int $post_id The post ID this block is saved to.
 * @param WP_Block $wp_block The block instance (since WP 5.5).
 * @param array $context The block context array.
 */

// Create id attribute allowing for custom "anchor" value
$id = 'team-swiper-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values
$className = 'wp-block-asari-team-swiper';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}
if (!empty($block['align'])) {
    $className .= ' align' . $block['align'];
}

// Get ACF fields
$title = get_field('title');
$subtitle = get_field('subtitle');
$description = get_field('description');
$link = get_field('link');

// Query team members
$team_query = new WP_Query(array(
    'post_type' => 'team',
    'posts_per_page' => -1,
    'orderby' => 'menu_order',
    'order' => 'ASC',
    'post_status' => 'publish',
    'meta_query' => array(
        'relation' => 'OR',
        array(
            'key' => 'bw_image',
            'compare' => 'EXISTS'
        ),
        array(
            'key' => 'color_image', 
            'compare' => 'EXISTS'
        )
    )
));

// If no content and not in preview mode, show placeholder
if (!$title && !$subtitle && !$team_query->have_posts() && !$is_preview) {
    echo '<div class="' . esc_attr($className) . ' is-empty-placeholder">';
    echo '<p>' . __('Team Swiper Block - Add content in the editor', 'asari-legal-theme') . '</p>';
    echo '</div>';
    return;
}

// Generate unique swiper ID
$swiper_id = 'team-swiper-' . $block['id'];

// Get block wrapper attributes (includes spacing styles)
$wrapper_attributes = get_block_wrapper_attributes([
    'id' => $id,
    'class' => $className,
    'data-swiper-id' => $swiper_id
]);
?>

<section <?php echo $wrapper_attributes; ?>>
    
    <!-- Header Section -->
    <?php if ($title || $subtitle || $description || $link) : ?>
        <div class="team-swiper-header-wrapper d-flex justify-start items-end mb-2x-large">
            <div class="team-swiper-header max-w-content px-x-large w-half d-flex justify-end flex-column items-start">
                <?php if ($title) : ?>
                    <h2 class="team-swiper-title font-manege text-h2 line-height-tight my-0 animate-fade-in-1">
                        <?php echo wp_kses_post($title); ?>
                    </h2>
                <?php endif; ?>
                
                <?php if ($subtitle) : ?>
                    <p class="team-swiper-subtitle font-cofo text-h2 line-height-tight my-0 animate-fade-in-2">
                        <?php echo wp_kses_post($subtitle); ?>
                    </p>
                <?php endif; ?>
            </div>
                    
            <?php if ($description) : ?>
                <div class="team-swiper-description w-half">
                    <p class="team-swiper-description text-b2 line-height-relaxed max-w-lg my-0 animate-fade-in-3">
                        <?php echo wp_kses_post($description); ?>
                    </p>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
                
    <?php if ($link) : 
        // Process link - could be URL string or ACF link field
        $link_url = '';
        $link_text = 'Показать полностью';
        
        if (is_array($link)) {
            // ACF Link field
            $link_url = $link['url'];
            $link_text = !empty($link['title']) ? $link['title'] : $link_text;
        } else {
            // URL string
            $link_url = $link;
            $post_id = url_to_postid($link);
            if ($post_id) {
                $link_text = get_the_title($post_id);
            }
        }
    ?>
        <div class="px-x-large mb-2x-large">
            <div class="team-swiper-link animate-fade-in-3">
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
        </div>
    <?php endif; ?>
    
    <!-- Swiper Container -->
    <?php if ($team_query->have_posts()) : ?>
        <div class="team-swiper-wrapper animate-fade-in-4">
            <div class="swiper" id="<?php echo esc_attr($swiper_id); ?>">
                <div class="swiper-wrapper">
                    <?php 
                    $slide_index = 0;
                    while ($team_query->have_posts()) : 
                        $team_query->the_post();
                        
                        // Get team member data
                        $member_id = get_the_ID();
                        $member_name = get_the_title();
                        $member_url = get_permalink();
                        $position = get_field('position', $member_id);
                        $bw_image = get_field('bw_image', $member_id);
                        $color_image = get_field('color_image', $member_id);
                        
                        // Prepare image URLs
                        $bw_url = '';
                        $color_url = '';
                        $alt_text = esc_attr($member_name);
                        
                        if ($bw_image) {
                            if (is_array($bw_image)) {
                                $bw_url = esc_url($bw_image['url']);
                                if (!empty($bw_image['alt'])) $alt_text = esc_attr($bw_image['alt']);
                            } else {
                                $bw_url = esc_url(wp_get_attachment_image_url($bw_image, 'medium'));
                            }
                        }
                        
                        if ($color_image) {
                            if (is_array($color_image)) {
                                $color_url = esc_url($color_image['url']);
                            } else {
                                $color_url = esc_url(wp_get_attachment_image_url($color_image, 'medium'));
                            }
                        }
                        
                        // Skip if no images
                        if (!$bw_url && !$color_url) continue;
                    ?>
                        <div class="swiper-slide" data-slide="<?php echo esc_attr($slide_index); ?>">
                            <article class="team-member-card">
                                <a href="<?php echo esc_url($member_url); ?>" class="team-member-link">
                                    
                                    <div class="team-member-image">
                                        <?php if ($bw_url) : ?>
                                            <img src="<?php echo $bw_url; ?>" 
                                                 alt="<?php echo $alt_text; ?>"
                                                 class="team-member-bw"
                                                 loading="lazy">
                                        <?php endif; ?>
                                        
                                        <?php if ($color_url) : ?>
                                            <img src="<?php echo $color_url; ?>" 
                                                 alt="<?php echo $alt_text; ?>"
                                                 class="team-member-color"
                                                 loading="lazy">
                                        <?php endif; ?>
                                    </div>
                                    
                                    <div class="team-member-info">
                                        <h3 class="team-member-name font-cofo text-b3 line-height-snug mb-0">
                                            <?php echo esc_html($member_name); ?>
                                        </h3>
                                        
                                        <?php if ($position) : ?>
                                            <p class="team-member-position text-b5 line-height-relaxed text-gray mt-0 mb-0">
                                                <?php echo esc_html($position); ?>
                                            </p>
                                        <?php endif; ?>
                                    </div>
                                    
                                </a>
                            </article>
                        </div>
                    <?php 
                        $slide_index++;
                    endwhile; 
                    wp_reset_postdata();
                    ?>
                </div>
                
                <!-- Navigation -->
                <div class="swiper-navigation d-flex justify-end mt-2x-large mb-2x-large">
                    <div class="swiper-button-prev team-swiper-prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1"/>
                            <path d="M14 8l-4 4 4 4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="swiper-button-next team-swiper-next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1"/>
                            <path d="M10 8l4 4-4 4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    <?php else : ?>
        <div class="team-swiper-empty">
            <p class="text-center text-gray">
                <?php _e('No team members found.', 'asari-legal-theme'); ?>
            </p>
        </div>
    <?php endif; ?>
    
</section>