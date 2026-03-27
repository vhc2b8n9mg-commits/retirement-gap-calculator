import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 添加健康检测步骤渲染
health_check_render = '''      {step === "healthCheck" && (
        <HealthCheckStep
          health={health}
          gender={basic.gender}
          onChange={setHealth}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

'''

# 找到 basic 步骤渲染后面，插入健康检测步骤
content = content.replace(
    '''      {step === "basic" && (
        <BasicInfoStep
          basic={basic}
          onChange={setBasic}
          onNext={goNext}
        />
      )}

      {step === "retirement" && (''',
    '''      {step === "basic" && (
        <BasicInfoStep
          basic={basic}
          onChange={setBasic}
          onNext={goNext}
        />
      )}

''' + health_check_render + '''      {step === "retirement" && ('''
)

# 2. 修改 OverviewStep 调用，添加 health 和 healthDetails 参数
content = content.replace(
    '''      {step === "overview" && (
        <OverviewStep
          basic={basic}
          retire={retire}
          expectedLife={expectedLife}
          healthyLife={healthyLife}''',
    '''      {step === "overview" && (
        <OverviewStep
          basic={basic}
          retire={retire}
          health={health}
          healthDetails={healthDetails}
          expectedLife={expectedLife}
          healthyLife={healthyLife}'''
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 3 completed successfully")
