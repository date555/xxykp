$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
python tools/audit_content.py
if ($LASTEXITCODE -ne 0) { throw '武将、皮肤与首领适配筛选失败' }
python tools/prepare-content.py
if ($LASTEXITCODE -ne 0) { throw '内容清单生成失败' }
python tools/prepare-assets.py
if ($LASTEXITCODE -ne 0) { throw 'UI 资源整理失败' }
python tools/prepare-spine.py
if ($LASTEXITCODE -ne 0) { throw '武将骨骼资源整理失败' }
node tools/audit-effect-bounds.mjs
if ($LASTEXITCODE -ne 0) { throw '特效尺寸校验失败，请检查缺失尺寸或异常骨骼' }
python tools/prepare-stars.py
if ($LASTEXITCODE -ne 0) { throw '原版星级资源整理失败' }
python tools/prepare-landscape-ui.py
if ($LASTEXITCODE -ne 0) { throw '横屏游戏原版 UI 资源整理失败' }
python tools/prepare-damage-fonts.py
if ($LASTEXITCODE -ne 0) { throw '原版伤害数字资源整理失败' }
& '..\骨骼图片拼合工具\node_modules\@esbuild\win32-x64\esbuild.exe' tools/vendor-entry.js --bundle --format=esm --platform=browser --minify --outfile=vendor/spine.js --legal-comments=linked
if ($LASTEXITCODE -ne 0) { throw '本地动画库打包失败' }
Copy-Item -LiteralPath '..\骨骼图片拼合工具\node_modules\pixi.js\LICENSE' -Destination 'vendor\pixi-LICENSE.txt'
Copy-Item -LiteralPath '..\骨骼图片拼合工具\node_modules\pixi-spine\SPINE-LICENSE' -Destination 'vendor\SPINE-LICENSE.txt'
