<?php
/**
 * Plugin Name: All In One SEO
 * Plugin URI: https://app.example.com/integrations
 * Description: Installs the All In One SEO monitoring script on WordPress sites.
 * Version: 0.1.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: All In One SEO
 * License: GPL-2.0-or-later
 * Text Domain: all-in-one-seo
 */

if (!defined('ABSPATH')) {
    exit;
}

const ALL_IN_ONE_SEO_OPTION_NAME = 'all_in_one_seo_settings';
const ALL_IN_ONE_SEO_SCRIPT_HANDLE = 'all-in-one-seo-monitor';

function all_in_one_seo_default_settings(): array
{
    return [
        'enabled' => '1',
        'app_url' => '',
        'site_id' => '',
    ];
}

function all_in_one_seo_get_settings(): array
{
    $settings = get_option(ALL_IN_ONE_SEO_OPTION_NAME, []);

    if (!is_array($settings)) {
        $settings = [];
    }

    return array_merge(all_in_one_seo_default_settings(), $settings);
}

function all_in_one_seo_sanitize_settings(array $input): array
{
    $app_url = isset($input['app_url']) ? esc_url_raw(trim((string) $input['app_url'])) : '';
    $site_id = isset($input['site_id']) ? sanitize_text_field((string) $input['site_id']) : '';

    return [
        'enabled' => !empty($input['enabled']) ? '1' : '0',
        'app_url' => untrailingslashit($app_url),
        'site_id' => $site_id,
    ];
}

function all_in_one_seo_register_settings(): void
{
    register_setting(
        'all_in_one_seo_settings',
        ALL_IN_ONE_SEO_OPTION_NAME,
        [
            'type' => 'array',
            'sanitize_callback' => 'all_in_one_seo_sanitize_settings',
            'default' => all_in_one_seo_default_settings(),
        ]
    );

    add_settings_section(
        'all_in_one_seo_connection',
        __('Connection', 'all-in-one-seo'),
        '__return_false',
        'all-in-one-seo'
    );

    add_settings_field(
        'all_in_one_seo_enabled',
        __('Enable monitoring script', 'all-in-one-seo'),
        'all_in_one_seo_render_enabled_field',
        'all-in-one-seo',
        'all_in_one_seo_connection'
    );

    add_settings_field(
        'all_in_one_seo_app_url',
        __('All In One SEO app URL', 'all-in-one-seo'),
        'all_in_one_seo_render_app_url_field',
        'all-in-one-seo',
        'all_in_one_seo_connection'
    );

    add_settings_field(
        'all_in_one_seo_site_id',
        __('Site ID', 'all-in-one-seo'),
        'all_in_one_seo_render_site_id_field',
        'all-in-one-seo',
        'all_in_one_seo_connection'
    );
}
add_action('admin_init', 'all_in_one_seo_register_settings');

function all_in_one_seo_add_settings_page(): void
{
    add_options_page(
        __('All In One SEO', 'all-in-one-seo'),
        __('All In One SEO', 'all-in-one-seo'),
        'manage_options',
        'all-in-one-seo',
        'all_in_one_seo_render_settings_page'
    );
}
add_action('admin_menu', 'all_in_one_seo_add_settings_page');

function all_in_one_seo_render_enabled_field(): void
{
    $settings = all_in_one_seo_get_settings();
    ?>
    <label>
        <input
            type="checkbox"
            name="<?php echo esc_attr(ALL_IN_ONE_SEO_OPTION_NAME); ?>[enabled]"
            value="1"
            <?php checked($settings['enabled'], '1'); ?>
        />
        <?php esc_html_e('Load the monitoring script on public pages.', 'all-in-one-seo'); ?>
    </label>
    <?php
}

function all_in_one_seo_render_app_url_field(): void
{
    $settings = all_in_one_seo_get_settings();
    ?>
    <input
        type="url"
        class="regular-text"
        name="<?php echo esc_attr(ALL_IN_ONE_SEO_OPTION_NAME); ?>[app_url]"
        value="<?php echo esc_attr($settings['app_url']); ?>"
        placeholder="https://app.example.com"
        required
    />
    <p class="description">
        <?php esc_html_e('Use the app origin that serves /seo.js.', 'all-in-one-seo'); ?>
    </p>
    <?php
}

function all_in_one_seo_render_site_id_field(): void
{
    $settings = all_in_one_seo_get_settings();
    ?>
    <input
        type="text"
        class="regular-text"
        name="<?php echo esc_attr(ALL_IN_ONE_SEO_OPTION_NAME); ?>[site_id]"
        value="<?php echo esc_attr($settings['site_id']); ?>"
        placeholder="Domain ID from All In One SEO"
        required
    />
    <p class="description">
        <?php esc_html_e('Copy this from the domain install panel in All In One SEO.', 'all-in-one-seo'); ?>
    </p>
    <?php
}

function all_in_one_seo_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('All In One SEO', 'all-in-one-seo'); ?></h1>
        <p>
            <?php esc_html_e('Connect this WordPress site to continuous SEO monitoring, rendered SEO checks, SPA route observations, and Core Web Vitals collection.', 'all-in-one-seo'); ?>
        </p>
        <form action="options.php" method="post">
            <?php
            settings_fields('all_in_one_seo_settings');
            do_settings_sections('all-in-one-seo');
            submit_button(__('Save settings', 'all-in-one-seo'));
            ?>
        </form>
    </div>
    <?php
}

function all_in_one_seo_enqueue_monitoring_script(): void
{
    if (is_admin()) {
        return;
    }

    $settings = all_in_one_seo_get_settings();

    if ($settings['enabled'] !== '1' || empty($settings['app_url']) || empty($settings['site_id'])) {
        return;
    }

    $script_url = trailingslashit($settings['app_url']) . 'seo.js';

    wp_enqueue_script(
        ALL_IN_ONE_SEO_SCRIPT_HANDLE,
        esc_url($script_url),
        [],
        '0.1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'all_in_one_seo_enqueue_monitoring_script');

function all_in_one_seo_add_site_id_attribute(string $tag, string $handle, string $src): string
{
    if ($handle !== ALL_IN_ONE_SEO_SCRIPT_HANDLE) {
        return $tag;
    }

    $settings = all_in_one_seo_get_settings();
    $site_id = esc_attr($settings['site_id']);
    $src = esc_url($src);

    return '<script async src="' . $src . '" data-site-id="' . $site_id . '"></script>' . "\n";
}
add_filter('script_loader_tag', 'all_in_one_seo_add_site_id_attribute', 10, 3);

function all_in_one_seo_settings_link(array $links): array
{
    $settings_link = '<a href="' . esc_url(admin_url('options-general.php?page=all-in-one-seo')) . '">' . esc_html__('Settings', 'all-in-one-seo') . '</a>';
    array_unshift($links, $settings_link);

    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'all_in_one_seo_settings_link');
