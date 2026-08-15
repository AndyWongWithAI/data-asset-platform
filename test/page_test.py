import os
import subprocess
import sys
import time
import urllib.request

BASE = os.environ.get('BASE_URL', 'http://localhost:5173')

def wait_ready():
    for _ in range(30):
        try:
            urllib.request.urlopen(BASE, timeout=2)
            return
        except Exception:
            time.sleep(1)
    raise SystemExit('dev server 未就绪')

def click_menu(page, title):
    """精确点击侧边栏菜单项（exact=True 规避『数据质量』vs『数据质量看板』、『数据标准』vs『数据标准看板』子串冲突）"""
    page.get_by_role('button', name=title, exact=True).click()

def assert_no_hscroll(page):
    """表格撑满容器宽度且无横向溢出（自适应）"""
    r = page.evaluate("""() => {
      const panel = document.querySelector('.tab-panel');
      return {
        panel: panel ? panel.scrollWidth - panel.clientWidth : 0,
        body: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    }""")
    assert r['body'] <= 1, f"页面横向溢出 {r['body']}px"
    assert r['panel'] <= 1, f"工作区横向溢出 {r['panel']}px"

def assert_table_fills(page):
    """表格宽度跟踪容器宽度（非固定窄宽）"""
    r = page.evaluate("""() => {
      const t = document.querySelector('.table');
      const parent = t ? t.parentElement : null;
      if (!t || !parent) return { parent: 0, table: 0 };
      return { parent: parent.clientWidth, table: t.getBoundingClientRect().width };
    }""")
    assert r['table'] >= r['parent'] - 4, f"表格未撑满容器：table {r['table']}px vs 容器 {r['parent']}px"

def main():
    wait_ready()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('需安装 playwright：pip install playwright && playwright install chromium')
        sys.exit(2)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(BASE)
        # 壳
        assert page.locator('.sidebar').count() == 1
        assert page.locator('.header').count() == 1
        # 三个大分组可折叠/展开
        assert page.locator('.sidebar-group-dir').count() == 3
        page.locator('.sidebar-group-dir', has_text='设计态·定义').click()
        assert page.locator('.sidebar-item', has_text='结构化元数据').count() == 0
        page.locator('.sidebar-group-dir', has_text='设计态·定义').click()
        assert page.locator('.sidebar-item', has_text='结构化元数据').count() == 1
        # 打开资产目录
        click_menu(page, '结构化元数据')
        assert page.locator('.tab', has_text='结构化元数据').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        # 检索区分：应用/业务域下拉 + 表名输入
        assert page.locator('.search-bar select').count() == 2
        assert page.locator('.search-bar input').count() == 1
        # 表粒度清单自适应：撑满 + 无横向溢出
        assert_table_fills(page)
        assert_no_hscroll(page)
        # 查看按钮 → 打开表详情（默认表级元数据 tab，五子 tab）
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab', has_text='测风数据表').count() == 1
        assert page.locator('.sub-tabs button').count() == 5
        assert page.locator('.detail-head').count() == 1
        assert page.locator('.field-table').count() == 0
        # 切到「字段元数据」子 tab
        page.locator('.sub-tabs button', has_text='字段元数据').click()
        assert page.locator('.field-table').count() == 1
        # 字段粒度清单自适应
        assert_table_fills(page)
        assert_no_hscroll(page)
        # 窄视口下仍自适应（字段详情为最宽表）
        page.set_viewport_size({'width': 900, 'height': 700})
        assert_table_fills(page)
        assert_no_hscroll(page)
        # 恢复常规视口
        page.set_viewport_size({'width': 1280, 'height': 720})
        # 打开数据质量看板（生产态）
        click_menu(page, '数据质量看板')
        assert page.locator('.tab', has_text='数据质量看板').count() == 1
        # M2 数据质量
        click_menu(page, '数据质量')
        assert page.locator('.tab.active', has_text='数据质量').count() == 1
        assert page.locator('.table tbody tr').count() >= 8
        # 新增规则 → 表单弹窗 → 取消关闭
        page.locator('button', has_text='新增规则').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 点规则进详情 → 定位字段转跳 M1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='规则详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .link', has_text='定位').click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='SCADA 遥测表').count() == 1
        # M3 数据标准（可收缩目录：父级「数据标准」含 4 子项）
        # 侧边栏折叠目录：点「数据标准」父级 toggle 折叠/展开子项
        assert page.locator('.sidebar-sub', has_text='基础术语').count() == 1   # 默认展开
        page.locator('.sidebar-dir', has_text='数据标准').click()
        assert page.locator('.sidebar-sub', has_text='基础术语').count() == 0   # 折叠后不可见
        page.locator('.sidebar-dir', has_text='数据标准').click()
        assert page.locator('.sidebar-sub', has_text='基础术语').count() == 1   # 再点展开
        # 基础术语（无下钻）
        click_menu(page, '基础术语')
        assert page.locator('.tab.active', has_text='基础术语').count() == 1
        assert page.locator('.table tbody tr').count() >= 20
        page.locator('button', has_text='新增术语').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 去下钻：点中文名第一列后仍无 .detail-panel
        page.locator('.table tbody tr').first.locator('td').first.click()
        assert page.locator('.detail-panel').count() == 0
        # 值域
        click_menu(page, '值域')
        assert page.locator('.tab.active', has_text='值域').count() == 1
        assert page.locator('.table tbody tr').count() >= 6
        page.locator('button', has_text='新增值域').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='值域详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        # 被引用信息项中文名 → 信息项详情 tab（ii_voltage 电压等级编码）
        page.locator('.detail-panel table tbody tr .link', has_text='电压等级编码').click()
        assert page.locator('.tab.active', has_text='信息项详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='电压等级编码').count() == 1
        # 参考数据
        click_menu(page, '参考数据')
        assert page.locator('.tab.active', has_text='参考数据').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('button', has_text='新增参考数据').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='参考数据详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        # 被引用信息项中文名 → 信息项详情 tab（ii_voltage 电压等级编码）
        page.locator('.detail-panel table tbody tr .link', has_text='电压等级编码').click()
        assert page.locator('.tab.active', has_text='信息项详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='电压等级编码').count() == 1
        # 信息项
        click_menu(page, '信息项')
        assert page.locator('.tab.active', has_text='信息项').count() == 1
        assert page.locator('.table tbody tr').count() >= 10
        assert page.locator('.table thead th', has_text='类型').count() == 1   # 列表含「类型」列
        page.locator('button', has_text='新增信息项').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 点信息项进详情（第一条 ii_voltage 电压等级编码）→ 无词根链 + 类型/业务域/定义 + 被引用字段转跳 M1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='信息项详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.term-chain').count() == 0
        assert page.locator('.detail-panel h4', has_text='英文名映射').count() == 0   # 英文名映射块已删，英文名=词根拼接直接展示
        assert page.locator('.detail-panel', has_text='类型').count() >= 1
        assert page.locator('.detail-panel', has_text='业务域').count() >= 1
        assert page.locator('.detail-panel', has_text='定义').count() >= 1
        page.locator('.detail-panel .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='海缆参数表').count() == 1
        # 值域跳转：信息项详情点「值域」→ 值域详情 tab（ii_voltage 值域=VD-VARCHAR10）
        page.locator('.tab', has_text='信息项详情').click()
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .kv-list .link', has_text='VD-VARCHAR10').click()
        assert page.locator('.tab.active', has_text='值域详情').count() == 1
        assert page.locator('.detail-panel', has_text='VD-VARCHAR10').count() >= 1
        # 参考数据跳转：信息项详情「参考数据」→ 参考数据详情 tab（ii_voltage 参考数据=电压等级）
        page.locator('.tab', has_text='信息项详情').click()
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .kv-list .link', has_text='电压等级').click()
        assert page.locator('.tab.active', has_text='参考数据详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='电压等级').count() == 1
        # 关联标准转跳（需求 5）：M1 资产目录 → 测风数据表「查看」→ 点「关联标准」→ 信息项详情
        click_menu(page, '结构化元数据')
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('.table tbody tr', has_text='测风数据表').locator('.link', has_text='查看').click()
        page.locator('.sub-tabs button', has_text='字段元数据').click()
        assert page.locator('.field-table').count() == 1
        page.locator('.field-table tbody tr', has_text='风速值').locator('.link', has_text='II0008').click()
        assert page.locator('.tab.active', has_text='信息项详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.detail-panel h3', has_text='风速值').count() == 1
        assert page.locator('.detail-panel h3', has_text='电压等级编码').count() == 0
        # 关联规则跳转：字段明细「关联规则」列 → 具体规则详情
        click_menu(page, '结构化元数据')
        page.locator('.table tbody tr', has_text='测风数据表').locator('.link', has_text='查看').click()
        page.locator('.sub-tabs button', has_text='字段元数据').click()
        assert page.locator('.field-table').count() == 1
        page.locator('.field-table tbody tr', has_text='风速值').locator('.link', has_text='测风风速取值越界').click()
        assert page.locator('.tab.active', has_text='规则详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='测风风速取值越界').count() == 1
        # M4 数据安全分级
        click_menu(page, '数据安全')
        assert page.locator('.tab', has_text='数据安全').count() == 1
        assert page.locator('.score-row').count() >= 4   # L1-L4 分级总览
        page.locator('.score-row .link', has_text='调整').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        # 切到高风险清单 → 定位字段转跳 M1
        page.locator('.sub-tabs button', has_text='高风险清单').click()
        assert page.locator('.table tbody tr').count() >= 1
        page.locator('.table tbody tr .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='地质钻孔表').count() == 1
        # 切到脱敏前后对比（定位转跳 M1 后需先回到数据安全模块）
        click_menu(page, '数据安全')
        page.locator('.sub-tabs button', has_text='脱敏前后对比').click()
        assert page.locator('.table tbody tr').count() >= 4
        # M5 主数据管理（同步占位，不可新增；清单 5 列 + 详情三 tab）
        click_menu(page, '主数据')
        assert page.locator('.tab', has_text='主数据').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        assert page.locator('.table thead th', has_text='资产编码').count() == 1
        assert page.locator('.table thead th', has_text='中文名').count() == 1
        assert page.locator('.table thead th', has_text='业务定义').count() == 1
        assert page.locator('.table thead th', has_text='业务规则').count() == 1
        assert page.locator('.table thead th', has_text='数据Owner').count() == 1
        page.on('dialog', lambda d: d.accept())
        page.locator('button', has_text='同步').click()
        # 点资产编码进详情 → 默认「首页」tab（资产级元数据）
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='主数据详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.sub-tabs button').count() == 3   # 三 tab：首页/引用详情/审批记录
        assert page.locator('.detail-panel', has_text='业务定义').count() >= 1
        assert page.locator('.detail-panel', has_text='业务规则').count() >= 1
        assert page.locator('.detail-panel', has_text='数据 Owner').count() >= 1
        # 切到「审批记录」→ 审批表存在
        page.locator('.sub-tabs button', has_text='审批记录').click()
        assert page.locator('.detail-panel table', has_text='审批人').count() >= 1
        # 切到「引用详情」→ 定位字段转跳 M1
        page.locator('.sub-tabs button', has_text='引用详情').click()
        page.locator('.detail-panel .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='风机设备表').count() == 1

        # ① 数据质量看板（生产态）
        click_menu(page, '数据质量看板')
        assert page.locator('.tab', has_text='数据质量看板').count() == 1
        assert page.locator('.score-row').count() >= 2
        # ② 数据标准看板（生产态）+ 贯标对齐判定（需求 6）
        click_menu(page, '数据标准看板')
        assert page.locator('.tab', has_text='数据标准看板').count() == 1
        assert page.locator('.score-row').count() >= 1
        assert page.locator('.score-info', has_text='已贯').count() == 1   # 贯标率（约 12%）
        assert page.locator('.table', has_text='名称未对齐').count() >= 1  # 应贯未贯明细含原因列
        assert page.locator('.table', has_text='无关联标准').count() >= 1
        # ③ 数据血缘看板（列表 + UML 血缘图 + 字段级一级/N级交互 + 节点转跳）
        click_menu(page, '数据血缘看板')
        assert page.locator('.tab', has_text='数据血缘看板').count() == 1
        assert page.locator('.table tbody tr').count() >= 10
        page.locator('.table tbody tr .link', has_text='查看血缘图').first.click()
        # 表级视图：类框 + 表级线默认蓝色（无 is-dimmed）
        assert page.locator('.lineage-table-box').count() >= 2
        assert page.locator('.lineage-edge-table').count() >= 1
        assert page.locator('.lineage-edge-table.is-dimmed').count() == 0
        # 交换方式标注在连线上
        assert page.locator('.lineage-edge-mode').count() >= 1
        # 一级：点中心表「风速」字段 → 表级线变灰 + 字段级线出现
        page.locator('.lineage-field-row', has_text='风速').first.click()
        assert page.locator('.lineage-edge-table.is-dimmed').count() >= 1
        assert page.locator('.lineage-edge-field').count() == 1
        # 再点同字段 → 清空回表级视图
        page.locator('.lineage-field-row', has_text='风速').first.click()
        assert page.locator('.lineage-edge-field').count() == 0
        assert page.locator('.lineage-edge-table.is-dimmed').count() == 0
        # N 级：返回列表，进 t_scada 画布，点上游表字段「主数据编码」→ 字段级线延伸 ≥ 2 条
        page.locator('button', has_text='返回列表').click()
        page.locator('.table tbody tr', has_text='SCADA 遥测表').locator('.link', has_text='查看血缘图').click()
        page.locator('.lineage-field-row', has_text='主数据编码').first.click()
        assert page.locator('.lineage-edge-field').count() >= 2
        # 清空
        page.locator('.lineage-field-row', has_text='主数据编码').first.click()
        assert page.locator('.lineage-edge-field').count() == 0
        # 点表名条 → 转跳 M1 表详情（默认表级元数据）
        page.locator('.table-title-hitbox').first.click()
        assert page.locator('.detail-head').count() == 1
        # ④ 元数据比对（生产态差异清单，只读）
        click_menu(page, '元数据比对')
        assert page.locator('.tab', has_text='元数据比对').count() == 1
        # 5 个计数卡片
        for label in ['未登记表', '疑似下线表', '未登记字段', '疑似下线字段', '漂移字段']:
            assert page.locator('.stat-card', has_text=label).count() == 1, f'缺计数卡片 {label}'
        # 表级差异明细：未登记表 scada_alarm_raw
        assert page.locator('.table tbody tr', has_text='scada_alarm_raw').count() == 1
        # 字段级差异明细：漂移字段 active_power_value
        assert page.locator('.table tbody tr', has_text='active_power_value').count() == 1
        # 只读：无写操作按钮
        assert page.locator('button', has_text='新增').count() == 0
        # ⑤ 文件交换（列表 + 详情 + 审批链 + 源表转跳 + 占位）
        click_menu(page, '文件交换')
        assert page.locator('.tab', has_text='文件交换').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        # 方向列 + 库级字段（入站任务展示库名）
        assert page.locator('.table thead th', has_text='方向').count() == 1
        assert page.locator('.table thead th', has_text='源系统 · 源对象').count() == 1
        assert page.locator('.table thead th', has_text='目标系统 · 目标对象').count() == 1
        assert page.locator('.table tbody tr', has_text='出站').count() == 5
        assert page.locator('.table tbody tr', has_text='入站').count() == 3
        assert page.locator('.table tbody tr', has_text='scada_telemetry_db').count() == 1
        page.locator('button', has_text='发起交换申请').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='文件交换详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.flow-step').count() >= 3
        page.locator('.detail-panel .link', has_text='查看').click()
        assert page.locator('.detail-head').count() == 1   # 表详情默认表级元数据
        assert page.locator('.row-active').count() == 0   # 表详情非字段定位，无高亮
        # 入站详情：库级字段 + 生产元数据快照 + 转跳结构化元数据目录
        click_menu(page, '文件交换')
        page.locator('.table tbody tr', has_text='SCADA遥测数据接入').locator('.link').click()
        assert page.locator('.tab.active', has_text='文件交换详情').count() == 1
        assert page.locator('.detail-panel', has_text='源库').count() == 1
        assert page.locator('.detail-panel', has_text='scada_telemetry_db').count() == 1
        assert page.locator('.detail-panel', has_text='生产元数据快照').count() == 1
        assert page.locator('.detail-panel', has_text='scada_alarm_raw').count() == 1
        page.locator('.detail-panel .link', has_text='查看目录').click()
        assert page.locator('.tab.active', has_text='结构化元数据').count() == 1
        # ⑥ 数据服务（列表 + 详情 + 审批链 + 封装资产转跳 + 占位）
        click_menu(page, '数据服务')
        assert page.locator('.tab', has_text='数据服务').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('.table tbody tr button', has_text='申请/订阅').first.click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='数据服务详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.flow-step').count() >= 3
        page.locator('.detail-panel .link', has_text='查看').first.click()
        assert page.locator('.detail-head').count() == 1

        # 跨模块转跳：质量看板 → 定位字段 → 打开表详情 tab
        page.locator('.tab', has_text='数据质量看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='测风数据表').count() == 1
        assert page.locator('.field-table').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
