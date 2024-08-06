We are converting SVG and PNG images to TTF-based font icons for several reasons:

Scalability: Font icons are vector-based, allowing them to be scaled to any size without losing quality. In contrast, PNG images become distorted when their render size is increased.
Theming: As this is a multi-theme app, the colors of TTF font icons can be easily set using styles, just like text colors.
Performance: Font icons are stored in a single file rather than being spread across multiple files. This improves performance since the file only needs to be loaded once.
Please note that only single-color icons can be converted to TTF font icons, as font icons do not support color information. Multi-colored images, such as country flags, cannot be used as font icons. For these cases, we use 3x PNG images exported from Figma.
