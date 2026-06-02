import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const packagePath = path.join(process.cwd(), "package.json");
const pluginPath = path.join(
  process.cwd(),
  "integrations",
  "wordpress",
  "all-in-one-seo",
  "all-in-one-seo.php",
);
const pluginZipPath = path.join(
  process.cwd(),
  "public",
  "downloads",
  "all-in-one-seo-wordpress.zip",
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
  assert.match(source, /wordpress\.receiver\.test/);
  assert.match(source, /All In One SEO receiver test accepted/);
  assert.match(source, /all_in_one_seo_fix_queue/);
  assert.match(source, /all_in_one_seo_apply_link_fix/);
  assert.match(source, /all_in_one_seo_insert_contextual_link/);
  assert.match(source, /all_in_one_seo_link_first_anchor_text/);
  assert.match(source, /Add internal link/);
  assert.match(source, /all_in_one_seo_report_link_fix_status/);
  assert.match(source, /url_to_postid/);
  assert.match(source, /wp_update_post/);
  assert.match(source, /wp_remote_post/);
  assert.match(source, /current_user_can\('manage_options'\)/);
  assert.match(source, /current_user_can\('edit_posts'\)/);
});

test("WordPress plugin package is downloadable from the portal", () => {
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
    scripts: Record<string, string>;
  };
  const zip = readFileSync(pluginZipPath);
  const zipText = zip.toString("latin1");

  assert.equal(
    packageJson.scripts["plugin:wordpress:package"],
    "tsx scripts/package-wordpress-plugin.ts",
  );
  assert.equal(zip.subarray(0, 2).toString("utf8"), "PK");
  assert.match(zipText, /all-in-one-seo\/all-in-one-seo\.php/);
  assert.match(zipText, /all-in-one-seo\/README\.md/);
});
