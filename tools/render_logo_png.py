"""
Helper script to render a high-resolution transparent PNG version of the
Regal Party Rentals logo so it can be regenerated if the design changes.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence, Tuple

from PIL import Image, ImageDraw, ImageFont

WIDTH = 1200
HEIGHT = 320


def find_font(candidates: Sequence[str]) -> str:
    """Return the first available font from the provided candidate filenames."""
    search_roots = [
        Path("C:/Windows/Fonts"),
        Path("/System/Library/Fonts"),
        Path("/Library/Fonts"),
        Path("/usr/share/fonts"),
        Path("/usr/local/share/fonts"),
    ]
    for root in search_roots:
        for name in candidates:
            if not name:
                continue
            candidate = root / name
            if candidate.exists():
                return str(candidate)
    raise FileNotFoundError(f"Could not locate any of the fonts: {candidates}")


def draw_text_with_tracking(
    draw: ImageDraw.ImageDraw,
    position: Tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: Tuple[int, int, int, int],
    tracking: int = 0,
) -> None:
    """Render text applying simple tracking (extra spacing between characters)."""
    x, y = position
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        left, top, right, bottom = font.getbbox(char)
        char_width = right - left
        x += char_width + tracking


def render_logo(path: Path) -> None:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    crest_points = [
        (20, 30),
        (280, 30),
        (320, 70),
        (320, 250),
        (280, 290),
        (20, 290),
        (-20, 250),
        (-20, 70),
    ]
    crest_fill = (233, 202, 137, 255)
    crest_outline = (180, 126, 47, 255)
    draw.polygon(crest_points, fill=crest_fill, outline=crest_outline)

    inner_points = [(x + 14, y + 12) for x, y in crest_points]
    draw.polygon(inner_points, outline=(255, 245, 210, 255), fill=None)

    crown = [
        (40, 150),
        (70, 90),
        (105, 140),
        (140, 85),
        (175, 140),
        (210, 90),
        (245, 150),
        (40, 150),
    ]
    draw.line(crown, fill=(255, 245, 210, 255), width=8, joint="curve")
    draw.line([(40, 160), (245, 160)], fill=crest_outline, width=8)

    for center in (70, 140, 210):
        draw.ellipse(
            (center - 8, 90 - 8, center + 8, 90 + 8),
            fill=(255, 245, 210, 255),
            outline=crest_outline,
        )

    script_font = ImageFont.truetype(
        find_font(["segoesc.ttf", "seguisbi.ttf", "brushscript.ttf"]), 180
    )
    draw.text((85, 95), "R", font=script_font, fill=(255, 244, 210, 255))

    draw.arc((40, 190, 280, 360), 210, 330, fill=(255, 244, 210, 255), width=6)
    draw.arc((10, 210, 260, 390), 200, 320, fill=crest_outline, width=4)

    regal_font = ImageFont.truetype(
        find_font(
            [
                "PLAYFAIRDISPLAY-REGULAR.TTF",
                "PlayfairDisplay-Regular.ttf",
                "timesbd.ttf",
                "times.ttf",
            ]
        ),
        96,
    )
    sub_font = ImageFont.truetype(
        find_font(
            [
                "Lora-Regular.ttf",
                "LibreBaskerville-Regular.ttf",
                "timesi.ttf",
                "times.ttf",
            ]
        ),
        46,
    )

    regal_color = (137, 42, 88, 255)
    sub_color = (168, 69, 112, 255)

    draw_text_with_tracking(draw, (360, 120), "REGAL", regal_font, regal_color, 8)
    draw_text_with_tracking(
        draw, (360, 205), "PARTY RENTALS", sub_font, sub_color, 6
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"Logo PNG exported to {path}")


if __name__ == "__main__":
    output_path = Path("images/logo-regal.png")
    render_logo(output_path)

