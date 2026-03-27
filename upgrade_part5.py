import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新 OverviewStep 组件签名
old_overview = '''function OverviewStep({
  basic,
  retire,
  expectedLife,
  healthyLife,
  basePensionMonthly,
  basePensionTotal,
  manualExpectLife,
  manualHealthyLife,
  setManualExpectLife,
  setManualHealthyLife,
  onPrev,
  onNext
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  expectedLife: number;
  healthyLife: number;
  basePensionMonthly: number;
  basePensionTotal: number;
  manualExpectLife: number | null;
  manualHealthyLife: number | null;
  setManualExpectLife: (v: number | null) => void;
  setManualHealthyLife: (v: number | null) => void;
  onPrev?: () => void;
  onNext: () => void;
}) {'''

new_overview = '''function OverviewStep({
  basic,
  retire,
  health,
  healthDetails,
  expectedLife,
  healthyLife,
  basePensionMonthly,
  basePensionTotal,
  manualExpectLife,
  manualHealthyLife,
  setManualExpectLife,
  setManualHealthyLife,
  onPrev,
  onNext
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  health: HealthData;
  healthDetails: string[];
  expectedLife: number;
  healthyLife: number;
  basePensionMonthly: number;
  basePensionTotal: number;
  manualExpectLife: number | null;
  manualHealthyLife: number | null;
  setManualExpectLife: (v: number | null) => void;
  setManualHealthyLife: (v: number | null) => void;
  onPrev?: () => void;
  onNext: () => void;
}) {'''

content = content.replace(old_overview, new_overview)

# 更新说明文案
content = content.replace(
    '系统根据近年公开统计口径、地区差异以及您的生活习惯，\n          为您推演出一个预期寿命与健康寿命区间。',
    '系统根据近年公开统计口径、地区差异、您的生活习惯以及健康检测数据，\n          为您推演出一个预期寿命与健康寿命区间。'
)

content = content.replace(
    '已考虑性别、地区、生活方式及长期寿命增长趋势。',
    '已综合性别、地区、生活习惯及健康检测数据。'
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 5 completed successfully")
