"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

type Gender = "male" | "female";

type CityLevel = "rural" | "city" | "tier1";

type HabitKey =
  | "noSmoke"
  | "lessDrink"
  | "exercise"
  | "social"
  | "normalSugar"
  | "regularCheck";

type LifeChoiceKey =
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
  | "endOfLife";


// 健康检测数据类型（6项核心指标）
interface HealthData {
  height: number;        // 身高 cm
  weight: number;        // 体重 kg
  systolicBP: number;    // 收缩压 mmHg
  restingHR: number;     // 静息心率 bpm
  waist: number;         // 腰围 cm
  hip: number;           // 臀围 cm
}

interface BasicInfo {
  age: number;
  gender: Gender;
  cityLevel: CityLevel;
  cityName: string;
  habits: HabitKey[];
  familyStatus: "single" | "marriedNoKid" | "marriedWithKid" | "other";
  jobType: "employee" | "self" | "freelance" | "other";
}

interface RetirementInfo {
  retireAge: number;
  considerTrend: boolean;
  monthlyIncome: number;
  hasBasicPension: boolean;
  hasEnterprisePension: boolean;
  existingReserveLevel: "none" | "low" | "mid" | "high";
}

interface LifeChoiceState {
  cityChoice: "rural" | "comfortable" | "tier1";
  living: "simple" | "classic" | "smart";
  food: "simple" | "balanced" | "gourmet";
  supplement: "none" | "yes";
  travel: "near" | "domestic" | "world";
  hobby: "cheap" | "pro" | "expensive";
  gift: "none" | "normal" | "big";
  medical: "public" | "vip" | "private";
  care: "home" | "institution" | "community";
}

type WizardStep =
  | "basic"
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
  "retirement",
  "incomeReserve",
  "overview",
  "cityChoice",
  "living",
  "food",
  "supplement",
  "travel",
  "inflation",
  "hobby",
  "gift",
  "medical",
  "care",
  "teeth",
  "endOfLife",
  "summary"
];

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num));
}

// 计算BMI
function calcBMI(weight: number, height: number): number {
  if (height <= 0) return 22;
  const h = height / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
}

// 计算腰臀比
function calcWHR(waist: number, hip: number): number {
  if (hip <= 0) return 0.85;
  return parseFloat((waist / hip).toFixed(2));
}

// 计算健康评分 (0-100分)
function calcHealthScore(health: HealthData, gender: Gender): { score: number; grade: string; suggestions: string[] } {
  let score = 60; // 基础分
  const suggestions: string[] = [];
  const bmi = calcBMI(health.weight, health.height);
  const whr = calcWHR(health.waist, health.hip);

  // BMI评分 (最多±15分)
  if (bmi >= 18.5 && bmi < 25) { score += 15; }
  else if (bmi >= 25 && bmi < 28) { score -= 5; suggestions.push("建议适当控制体重，BMI保持在18.5-24.9范围内"); }
  else if (bmi >= 28) { score -= 15; suggestions.push("建议咨询营养师或医生，制定减重计划"); }
  else { score -= 10; suggestions.push("建议增加营养摄入，保持健康体重"); }

  // 血压评分 (最多±15分)
  if (health.systolicBP < 120) { score += 15; }
  else if (health.systolicBP < 140) { score -= 5; suggestions.push("建议减少盐分摄入，保持规律运动"); }
  else if (health.systolicBP < 160) { score -= 15; suggestions.push("建议尽快就医，遵医嘱控制血压"); }
  else { score -= 20; suggestions.push("建议立即就医，进行血压管理"); }

  // 心率评分 (最多±10分)
  if (health.restingHR >= 60 && health.restingHR < 75) { score += 10; }
  else if (health.restingHR >= 75 && health.restingHR < 90) { score -= 5; suggestions.push("建议增加有氧运动，改善心肺功能"); }
  else if (health.restingHR >= 90) { score -= 10; suggestions.push("建议就医检查心率异常原因"); }
  else { score += 5; } // 心率低于60但健康

  // 腰臀比评分 (最多±10分)
  const whrRisk = gender === "female" ? 0.8 : 0.9;
  const whrHigh = gender === "female" ? 0.85 : 0.95;
  if (whr < whrRisk) { score += 10; }
  else if (whr < whrHigh) { score -= 5; suggestions.push("建议加强核心肌群训练，控制腹部脂肪"); }
  else { score -= 10; suggestions.push("腰臀比偏高，建议调整饮食结构并增加运动"); }

  // 确保分数在0-100范围内
  score = Math.max(0, Math.min(100, score));

  // 评级
  let grade = "优秀";
  if (score < 60) grade = "需改善";
  else if (score < 70) grade = "一般";
  else if (score < 80) grade = "良好";
  else if (score < 90) grade = "优秀";
  else grade = "非常优秀";

  return { score, grade, suggestions };
}

// 根据健康数据计算对寿命的影响
function calcHealthImpact(health: HealthData, gender: Gender): {
  lifeAdj: number;
  healthyAdj: number;
  details: string[];
  whr: number;
} {
  const details: string[] = [];
  let lifeAdj = 0;
  let healthyAdj = 0;
  const bmi = calcBMI(health.weight, health.height);
  const whr = calcWHR(health.waist, health.hip);

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

  // 腰臀比影响 (参考: WHO标准)
  const whrRisk = gender === "female" ? 0.8 : 0.9;
  const whrHigh = gender === "female" ? 0.85 : 0.95;
  if (whr < whrRisk) { lifeAdj += 1; healthyAdj += 1; details.push("腰臀比 " + whr + "（理想）: +1年"); }
  else if (whr < whrHigh) { lifeAdj -= 1; details.push("腰臀比 " + whr + "（偏高）: -1年"); }
  else { lifeAdj -= 2; healthyAdj -= 2; details.push("腰臀比 " + whr + "（中心性肥胖）: -2年"); }

  return { lifeAdj, healthyAdj, details, whr };
}



export default function ElderlyCarePage() {
  const [step, setStep] = useState<WizardStep>("basic");
  const [explainOpen, setExplainOpen] = useState<
    null | "life" | "healthyLife" | "pension"
  >(null);

  const [basic, setBasic] = useState<BasicInfo>({
    age: 45,
    gender: "male",
    cityLevel: "city",
    cityName: "",
    habits: ["noSmoke", "lessDrink", "exercise"],
    familyStatus: "marriedWithKid",
    jobType: "employee"
  });


  // 健康检测数据状态
  const [health, setHealth] = useState<HealthData>({
    height: 170,
    weight: 70,
    systolicBP: 120,
    restingHR: 72,
    waist: 85,
    hip: 95
  });

  const [retire, setRetire] = useState<RetirementInfo>({
    retireAge: 60,
    considerTrend: true,
    monthlyIncome: 15000,
    hasBasicPension: true,
    hasEnterprisePension: false,
    existingReserveLevel: "low"
  });

  const [life, setLife] = useState<LifeChoiceState>({
    cityChoice: "comfortable",
    living: "classic",
    food: "balanced",
    supplement: "none",
    travel: "near",
    hobby: "cheap",
    gift: "normal",
    medical: "public",
    care: "home"
  });

  const [manualExpectLife, setManualExpectLife] = useState<number | null>(null);
  const [manualHealthyLife, setManualHealthyLife] = useState<number | null>(null);

  const {
    expectedLife,
    healthyLife,
    healthDetails,
    whr,
    basePensionMonthly,
    basePensionTotal,
    existingReserveAmount
  } = useMemo(() => {
    const baseLife = basic.gender === "female" ? 82 : 79;
    const cityAdj =
      basic.cityLevel === "tier1" ? 1.5 : basic.cityLevel === "city" ? 0.5 : 0;
    const habitScore = basic.habits.length;
    const habitAdj = habitScore >= 4 ? 2 : habitScore >= 2 ? 1 : 0;
    const trendAdj = retire.considerTrend ? 2 : 0;
    // 纳入健康检测数据的调整
    const { lifeAdj: healthLifeAdj, healthyAdj: healthHealthyAdj, details: healthDetails, whr } = calcHealthImpact(health, basic.gender);

    const rawExpect = baseLife + cityAdj + habitAdj + trendAdj + healthLifeAdj;
    const expectLife = clamp(Math.round(rawExpect), basic.age + 15, 100);

    const healthyBase = expectLife - 7;
    const healthyAdj = habitScore >= 4 ? 2 : habitScore >= 2 ? 1 : 0;
    const healthy = clamp(healthyBase + healthyAdj + healthHealthyAdj, basic.age + 5, expectLife);

    let replaceRate = 0;
    if (retire.hasBasicPension) replaceRate += 0.45;
    if (retire.hasEnterprisePension) replaceRate += 0.1;
    const basePensionMonthly = Math.round(retire.monthlyIncome * replaceRate);
    const pensionYears = Math.max(0, expectLife - retire.retireAge);
    const basePensionTotal = basePensionMonthly * 12 * pensionYears;

    let existingReserveAmount = 0;
    switch (retire.existingReserveLevel) {
      case "none":
        existingReserveAmount = 0;
        break;
      case "low":
        existingReserveAmount = 100_000;
        break;
      case "mid":
        existingReserveAmount = 300_000;
        break;
      case "high":
        existingReserveAmount = 800_000;
        break;
    }

    return {
      expectedLife: manualExpectLife ?? expectLife,
      healthyLife: manualHealthyLife ?? healthy,
      healthDetails,
      whr,
      basePensionMonthly,
      basePensionTotal,
      existingReserveAmount
    };
  }, [basic, health, retire, manualExpectLife, manualHealthyLife]);

  const cityCostFactor =
    life.cityChoice === "rural"
      ? 0.7
      : life.cityChoice === "tier1"
      ? 1.3
      : 1.0;

  const {
    monthlyNeed,
    monthlyNeedDetail,
    totalNeed,
    gap,
    monthlyGapNeedNow,
    summaryChart
  } = useMemo(() => {
    const survivalBase =
      (life.living === "simple" ? 2500 : life.living === "classic" ? 4000 : 5500) *
      cityCostFactor;
    const foodBase =
      (life.food === "simple" ? 1200 : life.food === "balanced" ? 2000 : 3200) *
      cityCostFactor;
    const supplementBase =
      life.supplement === "yes" ? 800 * cityCostFactor : 0;
    const travelBase =
      (life.travel === "near" ? 800 : life.travel === "domestic" ? 1800 : 3500) *
      cityCostFactor;
    const hobbyBase =
      (life.hobby === "cheap" ? 300 : life.hobby === "pro" ? 1000 : 3000) *
      cityCostFactor;
    const giftBase =
      (life.gift === "none" ? 0 : life.gift === "normal" ? 500 : 1500) *
      cityCostFactor;
    const medicalBase =
      (life.medical === "public"
        ? 1200
        : life.medical === "vip"
        ? 2500
        : 4500) * cityCostFactor;
    const careBase =
      (life.care === "home" ? 2000 : life.care === "institution" ? 4500 : 9000) *
      cityCostFactor;
    const teethBase = 300 * cityCostFactor;
    const endOfLifeBase = 300 * cityCostFactor;

    const inflationFactor = 1.25;

    const monthlyNeed =
      (survivalBase +
        foodBase +
        medicalBase +
        careBase +
        teethBase +
        endOfLifeBase) *
        inflationFactor +
      travelBase +
      hobbyBase +
      giftBase +
      supplementBase;

    const years = Math.max(0, expectedLife - retire.retireAge);
    const totalNeed = Math.round(monthlyNeed * 12 * years);
    const totalExisting = basePensionTotal + existingReserveAmount;
    const gap = Math.max(0, totalNeed - totalExisting);

    const yearsToRetire = Math.max(0, retire.retireAge - basic.age);
    const monthlyGapNeedNow =
      yearsToRetire === 0 ? gap / (12 * 10 || 1) : gap / (12 * yearsToRetire);

    const chartData: {
      age: number;
      need: number;
      pension: number;
      gap: number;
    }[] = [];
    for (let age = retire.retireAge; age <= expectedLife; age += 1) {
      const yearNeed = monthlyNeed * 12;
      const pension =
        age <= healthyLife ? basePensionMonthly * 12 : basePensionMonthly * 10;
      chartData.push({
        age,
        need: Math.round(yearNeed),
        pension: Math.round(pension),
        gap: Math.max(0, Math.round(yearNeed - pension))
      });
    }

    return {
      monthlyNeed,
      monthlyNeedDetail: {
        survivalBase,
        foodBase,
        supplementBase,
        travelBase,
        hobbyBase,
        giftBase,
        medicalBase,
        careBase,
        teethBase,
        endOfLifeBase
      },
      totalNeed,
      gap,
      monthlyGapNeedNow,
      summaryChart: chartData
    };
  }, [
    basic.age,
    basePensionMonthly,
    basePensionTotal,
    cityCostFactor,
    existingReserveAmount,
    expectedLife,
    healthyLife,
    life,
    retire.retireAge
  ]);

  const currentIndex = wizardOrder.indexOf(step);
  const goNext = () => {
    const next = wizardOrder[currentIndex + 1];
    if (next) setStep(next);
  };
  const goPrev = () => {
    const prev = wizardOrder[currentIndex - 1];
    if (prev) setStep(prev);
  };

  const overSpend = monthlyNeed > basePensionMonthly;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="mb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
          RETIREMENT GAP LAB
        </p>
        <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
          线上养老储备测算与缺口唤醒工具
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400 leading-relaxed">
          模拟您未来的养老方式与花费结构，测算养老资金缺口，把"要不要准备养老钱"
          转化为"为了体面、有尊严、实现梦想，需要补齐多少储备"，
          方便与专业顾问进一步讨论年金、养老年金、增额终身寿险与杠杆终身寿险方案。
        </p>
      </header>

      <StepHeader step={step} />

      {step === "basic" && (
        <BasicInfoStep
          basic={basic}
          health={health}
          onChange={setBasic}
          onHealthChange={setHealth}
          onNext={goNext}
        />
      )}

      {step === "retirement" && (
        <RetirementStep
          basic={basic}
          retire={retire}
          onChange={setRetire}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {step === "incomeReserve" && (
        <IncomeReserveStep
          retire={retire}
          onChange={setRetire}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {step === "overview" && (
        <OverviewStep
          basic={basic}
          retire={retire}
          health={health}
          healthDetails={healthDetails}
          expectedLife={expectedLife}
          healthyLife={healthyLife}
          basePensionMonthly={basePensionMonthly}
          basePensionTotal={basePensionTotal}
          manualExpectLife={manualExpectLife}
          manualHealthyLife={manualHealthyLife}
          setManualExpectLife={setManualExpectLife}
          setManualHealthyLife={setManualHealthyLife}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {step === "cityChoice" && (
        <CityStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "living" && (
        <LivingStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "food" && (
        <FoodStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "supplement" && (
        <SupplementStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "travel" && (
        <TravelStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "inflation" && (
        <InflationStep
          basic={basic}
          retire={retire}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "hobby" && (
        <HobbyStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "gift" && (
        <GiftStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "medical" && (
        <MedicalStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "care" && (
        <CareStep
          basic={basic}
          retire={retire}
          life={life}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onChange={(partial) => setLife({ ...life, ...partial })}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "teeth" && (
        <TeethStep
          basic={basic}
          retire={retire}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "endOfLife" && (
        <EndOfLifeStep
          basic={basic}
          retire={retire}
          monthlyNeed={monthlyNeed}
          basePensionMonthly={basePensionMonthly}
          onPrev={goPrev}
          onNext={goNext}
          overSpend={overSpend}
        />
      )}

      {step === "summary" && (
        <SummaryStep
          basic={basic}
          retire={retire}
          expectedLife={expectedLife}
          healthyLife={healthyLife}
          basePensionMonthly={basePensionMonthly}
          basePensionTotal={basePensionTotal}
          monthlyNeed={monthlyNeed}
          monthlyNeedDetail={monthlyNeedDetail}
          totalNeed={totalNeed}
          gap={gap}
          monthlyGapNeedNow={monthlyGapNeedNow}
          chartData={summaryChart}
          onPrev={goPrev}
        />
      )}
    </main>
  );
}

function StepHeader({ step }: { step: WizardStep }) {
  const index = wizardOrder.indexOf(step) + 1;
  const total = wizardOrder.length;

  const labelMap: Record<WizardStep, string> = {
    basic: "基础信息",
    retirement: "退休年龄设定",
    incomeReserve: "收入与养老储备",
    overview: "养老数据概览",
    cityChoice: "定居城市",
    living: "起居标准",
    food: "膳食标准",
    supplement: "保健品选择",
    travel: "旅行方式",
    inflation: "物价上涨提示",
    hobby: "兴趣爱好",
    gift: "晚辈红包",
    medical: "医疗标准",
    care: "照护方式",
    teeth: "牙齿维护",
    endOfLife: "临终关怀",
    summary: "养老安排总结"
  };

  return (
    <div className="step-indicator mb-4 flex items-center justify-between px-5 py-3">
      <div>
        <p className="text-[11px] text-slate-400">
          步骤 {index} / {total}
        </p>
        <p className="text-sm font-semibold text-slate-200">
          {labelMap[step]}
        </p>
      </div>
      <div className="ml-4 h-2 flex-1 overflow-hidden rounded-full bg-slate-800/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface StepPropsBase {
  onPrev?: () => void;
  onNext: () => void;
}


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

  const whr = calcWHR(health.waist, health.hip);
  const whrRisk = gender === "female" ? 0.8 : 0.9;
  const whrHigh = gender === "female" ? 0.85 : 0.95;
  const whrLabel = whr < whrRisk ? "理想" : whr < whrHigh ? "偏高" : "中心性肥胖";
  const whrColor = whr < whrRisk ? "emerald" : whr < whrHigh ? "amber" : "rose";

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
    amber: "border-amber-500/50 bg-amber-500/20 text-amber-300",
    rose: "border-rose-500/50 bg-rose-500/20 text-rose-300"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>健康中心检测数据录入</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          请将健康中心检测结果填入下方。系统将结合这些数据，为您生成更精准的预期寿命与健康寿命评估。
        </p>

        <div className="grid gap-4 md:grid-cols-2 text-xs">
          {/* BMI */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-300">体重指数（BMI）<span className="font-normal text-slate-400 ml-1">- 参考：Lancet 2016</span></p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-400">身高（cm）</label>
                <input type="number" value={health.height} min={140} max={210} onChange={(e) => onChange({ ...health, height: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">体重（kg）</label>
                <input type="number" value={health.weight} min={30} max={200} onChange={(e) => onChange({ ...health, weight: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[bmiColor]}>BMI = <strong>{bmi}</strong>  {bmiLabel}</div>
          </div>

          {/* 血压 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-300">收缩压<span className="font-normal text-slate-400 ml-1">- 参考：Framingham研究</span></p>
            <div className="space-y-1">
              <label className="text-slate-400">收缩压（mmHg）</label>
              <input type="number" value={health.systolicBP} min={80} max={220} onChange={(e) => onChange({ ...health, systolicBP: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[bpColor]}><strong>{health.systolicBP}</strong> mmHg  {bpLabel}</div>
          </div>

          {/* 心率 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-300">静息心率<span className="font-normal text-slate-400 ml-1">- 参考：JAMA Cardiology 2019</span></p>
            <div className="space-y-1">
              <label className="text-slate-400">静息心率（bpm）</label>
              <input type="number" value={health.restingHR} min={40} max={130} onChange={(e) => onChange({ ...health, restingHR: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
            </div>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[hrColor]}><strong>{health.restingHR}</strong> bpm  {hrLabel}</div>
          </div>

          {/* 腰臀比 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <p className="font-semibold text-slate-300">腰臀比<span className="font-normal text-slate-400 ml-1">- 参考：WHO标准</span></p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-400">腰围（cm）</label>
                <input type="number" value={health.waist} min={50} max={160} onChange={(e) => onChange({ ...health, waist: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">臀围（cm）</label>
                <input type="number" value={health.hip} min={60} max={180} onChange={(e) => onChange({ ...health, hip: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">{gender === "female" ? "女性：腰臀比&lt;0.8理想，>=0.85为中心性肥胖" : "男性：腰臀比&lt;0.9理想，>=0.95为中心性肥胖"}</p>
            <div className={"rounded-lg border px-3 py-2 " + colorMap[whrColor]}>腰臀比 = <strong>{whr}</strong>  {whrLabel}</div>
          </div>
        </div>

        <div className="info-card border-blue-500/30 bg-blue-900/20 p-4 text-[11px] text-blue-200">
          <p className="font-semibold mb-1">这5项指标如何影响您的寿命评估？</p>
          <p>BMI、血压、静息心率、腰臀比均是经大规模流行病学研究证实的独立寿命预测因子。系统将根据您的检测结果进行个性化调整（最大影响约+-6年）。</p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrev}>上一步</Button>
          <Button onClick={onNext}>继续设定退休年龄</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BasicInfoStep({
  basic,
  health,
  onChange,
  onHealthChange,
  onNext
}: {
  basic: BasicInfo;
  health: HealthData;
  onChange: (b: BasicInfo) => void;
  onHealthChange: (h: HealthData) => void;
  onNext: () => void;
}) {
  const canNext = basic.age >= 25 && basic.age <= 70;

  // 健康指标计算
  const bmi = calcBMI(health.weight, health.height);
  const bmiLabel = bmi < 18.5 ? "偏低" : bmi < 25 ? "正常" : bmi < 28 ? "超重" : "肥胖";
  const bmiColor = bmi < 18.5 ? "amber" : bmi < 25 ? "emerald" : bmi < 28 ? "amber" : "rose";

  const bpLabel = health.systolicBP < 120 ? "理想" : health.systolicBP < 140 ? "正常偏高" : health.systolicBP < 160 ? "高血压" : "严重高血压";
  const bpColor = health.systolicBP < 120 ? "emerald" : health.systolicBP < 140 ? "emerald" : health.systolicBP < 160 ? "amber" : "rose";

  const hrLabel = health.restingHR < 60 ? "优秀" : health.restingHR < 75 ? "正常" : health.restingHR < 90 ? "偏快" : "过快";
  const hrColor = health.restingHR < 60 ? "emerald" : health.restingHR < 75 ? "emerald" : health.restingHR < 90 ? "amber" : "rose";

  const whr = calcWHR(health.waist, health.hip);
  const whrRisk = basic.gender === "female" ? 0.8 : 0.9;
  const whrHigh = basic.gender === "female" ? 0.85 : 0.95;
  const whrLabel = whr < whrRisk ? "理想" : whr < whrHigh ? "偏高" : "中心性肥胖";
  const whrColor = whr < whrRisk ? "emerald" : whr < whrHigh ? "amber" : "rose";

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
    amber: "border-amber-500/50 bg-amber-500/20 text-amber-300",
    rose: "border-rose-500/50 bg-rose-500/20 text-rose-300"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>先了解一下您的基本情况</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          只需回答几个简单问题，系统会结合地区、年龄、生活方式与健康检测数据，为您生成专属的
          预期寿命与健康寿命假设，后续所有测算都会基于这些数据完成。
        </p>
        
        {/* 基础信息区域 */}
        <div className="rounded-2xl border border-slate-600/30 bg-slate-800/30 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold text-slate-700 mb-3">基础信息</p>
          <div className="grid gap-4 md:grid-cols-2 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-400">当前年龄</label>
              <input
                type="number"
                value={basic.age}
                min={25}
                max={70}
                onChange={(e) =>
                  onChange({
                    ...basic,
                    age: Number(e.target.value) || 0
                  })
                }
                className="w-full dark-select px-3 py-2 text-sm"
              />
              <label className="block text-slate-400">性别</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...basic, gender: "male" })}
                  className={`flex-1 rounded-lg border px-2 py-1.5 ${
                    basic.gender === "male"
                      ? "border-blue-500 bg-blue-50 text-blue-300"
                      : "border-slate-200 text-slate-400"
                  } text-sm`}
                >
                  男性
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...basic, gender: "female" })}
                  className={`flex-1 rounded-lg border px-2 py-1.5 ${
                    basic.gender === "female"
                      ? "border-blue-500 bg-blue-50 text-blue-300"
                      : "border-slate-200 text-slate-400"
                  } text-sm`}
                >
                  女性
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-slate-400">主要生活城市</label>
              <input
                type="text"
                value={basic.cityName}
                placeholder="如：上海、成都等"
                onChange={(e) =>
                  onChange({
                    ...basic,
                    cityName: e.target.value
                  })
                }
                className="w-full dark-select px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-slate-400">
                城市类型将在后续"定居城市"环节统一选择并用于生活成本测算，
                这里不再单独询问。
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-xs mt-4">
            <div className="space-y-2">
              <label className="block text-slate-400">生活习惯（可多选）</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ["noSmoke", "不吸烟"],
                  ["lessDrink", "少饮酒"],
                  ["exercise", "规律运动"],
                  ["social", "常与朋友社交"],
                  ["normalSugar", "血糖基本正常"],
                  ["regularCheck", "定期体检"]
                ].map(([key, label]) => {
                  const checked = basic.habits.includes(key as HabitKey);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const exists = checked;
                        onChange({
                          ...basic,
                          habits: exists
                            ? basic.habits.filter((h) => h !== key)
                            : [...basic.habits, key as HabitKey]
                        });
                      }}
                      className={`tag-btn px-3 py-1.5 text-[11px] ${
                        checked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-300"
                          : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-slate-400">家庭与职业</label>
              <select
                value={basic.familyStatus}
                onChange={(e) =>
                  onChange({
                    ...basic,
                    familyStatus: e.target
                      .value as BasicInfo["familyStatus"]
                  })
                }
                className="w-full dark-select px-3 py-2 text-sm"
              >
                <option value="single">单身</option>
                <option value="marriedNoKid">已婚未育</option>
                <option value="marriedWithKid">已婚有子女</option>
                <option value="other">其他/不便透露</option>
              </select>
              <select
                value={basic.jobType}
                onChange={(e) =>
                  onChange({
                    ...basic,
                    jobType: e.target.value as BasicInfo["jobType"]
                  })
                }
                className="w-full dark-select px-3 py-2 text-sm"
              >
                <option value="employee">受薪族</option>
                <option value="self">个体经营</option>
                <option value="freelance">自由职业</option>
                <option value="other">其他</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                不同家庭结构与职业，对养老安全感和对孩子的期望不同，
                也会影响后续"梦想线"和"传承安排"的侧重点。
              </p>
            </div>
          </div>
        </div>

        {/* 健康检测数据区域 */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-900/20 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold text-blue-200 mb-3">健康中心检测数据</p>
          <p className="text-[11px] text-blue-600 mb-3">
            请将健康中心检测结果填入下方，系统将结合这些数据为您生成更精准的预期寿命评估。
          </p>
          
          <div className="grid gap-3 md:grid-cols-2 text-xs">
            {/* BMI */}
            <div className="rounded-xl border border-slate-600/30 bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm">
              <p className="font-medium text-slate-300">体重指数（BMI）<span className="font-normal text-slate-400 ml-1 text-[10px]">参考：Lancet 2016</span></p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">身高（cm）</label>
                  <input type="number" value={health.height} min={140} max={210} onChange={(e) => onHealthChange({ ...health, height: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">体重（kg）</label>
                  <input type="number" value={health.weight} min={30} max={200} onChange={(e) => onHealthChange({ ...health, weight: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
                </div>
              </div>
              <div className={"rounded-lg border px-2 py-1 " + colorMap[bmiColor]}>BMI = <strong>{bmi}</strong>　{bmiLabel}</div>
            </div>

            {/* 血压 */}
            <div className="rounded-xl border border-slate-600/30 bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm">
              <p className="font-medium text-slate-300">收缩压<span className="font-normal text-slate-400 ml-1 text-[10px]">参考：Framingham研究</span></p>
              <div className="space-y-1">
                <label className="text-slate-400">收缩压（mmHg）</label>
                <input type="number" value={health.systolicBP} min={80} max={220} onChange={(e) => onHealthChange({ ...health, systolicBP: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
              <div className={"rounded-lg border px-2 py-1 " + colorMap[bpColor]}><strong>{health.systolicBP}</strong> mmHg　{bpLabel}</div>
            </div>

            {/* 心率 */}
            <div className="rounded-xl border border-slate-600/30 bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm">
              <p className="font-medium text-slate-300">静息心率<span className="font-normal text-slate-400 ml-1 text-[10px]">参考：JAMA Cardiology 2019</span></p>
              <div className="space-y-1">
                <label className="text-slate-400">静息心率（bpm）</label>
                <input type="number" value={health.restingHR} min={40} max={130} onChange={(e) => onHealthChange({ ...health, restingHR: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
              </div>
              <div className={"rounded-lg border px-2 py-1 " + colorMap[hrColor]}><strong>{health.restingHR}</strong> bpm　{hrLabel}</div>
            </div>

            {/* 腰臀比 */}
            <div className="rounded-xl border border-slate-600/30 bg-slate-800/40 p-4 space-y-2 backdrop-blur-sm">
              <p className="font-medium text-slate-300">腰臀比<span className="font-normal text-slate-400 ml-1 text-[10px]">参考：WHO标准</span></p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">腰围（cm）</label>
                  <input type="number" value={health.waist} min={50} max={160} onChange={(e) => onHealthChange({ ...health, waist: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">臀围（cm）</label>
                  <input type="number" value={health.hip} min={60} max={180} onChange={(e) => onHealthChange({ ...health, hip: Number(e.target.value) })} className="w-full dark-input px-3 py-2" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">{basic.gender === "female" ? "女性：腰臀比&lt;0.8理想，≥0.85为中心性肥胖" : "男性：腰臀比&lt;0.9理想，≥0.95为中心性肥胖"}</p>
              <div className={"rounded-lg border px-2 py-1 " + colorMap[whrColor]}>腰臀比 = <strong>{whr}</strong>　{whrLabel}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button disabled={!canNext} onClick={onNext}>
            开始设定退休年龄
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RetirementStep({
  basic,
  retire,
  onChange,
  onPrev,
  onNext
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  onChange: (r: RetirementInfo) => void;
  onPrev?: () => void;
  onNext: () => void;
}) {
  const canNext =
    retire.retireAge > basic.age &&
    retire.retireAge >= 40 &&
    retire.retireAge <= 70;

  return (
    <Card>
      <CardHeader>
        <CardTitle>打算什么时候退休？</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">
          退休年龄越早，养老时间越长，需要的总准备就越多；
          但早点规划、早点开始，后面每年需要准备的压力反而会更小。
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-slate-400">
              计划退休年龄（岁）
            </label>
            <input
              type="range"
              min={40}
              max={70}
              value={retire.retireAge}
              onChange={(e) =>
                onChange({
                  ...retire,
                  retireAge: Number(e.target.value)
                })
              }
              className="w-full"
            />
            <p className="text-sm font-semibold text-slate-100">
              {retire.retireAge} 岁
            </p>
            <p className="text-[11px] text-slate-400">
              以当前年龄 {basic.age} 岁计算，距离退休大约还有{" "}
              {Math.max(0, retire.retireAge - basic.age)} 年。
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-sky-800">
              越早开始规划，越容易"以小搏大"
            </p>
            <p className="text-[11px] text-sky-100">
              在后面的测算中，我们会以
              <span className="font-semibold">
                "提前准备几年，每年少存一点"
              </span>
              为思路，帮助您看清：现在稍微做一点调整，将来就可以从容面对更长的养老时间。
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            上一步
          </Button>
          <Button disabled={!canNext} onClick={onNext}>
            填写收入与养老储备
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function IncomeReserveStep({
  retire,
  onChange,
  onPrev,
  onNext
}: {
  retire: RetirementInfo;
  onChange: (r: RetirementInfo) => void;
  onPrev?: () => void;
  onNext: () => void;
}) {
  const canNext = retire.monthlyIncome >= 1000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>当前收入与已有养老储备</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">
          这一部分信息仅用于测算，系统不会自动保存到任何对外系统。
          即使不精确，只填写区间，也足以帮助我们看清大致的养老缺口。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-slate-400">
              当前税前月收入（元）
            </label>
            <input
              type="range"
              min={3000}
              max={50000}
              step={1000}
              value={retire.monthlyIncome}
              onChange={(e) =>
                onChange({
                  ...retire,
                  monthlyIncome: Number(e.target.value)
                })
              }
              className="w-full"
            />
            <p className="text-sm font-semibold text-slate-100">
              约 {retire.monthlyIncome.toLocaleString()} 元/月
            </p>
            <p className="text-[11px] text-slate-400">
              收入水平越高，未来养老金替代率通常越低，
              也更容易形成"生活品质降级"的落差感。
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-slate-400">社保与养老金预期</p>
              <label className="flex items-center gap-2 text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  checked={retire.hasBasicPension}
                  onChange={(e) =>
                    onChange({
                      ...retire,
                      hasBasicPension: e.target.checked
                    })
                  }
                />
                已正常缴纳城镇职工基本养老保险
              </label>
              <label className="flex items-center gap-2 text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  checked={retire.hasEnterprisePension}
                  onChange={(e) =>
                    onChange({
                      ...retire,
                      hasEnterprisePension: e.target.checked
                    })
                  }
                />
                单位有企业年金/职业年金
              </label>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">目前专门为养老准备的大致资金</p>
              <select
                value={retire.existingReserveLevel}
                onChange={(e) =>
                  onChange({
                    ...retire,
                    existingReserveLevel: e.target
                      .value as RetirementInfo["existingReserveLevel"]
                  })
                }
                className="w-full dark-select px-3 py-2 text-sm"
              >
                <option value="none">几乎没有专门为养老准备</option>
                <option value="low">大约 10 万以内</option>
                <option value="mid">大约 10-30 万</option>
                <option value="high">大约 30 万以上</option>
              </select>
              <p className="text-[11px] text-slate-400">
                包括银行存款、理财/基金、专门的养老保险/年金险等，
                只看"心里为养老预留的那一笔"。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            上一步
          </Button>
          <Button disabled={!canNext} onClick={onNext}>
            生成养老数据概览
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewStep({
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
}) {
  const expectVal = manualExpectLife ?? expectedLife;
  const healthyVal = manualHealthyLife ?? healthyLife;
  const [explainOpen, setExplainOpen] = useState<
    null | "life" | "healthyLife" | "pension" | "healthScore"
  >(null);

  // 计算健康评分
  const { score: healthScore, grade: healthGrade, suggestions: healthSuggestions } = calcHealthScore(health, basic.gender);

  return (
    <Card>
      <CardHeader>
        <CardTitle>养老数据概览：寿命、健康寿命与基础养老金</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">
          系统根据近年公开统计口径、地区差异、您的生活习惯以及健康检测数据，
          为您推演出一个预期寿命与健康寿命区间。您也可以根据自己的判断，在下方手动微调。
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 健康评分 - 放在最前面 */}
          <button
            type="button"
            onClick={() => setExplainOpen("healthScore")}
            className="space-y-2 info-card border-purple-500/30 bg-purple-900/30 p-4 text-left transition hover:bg-purple-50"
          >
            <p className="text-[11px] text-purple-300">健康评分</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-100">{healthScore}</span>
              <span className="text-sm text-purple-300">分</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">{healthGrade}</span>
            </div>
            <p className="text-[11px] text-purple-300">
              根据您的健康检测数据综合评估
            </p>
            <p className="text-[11px] text-purple-400">
              点击查看评分详情与改善建议
            </p>
          </button>

          <button
            type="button"
            onClick={() => setExplainOpen("life")}
            className="space-y-2 info-card p-4 text-left transition hover:bg-slate-50"
          >
            <p className="text-[11px] text-slate-500">预期寿命假设</p>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={expectVal}
                min={basic.age + 10}
                max={100}
                onChange={(e) =>
                  setManualExpectLife(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-16 rounded-lg border border-slate-200 px-1.5 py-1 text-sm"
              />
              <span className="text-sm">岁</span>
            </div>
            <p className="text-[11px] text-slate-400">
              系统预估值约为 {expectedLife} 岁，
              已综合性别、地区、生活习惯及健康检测数据。
            </p>
            <p className="text-[11px] text-slate-500">
              点击查看数据口径与出处
            </p>
          </button>

          <button
            type="button"
            onClick={() => setExplainOpen("healthyLife")}
            className="space-y-2 info-card border-emerald-500/30 bg-emerald-900/20 p-4 text-left transition hover:bg-emerald-50"
          >
            <p className="text-[11px] text-emerald-300">预期健康寿命</p>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={healthyVal}
                min={basic.age + 5}
                max={expectVal}
                onChange={(e) =>
                  setManualHealthyLife(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-16 rounded-lg border border-emerald-200 px-1.5 py-1 text-sm"
              />
              <span className="text-sm">岁</span>
            </div>
            <p className="text-[11px] text-emerald-200">
              健康寿命指基本可以独立生活、不严重依赖照护的年限，
              也是规划"自助旅游、爱好、社交生活"的黄金阶段。
            </p>
            <p className="text-[11px] text-emerald-300">
              点击查看数据口径与出处
            </p>
          </button>

          <button
            type="button"
            onClick={() => setExplainOpen("pension")}
            className="space-y-2 info-card border-sky-500/30 bg-sky-900/20 p-4 text-left transition hover:bg-sky-50"
          >
            <p className="text-[11px] text-sky-300">基础养老收入测算</p>
            <p className="text-sm font-semibold text-sky-100">
              预计养老金约 {basePensionMonthly.toLocaleString()} 元/月
            </p>
            <p className="text-[11px] text-sky-200">
              从 {retire.retireAge} 岁领到约 {expectVal} 岁，
              一生合计约 {basePensionTotal.toLocaleString()} 元。
              实际金额以社保部门及单位最终发放为准。
            </p>
            <p className="text-[11px] text-sky-300">
              点击查看测算逻辑说明
            </p>
          </button>
        </div>

        <ExplainModal
          open={explainOpen}
          onClose={() => setExplainOpen(null)}
          healthDetails={healthDetails}
          healthScore={healthScore}
          healthGrade={healthGrade}
          healthSuggestions={healthSuggestions}
        />

        <div className="info-card border-amber-500/30 bg-amber-900/20 p-4 text-[11px] text-amber-200">
          <p className="mb-1 font-semibold">
            提醒：活得越久，越需要提前把"钱的安排"想清楚
          </p>
          <p>
            如果仅靠基础养老金，往往只能覆盖"生存线"，
            想要体面生活、经常旅行、给晚辈准备红包或实现心愿，就需要另外的养老储备。
            下一步我们将通过一系列轻松的选择，帮您拼出属于自己的"优雅养老蓝图"。
          </p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            上一步
          </Button>
          <Button onClick={onNext}>开启优雅养老生活</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ExplainModal({
  open,
  onClose,
  healthDetails,
  healthScore,
  healthGrade,
  healthSuggestions
}: {
  open: null | "life" | "healthyLife" | "pension" | "healthScore";
  onClose: () => void;
  healthDetails?: string[];
  healthScore?: number;
  healthGrade?: string;
  healthSuggestions?: string[];
}) {
  if (!open) return null;

  const content = (() => {
    switch (open) {
      case "life":
        return {
          title: "预期寿命假设：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-300">
              <p>
                本工具展示的"预期寿命"用于做养老规划的情景假设，
                口径参考国际通用的<strong>Life expectancy at birth</strong>等统计指标，
                并结合您选择的生活习惯做简化修正，便于唤起对"长寿风险"的直观感受。
              </p>
              <p className="text-slate-400">
                参考出处（权威公开数据）：
              </p>
              <ul className="list-disc space-y-1 pl-5 text-slate-400">
                <li>
                  WHO Global Health Observatory（预期寿命相关指标说明与数据入口）：
                  <a
                    className="ml-1 text-blue-300 underline underline-offset-2"
                    href="https://www.who.int/data/gho"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://www.who.int/data/gho
                  </a>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500">
                提示：实际寿命受遗传、既往病史、医疗可及性、意外风险等影响，
                本工具仅用于规划讨论，不作为医学或精算结论。
              </p>
            </div>
          )
        };
      case "healthyLife":
        return {
          title: "预期健康寿命：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-300">
              <p>
                "健康寿命"用于帮助您区分两个阶段：能较为独立生活的时间、
                与可能更需要照护/医疗支持的时间。本工具的健康寿命是假设值，
                用于测算养老方式与预算结构。
              </p>
              <p className="text-slate-400">参考出处（权威公开数据）：</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-400">
                <li>
                  WHO（健康寿命/健康预期寿命等相关统计口径与数据入口）：
                  <a
                    className="ml-1 text-blue-300 underline underline-offset-2"
                    href="https://www.who.int/data/gho"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://www.who.int/data/gho
                  </a>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500">
                提示：健康寿命并不等同于"完全不生病"，只是以功能状态为核心的统计口径；
                本工具用于引导养老照护与医疗预算讨论。
              </p>
            </div>
          )
        };
      case "pension":
        return {
          title: "基础养老收入测算：逻辑说明",
          body: (
            <div className="space-y-2 text-[12px] text-slate-300">
              <p>
                本工具的"基础养老金"是为了做养老缺口讨论而采用的简化估算：
                根据您填写的月收入，并结合是否缴纳基本养老保险/是否有企业年金，
                用一个"养老金替代率"假设来得到月度养老金水平。
              </p>
              <ul className="list-disc space-y-1 pl-5 text-slate-400">
                <li>
                  若有基本养老保险：按约 <strong>45%</strong> 的替代率估算；
                </li>
                <li>
                  若另有企业年金/职业年金：额外增加约 <strong>10%</strong>；
                </li>
                <li>
                  退休后按预计寿命年限累积，得到"一生基础养老金总额"。
                </li>
              </ul>
              <p className="text-[11px] text-slate-500">
                提示：真实养老金受缴费年限、缴费基数、当地社平工资、计发办法等影响，
                以社保部门最终核算为准。本工具的目的，是快速把话题从"未来不确定"
                转为"缺口大概是多少、用什么方式补齐"。
              </p>
            </div>
          )
        };
      case "healthScore":
        return {
          title: "健康评分详情",
          body: (
            <div className="space-y-3 text-[12px] text-slate-300">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-100">{healthScore}</p>
                  <p className="text-xs text-purple-400">总分 100</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-purple-800">评级：{healthGrade}</p>
                  <p className="text-[11px] text-purple-400 mt-1">基于您的健康检测数据综合评估</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-700 mb-1">评分逻辑说明：</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                  <li>基础分 60 分</li>
                  <li>BMI（18.5-24.9）：+15分；超重：-5分；肥胖：-15分</li>
                  <li>血压（理想值 &lt;120mmHg）：+15分；140-159：-15分；≥160：-20分</li>
                  <li>静息心率（60-74 bpm）：+10分；75-89：-5分；≥90：-10分</li>
                  <li>腰臀比（女性&lt;0.8/男性&lt;0.9）：+10分；偏高：-5分；中心性肥胖：-10分</li>
                </ul>
              </div>

              {healthDetails && healthDetails.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-700 mb-1">健康数据对预期寿命的影响：</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                    {healthDetails.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {healthSuggestions && healthSuggestions.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="font-semibold text-amber-200 mb-1">健康改善建议：</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-300 text-[11px]">
                    {healthSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-slate-500">
                <p>参考出处：Lancet 2016（BMI）、Framingham心脏研究（血压）、JAMA Cardiology 2019（心率）、WHO标准（腰臀比）</p>
              </div>
            </div>
          )
        };
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-slate-900/95 backdrop-blur-xl p-5 shadow-2xl border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {content.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50"
          >
            关闭
          </button>
        </div>
        <div className="mt-3">{content.body}</div>
      </div>
    </div>
  );
}

interface LifeStepProps extends StepPropsBase {
  basic: BasicInfo;
  retire: RetirementInfo;
  life: LifeChoiceState;
  monthlyNeed: number;
  basePensionMonthly: number;
  onChange: (partial: Partial<LifeChoiceState>) => void;
  overSpend: boolean;
}

function CityStep(props: LifeStepProps) {
  const {
    basic,
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="您理想中的养老定居城市是？"
      description="不同城市只是费用水平不同，没有绝对的好坏之分。关键是：用您能接受的成本，换自己喜欢的生活节奏。"
      scenarioAge={retire.retireAge}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.cityChoice === "rural"}
          label="田园乡间"
          desc="节奏慢、空气好，生活成本相对较低，更适合向往宁静、喜欢种花种菜的您。"
          onClick={() => onChange({ cityChoice: "rural" })}
        />
        <CityOption
          active={life.cityChoice === "comfortable"}
          label="舒享城市"
          desc="二线/强省会等城市，医疗教育资源较好，生活便利，性价比高。"
          onClick={() => onChange({ cityChoice: "comfortable" })}
        />
        <CityOption
          active={life.cityChoice === "tier1"}
          label="一线都市"
          desc="国际化程度高，医疗资源集中，适合追求视野与品质，但生活成本较高。"
          onClick={() => onChange({ cityChoice: "tier1" })}
        />
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        当前假设：您将在 {retire.retireAge} 岁左右在此城市进入正式退休状态。
        后续所有花费将基于该城市的平均生活成本水平估算。
      </p>
    </ScenarioCard>
  );
}

function CityOption({
  active,
  label,
  desc,
  onClick
}: {
  active: boolean;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col rounded-xl border p-3 text-left ${
        active
          ? "border-blue-500 bg-blue-50/70 text-blue-900 shadow-sm"
          : "border-slate-200 bg-white/70 text-slate-200"
      }`}
    >
      <span className="mb-1 text-sm font-semibold">{label}</span>
      <span className="text-[11px] text-slate-500">{desc}</span>
    </button>
  );
}

function LivingStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="您希望退休后的起居环境是？"
      description="居住环境决定了每天醒来的心情。这里我们不讨论房价，只讨论未来每月维持这种居住标准的大致花费。"
      scenarioAge={retire.retireAge}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.living === "simple"}
          label="简约随心"
          desc="不追求装修与面积，以干净整洁、生活便利为主，租住或与子女同住。"
          onClick={() => onChange({ living: "simple" })}
        />
        <CityOption
          active={life.living === "classic"}
          label="经典舒适"
          desc="有独立卧室与起居空间，装修温馨，配备电梯与适老化设施。"
          onClick={() => onChange({ living: "classic" })}
        />
        <CityOption
          active={life.living === "smart"}
          label="智慧雅居"
          desc="智能家居、适老化改造到位，方便健康监测与远程照护。"
          onClick={() => onChange({ living: "smart" })}
        />
      </div>
    </ScenarioCard>
  );
}

function FoodStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="退休后的饮食标准？"
      description="吃得好，是养老品质的底色。这里的选择，会影响未来每月在食材、外出就餐上的支出。"
      scenarioAge={retire.retireAge}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.food === "simple"}
          label="简约饮食"
          desc="以家常菜和简单食材为主，偶尔外出就餐，更注重节约。"
          onClick={() => onChange({ food: "simple" })}
        />
        <CityOption
          active={life.food === "balanced"}
          label="品质均衡"
          desc="讲究营养搭配，经常选购优质食材，适度外出就餐或点外卖。"
          onClick={() => onChange({ food: "balanced" })}
        />
        <CityOption
          active={life.food === "gourmet"}
          label="乐享美味"
          desc="经常尝试新餐厅，偶尔精致聚会，享受美食带来的快乐。"
          onClick={() => onChange({ food: "gourmet" })}
        />
      </div>
    </ScenarioCard>
  );
}

function SupplementStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="是否长期购买保健品？"
      description="保健品可以作为辅助，但不能替代正规治疗。这里只讨论长期购买保健品的花费。"
      scenarioAge={retire.retireAge}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-2 text-xs">
        <CityOption
          active={life.supplement === "none"}
          label="不特意购买"
          desc="更愿意把预算用在优质食材、体检和运动上。"
          onClick={() => onChange({ supplement: "none" })}
        />
        <CityOption
          active={life.supplement === "yes"}
          label="会定期购买"
          desc="愿意尝试适合自己的保健品，但也知晓其效果有限。"
          onClick={() => onChange({ supplement: "yes" })}
        />
      </div>
      <p className="mt-3 text-[11px] text-amber-300">
        温馨提示：保健品不是药物，不能代替正规诊疗。合理安排预算，避免因冲动消费挤占真正必要的医疗和养老储备。
      </p>
    </ScenarioCard>
  );
}

function TravelStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="退休后的旅行节奏？"
      description="旅行，是很多人对养老生活最真实的想象。频率和方式不同，对预算的影响也完全不同。"
      scenarioAge={retire.retireAge + 3}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.travel === "near"}
          label="周边短途"
          desc="以本市/周边城市一日游或短途游为主，一年 1-2 次。"
          onClick={() => onChange({ travel: "near" })}
        />
        <CityOption
          active={life.travel === "domestic"}
          label="大好河山"
          desc="每年 1 次左右国内中长线旅游，偶尔跟团或自由行。"
          onClick={() => onChange({ travel: "domestic" })}
        />
        <CityOption
          active={life.travel === "world"}
          label="环游世界"
          desc="经常计划长线旅行，包含境外线路或高品质深度游。"
          onClick={() => onChange({ travel: "world" })}
        />
      </div>
    </ScenarioCard>
  );
}

function InflationStep({
  basic,
  retire,
  monthlyNeed,
  basePensionMonthly,
  onPrev,
  onNext,
  overSpend
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  monthlyNeed: number;
  basePensionMonthly: number;
  onPrev?: () => void;
  onNext: () => void;
  overSpend: boolean;
}) {
  const yearsToRetire = Math.max(0, retire.retireAge - basic.age);

  return (
    <ScenarioCard
      title="物价上涨：今天的一杯奶茶，退休时要多少钱？"
      description="通货膨胀会悄悄抬高一切生活成本。很多人在规划养老时容易忽视这个因素。"
      scenarioAge={retire.retireAge}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="继续"
      showPrev
    >
      <p className="mb-2 text-xs text-slate-400">
        假设未来长期平均通胀率为 3%-4%，
        即便您现在每月花 8000 元维持生活品质，
        等到 {retire.retireAge} 岁退休时，
        可能需要 1.5 倍甚至 2 倍的金额才能维持同样水准。
      </p>
      <p className="text-[11px] text-slate-500">
        从 {basic.age} 岁到 {retire.retireAge} 岁，大约还有 {yearsToRetire} 年。
        越早开始做养老规划，越能利用时间的力量，对冲通胀和不确定性。
      </p>
    </ScenarioCard>
  );
}

function HobbyStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="您的兴趣爱好属于哪一类？"
      description="爱好会决定您退休后很多快乐时光的模样，也会占据一部分预算。"
      scenarioAge={retire.retireAge + 5}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.hobby === "cheap"}
          label="省钱爱好"
          desc="散步、广场舞、读书、摄影等，不需要太多额外花费。"
          onClick={() => onChange({ hobby: "cheap" })}
        />
        <CityOption
          active={life.hobby === "pro"}
          label="专业爱好"
          desc="乐器、绘画、收藏等，需要持续课程或器材投入。"
          onClick={() => onChange({ hobby: "pro" })}
        />
        <CityOption
          active={life.hobby === "expensive"}
          label="烧钱爱好"
          desc="如高尔夫、高端收藏、经常性高消费型活动等。"
          onClick={() => onChange({ hobby: "expensive" })}
        />
      </div>
    </ScenarioCard>
  );
}

function GiftStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="打算给晚辈准备怎样的红包？"
      description="很多长辈都希望在节假日、婚礼或关键节点给子女晚辈一些支持，这部分也是养老预算的重要组成。"
      scenarioAge={retire.retireAge + 10}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.gift === "none"}
          label="基本不包红包"
          desc="更多把时间和陪伴给到晚辈，经济上不刻意准备。"
          onClick={() => onChange({ gift: "none" })}
        />
        <CityOption
          active={life.gift === "normal"}
          label="一般红包"
          desc="春节、生日等维持人情往来的红包为主。"
          onClick={() => onChange({ gift: "normal" })}
        />
        <CityOption
          active={life.gift === "big"}
          label="大红包"
          desc="希望在婚礼、买房等关键节点给予更实质的经济支持。"
          onClick={() => onChange({ gift: "big" })}
        />
      </div>
    </ScenarioCard>
  );
}

function MedicalStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="未来就医主要选择哪类医疗资源？"
      description="医疗支出往往是养老时期最大的不确定成本之一，不同就医选择，会带来完全不同的预算压力。"
      scenarioAge={retire.retireAge + 15}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.medical === "public"}
          label="公立普通"
          desc="以公立医院普通门诊和住院为主，接受排队与等待。"
          onClick={() => onChange({ medical: "public" })}
        />
        <CityOption
          active={life.medical === "vip"}
          label="公立特需"
          desc="更愿意选择特需门诊、专家门诊，提高就医体验。"
          onClick={() => onChange({ medical: "vip" })}
        />
        <CityOption
          active={life.medical === "private"}
          label="国疗私立"
          desc="愿意为更便捷、服务更好的私立或高端医疗付费。"
          onClick={() => onChange({ medical: "private" })}
        />
      </div>
    </ScenarioCard>
  );
}

function CareStep(props: LifeStepProps) {
  const {
    retire,
    life,
    monthlyNeed,
    basePensionMonthly,
    onChange,
    onPrev,
    onNext,
    overSpend
  } = props;

  return (
    <ScenarioCard
      title="当需要照护时，更倾向哪种方式？"
      description="照护安排往往关系到要不要麻烦子女的心理感受，也是很多客户选择高端养老社区或长期护理保险的原因。"
      scenarioAge={retire.retireAge + 20}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="确认选择"
      showPrev
    >
      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <CityOption
          active={life.care === "home"}
          label="居家保姆"
          desc="以居家照护为主，必要时请住家或钟点保姆协助。"
          onClick={() => onChange({ care: "home" })}
        />
        <CityOption
          active={life.care === "institution"}
          label="专业机构"
          desc="入住专业养老机构或护理院，享受全天候照护服务。"
          onClick={() => onChange({ care: "institution" })}
        />
        <CityOption
          active={life.care === "community"}
          label="高端社区"
          desc="入住高端养老社区，兼顾生活便利、社交和专业医疗。"
          onClick={() => onChange({ care: "community" })}
        />
      </div>
    </ScenarioCard>
  );
}

function TeethStep({
  basic,
  retire,
  monthlyNeed,
  basePensionMonthly,
  onPrev,
  onNext,
  overSpend
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  monthlyNeed: number;
  basePensionMonthly: number;
  onPrev?: () => void;
  onNext: () => void;
  overSpend: boolean;
}) {
  return (
    <ScenarioCard
      title="牙齿维护：种牙往往是被忽略的大支出"
      description="很多人在年轻时不会把牙齿问题当回事，但到老年时，一次种牙可能就是几万甚至十几万。"
      scenarioAge={retire.retireAge + 25}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="继续"
      showPrev
    >
      <p className="mb-2 text-xs text-slate-400">
        本工具在测算时，已经为您预留了
        <span className="font-semibold">"牙齿专项预算"</span>
        ，并均摊到每月支出中，避免未来突然一次性大额支出打乱养老节奏。
      </p>
      <p className="text-[11px] text-slate-500">
        趁现在牙齿状况还不错，可以适当提前做检查和维护，
        也可以通过长期储蓄或保险方式，为未来可能的种牙支出预留一部分"弹性空间"。
      </p>
    </ScenarioCard>
  );
}

function EndOfLifeStep({
  basic,
  retire,
  monthlyNeed,
  basePensionMonthly,
  onPrev,
  onNext,
  overSpend
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  monthlyNeed: number;
  basePensionMonthly: number;
  onPrev?: () => void;
  onNext: () => void;
  overSpend: boolean;
}) {
  return (
    <ScenarioCard
      title="临终关怀与人生谢幕"
      description="很多人不愿意提前谈最后一程，但提前做一些安排，反而可以减轻家人的身心压力。"
      scenarioAge={retire.retireAge + 30}
      monthlyNeed={monthlyNeed}
      basePensionMonthly={basePensionMonthly}
      overSpend={overSpend}
      onPrev={onPrev}
      onNext={onNext}
      confirmLabel="查看规划报告"
      showPrev
    >
      <p className="mb-2 text-xs text-slate-400">
        无论是居家宁养、安宁疗护，还是在专业机构完成最后的陪伴，
        都离不开一定的经济基础支撑。本工具已经在整体养老支出模型中，为这一阶段预留了预算。
      </p>
      <p className="text-[11px] text-slate-500">
        接下来，我们将把前面所有关于
        "住在哪里、怎么生活、如何就医、要不要给晚辈红包"等选择，
        汇总成一份完整的《个人养老财富报告》，
        帮助您清晰看到：理想中的人生谢幕方式背后，大概要准备多少资金。
      </p>
    </ScenarioCard>
  );
}

function ScenarioCard({
  title,
  description,
  scenarioAge,
  monthlyNeed,
  basePensionMonthly,
  overSpend,
  onPrev,
  onNext,
  confirmLabel,
  showPrev,
  children
}: {
  title: string;
  description: string;
  scenarioAge: number;
  monthlyNeed: number;
  basePensionMonthly: number;
  overSpend: boolean;
  onPrev?: () => void;
  onNext: () => void;
  confirmLabel: string;
  showPrev?: boolean;
  children: ReactNode;
}) {
  const diff = monthlyNeed - basePensionMonthly;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-sm text-slate-400">{description}</p>
        {children}
        <div className="mt-4 grid gap-3 md:grid-cols-[2fr,1.2fr]">
          <div className="info-card p-4 text-[11px]">
            <p className="mb-1 font-semibold text-slate-300">
              在大约 {scenarioAge} 岁时，按当前所有选择测算：
            </p>
            <p className="text-slate-400">
              每月合计养老支出约{" "}
              <span className="font-semibold">
                {monthlyNeed.toLocaleString()} 元
              </span>
              ，其中基础养老金预计可覆盖{" "}
              <span className="font-semibold">
                {Math.max(basePensionMonthly, 0).toLocaleString()} 元/月
              </span>
              。
            </p>
            {overSpend ? (
              <p className="mt-1 text-rose-700">
                仍有约{" "}
                <span className="font-semibold">
                  {Math.max(diff, 0).toLocaleString()} 元/月
                </span>{" "}
                需要通过
                <span className="font-semibold">
                  个人储蓄/商业养老保险/年金险
                </span>
                来补足，否则生活品质可能会被迫打折。
              </p>
            ) : (
              <p className="mt-1 text-emerald-300">
                按当前假设，基础养老金基本可以覆盖主要开支，
                但如果未来通胀超出预期或健康状况变化，仍然建议预留一部分备用金。
              </p>
            )}
          </div>
          <div
            className={`rounded-xl border p-3 text-[11px] ${
              overSpend
                ? "border-rose-200 bg-rose-50/70 text-rose-800"
                : "border-emerald-200 bg-emerald-50/70 text-emerald-800"
            }`}
          >
            <p className="mb-1 font-semibold">
              {overSpend ? "超支风险提醒" : "相对安全，但仍需预备"}
            </p>
            <p>
              本提示仅基于简化模型和您当前的选择结果，
              具体规划建议请结合专业顾问与实际产品方案进一步确认。
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          {showPrev ? (
            <Button variant="outline" onClick={onPrev}>
              上一步
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onNext}>{confirmLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStep({
  basic,
  retire,
  expectedLife,
  healthyLife,
  basePensionMonthly,
  basePensionTotal,
  monthlyNeed,
  monthlyNeedDetail,
  totalNeed,
  gap,
  monthlyGapNeedNow,
  chartData,
  onPrev
}: {
  basic: BasicInfo;
  retire: RetirementInfo;
  expectedLife: number;
  healthyLife: number;
  basePensionMonthly: number;
  basePensionTotal: number;
  monthlyNeed: number;
  monthlyNeedDetail: Record<string, number>;
  totalNeed: number;
  gap: number;
  monthlyGapNeedNow: number;
  chartData: { age: number; need: number; pension: number; gap: number }[];
  onPrev?: () => void;
}) {
  const yearsToRetire = Math.max(0, retire.retireAge - basic.age);
  const gapMillion = gap / 1_000_000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人养老财富报告 · 摘要</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-xs">
        <div className="grid gap-4 md:grid-cols-[1.3fr,1.2fr]">
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              基于您刚才关于
              <span className="font-semibold">
                居住、饮食、旅行、爱好、医疗、照护与给晚辈支持
              </span>
              的所有选择，本工具为您生成了如下养老资金全景图：
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
              <p className="mb-1 text-[11px] text-amber-200">
                一生大致需要准备的养老总资金
              </p>
              <p className="text-2xl font-bold text-amber-900">
                {totalNeed.toLocaleString()} 元
              </p>
              <p className="mt-1 text-[11px] text-amber-200">
                从 {retire.retireAge} 岁到 {expectedLife} 岁，
                按当前生活方式测算，平均每月约{" "}
                <span className="font-semibold">
                  {monthlyNeed.toLocaleString()} 元
                </span>
                。
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="mb-1 text-[11px] text-slate-300">
                可以预期的基础养老收入（养老金等）
              </p>
              <p className="text-sm font-semibold text-slate-100">
                约 {basePensionMonthly.toLocaleString()} 元/月，
                一生合计约 {basePensionTotal.toLocaleString()} 元。
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                这部分主要覆盖"生存线"，包括吃穿住行和基础医疗，
                难以完全承担旅游、兴趣爱好、给晚辈支持等"生活线"和"梦想线"支出。
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3">
              <p className="mb-1 text-[11px] text-rose-800">
                按当前设想，您的养老储备缺口约为
              </p>
              <p className="text-2xl font-bold text-rose-900">
                {gap.toLocaleString()} 元
              </p>
              <p className="mt-1 text-[11px] text-rose-800">
                如果从现在 {basic.age} 岁开始，到 {retire.retireAge} 岁退休，
                还有 {yearsToRetire} 年时间，
                每月平均需要额外准备约{" "}
                <span className="font-semibold">
                  {Math.round(monthlyGapNeedNow).toLocaleString()} 元/月
                </span>
                ，才能大致实现您刚才勾画的养老生活。
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-56 rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 text-[11px] text-slate-400">
                从退休到高龄的资金曲线
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="age"
                    tickLine={false}
                    tickMargin={6}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${Math.round(v / 10000)}万`}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `${Math.round(value).toLocaleString()} 元/年`
                    }
                    labelFormatter={(label) => `${label} 岁`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="need"
                    stroke="#f97316"
                    fill="#fed7aa"
                    name="养老总支出"
                  />
                  <Area
                    type="monotone"
                    dataKey="pension"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    name="养老金等稳定收入"
                  />
                  <Area
                    type="monotone"
                    dataKey="gap"
                    stroke="#e11d48"
                    fill="#fecdd3"
                    name="年度资金缺口"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
              <p className="mb-1 text-[11px] text-slate-300">
                每月支出结构（示意）
              </p>
              <ul className="space-y-0.5 text-[11px] text-slate-400">
                <li>
                  生存花费（吃穿住行+基础医疗）约{" "}
                  {Math.round(
                    (monthlyNeedDetail.survivalBase ??
                      0 + (monthlyNeedDetail.medicalBase ?? 0)) || 0
                  ).toLocaleString()}{" "}
                  元/月
                </li>
                <li>
                  生活花费（膳食升级、旅行、兴趣、红包等）约{" "}
                  {Math.round(
                    (monthlyNeedDetail.foodBase ?? 0) +
                      (monthlyNeedDetail.travelBase ?? 0) +
                      (monthlyNeedDetail.hobbyBase ?? 0) +
                      (monthlyNeedDetail.giftBase ?? 0)
                  ).toLocaleString()}{" "}
                  元/月
                </li>
                <li>
                  梦想花费（牙齿维护、临终关怀、额外健康支出等摊销）约{" "}
                  {Math.round(
                    (monthlyNeedDetail.teethBase ?? 0) +
                      (monthlyNeedDetail.endOfLifeBase ?? 0) +
                      (monthlyNeedDetail.supplementBase ?? 0)
                  ).toLocaleString()}{" "}
                  元/月
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="mb-1 text-[11px] font-semibold text-slate-200">
              专业顾问可基于本报告，如何衔接保险方案？
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-slate-400">
              <li>
                用上图"年度资金缺口"曲线，对应
                <span className="font-semibold">年金险/养老年金</span>
                的年度现金流，讨论如何锁定基础养老现金流。
              </li>
              <li>
                用"梦想花费"与"晚辈红包"等部分，对接
                <span className="font-semibold">增额终身寿险</span>
                的长期增值与传承功能。
              </li>
              <li>
                若一次性可投入资金有限，可进一步引入
                <span className="font-semibold">杠杆终身寿险</span>
                ，以较小保费撬动更高保额，解决重疾、身故与传承安排。
              </li>
            </ul>
            <p className="mt-1 text-[11px] text-slate-400">
              本工具不涉及具体产品条款与收益演示，所有保险责任和利益以正式条款及精算演示为准。
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-[11px] font-semibold text-slate-200">
              下一步行动建议
            </p>
            <p className="text-[11px] text-slate-400">
              1）与专业顾问一对一沟通，基于当前缺口
              <span className="font-semibold">
                （约 {gap.toLocaleString()} 元）
              </span>
              ，共同确认可以接受的
              <span className="font-semibold">
                每年保费或每月储蓄金额
              </span>
              ；
            </p>
            <p className="text-[11px] text-slate-400">
              2）结合年金、养老年金、增额终身寿险与杠杆终身寿险，
              设计出一份覆盖"生存线 + 生活线 + 梦想线"的组合方案；
            </p>
            <p className="text-[11px] text-slate-400">
              3）每隔 2-3 年复盘一次本报告，随着收入、家庭结构和健康状况变化，动态微调养老蓝图。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
              >
                导出/打印养老报告
              </Button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          声明：本工具为养老测算辅助工具，所有结果仅供参考，不构成投资、理财或保险建议。
          具体保险责任、利益与风险请以正式条款与投保提示为准。
        </p>

        <div className="mt-3 flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            返回上一环节
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined" && navigator.share) {
                navigator
                  .share({
                    title: "我的养老蓝图与资金缺口",
                    text:
                      "我刚刚用一个工具测算了自己的养老缺口，你也可以来试一试，看看自己的养老准备够不够。",
                    url: window.location.href
                  })
                  .catch(() => undefined);
              }
            }}
          >
            生成"我的养老缺口"小卡片
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

