import math
import os
from PIL import Image, ImageDraw, ImageFont

def draw_star(draw, cx, cy, r_outer, r_inner, fill_color, outline_color=None):
    points = []
    for i in range(10):
        r = r_outer if i % 2 == 0 else r_inner
        angle = math.radians(-90 + i * 36)
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=fill_color, outline=outline_color)

def generate_icon(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Shield / Squircle with Radial Gradient
    cx, cy = size / 2, size / 2
    r_corner = size * 0.22

    # Draw gradient background squircle
    for r in range(int(size * 0.48), 0, -2):
        factor = r / (size * 0.48)
        # Gradient from deep military navy (#0d1b2a) to rich night navy (#1b2d42)
        red = int(13 + (27 - 13) * (1 - factor))
        green = int(27 + (45 - 27) * (1 - factor))
        blue = int(42 + (68 - 42) * (1 - factor))
        draw.rounded_rectangle(
            [cx - r, cy - r, cx + r, cy + r],
            radius=int(r * 0.45),
            fill=(red, green, blue, 255)
        )

    # 2. Outer Gold Accent Ring / Hexagonal Crest
    gold_outer = (235, 198, 100, 255)
    gold_inner = (190, 145, 55, 255)
    margin = size * 0.08
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=int(size * 0.18),
        outline=gold_outer,
        width=int(size * 0.016)
    )

    inner_margin = size * 0.105
    draw.rounded_rectangle(
        [inner_margin, inner_margin, size - inner_margin, size - inner_margin],
        radius=int(size * 0.15),
        outline=gold_inner,
        width=int(size * 0.008)
    )

    # 3. Shield Contour
    shield_pts = [
        (cx, size * 0.17),
        (size * 0.78, size * 0.23),
        (size * 0.74, size * 0.58),
        (cx, size * 0.78),
        (size * 0.26, size * 0.58),
        (size * 0.22, size * 0.23),
    ]
    draw.polygon(shield_pts, fill=(15, 29, 46, 230), outline=gold_outer)

    # 4. Three Golden Philippine Stars near upper rim
    star_y = size * 0.28
    draw_star(draw, cx - size * 0.14, star_y, size * 0.032, size * 0.015, fill_color=(245, 215, 120, 255))
    draw_star(draw, cx, star_y - size * 0.03, size * 0.042, size * 0.019, fill_color=(255, 230, 135, 255))
    draw_star(draw, cx + size * 0.14, star_y, size * 0.032, size * 0.015, fill_color=(245, 215, 120, 255))

    # 5. Central Grand Emblem: Military Star & Crossed Academic Quills/Swords
    # Center Star with 3D faceted half-points
    star_cx, star_cy = cx, cy * 0.94
    r_out, r_in = size * 0.16, size * 0.07

    # Draw star facets for sharp 3D military insignia look
    for i in range(5):
        angle_peak = math.radians(-90 + i * 72)
        angle_left = math.radians(-90 + i * 72 - 36)
        angle_right = math.radians(-90 + i * 72 + 36)

        p_peak = (star_cx + r_out * math.cos(angle_peak), star_cy + r_out * math.sin(angle_peak))
        p_center = (star_cx, star_cy)
        p_left = (star_cx + r_in * math.cos(angle_left), star_cy + r_in * math.sin(angle_left))
        p_right = (star_cx + r_in * math.cos(angle_right), star_cy + r_in * math.sin(angle_right))

        # Bright facet (left)
        draw.polygon([p_center, p_peak, p_left], fill=(255, 228, 130, 255))
        # Shaded facet (right)
        draw.polygon([p_center, p_peak, p_right], fill=(185, 140, 45, 255))

    # 6. Ribbon Banner with "EXAMPRAC"
    ribbon_w = size * 0.38
    ribbon_h = size * 0.09
    ribbon_x = cx - ribbon_w
    ribbon_y = size * 0.77

    # Draw Ribbon Background
    draw.rounded_rectangle(
        [cx - ribbon_w, ribbon_y, cx + ribbon_w, ribbon_y + ribbon_h],
        radius=int(ribbon_h * 0.35),
        fill=(20, 36, 56, 255),
        outline=gold_outer,
        width=int(size * 0.008)
    )

    # 7. Text "EXAMPRAC"
    try:
        font_size = int(size * 0.055)
        # Try finding a sans-serif bold font on Windows
        font_paths = [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibrib.ttf",
        ]
        font = None
        for fp in font_paths:
            if os.path.exists(fp):
                font = ImageFont.truetype(fp, font_size)
                break
        if not font:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    text = "EXAMPRAC"
    # Measure text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw / 2
    ty = ribbon_y + (ribbon_h - th) / 2 - bbox[1]
    draw.text((tx, ty), text, fill=(245, 218, 128, 255), font=font)

    # Subtitle "PAARCQE" at bottom
    sub_text = "PAARCQE 2026"
    try:
        sub_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(size * 0.032))
    except Exception:
        sub_font = ImageFont.load_default()
    s_bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
    s_tw = s_bbox[2] - s_bbox[0]
    draw.text((cx - s_tw / 2, size * 0.88), sub_text, fill=(160, 185, 215, 230), font=sub_font)

    return img

if __name__ == '__main__':
    base_dir = r"C:/Users/princ/Documents/EXAMPRAC"
    icon512 = generate_icon(512)
    icon192 = icon512.resize((192, 192), Image.Resampling.LANCZOS)

    # Save to assets/icons
    icon512_path = os.path.join(base_dir, "assets", "icons", "icon-512.png")
    icon192_path = os.path.join(base_dir, "assets", "icons", "icon-192.png")
    icon512.save(icon512_path, "PNG")
    icon192.save(icon192_path, "PNG")
    print(f"Saved: {icon512_path}")
    print(f"Saved: {icon192_path}")

    # Also generate Android mipmap launcher icons
    android_res = os.path.join(base_dir, "android", "app", "src", "main", "res")
    if os.path.exists(android_res):
        density_map = {
            "mipmap-mdpi": 48,
            "mipmap-hdpi": 72,
            "mipmap-xhdpi": 96,
            "mipmap-xxhdpi": 144,
            "mipmap-xxxhdpi": 192,
        }
        for folder, d_size in density_map.items():
            dest_dir = os.path.join(android_res, folder)
            os.makedirs(dest_dir, exist_ok=True)
            resized = icon512.resize((d_size, d_size), Image.Resampling.LANCZOS)
            resized.save(os.path.join(dest_dir, "ic_launcher.png"), "PNG")
            resized.save(os.path.join(dest_dir, "ic_launcher_round.png"), "PNG")
            print(f"Saved Android icon ({d_size}x{d_size}) -> {folder}")

    print("All icons successfully generated!")

