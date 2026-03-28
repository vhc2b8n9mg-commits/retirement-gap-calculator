with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到 CityStep 的 return 语句并修改
new_lines = []
i = 0
in_city_step = False
added_wrapper = False

while i < len(lines):
    line = lines[i]
    
    # 检测 CityStep 函数开始
    if 'function CityStep' in line:
        in_city_step = True
        
    # 在 CityStep 的 return ( 后添加背景 div
    if in_city_step and 'return (' in line and not added_wrapper:
        new_lines.append(line)
        # 添加背景 div 开始
        new_lines.append('    <div className="relative rounded-2xl overflow-hidden">\n')
        new_lines.append('      {/* 背景图片 */}\n')
        new_lines.append('      <div \n')
        new_lines.append('        className="absolute inset-0 bg-cover bg-center"\n')
        new_lines.append('        style={{ backgroundImage: "url(\'/backgrounds/step5-city-photo2.jpg\')" }}\n')
        new_lines.append('      >\n')
        new_lines.append('        {/* 半透明遮罩 */}\n')
        new_lines.append('        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/80 backdrop-blur-sm"></div>\n')
        new_lines.append('      </div>\n')
        new_lines.append('      \n')
        new_lines.append('      {/* 内容层 */}\n')
        new_lines.append('      <div className="relative z-10">\n')
        added_wrapper = True
        i += 1
        continue
    
    # 在 CityStep 的 </ScenarioCard> 后添加闭合 div
    if in_city_step and '</ScenarioCard>' in line and i + 1 < len(lines) and ');' in lines[i+1]:
        new_lines.append(line)
        new_lines.append('      </div>\n')
        new_lines.append('    </div>\n')
        i += 2  # 跳过下一行的 );
        in_city_step = False
        added_wrapper = False
        continue
    
    new_lines.append(line)
    i += 1

with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Background added to CityStep successfully!")
