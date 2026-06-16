import qrcode
import qrcode.image.svg
from pathlib import Path

BASE_URL = "https://workshop2026-roan.vercel.app/booth"

png_dir = Path("qrcodes/png")
svg_dir = Path("qrcodes/svg")
png_dir.mkdir(parents=True, exist_ok=True)
svg_dir.mkdir(parents=True, exist_ok=True)

for i in range(1, 21):
    url = f"{BASE_URL}/{i}"

    # 고해상도 PNG (오류정정 H, 큰 모듈/여백)
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=60,   # 모듈당 픽셀 크기 (인쇄용 대형)
        border=4,      # 여백(quiet zone)
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(png_dir / f"booth_{i}.png")

    # 벡터 SVG (배너 대형 인쇄용, 무한 확대 가능)
    svg_img = qrcode.make(
        url,
        image_factory=qrcode.image.svg.SvgPathImage,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
    )
    svg_img.save(svg_dir / f"booth_{i}.svg")

    print(f"생성됨: booth_{i}  ({img.size[0]}x{img.size[1]}px PNG + SVG) -> {url}")
