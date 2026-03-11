#!/usr/bin/env python3
"""Take screenshots of sample HTML visualizations using Chrome headless."""
import os
import subprocess
import time

DIR = os.path.dirname(os.path.abspath(__file__))
CHROME = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome'

pages = [
    ('sample-dependency-map.html', 'screenshot-dependency-map.png', 1000, 750),
    ('sample-complexity-dashboard.html', 'screenshot-complexity-dashboard.png', 1000, 600),
    ('sample-comparative-table.html', 'screenshot-comparative-table.png', 900, 700),
]

for html_file, out_file, w, h in pages:
    url = f'file://{os.path.join(DIR, html_file)}'
    out_path = os.path.join(DIR, out_file)
    cmd = [
        CHROME,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        f'--window-size={w},{h}',
        f'--screenshot={out_path}',
        '--hide-scrollbars',
        '--virtual-time-budget=3000',
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    if os.path.exists(out_path):
        print(f'Captured: {out_file} ({os.path.getsize(out_path)} bytes)')
    else:
        print(f'Failed: {out_file}')
        print(result.stderr[-500:] if result.stderr else 'no stderr')
