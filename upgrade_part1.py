import re

# 读取原始文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 添加 HealthData 接口
health_interface = '''
// 健康检测数据类型（5项核心指标）
interface HealthData {
  height: number;        // 身高 cm
  weight: number;        // 体重 kg
  systolicBP: number;    // 收缩压 mmHg
  restingHR: number;     // 静息心率 bpm
  waist: number;         // 腰围 cm
}
'''
content = content.replace(
    'interface BasicInfo {',
    health_interface + '\ninterface BasicInfo {'
)

# 2. 修改 WizardStep
content = content.replace(
    'type WizardStep =\n  | "basic"\n  | "retirement"',
    'type WizardStep =\n  | "basic"\n  | "healthCheck"\n  | "retirement"'
)

# 3. 修改 wizardOrder
content = content.replace(
    'const wizardOrder: WizardStep[] = [\n  "basic",\n  "retirement"',
    'const wizardOrder: WizardStep[] = [\n  "basic",\n  "healthCheck",\n  "retirement"'
)

# 4. 添加辅助函数
helper_functions = '''
// 计算BMI
function calcBMI(weight: number, height: number): number {
  if (height <= 0) return 22;
  const h = height / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
}

// 根据健康数据计算对寿命的影响
function calcHealthImpact(health: HealthData, gender: Gender): { 
  lifeAdj: number; 
  healthyAdj: number; 
  details: string[] 
} {
  const details: string[] = [];
  let lifeAdj = 0;
  let healthyAdj = 0;
  const bmi = calcBMI(health.weight, health.height);

  // BMI影响 (参考: Lancet 2016)
  if (bmi < 18.5) { lifeAdj -= 2; healthyAdj -= 1; details.push("BMI " + bmi + "（偏低）: -2年"); }
  else if (bmi < 25) { lifeAdj += 1; healthyAdj += 1; details.push("BMI " + bmi + "（正常）: +1年"); }
  else if (bmi < 28) { lifeAdj -= 1; details.push("BMI " + bmi + "（超重）: -1年"); }
  else { lifeAdj -= 3; healthyAdj -= 2; details.push("BMI " + bmi + "（肥胖）: -3年"); }

  // 血压影响 (参考: Framingham研究)
  if (health.systolicBP < 120) { lifeAdj += 1; healthyAdj += 1; details.push("血压 " + health.systolicBP + "mmHg（理想）: +1年"); }
  else if (health.systolicBP < 140) { details.push("血压 " + health.systolicBP + "mmHg（正常偏高）: 0年"); }
  else if (health.systolicBP < 160) { lifeAdj -= 2; healthyAdj -= 1; details.push("血压 " + health.systolicBP + "mmHg（高血压）: -2年"); }
  else { lifeAdj -= 4; healthyAdj -= 3; details.push("血压 " + health.systolicBP + "mmHg（严重高血压）: -4年"); }

  // 心率影响 (参考: JAMA Cardiology 2019)
  if (health.restingHR < 60) { lifeAdj += 1; healthyAdj += 1; details.push("心率 " + health.restingHR + "bpm（优秀）: +1年"); }
  else if (health.restingHR < 75) { details.push("心率 " + health.restingHR + "bpm（正常）: 0年"); }
  else if (health.restingHR < 90) { lifeAdj -= 1; details.push("心率 " + health.restingHR + "bpm（偏快）: -1年"); }
  else { lifeAdj -= 2; healthyAdj -= 2; details.push("心率 " + health.restingHR + "bpm（过快）: -2年"); }

  // 腰围影响 (参考: WHO标准)
  const waistRisk = gender === "female" ? 80 : 90;
  const waistHigh = gender === "female" ? 88 : 102;
  if (health.waist < waistRisk) { lifeAdj += 1; healthyAdj += 1; details.push("腰围 " + health.waist + "cm（理想）: +1年"); }
  else if (health.waist < waistHigh) { lifeAdj -= 1; details.push("腰围 " + health.waist + "cm（偏高）: -1年"); }
  else { lifeAdj -= 3; healthyAdj -= 2; details.push("腰围 " + health.waist + "cm（中心性肥胖）: -3年"); }

  return { lifeAdj, healthyAdj, details };
}

'''
content = content.replace(
    'function clamp(num: number, min: number, max: number) {\n  return Math.min(max, Math.max(min, num));\n}',
    'function clamp(num: number, min: number, max: number) {\n  return Math.min(max, Math.max(min, num));\n}\n' + helper_functions
)

# 5. 添加健康状态
health_state = '''
  // 健康检测数据状态
  const [health, setHealth] = useState<HealthData>({
    height: 170,
    weight: 70,
    systolicBP: 120,
    restingHR: 72,
    waist: 85
  });

'''
content = content.replace(
    '  const [retire, setRetire] = useState<RetirementInfo>({',
    health_state + '  const [retire, setRetire] = useState<RetirementInfo>({'
)

# 保存修改后的文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 1 completed successfully")
