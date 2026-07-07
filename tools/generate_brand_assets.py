#!/usr/bin/env python3
"""Generate LocalLedger raster brand assets (favicons, app icons, OG images).

Mirrors the geometry of public/logo-mark.svg: a cream ledger tile with corner
brackets, ledger ruling, and the orange crash-and-recovery spark line.

Run: python3 tools/generate_brand_assets.py
Requires Pillow and the TTFs downloaded to /tmp/fonts (Fraunces, JetBrains Mono).
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
BRANDING = os.path.join(ROOT, 'branding')

CREAM = (247, 241, 227, 255)
INK = (24, 20, 16, 255)
ORANGE = (232, 84, 10, 255)
RULING = (24, 20, 16, 36)

FRAUNCES = '/tmp/fonts/fraunces.ttf'
JETBRAINS = '/tmp/fonts/jetbrains.ttf'


def load_font(path, size, wght=None):
    font = ImageFont.truetype(path, size)
    if wght is not None:
        try:
            axes = font.get_variation_axes()
            values = []
            for axis in axes:
                tag = axis['name'] if isinstance(axis, dict) else axis.name
                default = axis['default'] if isinstance(axis, dict) else axis.default
                key = tag.decode() if isinstance(tag, bytes) else str(tag)
                if 'wght' in key.lower() or 'weight' in key.lower():
                    values.append(wght)
                else:
                    values.append(default)
            font.set_variation_by_axes(values)
        except Exception:
            pass
    return font


def draw_mark(draw, x, y, size, scale_stroke=1.0, with_ruling=True, tile=True):
    """Draw the mark into an ImageDraw at (x, y) with given size (square)."""
    u = size / 64.0  # unit from the 64x64 SVG grid
    w = max(1, round(4 * u * scale_stroke))

    if tile:
        draw.rounded_rectangle(
            [x, y, x + size, y + size], radius=12 * u, fill=CREAM,
        )

    if with_ruling:
        for yy in (24, 34, 44):
            draw.line(
                [(x + 12 * u, y + yy * u), (x + 52 * u, y + yy * u)],
                fill=RULING, width=max(1, round(1.5 * u)),
            )

    # Corner brackets
    b = [
        [(x + 8 * u, y + 18 * u), (x + 8 * u, y + 8 * u), (x + 18 * u, y + 8 * u)],
        [(x + 46 * u, y + 8 * u), (x + 56 * u, y + 8 * u), (x + 56 * u, y + 18 * u)],
        [(x + 56 * u, y + 46 * u), (x + 56 * u, y + 56 * u), (x + 46 * u, y + 56 * u)],
        [(x + 18 * u, y + 56 * u), (x + 8 * u, y + 56 * u), (x + 8 * u, y + 46 * u)],
    ]
    for pts in b:
        draw.line(pts, fill=INK, width=w, joint='curve')

    # Spark line: rise, crash, recover
    spark = [
        (x + 13 * u, y + 39 * u),
        (x + 22 * u, y + 29 * u),
        (x + 31 * u, y + 45 * u),
        (x + 51 * u, y + 17 * u),
    ]
    draw.line(spark, fill=ORANGE, width=max(2, round(5.5 * u * scale_stroke)), joint='curve')
    # Terminal tick
    t = 5 * u
    draw.rectangle([x + 48.5 * u, y + 14.5 * u, x + 48.5 * u + t, y + 14.5 * u + t], fill=INK)


def render_mark(size, supersample=4, with_ruling=True, pad=0, bg=None):
    big = size * supersample
    img = Image.new('RGBA', (big, big), bg if bg else (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    inner = big - 2 * pad * supersample
    draw_mark(draw, pad * supersample, pad * supersample, inner, with_ruling=with_ruling)
    return img.resize((size, size), Image.LANCZOS)


def save(img, *path):
    target = os.path.join(*path)
    img.save(target)
    print('wrote', target, img.size)


def make_icons():
    save(render_mark(16, supersample=8, with_ruling=False), PUBLIC, 'favicon-16x16.png')
    save(render_mark(32, supersample=8, with_ruling=False), PUBLIC, 'favicon-32x32.png')
    save(render_mark(180, supersample=4), PUBLIC, 'apple-touch-icon.png')
    save(render_mark(192, supersample=4), PUBLIC, 'android-chrome-192x192.png')
    save(render_mark(512, supersample=2), PUBLIC, 'android-chrome-512x512.png')

    # Maskable: full-bleed cream, mark inside the central circular safe zone.
    maskable = Image.new('RGBA', (512 * 2, 512 * 2), CREAM)
    draw = ImageDraw.Draw(maskable)
    pad = int(512 * 2 * 0.21)
    draw_mark(draw, pad, pad, 512 * 2 - 2 * pad, tile=False)
    save(maskable.resize((512, 512), Image.LANCZOS), PUBLIC, 'maskable-icon.png')

    ico = render_mark(48, supersample=8, with_ruling=False)
    ico.save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    print('wrote', os.path.join(PUBLIC, 'favicon.ico'))


def ledger_canvas(width, height):
    img = Image.new('RGBA', (width, height), CREAM)
    draw = ImageDraw.Draw(img)
    for yy in range(72, height, 56):
        draw.line([(0, yy), (width, yy)], fill=(24, 20, 16, 18), width=2)
    return img, draw


def make_og(width, height, out_name, out_dir):
    img, draw = ledger_canvas(width, height)

    display_black = load_font(FRAUNCES, int(height * 0.115), wght=900)
    display_med = load_font(FRAUNCES, int(height * 0.072), wght=600)
    mono = load_font(JETBRAINS, int(height * 0.030))

    margin = int(width * 0.055)
    mark_size = int(height * 0.19)
    draw_mark(draw, margin, margin, mark_size)
    brand_font = load_font(FRAUNCES, int(mark_size * 0.62), wght=900)
    draw.text(
        (margin + mark_size + int(mark_size * 0.28), margin + int(mark_size * 0.12)),
        'LocalLedger', font=brand_font, fill=INK,
    )

    y = margin + mark_size + int(height * 0.085)
    draw.text((margin, y), 'Real economic data', font=display_black, fill=INK)
    y += int(height * 0.135)
    draw.text((margin, y), 'for every U.S. county.', font=display_black, fill=INK)
    y += int(height * 0.16)
    draw.text(
        (margin, y),
        'And an economy you are allowed to destroy.',
        font=display_med, fill=ORANGE,
    )

    footer = 'LOCAL-LEDGER.NET  /  DATA + SIMULATION  /  0 FABRICATED DATA POINTS'
    draw.text((margin, height - margin - int(height * 0.035)), footer, font=mono, fill=(92, 83, 64, 255))

    # Spark echo, kept clear of the headline in the top-right corner.
    spark = [
        (width - int(width * 0.27), int(height * 0.20)),
        (width - int(width * 0.21), int(height * 0.10)),
        (width - int(width * 0.155), int(height * 0.24)),
        (width - int(width * 0.055), int(height * 0.055)),
    ]
    draw.line(spark, fill=ORANGE, width=int(height * 0.024), joint='curve')
    t = int(height * 0.03)
    tx, ty = spark[-1]
    draw.rectangle([tx - t / 2, ty - t / 2, tx + t / 2, ty + t / 2], fill=INK)

    save(img.convert('RGB'), out_dir, out_name)


def make_branding_pngs():
    save(render_mark(512, supersample=2), BRANDING, 'localledger-logo.png')
    save(render_mark(1024, supersample=2), BRANDING, 'localledger-logo-1024.png')


if __name__ == '__main__':
    make_icons()
    make_og(1200, 630, 'og-default.png', PUBLIC)
    make_og(1280, 640, 'localledger-social.png', BRANDING)
    make_branding_pngs()
    print('done')
