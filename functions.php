<?php
/**
 * Asari Legal Theme functions and definitions
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme setup
 */
function asari_legal_setup() {
    // Add theme support for various features
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));
    
    // Add theme support for responsive embeds
    add_theme_support('responsive-embeds');
    
    // Add theme support for editor styles
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    
    // Add theme support for wide and full alignment
    add_theme_support('align-wide');
    
    // Add theme support for block editor color palette (defined in theme.json)
    add_theme_support('disable-custom-colors');
    add_theme_support('disable-custom-font-sizes');
}
add_action('after_setup_theme', 'asari_legal_setup');

/**
 * Enqueue scripts and styles
 */
function asari_legal_scripts() {
    // Theme stylesheet
    wp_enqueue_style(
        'asari-legal-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );
    
    // Custom fonts
    wp_enqueue_style(
        'asari-legal-fonts',
        get_template_directory_uri() . '/assets/css/fonts.css',
        array(),
        wp_get_theme()->get('Version')
    );
    
    // Utility classes - load after main styles
    wp_enqueue_style(
        'asari-legal-utilities',
        get_template_directory_uri() . '/assets/css/utilities.css',
        array('asari-legal-style'), // Depend on main styles
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'asari_legal_scripts');

/**
 * Enqueue editor styles including utilities
 */
function asari_legal_editor_styles() {
    // Add fonts
    add_editor_style(get_template_directory_uri() . '/assets/css/fonts.css');
    
    // Add utilities to editor
    add_editor_style(get_template_directory_uri() . '/assets/css/utilities.css');
}
add_action('after_setup_theme', 'asari_legal_editor_styles');

/**
 * Register ACF blocks 
 */
function asari_legal_register_blocks() {
    // Register blocks using block.json files
    $block_dirs = array(
        'hero',
        // Add other block directories here as you create them
        // 'employee-grid',
        // 'practice-showcase',
        // etc.
    );
    
    foreach ($block_dirs as $block_dir) {
        $block_path = get_template_directory() . '/blocks/' . $block_dir;
        
        if (file_exists($block_path . '/block.json')) {
            register_block_type($block_path);
        }
    }
}
add_action('init', 'asari_legal_register_blocks');

/**
 * Add custom block category
 */
function asari_legal_block_categories($categories) {
    return array_merge(
        array(
            array(
                'slug'  => 'asari-blocks',
                'title' => 'Asari Legal Blocks',
                'icon'  => 'building',
            ),
        ),
        $categories
    );
}
add_filter('block_categories_all', 'asari_legal_block_categories');

/**
 * Remove unwanted WordPress features
 */
function asari_legal_remove_unwanted_features() {
    // Remove comments support from posts and pages
    remove_post_type_support('post', 'comments');
    remove_post_type_support('page', 'comments');
    
    // Remove comments menu from admin
    remove_menu_page('edit-comments.php');
}
add_action('admin_menu', 'asari_legal_remove_unwanted_features');

/**
 * Disable comments entirely
 */
add_filter('comments_open', '__return_false', 20, 2);
add_filter('pings_open', '__return_false', 20, 2);
add_filter('comments_array', '__return_empty_array', 10, 2);

/**
 * Hide admin bar for non-admin users
 */
function asari_legal_hide_admin_bar() {
    if (!current_user_can('manage_options')) {
        show_admin_bar(false);
    }
}
add_action('wp_loaded', 'asari_legal_hide_admin_bar');

function asari_legal_mime_types( $mimes ) {
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}
add_filter( 'upload_mimes', 'asari_legal_mime_types' );