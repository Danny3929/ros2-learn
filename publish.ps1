# Publish the ros2-learn website: .\publish.ps1 ["commit message"]
# Bumps the service-worker cache, checks syntax, commits, pushes, then waits
# until the live site serves the new version.
param([string]$Message = "Update site")
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$url = "https://danny3929.github.io/ros2-learn"

foreach ($f in "app.js", "sw.js") { node --check $f; if ($LASTEXITCODE) { throw "Syntax error in $f" } }

# Pre-publish check (shared-web\precheck.js): every lesson renders and fits a phone, nothing throws, files are cached.
$pre = "C:\Users\hp\shared-web\precheck.js"; $el = "C:\Users\hp\ros2-learn\node_modules\.bin\electron.cmd"
if ((Test-Path $pre) -and (Test-Path $el)) {
  & $el $pre $PSScriptRoot
  if ($LASTEXITCODE) { throw "The pre-publish check failed. Fix the problems listed above, then run publish again." }
} else { "Skipping the pre-publish check (shared-web tools not found)." }

git add -A
$ahead = [int](git rev-list --count origin/main..HEAD 2>$null)
if (-not (git status --porcelain) -and $ahead -eq 0) { "Nothing to publish."; return }

# Bump the cache name so installed copies fetch the new files.
$sw = Get-Content sw.js -Raw
if ($sw -match 'ros2-learn-v(\d+)') {
  $next = [int]$Matches[1] + 1
  $sw = $sw -replace 'ros2-learn-v\d+', "ros2-learn-v$next"
  Set-Content sw.js $sw -NoNewline
  git add sw.js
} else { throw "Couldn't find the cache name in sw.js" }

git commit -q -m $Message
git push origin main
if ($LASTEXITCODE) { throw "Push failed (are you signed in? run: git push)" }

"Pushed. Waiting for the site to update (usually 1-2 minutes)..."
for ($i = 0; $i -lt 24; $i++) {
  Start-Sleep 10
  try {
    $live = (Invoke-WebRequest "$url/sw.js?t=$(Get-Random)" -UseBasicParsing).Content
    if ($live -match "ros2-learn-v$next") {
      "Live: $url (cache v$next). Verifying every file against local..."
      & "$PSScriptRoot\check.ps1"
      return
    }
  } catch {}
}
"Pushed, but the site hasn't updated yet. Check again shortly."
