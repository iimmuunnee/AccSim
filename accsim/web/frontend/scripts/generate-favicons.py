"""Generate favicon PNG/ICO files from the SVG design.

Design: Dark background (#0A0A0C) + blue-to-purple gradient PE grid + glow effect.
"""
import struct
import zlib
import math
import os

# Colors
DARK_BG = (10, 10, 12, 255)  # #0A0A0C
BLUE = (59, 130, 246)         # #3B82F6
PURPLE = (139, 92, 246)       # #8B5CF6

# Diagonal opacity map for 3x3 grid (row, col) -> opacity
# Minimum raised to 0.35 for visibility at small sizes
OPACITY_MAP = {
    (0, 0): 1.0,
    (0, 1): 0.75, (1, 0): 0.75,
    (0, 2): 0.55, (1, 1): 0.55, (2, 0): 0.55,
    (1, 2): 0.40, (2, 1): 0.40,
    (2, 2): 0.35,
}


def lerp_color(c1, c2, t):
    """Linearly interpolate between two RGB tuples."""
    return (
        int(c1[0] + (c2[0] - c1[0]) * t),
        int(c1[1] + (c2[1] - c1[1]) * t),
        int(c1[2] + (c2[2] - c1[2]) * t),
    )


def gradient_color(x, y, size):
    """Get gradient color at position (x, y) in a size x size grid.
    Gradient goes from top-left (blue) to bottom-right (purple)."""
    t = (x + y) / (2 * (size - 1)) if size > 1 else 0
    return lerp_color(BLUE, PURPLE, t)


def render_grid(size):
    """Render the 3x3 grid at given size with dark bg and gradient cells.
    Returns RGBA pixel data."""
    pixels = []

    # Calculate grid metrics
    gap = max(1, round(size * 0.08))
    cell_size = (size - gap * 2) // 3
    # Recalculate to center
    used = cell_size * 3 + gap * 2
    margin = (size - used) // 2

    corner_r = max(1, round(cell_size * 0.15))

    # Background corner radius (proportional to size, like rx=6 for 32px)
    bg_corner_r = max(2, round(size * 6 / 32))

    # Build cell rectangles
    cells = {}
    for row in range(3):
        for col in range(3):
            x0 = margin + col * (cell_size + gap)
            y0 = margin + row * (cell_size + gap)
            cells[(row, col)] = (x0, y0, x0 + cell_size, y0 + cell_size)

    # Pre-render glow layer (blurred version of the cells)
    # We'll use a simple box-approximation of gaussian blur
    glow_radius = max(1, round(size * 1.5 / 32))

    # First pass: render cells without glow
    cell_layer = []
    for y in range(size):
        row_pixels = []
        for x in range(size):
            pixel = None
            for (row, col), (x0, y0, x1, y1) in cells.items():
                if x0 <= x < x1 and y0 <= y < y1:
                    dx = min(x - x0, x1 - 1 - x)
                    dy = min(y - y0, y1 - 1 - y)
                    if dx < corner_r and dy < corner_r:
                        dist_sq = (corner_r - dx - 0.5) ** 2 + (corner_r - dy - 0.5) ** 2
                        if dist_sq > corner_r ** 2:
                            continue

                    opacity = OPACITY_MAP[(row, col)]
                    gc = gradient_color(x, y, size)
                    pixel = (gc[0], gc[1], gc[2], opacity)
                    break
            row_pixels.append(pixel)
        cell_layer.append(row_pixels)

    # Second pass: create glow by blurring the cell layer
    glow_layer = []
    for y in range(size):
        row_glow = []
        for x in range(size):
            r_sum, g_sum, b_sum, a_sum = 0.0, 0.0, 0.0, 0.0
            count = 0
            for dy in range(-glow_radius, glow_radius + 1):
                for dx in range(-glow_radius, glow_radius + 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < size and 0 <= ny < size:
                        cell = cell_layer[ny][nx]
                        if cell:
                            # Gaussian-ish weight
                            dist = math.sqrt(dx * dx + dy * dy)
                            weight = math.exp(-dist * dist / (2 * (glow_radius * 0.6) ** 2))
                            r_sum += cell[0] * cell[3] * weight
                            g_sum += cell[1] * cell[3] * weight
                            b_sum += cell[2] * cell[3] * weight
                            a_sum += cell[3] * weight
                            count += 1
            if a_sum > 0:
                row_glow.append((r_sum / max(count, 1), g_sum / max(count, 1),
                                 b_sum / max(count, 1), min(a_sum / max(count, 1), 1.0)))
            else:
                row_glow.append(None)
        glow_layer.append(row_glow)

    # Final pass: composite bg + glow + cells
    for y in range(size):
        row_pixels = []
        for x in range(size):
            # Check if inside rounded background
            in_bg = True
            dx_edge = min(x, size - 1 - x)
            dy_edge = min(y, size - 1 - y)
            if dx_edge < bg_corner_r and dy_edge < bg_corner_r:
                dist_sq = (bg_corner_r - dx_edge - 0.5) ** 2 + (bg_corner_r - dy_edge - 0.5) ** 2
                if dist_sq > bg_corner_r ** 2:
                    in_bg = False

            if not in_bg:
                row_pixels.append((0, 0, 0, 0))
                continue

            # Start with dark background
            pr, pg, pb, pa = DARK_BG

            # Add glow
            glow = glow_layer[y][x]
            if glow:
                ga = glow[3] * 0.5  # soften glow
                pr = int(pr * (1 - ga) + glow[0] * ga)
                pg = int(pg * (1 - ga) + glow[1] * ga)
                pb = int(pb * (1 - ga) + glow[2] * ga)

            # Add cell on top
            cell = cell_layer[y][x]
            if cell:
                ca = cell[3]
                pr = int(pr * (1 - ca) + cell[0] * ca)
                pg = int(pg * (1 - ca) + cell[1] * ca)
                pb = int(pb * (1 - ca) + cell[2] * ca)

            row_pixels.append((min(255, max(0, pr)),
                               min(255, max(0, pg)),
                               min(255, max(0, pb)), pa))
        pixels.append(row_pixels)

    return pixels


def create_png(pixels, size):
    """Create PNG file bytes from pixel data."""
    def write_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    # PNG signature
    out = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    out += write_chunk(b'IHDR', ihdr_data)

    # IDAT
    raw_data = b''
    for row in pixels:
        raw_data += b'\x00'  # filter: none
        for r, g, b, a in row:
            raw_data += struct.pack('BBBB', r, g, b, a)

    compressed = zlib.compress(raw_data, 9)
    out += write_chunk(b'IDAT', compressed)

    # IEND
    out += write_chunk(b'IEND', b'')

    return out


def create_ico(png16_data, png32_data):
    """Create ICO file with 16x16 and 32x32 PNG entries."""
    num_images = 2
    header = struct.pack('<HHH', 0, 1, num_images)

    offset = 6 + num_images * 16
    entry16 = struct.pack('<BBBBHHII', 16, 16, 0, 0, 1, 32, len(png16_data), offset)
    offset += len(png16_data)
    entry32 = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png32_data), offset)

    return header + entry16 + entry32 + png16_data + png32_data


def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(out_dir, exist_ok=True)

    # Generate PNGs at various sizes
    sizes = {
        'icon-192.png': 192,
        'icon-512.png': 512,
    }

    for filename, size in sizes.items():
        print(f"Generating {filename} ({size}x{size})...")
        pixels = render_grid(size)
        png_data = create_png(pixels, size)
        path = os.path.join(out_dir, filename)
        with open(path, 'wb') as f:
            f.write(png_data)

    # Apple touch icon (180x180)
    print("Generating apple-touch-icon.png (180x180)...")
    pixels = render_grid(180)
    png_data = create_png(pixels, 180)
    with open(os.path.join(out_dir, 'apple-touch-icon.png'), 'wb') as f:
        f.write(png_data)

    # ICO file (16 + 32)
    print("Generating favicon.ico (16x16 + 32x32)...")
    pixels16 = render_grid(16)
    png16 = create_png(pixels16, 16)
    pixels32 = render_grid(32)
    png32 = create_png(pixels32, 32)

    ico_data = create_ico(png16, png32)
    with open(os.path.join(out_dir, 'favicon.ico'), 'wb') as f:
        f.write(ico_data)

    print("Done! Generated files in public/")


if __name__ == '__main__':
    main()
