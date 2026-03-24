"""
批次圖片優化腳本 — optimize_images.py
======================================

【用途】
把手機拍的大圖（JPG/PNG/HEIC）批次轉換成適合網頁的格式。
支援輸出 WebP（預設，最小體積）或 PNG（需要透明背景時使用）。

【環境需求】
    pip install Pillow

【使用方式】
方式 A：輸出 WebP（預設，最常用）
    python tools/optimize_images.py


方式 C：輸出 PNG（保留透明度）
    python tools/optimize_images.py --format png

方式 D：指定資料夾並輸出 PNG
    python tools/optimize_images.py images/econ-night/2024 --format png

【執行後】
- 轉換完成的檔案會存在原始圖片旁邊
- 原始圖片不會被刪除，確認沒問題後可手動刪除
- 終端機會顯示每張圖的原始大小 → 壓縮後大小與壓縮率

【參數調整（在下方 CONFIG 區修改）】
- MAX_WIDTH：圖片最大寬度（px），超過會自動縮小，建議 1920
- QUALITY：壓縮品質，0–100（WebP/JPEG 有效，PNG 忽略此值）
- SUPPORTED_EXTS：要處理的原始格式
"""

import sys
import os
from pathlib import Path

# ── 參數設定 ──────────────────────────────────────────────────
MAX_WIDTH       = 1920          # 最大寬度（px），超過自動縮小
QUALITY         = 85            # 品質（0–100，WebP/JPEG 用，PNG 忽略）
SUPPORTED_EXTS  = {'.jpg', '.jpeg', '.png', '.heic', '.heif'}
# ─────────────────────────────────────────────────────────────

try:
    from PIL import Image
    # HEIC 需要額外套件，有裝才啟用
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass
except ImportError:
    print("❌  找不到 Pillow，請先安裝：pip install Pillow")
    sys.exit(1)


def human_size(size_bytes: int) -> str:
    """將 bytes 轉成可讀字串"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / 1024 ** 2:.1f} MB"


def convert_image(src: Path, out_format: str = 'webp') -> None:
    """
    將單張圖片轉換為指定格式。
    out_format: 'webp'（預設）或 'png'
    """
    ext = '.webp' if out_format == 'webp' else '.png'
    dst = src.with_suffix(ext)

    # 若輸入與輸出副檔名相同（如 PNG→PNG），改存為 _opt.png 避免覆蓋原檔
    if dst == src:
        dst = src.with_name(src.stem + '_opt' + ext)
        print(f"  ℹ️   同副檔名轉換，輸出改為：{dst.name}")

    # 若目標已存在且比原檔新，跳過
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        print(f"  ⏭  略過（已是最新）：{src.name}")
        return

    with Image.open(src) as img:
        # 修正 EXIF 旋轉（手機照片常見問題）
        try:
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # 保留透明度（PNG 模式）；WebP 也支援 RGBA
        if out_format == 'png':
            if img.mode not in ('RGBA', 'LA', 'PA'):
                img = img.convert('RGBA')
        else:
            # WebP：RGBA 保留，其他轉 RGB
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

        # 縮小超寬圖片
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_h = int(img.height * ratio)
            img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

        # 確保目標資料夾有寫入權限（有些資料夾可能是唯讀）
        try:
            import os
            os.chmod(dst.parent, 0o755)
        except Exception:
            pass

        if out_format == 'webp':
            img.save(dst, 'WEBP', quality=QUALITY, method=6)
        else:
            # PNG：使用 optimize=True 讓 Pillow 自動選最佳壓縮
            img.save(dst, 'PNG', optimize=True)

    orig_size = src.stat().st_size
    new_size  = dst.stat().st_size
    saving    = (1 - new_size / orig_size) * 100
    saving_str = f"節省 {saving:.0f}%" if saving > 0 else f"增加 {-saving:.0f}%"
    print(f"  ✅  {src.name} → {dst.name}  "
          f"({human_size(orig_size)} → {human_size(new_size)}, {saving_str})")


def process_folder(folder: Path, out_format: str = 'webp') -> None:
    """遞迴處理資料夾內所有支援格式的圖片"""
    # 排除已是 _opt 標記的輸出檔（避免重複處理）
    images = [
        p for p in sorted(folder.rglob('*'))
        if p.is_file()
        and p.suffix.lower() in SUPPORTED_EXTS
        and not p.stem.endswith('_opt')
    ]

    if not images:
        print(f"📂  {folder}：沒有找到需要轉換的圖片")
        return

    fmt_label = out_format.upper()
    print(f"\n📂  處理資料夾：{folder}（共 {len(images)} 張，輸出 → {fmt_label}）")
    for img_path in images:
        try:
            convert_image(img_path, out_format)
        except Exception as e:
            print(f"  ❌  {img_path.name} 轉換失敗：{e}")


if __name__ == '__main__':
    # ── 解析 --format 參數 ──
    args = sys.argv[1:]
    out_format = 'webp'
    if '--format' in args:
        idx = args.index('--format')
        if idx + 1 < len(args):
            fmt = args[idx + 1].lower()
            if fmt not in ('webp', 'png'):
                print("❌  --format 只接受 webp 或 png")
                sys.exit(1)
            out_format = fmt
            args = args[:idx] + args[idx + 2:]
        else:
            print("❌  --format 後面需要指定格式（webp 或 png）")
            sys.exit(1)

    # ── 解析資料夾路徑 ──
    script_dir  = Path(__file__).parent
    project_dir = script_dir.parent

    if args:
        target = Path(args[0])
        if not target.is_absolute():
            target = project_dir / target
    else:
        target = project_dir / 'images'

    if not target.exists():
        print(f"❌  找不到資料夾：{target}")
        sys.exit(1)

    fmt_label = out_format.upper()
    print("=" * 55)
    print(f"  圖片優化腳本（→ {fmt_label}）")
    print(f"  目標：{target}")
    print(f"  最大寬度：{MAX_WIDTH}px，品質：{QUALITY}（PNG 忽略）")
    print("=" * 55)

    process_folder(target, out_format)

    print(f"\n✨  完成！請確認 .{out_format} 檔案後，再手動刪除原始圖片。")
    print("    完成後記得更新 assets/js/gallery-data.js 填入路徑。")

