import re

# 读取文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 更新预期寿命弹窗内容
old_life_content = '''      case "life":
        return {
          title: "预期寿命假设：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-700">
              <p>
                本工具展示的"预期寿命"用于做养老规划的情景假设，
                口径参考国际通用的<strong>Life expectancy at birth</strong>等统计指标，
                并结合您选择的生活习惯做简化修正，便于唤起对"长寿风险"的直观感受。
              </p>
              <p className="text-slate-600">
                参考出处（权威公开数据）：
              </p>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>
                  WHO Global Health Observatory（预期寿命相关指标说明与数据入口）：
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
                提示：实际寿命受遗传、既往病史、医疗可及性、意外风险等影响，
                本工具仅用于规划讨论，不作为医学或精算结论。
              </p>
            </div>
          )
        };'''

new_life_content = '''      case "life":
        return {
          title: "预期寿命假设：数据口径与出处",
          body: (
            <div className="space-y-2 text-[12px] text-slate-700">
              <p>
                本工具展示的"预期寿命"用于做养老规划的情景假设，
                口径参考国际通用的<strong>Life expectancy at birth</strong>等统计指标，
                并结合您选择的生活习惯及健康检测数据做简化修正。
              </p>
              {healthDetails && healthDetails.length > 0 && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <p className="font-semibold text-blue-800 mb-1">您的健康检测数据对预期寿命的影响：</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-blue-700">
                    {healthDetails.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
              <p className="text-slate-600">
                参考出处（权威公开数据）：
              </p>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>
                  WHO Global Health Observatory：
                  <a className="ml-1 text-blue-700 underline underline-offset-2" href="https://www.who.int/data/gho" target="_blank" rel="noreferrer">https://www.who.int/data/gho</a>
                </li>
                <li>Lancet 2016：全球BMI与死亡率研究</li>
                <li>Framingham Heart Study：血压与心血管风险</li>
                <li>JAMA Cardiology 2019：静息心率与全因死亡率</li>
                <li>WHO / Circulation 2019：腰围与中心性肥胖</li>
              </ul>
              <p className="text-[11px] text-slate-500">
                提示：实际寿命受遗传、既往病史、医疗可及性、意外风险等影响，
                本工具仅用于规划讨论，不作为医学或精算结论。
              </p>
            </div>
          )
        };'''

content = content.replace(old_life_content, new_life_content)

# 保存文件
with open(r'C:\Users\haosh\Documents\trae_projects\retirement-gap-calculator\src\app\retirement\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Part 7 completed successfully")
