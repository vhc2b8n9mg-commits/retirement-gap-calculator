健康检测升级补丁文件
====================

此文件包含项目2（线上养老储备测算与缺口唤醒工具）的健康检测升级所需的所有代码修改。

## 修改说明

### 1. 新增类型定义（在 type LifeChoiceKey 之后添加）

```typescript
// 健康检测数据类型（5项核心指标）
interface HealthData {
  height: number;        // 身高 cm
  weight: number;        // 体重 kg
  systolicBP: number;    // 收缩压 mmHg
  restingHR: number;     // 静息心率 bpm
  waist: number;         // 腰围 cm
}
```

### 2. 修改 WizardStep 和 wizardOrder

```typescript
type WizardStep =
  | "basic"
  | "healthCheck"  // 新增
  | "retirement"
  | "incomeReserve"
  | "overview"
  | "cityChoice"
  | "living"
  | "food"
  | "supplement"
  | "travel"
  | "inflation"
  | "hobby"
  | "gift"
  | "medical"
  | "care"
  | "teeth"
  | "endOfLife"
  | "summary";

const wizardOrder: WizardStep[] = [
  "basic",
  "healthCheck",  // 新增
  "retirement",
  // ... 其他保持不变
];
```

### 3. 新增辅助函数（在 function clamp 之后添加）

```typescript
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

  // BMI影响
  if (bmi < 18.5) { lifeAdj -= 2; healthyAdj -= 1; details.push("BMI " + bmi + "（偏低）: -2年"); }
  else if (bmi < 25) { lifeAdj += 1; healthyAdj += 1; details.push("BMI " + bmi + "（正常）: +1年"); }
  else if (bmi < 28) { lifeAdj -= 1; details.push("BMI " + bmi + "（超重）: -1年"); }
  else { lifeAdj -= 3; healthyAdj -= 2; details.push("BMI " + bmi + "（肥胖）: -3年"); }

  // 血压影响
  if (health.systolicBP < 120) { lifeAdj += 1; healthyAdj += 1; details.push("血压 " + health.systolicBP + "mmHg（理想）: +1年"); }
  else if (health.systolicBP < 140) { details.push("血压 " + health.systolicBP + "mmHg（正常偏高）: 0年"); }
  else if (health.systolicBP < 160) { lifeAdj -= 2; healthyAdj -= 1; details.push("血压 " + health.systolicBP + "mmHg（高血压）: -2年"); }
  else { lifeAdj -= 4; healthyAdj -= 3; details.push("血压 " + health.systolicBP + "mmHg（严重高血压）: -4年"); }

  // 心率影响
  if (health.restingHR < 60) { lifeAdj += 1; healthyAdj += 1; details.push("心率 " + health.restingHR + "bpm（优秀）: +1年"); }
  else if (health.restingHR < 75) { details.push("心率 " + health.restingHR + "bpm（正常）: 0年"); }
  else if (health.restingHR < 90) { lifeAdj -= 1; details.push("心率 " + health.restingHR + "bpm（偏快）: -1年"); }
  else { lifeAdj -= 2; healthyAdj -= 2; details.push("心率 " + health.restingHR + "bpm（过快）: -2年"); }

  // 腰围影响
  const waistRisk = gender === "female" ? 80 : 90;
  const waistHigh = gender === "female" ? 88 : 102;
  if (health.waist < waistRisk) { lifeAdj += 1; healthyAdj += 1; details.push("腰围 " + health.waist + "cm（理想）: +1年"); }
  else if (health.waist < waistHigh) { lifeAdj -= 1; details.push("腰围 " + health.waist + "cm（偏高）: -1年"); }
  else { lifeAdj -= 3; healthyAdj -= 2; details.push("腰围 " + health.waist + "cm（中心性肥胖）: -3年"); }

  return { lifeAdj, healthyAdj, details };
}
```

### 4. 新增状态（在 basic 状态之后添加）

```typescript
const [health, setHealth] = useState<HealthData>({
  height: 170,
  weight: 70,
  systolicBP: 120,
  restingHR: 72,
  waist: 85
});
```

### 5. 修改预期寿命计算（useMemo 中）

找到：
```typescript
const rawExpect = baseLife + cityAdj + habitAdj + trendAdj;
```

替换为：
```typescript
const { lifeAdj: healthLifeAdj, healthyAdj: healthHealthyAdj, details: healthDetails } = calcHealthImpact(health, basic.gender);
const rawExpect = baseLife + cityAdj + habitAdj + trendAdj + healthLifeAdj;
```

找到：
```typescript
const healthy = clamp(healthyBase + healthyAdj, basic.age + 5, expectLife);
```

替换为：
```typescript
const healthy = clamp(healthyBase + healthyAdj + healthHealthyAdj, basic.age + 5, expectLife);
```

在 return 中添加：
```typescript
return {
  expectedLife: manualExpectLife ?? expectLife,
  healthyLife: manualHealthyLife ?? healthy,
  healthDetails: details,  // 新增
  // ... 其他不变
};
```

### 6. 更新 StepHeader labelMap

```typescript
const labelMap: Record<WizardStep, string> = {
  basic: "基础信息",
  healthCheck: "健康检测",  // 新增
  retirement: "退休年龄设定",
  // ... 其他不变
};
```

### 7. 添加健康检测步骤渲染（在 basic 步骤之后）

```tsx
{step === "healthCheck" && (
  <HealthCheckStep
    health={health}
    gender={basic.gender}
    onChange={setHealth}
    onPrev={goPrev}
    onNext={goNext}
  />
)}
```

### 8. 添加 HealthCheckStep 组件（在 BasicInfoStep 之后）

完整组件代码见下方...

### 9. 更新 OverviewStep 组件参数和 ExplainModal

添加 health 和 healthDetails 参数，在弹窗中显示健康数据影响明细。
