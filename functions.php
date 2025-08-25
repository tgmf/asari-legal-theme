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
}
add_action('wp_enqueue_scripts', 'asari_legal_scripts');

/**
 * Add custom fonts to editor
 */
function asari_legal_editor_styles() {
    add_editor_style(get_template_directory_uri() . '/assets/css/fonts.css');
}
add_action('after_setup_theme', 'asari_legal_editor_styles');

/**
 * Register ACF blocks (when ACF Pro is active)
 */
function asari_legal_register_acf_blocks() {
    if (function_exists('acf_register_block_type')) {
        
        // Employee Grid Block
        acf_register_block_type(array(
            'name'              => 'employee-grid',
            'title'             => 'Employee Grid',
            'description'       => 'Display a grid of team members with filtering',
            'render_template'   => 'blocks/employee-grid.php',
            'category'          => 'asari-blocks',
            'icon'              => 'groups',
            'keywords'          => array('team', 'employees', 'grid'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // Practice Showcase Block
        acf_register_block_type(array(
            'name'              => 'practice-showcase',
            'title'             => 'Practice Showcase',
            'description'       => 'Display practice areas in a showcase layout',
            'render_template'   => 'blocks/practice-showcase.php',
            'category'          => 'asari-blocks',
            'icon'              => 'portfolio',
            'keywords'          => array('practice', 'expertise', 'showcase'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // Industry Grid Block
        acf_register_block_type(array(
            'name'              => 'industry-grid',
            'title'             => 'Industry Grid',
            'description'       => 'Display industries we serve',
            'render_template'   => 'blocks/industry-grid.php',
            'category'          => 'asari-blocks',
            'icon'              => 'admin-multisite',
            'keywords'          => array('industry', 'sectors', 'grid'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // Event List Block
        acf_register_block_type(array(
            'name'              => 'event-list',
            'title'             => 'Event List',
            'description'       => 'Display upcoming events and webinars',
            'render_template'   => 'blocks/event-list.php',
            'category'          => 'asari-blocks',
            'icon'              => 'calendar-alt',
            'keywords'          => array('events', 'calendar', 'list'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // Vacancy List Block
        acf_register_block_type(array(
            'name'              => 'vacancy-list',
            'title'             => 'Vacancy List',
            'description'       => 'Display current job openings',
            'render_template'   => 'blocks/vacancy-list.php',
            'category'          => 'asari-blocks',
            'icon'              => 'businessman',
            'keywords'          => array('jobs', 'careers', 'vacancies'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // Office Info Block
        acf_register_block_type(array(
            'name'              => 'office-info',
            'title'             => 'Office Information',
            'description'       => 'Display office contact details and map',
            'render_template'   => 'blocks/office-info.php',
            'category'          => 'asari-blocks',
            'icon'              => 'building',
            'keywords'          => array('office', 'contact', 'address'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
        
        // News & Publications Block
        acf_register_block_type(array(
            'name'              => 'news-grid',
            'title'             => 'News & Publications',
            'description'       => 'Display latest news and publications with filtering',
            'render_template'   => 'blocks/news-grid.php',
            'category'          => 'asari-blocks',
            'icon'              => 'admin-post',
            'keywords'          => array('news', 'publications', 'articles'),
            'supports'          => array('align' => array('wide', 'full')),
        ));
    }
}
add_action('acf/init', 'asari_legal_register_acf_blocks');

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
 * Customize ACF admin (if ACF Pro is active)
 */
function asari_legal_customize_acf() {
    if (function_exists('acf_add_options_page')) {
        // Add theme options page
        acf_add_options_page(array(
            'page_title'    => 'Theme Options',
            'menu_title'    => 'Theme Options',
            'menu_slug'     => 'theme-options',
            'capability'    => 'manage_options',
        ));
    }
}
add_action('acf/init', 'asari_legal_customize_acf');

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