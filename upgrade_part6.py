import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新 ExplainModal 组件签名
old_modal = '''function ExplainModal({
  open,
  onClose
}: {
  open: null | "life" | "healthyLife" | "pension";
  onClose: () => void;
}) {'''

new_modal = '''function ExplainModal({
  open,
  onClose,
  healthDetails
}: {
  open: null | "life" | "healthyLife" | "pension";
  onClose: () => void;
  healthDetails?: string[];
}) {'''

content = content.replace(old_modal, new_modal)

# 更新 ExplainModal 调用
content = content.replace(
    '''        <ExplainModal
          open={explainOpen}
          onClose={() => setExplainOpen(null)}
        />''',
    '''        <ExplainModal
          open={explainOpen}
          onClose={() => setExplainOpen(null)}
          healthDetails={healthDetails}
        />'''
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 6 completed successfully")
