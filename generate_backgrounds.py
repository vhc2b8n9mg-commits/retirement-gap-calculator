from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

# 创建输出目录
output_dir = r"C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\public\backgrounds"
os.makedirs(output_dir, exist_ok=True)

def create_gradient_background(width, height, color1, color2, filename, style="vertical"):
    """创建渐变背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    for i in range(height):
        r = int(color1[0] + (color2[0] - color1[0]) * i / height)
        g = int(color1[1] + (color2[1] - color1[1]) * i / height)
        b = int(color1[2] + (color2[2] - color1[2]) * i / height)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

def create_nature_background(width, height, filename):
    """创建自然养老主题背景"""
    # 基础渐变
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 从深蓝到深紫色渐变
    for i in range(height):
        ratio = i / height
        r = int(15 + (26 - 15) * ratio)
        g = int(15 + (26 - 15) * ratio)
        b = int(40 + (62 - 40) * ratio)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    # 添加柔和的光斑效果
    for _ in range(5):
        import random
        x = random.randint(0, width)
        y = random.randint(0, height)
        r = random.randint(80, 150)
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        for i in range(r):
            alpha = int(30 * (1 - i / r))
            overlay_draw.ellipse([(x-r+i, y-r+i), (x+r-i, y+r-i)], fill=(100, 80, 150, alpha))
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

def create_sunset_background(width, height, filename):
    """创建夕阳主题背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 从深紫到暖橙渐变
    for i in range(height):
        ratio = i / height
        r = int(30 + int(180 * (1 - ratio)) + int(30 * ratio))
        g = int(20 + int(100 * (1 - ratio)) + int(20 * ratio))
        b = int(60 + int(40 * (1 - ratio)) + int(80 * ratio))
        draw.line([(0, i), (width, i)], fill=(min(255, r), min(255, g), min(255, b)))
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

def create_ocean_background(width, height, filename):
    """创建海洋主题背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 从深海蓝到浅蓝渐变
    for i in range(height):
        ratio = i / height
        r = int(10 + int(60 * (1 - ratio)))
        g = int(30 + int(120 * (1 - ratio)))
        b = int(80 + int(180 * ratio))
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

def create_forest_background(width, height, filename):
    """创建森林主题背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 从深绿到浅绿渐变
    for i in range(height):
        ratio = i / height
        r = int(10 + int(50 * ratio))
        g = int(40 + int(100 * (1 - ratio)))
        b = int(30 + int(50 * ratio))
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

def create_mountain_background(width, height, filename):
    """创建山脉主题背景"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # 从深蓝灰到浅蓝渐变
    for i in range(height):
        ratio = i / height
        r = int(20 + int(60 * ratio))
        g = int(30 + int(80 * ratio))
        b = int(50 + int(100 * ratio))
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    # 添加山脉剪影
    draw.polygon([(0, height), (200, height-150), (400, height-80), (600, height-180), (800, height-100), (width, height)], fill=(30, 40, 60))
    draw.polygon([(0, height), (150, height-100), (300, height-50), (500, height-120), (700, height-60), (width, height)], fill=(25, 35, 55))
    
    img.save(os.path.join(output_dir, filename))
    print(f"Created: {filename}")

# 生成所有背景图
width, height = 1920, 1080

# 1. 神秘紫色渐变
create_gradient_background(width, height, (15, 15, 40), (60, 30, 100), "bg-purple-mystery.png")

# 2. 自然主题
create_nature_background(width, height, "bg-nature-calm.png")

# 3. 夕阳主题
create_sunset_background(width, height, "bg-sunset-golden.png")

# 4. 海洋主题
create_ocean_background(width, height, "bg-ocean-serene.png")

# 5. 森林主题
create_forest_background(width, height, "bg-forest-peace.png")

# 6. 山脉主题
create_mountain_background(width, height, "bg-mountain-tranquil.png")

print("\nAll backgrounds created successfully!")
print(f"Location: {output_dir}")
