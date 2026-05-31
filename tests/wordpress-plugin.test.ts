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
  assert.match(source, /current_user_can\('manage_options'\)/);
});
