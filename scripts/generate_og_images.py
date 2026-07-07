#!/usr/bin/env python3
"""Generate Open Graph card images (public/og-default.png, public/og-simulator.png).

Uses the site's brand fonts fetched from Google Fonts: Source Serif 4 for
display, JetBrains Mono for labels, Inter for body. Run: python3 scripts/generate_og_images.py
"""
import os
import re
import urllib.request

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = '/tmp/ogfonts'

# Brand tokens from tailwind.config.ts
BACKGROUND = '#FAFAF7'
CANVAS = '#F4F1EA'
INK = '#1F2421'
TEXT_SECONDARY = '#5D625A'
TEXT_MUTED = '#8D887A'
ACCENT = '#23684A'
EMBER = '#B45F2A'
DATA = '#315B7A'
RULE = '#C8BEAA'

W, H = 1200, 630


def fetch_font(family, weight, out):
    if os.path.exists(out):
        return
    css_url = 'https://fonts.googleapis.com/css2?family=%s:wght@%s' % (family, weight)
    req = urllib.request.Request(css_url, headers={'User-Agent': 'python-urllib'})
    css = urllib.request.urlopen(req, timeout=20).read().decode()
    match = re.search(r'url\((https://[^)]+\.ttf)\)', css)
    if not match:
        raise RuntimeError('no ttf url in css for ' + family)
    urllib.request.urlretrieve(match.group(1), out)


def load_fonts():
    from PIL import ImageFont
    os.makedirs(FONT_DIR, exist_ok=True)
    specs = {
        'display': ('Source+Serif+4', '800', 'SourceSerif4-ExtraBold.ttf'),
        'serif': ('Source+Serif+4', '600', 'SourceSerif4-SemiBold.ttf'),
        'mono': ('JetBrains+Mono', '700', 'JetBrainsMono-Bold.ttf'),
        'body': ('Inter', '500', 'Inter-Medium.ttf'),
    }
    paths = {}
    for key, (family, weight, filename) in specs.items():
        path = os.path.join(FONT_DIR, filename)
        fetch_font(family, weight, path)
        paths[key] = path
    return {
        'display': lambda size: ImageFont.truetype(paths['display'], size),
        'serif': lambda size: ImageFont.truetype(paths['serif'], size),
        'mono': lambda size: ImageFont.truetype(paths['mono'], size),
        'body': lambda size: ImageFont.truetype(paths['body'], size),
    }


def base_card(fonts, kicker):
    img = Image.new('RGB', (W, H), BACKGROUND)
    draw = ImageDraw.Draw(img)
    # Top accent bar, three brand segments like the site's header rule
    draw.rectangle([0, 0, W // 3, 10], fill=ACCENT)
    draw.rectangle([W // 3, 0, 2 * W // 3, 10], fill=EMBER)
    draw.rectangle([2 * W // 3, 0, W, 10], fill=DATA)
    # Footer rule and site URL
    draw.line([80, H - 92, W - 80, H - 92], fill=RULE, width=2)
    draw.text((80, H - 70), 'LOCAL-LEDGER.NET', font=fonts['mono'](26), fill=TEXT_MUTED)
    right_label = 'FREE / CITED / NO LOGIN'
    bbox = draw.textbbox((0, 0), right_label, font=fonts['mono'](26))
    draw.text((W - 80 - (bbox[2] - bbox[0]), H - 70), right_label, font=fonts['mono'](26), fill=TEXT_MUTED)
    # Kicker label
    draw.text((80, 78), kicker, font=fonts['mono'](30), fill=ACCENT)
    return img, draw


def make_default(fonts):
    img, draw = base_card(fonts, 'OFFICIAL PUBLIC DATA / EVERY U.S. STATE AND COUNTY')
    draw.text((76, 150), 'LocalLedger', font=fonts['display'](120), fill=INK)
    draw.text((80, 310), 'Jobs, income, housing, colleges, and federal', font=fonts['serif'](46), fill=TEXT_SECONDARY)
    draw.text((80, 372), 'spending. Every figure cites its source.', font=fonts['serif'](46), fill=TEXT_SECONDARY)
    draw.text((80, 462), 'STATES / COUNTIES / METROS / RANKINGS / SIMULATOR', font=fonts['mono'](28), fill=ACCENT)
    img.save(os.path.join(ROOT, 'public', 'og-default.png'))


def make_simulator(fonts):
    img, draw = base_card(fonts, 'LOCALLEDGER ECONOMY SIMULATOR')
    draw.text((76, 146), 'An economy you are', font=fonts['display'](88), fill=INK)
    draw.text((76, 256), 'allowed to break.', font=fonts['display'](88), fill=EMBER)
    draw.text((80, 404), '41 policy dials. 12 historical scenarios.', font=fonts['serif'](44), fill=TEXT_SECONDARY)
    draw.text((80, 462), 'Ten million simulated people. Being wrong is free.', font=fonts['serif'](44), fill=TEXT_SECONDARY)
    img.save(os.path.join(ROOT, 'public', 'og-simulator.png'))


if __name__ == '__main__':
    fonts = load_fonts()
    make_default(fonts)
    make_simulator(fonts)
    print('wrote public/og-default.png and public/og-simulator.png')
