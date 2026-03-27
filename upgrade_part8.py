import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新健康寿命弹窗内容
old_healthy_content = '''      case "healthyLife":
        return {
          title: "预期健康寿命：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-700">
              <p>
                "健康寿命"用于帮助您区分两个阶段：能较为独立生活的时间、
                与可能更需要照护/医疗支持的时间。本工具的健康寿命是假设值，
                用于测算养老方式与预算结构。
              </p>
              <p className="text-slate-600">参考出处（权威公开数据）：</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>
                  WHO（健康寿命/健康预期寿命等相关统计口径与数据入口）：
                  <a
                    className="ml-1 text-blue-700 underline underline-offset-2"
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
        };'''

new_healthy_content = '''      case "healthyLife":
        return {
          title: "预期健康寿命：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-700">
              <p>
                "健康寿命"用于帮助您区分两个阶段：能较为独立生活的时间、
                与可能更需要照护/医疗支持的时间。本工具的健康寿命是假设值，
                用于测算养老方式与预算结构。
              </p>
              {healthDetails && healthDetails.length > 0 && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="font-semibold text-emerald-800 mb-1">您的健康检测数据对健康寿命的影响：</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-emerald-700">
                    {healthDetails.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                  <p className="mt-2 text-[11px] text-emerald-700/80">
                    BMI、血压、腰围等指标不仅影响寿命长度，更直接影响晚年能否保持独立生活能力。
                  </p>
                </div>
              )}
              <p className="text-slate-600">参考出处（权威公开数据）：</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>
                  WHO（健康寿命/健康预期寿命等相关统计口径与数据入口）：
                  <a
                    className="ml-1 text-blue-700 underline underline-offset-2"
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
        };'''

content = content.replace(old_healthy_content, new_healthy_content)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 8 completed successfully")
