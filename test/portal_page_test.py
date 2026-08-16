import os
import sys
import time
import urllib.request

BASE = os.environ.get('PORTAL_BASE_URL', 'http://localhost:5174/data-asset-portal/')

def wait_ready():
    for _ in range(30):
        try:
            urllib.request.urlopen(BASE, timeout=2)
            return
        except Exception:
            time.sleep(1)
    raise SystemExit('portal dev server 未就绪')

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
        # 顶部 + 目录
        assert page.locator('.header-title h1').inner_text() == '数据资产门户'
        assert page.locator('.header button', has_text='资产管理').count() == 1
        assert page.locator('.asset-card').count() == 8
        # 分类导航筛选
        page.locator('.portal-cats button', has_text='海洋勘测').click()
        assert page.locator('.asset-card').count() == 2
        page.locator('.portal-cats button', has_text='全部').click()
        assert page.locator('.asset-card').count() == 8
        # 搜索（「地质钻孔」仅命中 pa_004 一条，验证搜索过滤；勿用「测风」——会同时命中 pa_001 名 + pa_002 描述共 2 条）
        page.locator('.portal-toolbar input').fill('地质钻孔')
        assert page.locator('.asset-card').count() == 1
        page.locator('.portal-toolbar input').fill('')
        # 详情 + 占位按钮
        page.locator('.asset-card').first.click()
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.detail-panel button', has_text='下载数据').count() >= 1
        page.locator('.detail-panel .link', has_text='返回目录').click()
        assert page.locator('.asset-card').count() == 8
        # 我的申请
        page.locator('.portal-nav button', has_text='我的申请').click()
        assert page.locator('.table tbody tr').count() == 4
        print('portal_page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
