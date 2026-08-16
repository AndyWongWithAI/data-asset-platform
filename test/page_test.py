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
        # 顶部标题只保留「数据资产管理平台」
        assert page.locator('.header-title h1').inner_text() == '数据资产管理平台'
        assert page.locator('.header-subtitle').count() == 0
        # 三个大分组可折叠/展开
        assert page.locator('.sidebar-group-dir').count() == 3
        assert page.locator('.sidebar-group-dir', has_text='系统管理').count() == 1
        page.locator('.sidebar-group-dir', has_text='设计态·定义').click()
        assert page.locator('.sidebar-item', has_text='表结构').count() == 0
        page.locator('.sidebar-group-dir', has_text='设计态·定义').click()
        assert page.locator('.sidebar-item', has_text='表结构').count() == 1
        # 侧边栏搜索框：按目录名过滤
        search = page.locator('.sidebar-search input')
        search.fill('文件')
        assert page.locator('.sidebar-sub', has_text='文件交换').count() == 1
        assert page.locator('.sidebar-sub', has_text='数据服务').count() == 0
        assert page.locator('.sidebar-item', has_text='表结构').count() == 0
        search.fill('数据交换')
        assert page.locator('.sidebar-sub', has_text='文件交换').count() == 1
        assert page.locator('.sidebar-sub', has_text='数据服务').count() == 1
        search.fill('不存在的目录')
        assert page.locator('.sidebar-empty').count() == 1
        search.fill('')
        assert page.locator('.sidebar-item', has_text='表结构').count() == 1
        # 打开资产目录
        click_menu(page, '表结构')
        assert page.locator('.tab', has_text='表结构').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        # 检索区分：应用/业务域下拉 + 表名输入
        assert page.locator('.search-bar select').count() == 2
        assert page.locator('.search-bar input').count() == 1
        # 表粒度清单自适应：撑满 + 无横向溢出
        assert_table_fills(page)
        assert_no_hscroll(page)
        # 表结构 新建 + 批量导入（真写入口，非「开发中」占位）
        page.locator('button', has_text='新增表').click()
        assert page.locator('.modal-lg').count() == 1
        assert page.locator('.modal h3', has_text='新增表').count() == 1
        assert page.locator('.modal label', has_text='主题域').count() == 1  # cascadeRef 主题域随业务域联动
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal-lg').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
        assert page.locator('.modal').count() == 0
        # 表结构 编辑（真写入口，非「开发中」占位）
        page.locator('.table tbody tr', has_text='测风数据表').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal h3', has_text='编辑表').count() == 1
        assert page.locator('.modal label', has_text='主题域').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
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
        # 字段编辑（真写入口）
        page.locator('.field-table tbody tr', has_text='风速值').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal h3', has_text='编辑字段').count() == 1
        assert page.locator('.modal label', has_text='字段中文名').count() == 1
        assert page.locator('.modal label', has_text='安全分级').count() == 1
        assert page.locator('.modal label', has_text='关联数据安全分类').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 字段新增 + 批量导入（真写入口）
        page.locator('button', has_text='新增字段').click()
        assert page.locator('.modal h3', has_text='新增字段').count() == 1
        assert page.locator('.modal label', has_text='字段编码').count() == 1
        assert page.locator('.modal label', has_text='所属表').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal-lg').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
        assert page.locator('.modal').count() == 0
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
        # 十七期：质量规则 编辑 + 批量导入
        # 编辑 → 表单弹窗（.modal-lg）→ 取消
        page.locator('.table tbody tr', has_text='有功功率取值范围').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 批量导入 → 弹窗（含「下载模板」）→ 关闭
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
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
        # 数据交换（设计态下二级目录：父级「数据交换」含 文件交换/数据服务 2 子项）
        assert page.locator('.sidebar-sub', has_text='文件交换').count() == 1   # 默认展开
        page.locator('.sidebar-dir', has_text='数据交换').click()
        assert page.locator('.sidebar-sub', has_text='文件交换').count() == 0   # 折叠后不可见
        page.locator('.sidebar-dir', has_text='数据交换').click()
        assert page.locator('.sidebar-sub', has_text='文件交换').count() == 1   # 再点展开
        # 基础术语（无下钻）
        click_menu(page, '基础术语')
        assert page.locator('.tab.active', has_text='基础术语').count() == 1
        assert page.locator('.table tbody tr').count() >= 20
        page.locator('button', has_text='新增术语').click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 十七期：基础术语 编辑 + 批量导入
        # 编辑 → 表单弹窗（.modal-lg）→ 取消
        page.locator('.table tbody tr', has_text='名称').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 批量导入 → 弹窗（含「下载模板」）→ 关闭
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
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
        # 十七期：值域 编辑 + 批量导入
        # 编辑 → 表单弹窗（.modal-lg）→ 取消
        page.locator('.table tbody tr', has_text='VD-VARCHAR10').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 批量导入 → 弹窗（含「下载模板」）→ 关闭
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
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
        # 十七期：参考数据 编辑 + 批量导入
        # 编辑 → 表单弹窗（.modal-lg）→ 取消
        page.locator('.table tbody tr', has_text='电压等级').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 批量导入 → 弹窗（含「下载模板」）→ 关闭
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
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
        # 十七期：信息项 编辑 + 批量导入
        # 编辑 → 表单弹窗（.modal-lg）→ 取消
        page.locator('.table tbody tr', has_text='II0001').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        assert page.locator('.modal').count() == 0
        # 批量导入 → 弹窗（含「下载模板」）→ 关闭
        page.locator('button', has_text='批量导入').click()
        assert page.locator('.modal').count() == 1
        assert page.locator('.modal button', has_text='下载模板').count() == 1
        page.locator('.modal button', has_text='关闭').click()
        assert page.locator('.modal').count() == 0
        # 信息项编辑：中文名只读（derived-value 而非 input）
        page.locator('.table tbody tr', has_text='II0001').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal-lg').count() == 1
        assert page.locator('.modal .derived-value', has_text='电压等级编码').count() == 1
        page.locator('.modal button', has_text='取消').click()
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
        click_menu(page, '表结构')
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
        click_menu(page, '表结构')
        page.locator('.table tbody tr', has_text='测风数据表').locator('.link', has_text='查看').click()
        page.locator('.sub-tabs button', has_text='字段元数据').click()
        assert page.locator('.field-table').count() == 1
        page.locator('.field-table tbody tr', has_text='风速值').locator('.link', has_text='测风风速取值越界').click()
        assert page.locator('.tab.active', has_text='规则详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='测风风速取值越界').count() == 1
        # M4 数据安全分级（十四期：分级总览 + 分类目录 + 分类详情下钻）
        click_menu(page, '数据安全')
        assert page.locator('.tab', has_text='数据安全').count() == 1
        assert page.locator('.score-row').count() >= 4   # L1-L4 分级总览
        page.locator('.score-row .link', has_text='调整').first.click()
        assert page.locator('.modal-lg').count() == 1
        page.locator('.modal button', has_text='取消').click()
        # 分级总览「查看定位」→ 安全分级详情（按级定位：L3 同时含继承/自定义升级来源）
        page.locator('.score-row', has_text='L3 · 敏感').locator('.link', has_text='查看定位').click()
        assert page.locator('.tab.active', has_text='安全分级详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        assert page.locator('.detail-panel table tbody tr').count() >= 1
        assert page.locator('.detail-panel .tag', has_text='继承').count() >= 1
        assert page.locator('.detail-panel .tag', has_text='自定义升级').count() >= 1
        # 点回侧边栏「数据安全」→ 点子 tab「分类目录」→ 四列+操作表格（无定位列）+ 一级分类下拉筛选
        click_menu(page, '数据安全')
        page.locator('.sub-tabs button', has_text='分类目录').click()
        assert page.locator('.table thead th', has_text='一级分类').count() == 1
        assert page.locator('.table thead th', has_text='二级分类').count() == 1
        assert page.locator('.table thead th', has_text='数据类型').count() == 1
        assert page.locator('.table thead th', has_text='数据分级').count() == 1
        assert page.locator('.table thead th', has_text='操作').count() == 1
        assert page.locator('.table thead th', has_text='定位').count() == 0   # 定位列已删
        assert page.locator('.table tbody tr').count() == 13
        assert page.locator('.search-bar select').count() == 1
        # 二十期：分类目录 新增/编辑/停用（真写入口，非「开发中」占位）
        page.locator('button', has_text='新增分类').click()
        assert page.locator('.modal h3', has_text='新增数据安全分类').count() == 1
        assert page.locator('.modal label', has_text='一级分类').count() == 1
        assert page.locator('.modal label', has_text='二级分类').count() == 1
        page.locator('.modal button', has_text='取消').click()
        page.locator('.table tbody tr', has_text='测风数据').locator('button', has_text='编辑').first.click()
        assert page.locator('.modal h3', has_text='编辑数据安全分类').count() == 1
        page.locator('.modal button', has_text='取消').click()
        # 状态列 + 停用/启用切换（可逆不物理删）
        assert page.locator('.table thead th', has_text='状态').count() == 1
        assert page.locator('.table tbody tr', has_text='测风数据').locator('button', has_text='停用').count() == 1
        # 分类目录「海底地形测绘数据」查看明细 → 数据安全分类详情（扁平字段列表：表名/字段中文名/字段英文名/字段安全分级来源/操作，5 字段）
        page.locator('.table tbody tr', has_text='海底地形测绘数据').locator('.link', has_text='查看明细').click()
        assert page.locator('.tab.active', has_text='数据安全分类详情').count() == 1
        assert page.locator('.detail-panel').count() == 1
        for col in ['表名', '字段中文名', '字段英文名', '字段安全分级来源', '操作']:
            assert page.locator('.detail-panel thead th', has_text=col).count() == 1, f'缺表头 {col}'
        assert page.locator('.detail-panel table tbody tr').count() == 5   # 5 个定位字段
        assert page.locator('.detail-panel', has_text='所属项目').count() == 0   # 不含主数据引用字段
        assert page.locator('.detail-panel .tag', has_text='继承').count() >= 1
        # 分类详情「定位」→ 字段级高亮转跳 M1
        page.locator('.detail-panel table tbody tr .link', has_text='定位').first.click()
        assert page.locator('.field-table').count() == 1
        assert page.locator('.row-active').count() == 1
        # 字段元数据「安全分级」列反向转跳：水深 → 海底地形测绘数据分类详情
        click_menu(page, '表结构')
        page.locator('.table tbody tr', has_text='海底地形测绘表').locator('.link', has_text='查看').click()
        page.locator('.sub-tabs button', has_text='字段元数据').click()
        assert page.locator('.field-table').count() == 1
        page.locator('.field-table tbody tr', has_text='水深').locator('.link', has_text='海底地形测绘数据').click()
        assert page.locator('.tab.active', has_text='数据安全分类详情').count() == 1
        assert page.locator('.detail-panel h3', has_text='海底地形测绘数据').count() == 1
        # M5 主数据管理（同步占位，不可新增；清单 5 列 + 详情三 tab）
        click_menu(page, '主数据')
        assert page.locator('.tab', has_text='主数据').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        assert page.locator('.table thead th', has_text='资产编码').count() == 1
        assert page.locator('.table thead th', has_text='中文名').count() == 1
        assert page.locator('.table thead th', has_text='业务定义').count() == 1
        assert page.locator('.table thead th', has_text='业务规则').count() == 1
        assert page.locator('.table thead th', has_text='数据Owner').count() == 1
        page.locator('button', has_text='同步').click()
        assert page.locator('.modal').count() == 1
        page.locator('.modal button', has_text='知道了').click()
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
        # 应用维度贯标率 + 明细表表头（应用名称/表名称/字段名称/原因/操作，无安全分级）
        assert page.locator('h3', has_text='应用维度贯标率').count() == 1
        assert page.locator('th', has_text='应用名称').count() == 2  # 应用维度表 + 明细表各一列
        assert page.locator('th', has_text='表名称').count() == 1
        assert page.locator('th', has_text='字段名称').count() == 1
        # ③ 元数据比对（生产态差异清单，只读）
        click_menu(page, '元数据比对')
        assert page.locator('.tab', has_text='元数据比对').count() == 1
        assert page.locator('h3', has_text='企业整体生产元数据情况').count() == 1
        # 5 个计数卡片
        for label in ['未登记表', '疑似下线表', '未登记字段', '疑似下线字段', '漂移字段']:
            assert page.locator('.stat-card', has_text=label).count() == 1, f'缺计数卡片 {label}'
        # 表级差异明细：未登记表 scada_alarm_raw
        assert page.locator('.table tbody tr', has_text='scada_alarm_raw').count() == 1
        # 字段级差异明细：漂移字段 active_power_value
        assert page.locator('.table tbody tr', has_text='active_power_value').count() == 1
        # 只读：无写操作按钮（范围限定工作区，排除侧边栏「门户资产新增」导航项）
        assert page.locator('.tab-panel button', has_text='新增').count() == 0
        # ④ 文件交换（列表 + 详情 + 审批链 + 源表转跳 + 占位）
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
        # 入站详情：库级字段 + 生产元数据快照 + 转跳表结构目录
        click_menu(page, '文件交换')
        page.locator('.table tbody tr', has_text='SCADA遥测数据接入').locator('.link').first.click()
        assert page.locator('.tab.active', has_text='文件交换详情').count() == 1
        assert page.locator('.detail-panel', has_text='源库').count() == 1
        assert page.locator('.detail-panel', has_text='scada_telemetry_db').count() == 1
        assert page.locator('.detail-panel', has_text='生产元数据快照').count() == 1
        assert page.locator('.detail-panel', has_text='scada_alarm_raw').count() == 1
        page.locator('.detail-panel .link', has_text='查看目录').click()
        assert page.locator('.tab.active', has_text='表结构').count() == 1
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

        # ⑧ 数据服务接入指南（十六期）：三类接入契约 + 复制按钮 + 无鉴权/密钥
        # API 类型（svc_001 风资源评估 API）
        click_menu(page, '数据服务')
        page.locator('.table tbody tr', has_text='风资源评估 API').locator('button.link').first.click()
        assert page.locator('.tab.active', has_text='数据服务详情').count() == 1
        assert page.locator('.detail-panel', has_text='接入指南').count() == 1
        assert page.locator('.detail-panel', has_text='接口地址').count() == 1
        assert page.locator('.detail-panel', has_text='请求方法').count() == 1
        assert page.locator('.detail-panel', has_text='请求示例').count() == 1
        assert page.locator('.detail-panel', has_text='响应示例').count() == 1
        assert page.locator('.detail-panel button', has_text='复制').count() >= 2
        # 不出现鉴权/密钥
        assert page.locator('.detail-panel', has_text='密钥').count() == 0
        assert page.locator('.detail-panel', has_text='鉴权').count() == 0
        assert page.locator('.detail-panel', has_text='API Key').count() == 0
        # 订阅类型（svc_002 SCADA 实时数据订阅）
        click_menu(page, '数据服务')
        page.locator('.table tbody tr', has_text='SCADA 实时数据订阅').locator('button.link').first.click()
        assert page.locator('.detail-panel', has_text='协议').count() == 1
        assert page.locator('.detail-panel', has_text='MQTT').count() >= 1
        assert page.locator('.detail-panel', has_text='订阅主题').count() == 1
        assert page.locator('.detail-panel', has_text='消息字段').count() == 1
        # 数据包类型（svc_004 海域限制因素共享）
        click_menu(page, '数据服务')
        page.locator('.table tbody tr', has_text='海域限制因素共享').locator('button.link').first.click()
        assert page.locator('.detail-panel', has_text='文件格式').count() == 1
        assert page.locator('.detail-panel', has_text='下载地址').count() == 1
        assert page.locator('.detail-panel', has_text='包含字段').count() == 1

        # ⑦ 门户管理（上架列表 + 审批链详情 + 占位写按钮）
        click_menu(page, '门户管理')
        assert page.locator('.tab', has_text='门户管理').count() == 1
        assert page.locator('.table tbody tr').count() == 8
        assert page.locator('button', has_text='发起上架').count() == 1
        page.locator('.table tbody tr .link').first.click()
        assert page.locator('.tab.active', has_text='门户管理详情').count() == 1
        assert page.locator('.detail-panel', has_text='责任业务方').count() == 1
        assert page.locator('.flow-step').count() >= 3
        # 右上角「资产门户」按钮存在
        assert page.locator('.header button', has_text='资产门户').count() == 1

        # ⑧ 门户资产新增（仅由门户管理「发起上架」转跳进入，不在侧边栏）
        click_menu(page, '门户管理')
        page.locator('button', has_text='发起上架').click()
        assert page.locator('.tab.active', has_text='门户资产新增').count() == 1
        assert page.locator('.sidebar-item', has_text='门户资产新增').count() == 0
        for label in ['资产名', '业务分类', '业务介绍', '责任业务方', '使用方式', '安全分级']:
            assert page.locator('.form-label', has_text=label).count() == 1, f'缺字段 {label}'
        # 打包资产搜索器：类型筛选 + 名称搜索
        assert page.locator('.picker-search select').count() == 1
        assert page.locator('.picker-search input').count() == 1
        # 已选资产清单表头「资产类型」「资产名称」 + 默认空清单
        assert page.locator('th', has_text='资产类型').count() >= 1
        assert page.locator('th', has_text='资产名称').count() >= 1
        assert page.locator('.table tbody', has_text='尚未选择资产').count() == 1
        # 勾选候选 → 清单出现一行（数据表在前）
        page.locator('.picker-results input[type=checkbox]').first.check()
        assert page.locator('.table tbody tr', has_text='数据表').count() == 1
        # 名称搜索过滤：命中 / 无命中
        page.locator('.picker-search input').fill('测风')
        assert page.locator('.picker-results label').count() >= 1
        page.locator('.picker-search input').fill('zzz_not_exist')
        assert page.locator('.picker-empty', has_text='无匹配资产').count() == 1

        # 跨模块转跳：质量看板 → 定位字段 → 打开表详情 tab
        page.locator('.tab', has_text='数据质量看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='测风数据表').count() == 1
        assert page.locator('.field-table').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
