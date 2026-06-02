import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const pluginPath = path.join(
  process.cwd(),
  "integrations",
  "wordpress",
  "all-in-one-seo",
  "all-in-one-seo.php",
);

test("WordPress plugin exposes the monitoring script through WordPress APIs", () => {
  const source = readFileSync(pluginPath, "utf8");

  assert.match(source, /Plugin Name:\s*All In One SEO/);
  assert.match(source, /register_setting\(/);
  assert.match(source, /add_action\('wp_enqueue_scripts'/);
  assert.match(source, /wp_enqueue_script\(/);
  assert.match(source, /add_filter\('script_loader_tag'/);
  assert.match(source, /data-site-id/);
  assert.match(source, /register_rest_route\(/);
  assert.match(source, /all-in-one-seo\/v1/);
  assert.match(source, /X-All-In-One-SEO-Key|x-all-in-one-seo-key/);
  assert.match(source, /all_in_one_seo_receive_link_fix/);
  assert.match(source, /all_in_one_seo_fix_queue/);
  assert.match(source, /all_in_one_seo_apply_link_fix/);
  assert.match(source, /url_to_postid/);
  assert.match(source, /wp_update_post/);
  assert.match(source, /current_user_can\('manage_options'\)/);
  assert.match(source, /current_user_can\('edit_posts'\)/);
});
