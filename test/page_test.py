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
        page.locator('.sidebar-item', has_text='数据资产目录').click()
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
        # 打开治理看板
        page.locator('.sidebar-item', has_text='数据治理看板').click()
        assert page.locator('.tab', has_text='数据治理看板').count() == 1
        # M2 数据质量
        page.locator('.sidebar-item', has_text='数据质量').click()
        assert page.locator('.tab', has_text='数据质量').count() == 1
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
        page.locator('.sidebar-item', has_text='数据标准').click()
        assert page.locator('.tab', has_text='数据标准').count() == 1
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
        page.locator('.sidebar-item', has_text='数据安全').click()
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
        page.locator('.sidebar-item', has_text='数据安全').click()
        page.locator('.sub-tabs button', has_text='脱敏前后对比').click()
        assert page.locator('.table tbody tr').count() >= 4
        # M5 主数据管理
        page.locator('.sidebar-item', has_text='主数据').click()
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
        # 跨模块转跳：治理看板 → 定位字段 → 打开表详情 tab
        page.locator('.tab', has_text='数据治理看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='测风数据表').count() == 1
        assert page.locator('.field-table').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
