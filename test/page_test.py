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
        # 打开资产目录
        click_menu(page, '数据资产目录')
        assert page.locator('.tab', has_text='数据资产目录').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        # 检索区分：应用/业务域下拉 + 表名输入
        assert page.locator('.search-bar select').count() == 2
        assert page.locator('.search-bar input').count() == 1
        # 表粒度清单自适应：撑满 + 无横向溢出
        assert_table_fills(page)
        assert_no_hscroll(page)
        # 查看按钮 → 打开字段级元数据 tab
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.tab', has_text='测风数据表').count() == 1
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
        # 占位按钮 → 弹框 → 关闭
        page.locator('button', has_text='新增规则').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        assert page.locator('.modal').count() == 0
        # 点规则进详情 → 定位字段转跳 M1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .link', has_text='定位').click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='SCADA 遥测表').count() == 1
        # M3 数据标准
        click_menu(page, '数据标准')
        assert page.locator('.tab.active', has_text='数据标准').count() == 1
        assert page.locator('.table tbody tr').count() >= 6
        page.locator('button', has_text='新增标准').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        # 点标准进详情（第一条码表）→ 被引用字段转跳 M1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='海缆参数表').count() == 1
        # M4 数据安全分级
        click_menu(page, '数据安全')
        assert page.locator('.tab', has_text='数据安全').count() == 1
        assert page.locator('.score-row').count() >= 4   # L1-L4 分级总览
        page.locator('button', has_text='分级调整').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
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
        # M5 主数据管理
        click_menu(page, '主数据')
        assert page.locator('.tab', has_text='主数据').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('button', has_text='新增实体').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        # 点实体进详情 → 被引用字段转跳 M1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.detail-panel').count() == 1
        page.locator('.detail-panel .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        assert page.locator('.tab.active', has_text='风机设备表').count() == 1

        # ① 数据质量看板（生产态）
        click_menu(page, '数据质量看板')
        assert page.locator('.tab', has_text='数据质量看板').count() == 1
        assert page.locator('.score-row').count() >= 2
        # ② 数据标准看板（生产态）
        click_menu(page, '数据标准看板')
        assert page.locator('.tab', has_text='数据标准看板').count() == 1
        assert page.locator('.score-row').count() >= 1
        # ③ 数据血缘看板（列表 + UML 血缘图 + 字段级交互 + 节点转跳）
        click_menu(page, '数据血缘看板')
        assert page.locator('.tab', has_text='数据血缘看板').count() == 1
        assert page.locator('.table tbody tr').count() >= 10
        page.locator('.table tbody tr .link', has_text='查看血缘图').first.click()
        # 表级视图：类框 + 表级线默认蓝色（无 is-dimmed）
        assert page.locator('.lineage-table-box').count() >= 2
        assert page.locator('.lineage-edge-table').count() >= 1
        assert page.locator('.lineage-edge-table.is-dimmed').count() == 0
        # 交换方式标注在连线上（离线批次或数据服务至少一种 mode 标注存在）
        assert page.locator('.lineage-edge-mode').count() >= 1
        # 点中心表「风速」字段 → 表级线变灰 + 字段级线出现
        page.locator('.lineage-field-row', has_text='风速').first.click()
        assert page.locator('.lineage-edge-table.is-dimmed').count() >= 1
        assert page.locator('.lineage-edge-field').count() >= 1
        # 再点同字段 → 清空回表级视图
        page.locator('.lineage-field-row', has_text='风速').first.click()
        assert page.locator('.lineage-edge-field').count() == 0
        assert page.locator('.lineage-edge-table.is-dimmed').count() == 0
        # 点表名条 → 转跳 M1 表详情
        page.locator('.table-title-hitbox').first.click()
        assert page.locator('.field-table').count() == 1
        # ④ 批次文件（列表 + 详情 + 审批链 + 源表转跳 + 占位）
        click_menu(page, '批次文件')
        assert page.locator('.tab', has_text='批次文件').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('button', has_text='发起交换申请').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.flow-step').count() >= 3
        page.locator('.detail-panel .link', has_text='查看源表').click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 0   # 表详情非字段定位，无高亮
        # ⑤ 数据服务（列表 + 详情 + 审批链 + 封装资产转跳 + 占位）
        click_menu(page, '数据服务')
        assert page.locator('.tab', has_text='数据服务').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        page.locator('button', has_text='发起服务申请').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.flow-step').count() >= 3
        page.locator('.detail-panel .link', has_text='查看').first.click()
        assert page.locator('.field-table').count() == 1

        # 跨模块转跳：质量看板 → 定位字段 → 打开表详情 tab
        page.locator('.tab', has_text='数据质量看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='测风数据表').count() == 1
        assert page.locator('.field-table').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
