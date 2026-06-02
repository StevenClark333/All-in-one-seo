<?php
/**
 * Plugin Name: All In One SEO
 * Plugin URI: https://app.example.com/integrations
 * Description: Installs the All In One SEO monitoring script and receives approved fix tasks from the All In One SEO portal.
 * Version: 0.3.0
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
const ALL_IN_ONE_SEO_FIX_QUEUE_OPTION_NAME = 'all_in_one_seo_fix_queue';
const ALL_IN_ONE_SEO_SCRIPT_HANDLE = 'all-in-one-seo-monitor';
const ALL_IN_ONE_SEO_REST_NAMESPACE = 'all-in-one-seo/v1';
const ALL_IN_ONE_SEO_FIX_ROUTE = '/link-fixes';

function all_in_one_seo_default_settings(): array
{
    return [
        'enabled' => '1',
        'app_url' => '',
        'site_id' => '',
        'receiver_key' => '',
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
    $receiver_key = isset($input['receiver_key']) ? sanitize_text_field((string) $input['receiver_key']) : '';

    return [
        'enabled' => !empty($input['enabled']) ? '1' : '0',
        'app_url' => untrailingslashit($app_url),
        'site_id' => $site_id,
        'receiver_key' => $receiver_key,
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

    add_settings_section(
        'all_in_one_seo_fix_receiver',
        __('Fix receiver', 'all-in-one-seo'),
        '__return_false',
        'all-in-one-seo'
    );

    add_settings_field(
        'all_in_one_seo_receiver_key',
        __('Receiver API key', 'all-in-one-seo'),
        'all_in_one_seo_render_receiver_key_field',
        'all-in-one-seo',
        'all_in_one_seo_fix_receiver'
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

function all_in_one_seo_render_receiver_key_field(): void
{
    $settings = all_in_one_seo_get_settings();
    ?>
    <input
        type="password"
        class="regular-text"
        name="<?php echo esc_attr(ALL_IN_ONE_SEO_OPTION_NAME); ?>[receiver_key]"
        value="<?php echo esc_attr($settings['receiver_key']); ?>"
        autocomplete="new-password"
        placeholder="Paste a long secret from All In One SEO"
    />
    <p class="description">
        <?php esc_html_e('Used to authenticate approved fix payloads sent from the All In One SEO portal.', 'all-in-one-seo'); ?>
    </p>
    <p class="description">
        <?php esc_html_e('Receiver endpoint:', 'all-in-one-seo'); ?>
        <code><?php echo esc_html(rest_url(ALL_IN_ONE_SEO_REST_NAMESPACE . ALL_IN_ONE_SEO_FIX_ROUTE)); ?></code>
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
        <?php all_in_one_seo_render_admin_notice(); ?>
        <form action="options.php" method="post">
            <?php
            settings_fields('all_in_one_seo_settings');
            do_settings_sections('all-in-one-seo');
            submit_button(__('Save settings', 'all-in-one-seo'));
            ?>
        </form>
        <?php all_in_one_seo_render_fix_queue(); ?>
    </div>
    <?php
}

function all_in_one_seo_render_admin_notice(): void
{
    $notice = isset($_GET['all_in_one_seo_notice']) ? sanitize_key((string) wp_unslash($_GET['all_in_one_seo_notice'])) : '';

    if ($notice === '') {
        return;
    }

    $messages = [
        'applied' => __('Link replacement applied to the matching WordPress post.', 'all-in-one-seo'),
        'cannot_edit_post' => __('The matching post exists, but your account cannot edit it.', 'all-in-one-seo'),
        'anchor_not_found' => __('The matching post was found, but the suggested anchor text was not present in editable content.', 'all-in-one-seo'),
        'link_already_present' => __('The suggested link already exists on the matching WordPress post.', 'all-in-one-seo'),
        'link_not_found' => __('The matching post was found, but the exact broken URL was not present in post content.', 'all-in-one-seo'),
        'missing' => __('Fix task was not found in the queue.', 'all-in-one-seo'),
        'source_not_found' => __('No WordPress post matched the source URL.', 'all-in-one-seo'),
        'unchanged' => __('No content changes were needed.', 'all-in-one-seo'),
        'update_failed' => __('WordPress could not update the post.', 'all-in-one-seo'),
    ];
    $message = $messages[$notice] ?? '';

    if ($message === '') {
        return;
    }

    $success_notices = ['applied', 'link_already_present'];
    $class = in_array($notice, $success_notices, true) ? 'notice notice-success' : 'notice notice-warning';
    ?>
    <div class="<?php echo esc_attr($class); ?>">
        <p><?php echo esc_html($message); ?></p>
    </div>
    <?php
}

function all_in_one_seo_render_fix_queue(): void
{
    $fixes = all_in_one_seo_get_fix_queue();
    ?>
    <hr />
    <h2><?php esc_html_e('Received fix tasks', 'all-in-one-seo'); ?></h2>
    <p>
        <?php esc_html_e('Approved link fixes sent from All In One SEO appear here for review before any WordPress content is edited.', 'all-in-one-seo'); ?>
    </p>
    <?php if (empty($fixes)) : ?>
        <p><?php esc_html_e('No fix tasks received yet.', 'all-in-one-seo'); ?></p>
        <?php return; ?>
    <?php endif; ?>
    <table class="widefat striped">
        <thead>
            <tr>
                <th><?php esc_html_e('Status', 'all-in-one-seo'); ?></th>
                <th><?php esc_html_e('Source URL', 'all-in-one-seo'); ?></th>
                <th><?php esc_html_e('Suggested URL', 'all-in-one-seo'); ?></th>
                <th><?php esc_html_e('Instructions', 'all-in-one-seo'); ?></th>
                <th><?php esc_html_e('Received', 'all-in-one-seo'); ?></th>
                <th><?php esc_html_e('Actions', 'all-in-one-seo'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($fixes as $fix) : ?>
                <tr>
                    <td><?php echo esc_html($fix['status']); ?></td>
                    <td><code><?php echo esc_html($fix['source_url']); ?></code></td>
                    <td><code><?php echo esc_html($fix['suggested_url']); ?></code></td>
                    <td><?php echo esc_html($fix['manual_instructions']); ?></td>
                    <td><?php echo esc_html($fix['received_at']); ?></td>
                    <td>
                        <?php if (all_in_one_seo_fix_can_be_applied($fix)) : ?>
                            <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post" style="margin-bottom: 6px;">
                                <?php wp_nonce_field('all_in_one_seo_apply_link_fix'); ?>
                                <input type="hidden" name="action" value="all_in_one_seo_apply_link_fix" />
                                <input type="hidden" name="fix_id" value="<?php echo esc_attr($fix['id']); ?>" />
                                <?php submit_button(all_in_one_seo_get_apply_button_label($fix), 'primary small', 'submit', false); ?>
                            </form>
                        <?php endif; ?>
                        <?php if ($fix['status'] !== 'REVIEWED' && $fix['status'] !== 'APPLIED') : ?>
                            <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
                                <?php wp_nonce_field('all_in_one_seo_mark_fix_reviewed'); ?>
                                <input type="hidden" name="action" value="all_in_one_seo_mark_fix_reviewed" />
                                <input type="hidden" name="fix_id" value="<?php echo esc_attr($fix['id']); ?>" />
                                <?php submit_button(__('Mark reviewed', 'all-in-one-seo'), 'secondary small', 'submit', false); ?>
                            </form>
                        <?php else : ?>
                            <?php echo esc_html(all_in_one_seo_format_fix_status($fix['status'])); ?>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php
}

function all_in_one_seo_fix_can_be_applied(array $fix): bool
{
    return !empty($fix['source_url'])
        && !empty($fix['suggested_url'])
        && (!empty($fix['broken_url']) || !empty($fix['anchor_text']))
        && $fix['status'] !== 'APPLIED';
}

function all_in_one_seo_get_apply_button_label(array $fix): string
{
    if (!empty($fix['broken_url'])) {
        return __('Apply replacement', 'all-in-one-seo');
    }

    return __('Add internal link', 'all-in-one-seo');
}

function all_in_one_seo_format_fix_status(string $status): string
{
    if ($status === 'APPLIED') {
        return __('Applied', 'all-in-one-seo');
    }

    if ($status === 'REVIEWED') {
        return __('Reviewed', 'all-in-one-seo');
    }

    return $status;
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

function all_in_one_seo_register_rest_routes(): void
{
    register_rest_route(
        ALL_IN_ONE_SEO_REST_NAMESPACE,
        ALL_IN_ONE_SEO_FIX_ROUTE,
        [
            'methods' => 'POST',
            'callback' => 'all_in_one_seo_receive_link_fix',
            'permission_callback' => '__return_true',
        ]
    );
}
add_action('rest_api_init', 'all_in_one_seo_register_rest_routes');

function all_in_one_seo_receive_link_fix(WP_REST_Request $request)
{
    $settings = all_in_one_seo_get_settings();
    $receiver_key = (string) $settings['receiver_key'];
    $provided_key = (string) $request->get_header('x-all-in-one-seo-key');

    if ($receiver_key === '' || $provided_key === '' || !hash_equals($receiver_key, $provided_key)) {
        return new WP_Error(
            'all_in_one_seo_unauthorized',
            __('Invalid All In One SEO receiver key.', 'all-in-one-seo'),
            ['status' => 401]
        );
    }

    $payload = $request->get_json_params();

    if (!is_array($payload) || !isset($payload['linkFix']) || !is_array($payload['linkFix'])) {
        return new WP_Error(
            'all_in_one_seo_invalid_payload',
            __('Expected a linkFix payload.', 'all-in-one-seo'),
            ['status' => 400]
        );
    }

    $fix = all_in_one_seo_sanitize_link_fix_payload($payload);
    all_in_one_seo_store_link_fix($fix);

    return new WP_REST_Response(
        [
            'accepted' => true,
            'fixId' => $fix['id'],
        ],
        202
    );
}

function all_in_one_seo_sanitize_link_fix_payload(array $payload): array
{
    $link_fix = $payload['linkFix'];
    $resource_id = isset($payload['resourceId']) ? sanitize_text_field((string) $payload['resourceId']) : '';

    return [
        'id' => $resource_id !== '' ? $resource_id : wp_generate_uuid4(),
        'status' => 'RECEIVED',
        'source_url' => isset($link_fix['sourceUrl']) ? esc_url_raw((string) $link_fix['sourceUrl']) : '',
        'broken_url' => isset($link_fix['brokenUrl']) ? esc_url_raw((string) $link_fix['brokenUrl']) : '',
        'suggested_url' => isset($link_fix['suggestedUrl']) ? esc_url_raw((string) $link_fix['suggestedUrl']) : '',
        'callback_url' => isset($link_fix['callbackUrl']) ? esc_url_raw((string) $link_fix['callbackUrl']) : '',
        'anchor_text' => isset($link_fix['anchorText']) ? sanitize_text_field((string) $link_fix['anchorText']) : '',
        'manual_instructions' => isset($link_fix['manualInstructions']) ? sanitize_textarea_field((string) $link_fix['manualInstructions']) : '',
        'received_at' => current_time('mysql'),
    ];
}

function all_in_one_seo_store_link_fix(array $fix): void
{
    $queue = all_in_one_seo_get_fix_queue();
    $queue = array_values(
        array_filter(
            $queue,
            static function (array $item) use ($fix): bool {
                return $item['id'] !== $fix['id'];
            }
        )
    );
    array_unshift($queue, $fix);
    update_option(ALL_IN_ONE_SEO_FIX_QUEUE_OPTION_NAME, array_slice($queue, 0, 100), false);
}

function all_in_one_seo_get_fix_queue(): array
{
    $queue = get_option(ALL_IN_ONE_SEO_FIX_QUEUE_OPTION_NAME, []);

    if (!is_array($queue)) {
        return [];
    }

    return array_values(
        array_filter(
            $queue,
            static function ($item): bool {
                return is_array($item) && isset($item['id']);
            }
        )
    );
}

function all_in_one_seo_mark_fix_reviewed(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have permission to review fixes.', 'all-in-one-seo'));
    }

    check_admin_referer('all_in_one_seo_mark_fix_reviewed');

    $fix_id = isset($_POST['fix_id']) ? sanitize_text_field((string) wp_unslash($_POST['fix_id'])) : '';
    $queue = all_in_one_seo_get_fix_queue();

    foreach ($queue as &$fix) {
        if ($fix['id'] === $fix_id) {
            $fix['status'] = 'REVIEWED';
            $fix['reviewed_at'] = current_time('mysql');
            break;
        }
    }
    unset($fix);

    update_option(ALL_IN_ONE_SEO_FIX_QUEUE_OPTION_NAME, $queue, false);
    wp_safe_redirect(admin_url('options-general.php?page=all-in-one-seo'));
    exit;
}
add_action('admin_post_all_in_one_seo_mark_fix_reviewed', 'all_in_one_seo_mark_fix_reviewed');

function all_in_one_seo_apply_link_fix(): void
{
    if (!current_user_can('edit_posts')) {
        wp_die(esc_html__('You do not have permission to apply fixes.', 'all-in-one-seo'));
    }

    check_admin_referer('all_in_one_seo_apply_link_fix');

    $fix_id = isset($_POST['fix_id']) ? sanitize_text_field((string) wp_unslash($_POST['fix_id'])) : '';
    $queue = all_in_one_seo_get_fix_queue();
    $notice = 'missing';

    foreach ($queue as &$fix) {
        if ($fix['id'] !== $fix_id) {
            continue;
        }

        $result = all_in_one_seo_apply_link_fix_to_post($fix);
        $notice = $result['notice'];

        if ($result['applied']) {
            $fix['status'] = 'APPLIED';
            $fix['applied_at'] = current_time('mysql');
            $fix['post_id'] = (string) $result['post_id'];
            all_in_one_seo_report_link_fix_status($fix);
        }

        break;
    }
    unset($fix);

    update_option(ALL_IN_ONE_SEO_FIX_QUEUE_OPTION_NAME, $queue, false);
    wp_safe_redirect(
        add_query_arg(
            'all_in_one_seo_notice',
            rawurlencode($notice),
            admin_url('options-general.php?page=all-in-one-seo')
        )
    );
    exit;
}
add_action('admin_post_all_in_one_seo_apply_link_fix', 'all_in_one_seo_apply_link_fix');

function all_in_one_seo_report_link_fix_status(array $fix): void
{
    if (empty($fix['callback_url'])) {
        return;
    }

    $settings = all_in_one_seo_get_settings();
    $receiver_key = (string) $settings['receiver_key'];

    if ($receiver_key === '') {
        return;
    }

    wp_remote_post(
        esc_url_raw((string) $fix['callback_url']),
        [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-All-In-One-SEO-Key' => $receiver_key,
            ],
            'timeout' => 5,
            'body' => wp_json_encode(
                [
                    'fixId' => $fix['id'],
                    'postId' => $fix['post_id'] ?? '',
                    'status' => $fix['status'],
                ]
            ),
        ]
    );
}

function all_in_one_seo_apply_link_fix_to_post(array $fix): array
{
    $post_id = url_to_postid($fix['source_url']);

    if (!$post_id) {
        return [
            'applied' => false,
            'notice' => 'source_not_found',
            'post_id' => 0,
        ];
    }

    $post = get_post($post_id);

    if (!$post || !current_user_can('edit_post', $post_id)) {
        return [
            'applied' => false,
            'notice' => 'cannot_edit_post',
            'post_id' => $post_id,
        ];
    }

    $content = (string) $post->post_content;
    $broken_url = (string) $fix['broken_url'];
    $suggested_url = (string) $fix['suggested_url'];

    if ($suggested_url === '') {
        return [
            'applied' => false,
            'notice' => 'unchanged',
            'post_id' => $post_id,
        ];
    }

    if ($broken_url !== '') {
        if (strpos($content, $broken_url) === false) {
            return [
                'applied' => false,
                'notice' => 'link_not_found',
                'post_id' => $post_id,
            ];
        }

        $updated_content = str_replace($broken_url, $suggested_url, $content);
    } else {
        $insertion = all_in_one_seo_insert_contextual_link(
            $content,
            $suggested_url,
            (string) $fix['anchor_text']
        );

        if ($insertion['already_present']) {
            return [
                'applied' => true,
                'notice' => 'link_already_present',
                'post_id' => $post_id,
            ];
        }

        if (!$insertion['inserted']) {
            return [
                'applied' => false,
                'notice' => 'anchor_not_found',
                'post_id' => $post_id,
            ];
        }

        $updated_content = $insertion['content'];
    }

    if ($updated_content === $content) {
        return [
            'applied' => false,
            'notice' => 'unchanged',
            'post_id' => $post_id,
        ];
    }

    $updated = wp_update_post(
        [
            'ID' => $post_id,
            'post_content' => $updated_content,
        ],
        true
    );

    if (is_wp_error($updated)) {
        return [
            'applied' => false,
            'notice' => 'update_failed',
            'post_id' => $post_id,
        ];
    }

    return [
        'applied' => true,
        'notice' => 'applied',
        'post_id' => $post_id,
    ];
}

function all_in_one_seo_insert_contextual_link(string $content, string $suggested_url, string $anchor_text): array
{
    if ($suggested_url !== '' && strpos($content, $suggested_url) !== false) {
        return [
            'already_present' => true,
            'content' => $content,
            'inserted' => false,
        ];
    }

    $anchor_text = trim($anchor_text);

    if ($anchor_text === '') {
        return [
            'already_present' => false,
            'content' => $content,
            'inserted' => false,
        ];
    }

    $segments = preg_split('/(<a\b[^>]*>.*?<\/a>)/is', $content, -1, PREG_SPLIT_DELIM_CAPTURE);

    if (!is_array($segments)) {
        return [
            'already_present' => false,
            'content' => $content,
            'inserted' => false,
        ];
    }

    foreach ($segments as $segment_index => $segment) {
        if (preg_match('/^<a\b[^>]*>.*?<\/a>$/is', $segment)) {
            continue;
        }

        $text_segments = preg_split('/(<[^>]+>)/', $segment, -1, PREG_SPLIT_DELIM_CAPTURE);

        if (!is_array($text_segments)) {
            continue;
        }

        foreach ($text_segments as $text_index => $text_segment) {
            if ($text_segment === '' || preg_match('/^<[^>]+>$/', $text_segment)) {
                continue;
            }

            $linked_text = all_in_one_seo_link_first_anchor_text(
                $text_segment,
                $suggested_url,
                $anchor_text
            );

            if ($linked_text === $text_segment) {
                continue;
            }

            $text_segments[$text_index] = $linked_text;
            $segments[$segment_index] = implode('', $text_segments);

            return [
                'already_present' => false,
                'content' => implode('', $segments),
                'inserted' => true,
            ];
        }
    }

    return [
        'already_present' => false,
        'content' => $content,
        'inserted' => false,
    ];
}

function all_in_one_seo_link_first_anchor_text(string $text, string $suggested_url, string $anchor_text): string
{
    $position = stripos($text, $anchor_text);

    if ($position === false) {
        return $text;
    }

    $matched_text = substr($text, $position, strlen($anchor_text));
    $link = sprintf(
        '<a href="%s">%s</a>',
        esc_url($suggested_url),
        esc_html($matched_text)
    );

    return substr($text, 0, $position) . $link . substr($text, $position + strlen($anchor_text));
}

function all_in_one_seo_settings_link(array $links): array
{
    $settings_link = '<a href="' . esc_url(admin_url('options-general.php?page=all-in-one-seo')) . '">' . esc_html__('Settings', 'all-in-one-seo') . '</a>';
    array_unshift($links, $settings_link);

    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'all_in_one_seo_settings_link');
