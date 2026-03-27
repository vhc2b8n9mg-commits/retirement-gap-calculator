import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 更新颜色映射 - 使用深色主题风格
old_colormap = '''  const colorMap: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700"
  };'''

new_colormap = '''  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
    amber: "border-amber-500/50 bg-amber-500/20 text-amber-300",
    rose: "border-rose-500/50 bg-rose-500/20 text-rose-300"
  };'''

content = content.replace(old_colormap, new_colormap)

# 2. 更新基础信息区域的样式
content = content.replace(
    'rounded-xl border border-slate-200 bg-slate-50/40 p-4',
    'rounded-2xl border border-slate-600/30 bg-slate-800/30 p-5 backdrop-blur-sm'
)

# 3. 更新健康检测区域的样式
content = content.replace(
    'rounded-xl border border-blue-100 bg-blue-50/30 p-4',
    'rounded-2xl border border-indigo-500/30 bg-indigo-900/20 p-5 backdrop-blur-sm'
)

# 4. 更新健康卡片样式
content = content.replace(
    'rounded-lg border border-slate-200 bg-white p-3 space-y-2',
    'rounded-xl border border-slate-600/30 bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm'
)

# 5. 更新输入框样式
content = re.sub(
    r'className="w-full rounded-lg border border-slate-200 px-2 py-1"',
    'className="w-full dark-input px-3 py-2"',
    content
)

content = re.sub(
    r'className="w-full rounded-lg border border-slate-200 px-2 py-1\.5"',
    'className="w-full dark-input px-3 py-2"',
    content
)

# 6. 更新label样式
content = content.replace(
    'className="block text-slate-500"',
    'className="block text-slate-400"'
)

content = content.replace(
    'className="text-slate-500"',
    'className="text-slate-400"'
)

# 7. 更新按钮样式
content = content.replace(
    'rounded-full border px-2 py-1 text-[11px]',
    'tag-btn px-3 py-1.5 text-[11px]'
)

# 8. 更新选择框样式
content = re.sub(
    r'className="(mb-1 )?w-full rounded-lg border border-slate-200 px-2 py-1\.5 text-sm"',
    'className="w-full dark-select px-3 py-2 text-sm"',
    content
)

# 9. 更新信息卡片样式
content = content.replace(
    'rounded-xl border border-purple-200 bg-purple-50/60 p-3',
    'info-card border-purple-500/30 bg-purple-900/30 p-4'
)

content = content.replace(
    'rounded-xl border border-slate-200 bg-slate-50/60 p-3',
    'info-card p-4'
)

content = content.replace(
    'rounded-xl border border-emerald-200 bg-emerald-50/60 p-3',
    'info-card border-emerald-500/30 bg-emerald-900/20 p-4'
)

content = content.replace(
    'rounded-xl border border-sky-200 bg-sky-50/60 p-3',
    'info-card border-sky-500/30 bg-sky-900/20 p-4'
)

content = content.replace(
    'rounded-xl border border-amber-100 bg-amber-50/60 p-3',
    'info-card border-amber-500/30 bg-amber-900/20 p-4'
)

content = content.replace(
    'rounded-xl border border-blue-100 bg-blue-50/60 p-3',
    'info-card border-blue-500/30 bg-blue-900/20 p-4'
)

# 10. 更新文字颜色
content = content.replace('text-slate-600"', 'text-slate-400"')
content = content.replace('text-slate-700"', 'text-slate-300"')
content = content.replace('text-slate-800"', 'text-slate-200"')
content = content.replace('text-slate-900"', 'text-slate-100"')

# 11. 更新特殊提示文字颜色
content = content.replace('text-purple-700/80', 'text-purple-300')
content = content.replace('text-purple-700/90', 'text-purple-200')
content = content.replace('text-purple-600', 'text-purple-400')
content = content.replace('text-purple-700', 'text-purple-300')
content = content.replace('text-purple-900', 'text-purple-100')

content = content.replace('text-emerald-700/80', 'text-emerald-300')
content = content.replace('text-emerald-700/90', 'text-emerald-200')
content = content.replace('text-emerald-700', 'text-emerald-300')

content = content.replace('text-sky-700/80', 'text-sky-300')
content = content.replace('text-sky-700/90', 'text-sky-200')
content = content.replace('text-sky-700', 'text-sky-300')
content = content.replace('text-sky-900', 'text-sky-100')

content = content.replace('text-amber-700/80', 'text-amber-300')
content = content.replace('text-amber-800', 'text-amber-200')
content = content.replace('text-amber-700', 'text-amber-300')

content = content.replace('text-blue-700', 'text-blue-300')
content = content.replace('text-blue-800', 'text-blue-200')

# 12. 更新弹性窗样式
content = content.replace(
    'className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl"',
    'className="w-full max-w-lg rounded-2xl bg-slate-900/95 backdrop-blur-xl p-5 shadow-2xl border border-slate-700/50"'
)

content = content.replace(
    'className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"',
    'className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50"'
)

content = content.replace(
    'className="text-sm font-semibold text-slate-900"',
    'className="text-sm font-semibold text-slate-100"'
)

# 13. 更新网格布局
content = content.replace(
    'grid gap-4 md:grid-cols-2',
    'grid gap-4 md:grid-cols-2'
)

content = content.replace(
    'grid gap-4 md:grid-cols-3',
    'grid gap-4 md:grid-cols-2'
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Style update completed successfully")
