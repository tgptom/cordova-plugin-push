/**
 * Ensures every CocoaPods target uses at least the app's effective iOS deployment target.
 *
 * Some transitive dependencies of FirebaseMessaging (e.g. PromisesObjC, GoogleUtilities,
 * nanopb and their *_Privacy resource bundles) declare deployment targets as low as 9.0/12.0,
 * which newer Xcode versions reject. cordova-ios regenerates platforms/ios/Podfile on
 * platform add, plugin add/remove and prepare, so this hook re-applies the fix after every prepare:
 *
 * 1. Injects (or refreshes) a marked block in the Podfile `post_install` hook so any later
 *    `pod install` keeps the pod targets raised.
 * 2. Raises the IPHONEOS_DEPLOYMENT_TARGET values in the already generated Pods project(s),
 *    so the fix applies without having to re-run `pod install`.
 */
const fs = require('fs');
const path = require('path');

const MIN_DEPLOYMENT_TARGET = '15.0';
const BLOCK_BEGIN = '# cordova-plugin-push: pods deployment target (begin)';
const BLOCK_END = '# cordova-plugin-push: pods deployment target (end)';
const POST_INSTALL_RE = /^([ \t]*)post_install\s+do\s*\|\s*(\w+)\s*\|[^\n]*$/m;

function compareVersions (a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function resolveDeploymentTarget (configured) {
  const value = typeof configured === 'string' ? configured.trim() : '';
  if (!/^\d+(\.\d+)*$/.test(value)) return MIN_DEPLOYMENT_TARGET;
  return compareVersions(value, MIN_DEPLOYMENT_TARGET) < 0 ? MIN_DEPLOYMENT_TARGET : value;
}

function buildPostInstallBlock (target, installerVar, indent) {
  return [
    BLOCK_BEGIN,
    `projects = [${installerVar}.pods_project] + (${installerVar}.respond_to?(:generated_projects) ? Array(${installerVar}.generated_projects) : [])`,
    'projects.compact.uniq.each do |project|',
    '  project.targets.each do |target|',
    '    target.build_configurations.each do |config|',
    '      current = config.build_settings[\'IPHONEOS_DEPLOYMENT_TARGET\']',
    `      if current.nil? || Gem::Version.new(current.to_s) < Gem::Version.new('${target}')`,
    `        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${target}'`,
    '      end',
    '    end',
    '  end',
    'end',
    BLOCK_END
  ].map(line => indent + line).join('\n');
}

function escapeRegExp (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the Podfile contents with the deployment target block present exactly once.
 */
function updatePodfileContents (contents, target) {
  const existingRe = new RegExp(`^([ \\t]*)${escapeRegExp(BLOCK_BEGIN)}[\\s\\S]*?${escapeRegExp(BLOCK_END)}[^\\n]*$`, 'm');
  const existing = contents.match(existingRe);

  if (existing) {
    const before = contents.slice(0, existing.index).match(new RegExp(POST_INSTALL_RE.source, 'gm'));
    const enclosing = before ? before[before.length - 1].match(POST_INSTALL_RE) : null;
    const installerVar = enclosing ? enclosing[2] : 'installer';
    return contents.replace(existingRe, () => buildPostInstallBlock(target, installerVar, existing[1]));
  }

  const postInstall = contents.match(POST_INSTALL_RE);
  if (postInstall) {
    const insertAt = postInstall.index + postInstall[0].length;
    const block = buildPostInstallBlock(target, postInstall[2], `${postInstall[1]}  `);
    return `${contents.slice(0, insertAt)}\n${block}${contents.slice(insertAt)}`;
  }

  const separator = contents.length === 0 || contents.endsWith('\n') ? '' : '\n';
  return `${contents}${separator}\npost_install do |installer|\n${buildPostInstallBlock(target, 'installer', '  ')}\nend\n`;
}

/**
 * Raises any IPHONEOS_DEPLOYMENT_TARGET lower than `target` in pbxproj contents.
 */
function updatePbxprojContents (contents, target) {
  return contents.replace(/(IPHONEOS_DEPLOYMENT_TARGET\s*=\s*)("?)([\d.]+)\2;/g, (match, prefix, quote, version) => {
    return compareVersions(version, target) < 0 ? `${prefix}${quote}${target}${quote};` : match;
  });
}

function getConfiguredDeploymentTarget (context, podfileContents) {
  try {
    const { ConfigParser } = context.requireCordovaModule('cordova-common');
    const config = new ConfigParser(path.join(context.opts.projectRoot, 'config.xml'));
    const value = config.getPreference('deployment-target', 'ios');
    if (value) return value;
  } catch (e) {
    // Fall back to the deployment target cordova-ios wrote into the Podfile.
  }

  const platformLine = podfileContents.match(/^\s*platform\s+:ios\s*,\s*['"]([^'"]+)['"]/m);
  return platformLine ? platformLine[1] : undefined;
}

function writeIfChanged (file, original, updated) {
  if (original === updated) return false;
  fs.writeFileSync(file, updated, 'utf8');
  return true;
}

module.exports = function (context) {
  const iosRoot = path.join(context.opts.projectRoot, 'platforms', 'ios');
  const podfile = path.join(iosRoot, 'Podfile');
  if (!fs.existsSync(podfile)) return;

  const podfileContents = fs.readFileSync(podfile, 'utf8');
  const target = resolveDeploymentTarget(getConfiguredDeploymentTarget(context, podfileContents));

  if (writeIfChanged(podfile, podfileContents, updatePodfileContents(podfileContents, target))) {
    console.log(`cordova-plugin-push: Podfile post_install now enforces IPHONEOS_DEPLOYMENT_TARGET >= ${target} for all pods.`);
  }

  const podsDir = path.join(iosRoot, 'Pods');
  if (!fs.existsSync(podsDir)) return;

  fs.readdirSync(podsDir)
    .filter(entry => entry.endsWith('.xcodeproj'))
    .map(entry => path.join(podsDir, entry, 'project.pbxproj'))
    .filter(file => fs.existsSync(file))
    .forEach(file => {
      const contents = fs.readFileSync(file, 'utf8');
      if (writeIfChanged(file, contents, updatePbxprojContents(contents, target))) {
        console.log(`cordova-plugin-push: Raised pod IPHONEOS_DEPLOYMENT_TARGET values to ${target} in ${path.relative(iosRoot, file)}.`);
      }
    });
};

module.exports.MIN_DEPLOYMENT_TARGET = MIN_DEPLOYMENT_TARGET;
module.exports.compareVersions = compareVersions;
module.exports.resolveDeploymentTarget = resolveDeploymentTarget;
module.exports.updatePodfileContents = updatePodfileContents;
module.exports.updatePbxprojContents = updatePbxprojContents;
