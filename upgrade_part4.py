import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# HealthCheckStep 组件
health_check_component = '''
function HealthCheckStep({
  health,
  gender,
  onChange,
  onPrev,
  onNext
}: {
  health: HealthData;
  gender: Gender;
  onChange: (h: HealthData) => void;
  onPrev?: () => void;
  onNext: () => void;
}) {
  const bmi = calcBMI(health.weight, health.height);
  const bmiLabel = bmi < 18.5 ? "偏低" : bmi < 25 ? "正常" : bmi < 28 ? "超重" : "肥胖";
  const bmiColor = bmi < 18.5 ? "amber" : bmi < 25 ? "emerald" : bmi < 28 ? "amber" : "rose";

  const bpLabel = health.systolicBP < 120 ? "理想" : health.systolicBP < 140 ? "正常偏高" : health.systolicBP < 160 ? "高血压" : "严重高血压";
  const bpColor = health.systolicBP < 120 ? "emerald" : health.systolicBP < 140 ? "emerald" : health.systolicBP < 160 ? "amber" : "rose";

  const hrLabel = health.restingHR < 60 ? "优秀" : health.restingHR < 75 ? "正常" : health.restingHR < 90 ? "偏快" : "过快";
  const hrColor = health.restingHR < 60 ? "emerald" : health.restingHR < 75 ? "emerald" : health.restingHR < 90 ? "amber" : "rose";

  const waistRisk = gender === "female" ? 80 : 90;
  const waistHigh = gender === "female" ? 88 : 102;
  const waistLabel = health.waist < waistRisk ? "理想" : health.waist < waistHigh ? "偏高" : "中心性肥胖";
  const waistColor = health.waist < waistRisk ? "emerald" : health.waist < waistHigh ? "amber" : "rose";

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>健康中心检测数据录入</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          请将健康中心检测结果填入下方。系统将结合这些数据，为您生成更精准的预期寿命与健康寿命评估。
        </p>

        <div className="grid gap-4 md:grid-cols-2 text-xs">
          {/* BMI */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-700">体重指数（BMI）<span className="font-normal text-slate-400 ml-1">- 参考：Lancet 2016</span></p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-500">身高（cm）</label>
                <input type="number" value={health.height} min={140} max={210} onChange={(e) => onChange({ ...health, height: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500">体重（kg）</label>
                <input type="number" value={health.weight} min={30} max={200} onChange={(e) => onChange({ ...health, weight: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" />
              </div>
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[bmiColor]}>BMI = <strong>{bmi}</strong>  {bmiLabel}</div>
          </div>

          {/* 血压 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-700">收缩压<span className="font-normal text-slate-400 ml-1">- 参考：Framingham研究</span></p>
            <div className="space-y-1">
              <label className="text-slate-500">收缩压（mmHg）</label>
              <input type="number" value={health.systolicBP} min={80} max={220} onChange={(e) => onChange({ ...health, systolicBP: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[bpColor]}><strong>{health.systolicBP}</strong> mmHg  {bpLabel}</div>
          </div>

          {/* 心率 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-700">静息心率<span className="font-normal text-slate-400 ml-1">- 参考：JAMA Cardiology 2019</span></p>
            <div className="space-y-1">
              <label className="text-slate-500">静息心率（bpm）</label>
              <input type="number" value={health.restingHR} min={40} max={130} onChange={(e) => onChange({ ...health, restingHR: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[hrColor]}><strong>{health.restingHR}</strong> bpm  {hrLabel}</div>
          </div>

          {/* 腰围 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-700">腰围<span className="font-normal text-slate-400 ml-1">- 参考：WHO标准</span></p>
            <div className="space-y-1">
              <label className="text-slate-500">腰围（cm）</label>
              <input type="number" value={health.waist} min={50} max={160} onChange={(e) => onChange({ ...health, waist: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" />
              <p className="text-[10px] text-slate-400">{gender === "female" ? "女性：<80cm理想，>=88cm为中心性肥胖" : "男性：<90cm理想，>=102cm为中心性肥胖"}</p>
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[waistColor]}><strong>{health.waist}</strong> cm  {waistLabel}</div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] text-blue-800">
          <p className="font-semibold mb-1">这4项指标如何影响您的寿命评估？</p>
          <p>BMI、血压、静息心率、腰围均是经大规模流行病学研究证实的独立寿命预测因子。系统将根据您的检测结果进行个性化调整（最大影响约+-5年）。</p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrev}>上一步</Button>
          <Button onClick={onNext}>继续设定退休年龄</Button>
        </div>
      </CardContent>
    </Card>
  );
}

'''

# 在 BasicInfoStep 组件之前插入 HealthCheckStep
content = content.replace(
    'function BasicInfoStep({',
    health_check_component + 'function BasicInfoStep({'
)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 4 completed successfully")
