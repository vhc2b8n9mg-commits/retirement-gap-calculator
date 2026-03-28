import re

with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 从 OverviewStep 移除背景图
old_overview_return = '''  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/backgrounds/step5-city-photo2.jpg')" }}
      >
        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/80 backdrop-blur-sm"></div>
      </div>
      
      {/* 内容层 */}
      <div className="relative z-10">
        <CardHeader>
          <CardTitle>养老数据概览：寿命、健康寿命与基础养老金</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-sm text-slate-300">
            系统根据近年公开统计口径、地区差异、您的生活习惯以及健康检测数据，
            为您推演出一个预期寿命与健康寿命区间。您也可以根据自己的判断，在下方手动微调。</p>'''

new_overview_return = '''  return (
    <Card>
      <CardHeader>
        <CardTitle>养老数据概览：寿命、健康寿命与基础养老金</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">
          系统根据近年公开统计口径、地区差异、您的生活习惯以及健康检测数据，
          为您推演出一个预期寿命与健康寿命区间。您也可以根据自己的判断，在下方手动微调。</p>'''

content = content.replace(old_overview_return, new_overview_return)

# 2. 移除 OverviewStep 结尾的多余 div
content = content.replace(
    '''      </CardContent>
      </div>
    </div>
  );
}

function ExplainModal({''',
    '''      </CardContent>
    </Card>
  );
}

function ExplainModal({'''
)

# 3. 在 CityStep 添加背景图
old_city_return = '''function CityStep(props: LifeStepProps) {
  const { basic, retire, life, monthlyNeed, basePensionMonthly, onChange, onPrev, onNext, overSpend } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>您计划在哪个城市定居养老？</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">
          不同城市的物价水平、生活成本差异很大，同等收入在不同城市的实际购买力也完全不同。
          了解这些差异，才能更准确地测算您的养老储备是否充足。'''

new_city_return = '''function CityStep(props: LifeStepProps) {
  const { basic, retire, life, monthlyNeed, basePensionMonthly, onChange, onPrev, onNext, overSpend } = props;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/backgrounds/step5-city-photo2.jpg')" }}
      >
        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/80 backdrop-blur-sm"></div>
      </div>
      
      {/* 内容层 */}
      <div className="relative z-10">
        <CardHeader>
          <CardTitle>您计划在哪个城市定居养老？</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-sm text-slate-300">
            不同城市的物价水平、生活成本差异很大，同等收入在不同城市的实际购买力也完全不同。
            了解这些差异，才能更准确地测算您的养老储备是否充足。</p>'''

content = content.replace(old_city_return, new_city_return)

# 4. 在 CityStep 结尾添加闭合 div
content = content.replace(
    '''      </CardContent>
    </Card>
  );
}

function LivingStep''',
    '''      </CardContent>
      </div>
    </div>
  );
}

function LivingStep'''
)

with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Background moved to CityStep successfully!")
