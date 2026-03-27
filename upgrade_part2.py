import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改 useMemo 中的寿命计算
old_code = '''const rawExpect = baseLife + cityAdj + habitAdj + trendAdj;
    const expectLife = clamp(Math.round(rawExpect), basic.age + 15, 100);

    const healthyBase = expectLife - 7;
    const healthyAdj = habitScore >= 4 ? 2 : habitScore >= 2 ? 1 : 0;
    const healthy = clamp(healthyBase + healthyAdj, basic.age + 5, expectLife);'''

new_code = '''// 纳入健康检测数据的调整
    const { lifeAdj: healthLifeAdj, healthyAdj: healthHealthyAdj, details: healthDetails } = calcHealthImpact(health, basic.gender);
    
    const rawExpect = baseLife + cityAdj + habitAdj + trendAdj + healthLifeAdj;
    const expectLife = clamp(Math.round(rawExpect), basic.age + 15, 100);

    const healthyBase = expectLife - 7;
    const healthyAdj = habitScore >= 4 ? 2 : habitScore >= 2 ? 1 : 0;
    const healthy = clamp(healthyBase + healthyAdj + healthHealthyAdj, basic.age + 5, expectLife);'''

content = content.replace(old_code, new_code)

# 2. 修改 return 语句
old_return = '''return {
      expectedLife: manualExpectLife ?? expectLife,
      healthyLife: manualHealthyLife ?? healthy,
      basePensionMonthly,
      basePensionTotal,
      existingReserveAmount
    };
  }, [basic, retire, manualExpectLife, manualHealthyLife]);'''

new_return = '''return {
      expectedLife: manualExpectLife ?? expectLife,
      healthyLife: manualHealthyLife ?? healthy,
      healthDetails,
      basePensionMonthly,
      basePensionTotal,
      existingReserveAmount
    };
  }, [basic, health, retire, manualExpectLife, manualHealthyLife]);'''

content = content.replace(old_return, new_return)

# 3. 修改 labelMap
content = content.replace(
    '''const labelMap: Record<WizardStep, string> = {
    basic: "基础信息",
    retirement: "退休年龄设定"''',
    '''const labelMap: Record<WizardStep, string> = {
    basic: "基础信息",
    healthCheck: "健康检测",
    retirement: "退休年龄设定" '''
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 2 completed successfully")
