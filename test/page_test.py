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
        # 查看按钮 → 打开字段级元数据 tab
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.tab', has_text='测风数据表').count() == 1
        # 打开治理看板
        page.locator('.sidebar-item', has_text='数据治理看板').click()
        assert page.locator('.tab', has_text='数据治理看板').count() == 1
        # 占位模块
        page.locator('.sidebar-item', has_text='数据质量').click()
        assert page.locator('.placeholder').count() == 1
        assert page.locator('.badge-2nd').count() >= 1
        # 跨模块转跳：治理看板 → 定位字段 → 打开表详情 tab
        page.locator('.tab', has_text='数据治理看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='测风数据表').count() == 1
        assert page.locator('.field-table').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
