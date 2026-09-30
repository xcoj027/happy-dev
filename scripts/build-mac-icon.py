from PIL import Image, ImageDraw, ImageFilter
import os
import subprocess
import shutil

src_path = '/Users/tnqui/.gemini/antigravity/brain/3cb4e54d-fb72-45b9-aeff-a06beeae6537/happydev_new_logo_1790432232031.jpg'
src = Image.open(src_path).convert('RGBA')

# Clean interior squircle box: exactly 840x840
squircle_box = (92, 88, 932, 928)
cropped = src.crop(squircle_box)

target_size = 824
corner_radius = 185

# Resize cropped squircle to target size
cropped_resized = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)

# Create 4x supersampled mask for smooth anti-aliased squircle edges
scale = 4
mask_size = (target_size * scale, target_size * scale)
mask_large = Image.new('L', mask_size, 0)
draw = ImageDraw.Draw(mask_large)
draw.rounded_rectangle(
    [(0, 0), (target_size * scale, target_size * scale)],
    radius=corner_radius * scale,
    fill=255
)
mask = mask_large.resize((target_size, target_size), Image.Resampling.LANCZOS)
cropped_resized.putalpha(mask)

# Create transparent 1024x1024 base canvas
canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))

# macOS subtle drop shadow under the squircle
shadow_mask = Image.new('L', (1024, 1024), 0)
shadow_draw = ImageDraw.Draw(shadow_mask)
shadow_draw.rounded_rectangle(
    [(100, 106), (924, 930)],
    radius=corner_radius,
    fill=140
)
shadow_blur = shadow_mask.filter(ImageFilter.GaussianBlur(radius=18))
shadow_layer = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
shadow_layer.paste((0, 0, 0, 95), (0, 0), shadow_blur)

# Composite shadow and squircle
canvas.alpha_composite(shadow_layer)
canvas.paste(cropped_resized, (100, 100), cropped_resized)

# Save high-res master 1024x1024 PNG with transparent background
canvas.save('public/icon.png', 'PNG')
canvas.save('electron/assets/icon.png', 'PNG')
if os.path.exists('dist'):
    canvas.save('dist/icon.png', 'PNG')

print("1024x1024 transparent icon saved!")
