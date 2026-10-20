"""Production React theme matrix: semantics, drafts, controls, portals and mobile geometry."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE='http://127.0.0.1:5181/'
OUT=Path('docs/rosa-fluid-ui');OUT.mkdir(exist_ok=True)
expected={'success-bg':'rgb(237, 247, 241)','success-ink':'rgb(66, 119, 100)','success-line':'rgb(84, 132, 109)','fail-bg':'rgb(255, 242, 242)','fail-ink':'rgb(157, 66, 85)','fail-line':'rgb(198, 117, 133)','warning-bg':'rgb(255, 241, 226)','warning-ink':'rgb(141, 82, 40)','warning-line':'rgb(223, 181, 137)','section-bg':'rgb(241, 242, 245)','section-ink':'rgb(83, 83, 101)'}
reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,419]:
  for theme in ['spatial','fluid']:
   for brand in ['spatial','crimson','ocean']:
    ctx=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    query=f'?version=5&brandDemo=1&visualTheme={theme}&brand={brand}'
    for screen in ['overview','live','result','submission']:
     p.goto(BASE+query+'&flowPreview='+screen);p.locator('.phone').wait_for();p.wait_for_timeout(450)
     assert p.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,theme,brand,screen,'overflow')
     if screen=='live':
      for outcome in ['met','fail']:
       choice=p.locator(f'.spatial-choice[data-outcome={outcome}]');choice.click();p.wait_for_timeout(350)
       ink='success' if outcome=='met' else 'fail'
       colors=choice.evaluate('(e)=>({bg:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderTopColor,radio:getComputedStyle(e.querySelector(".spatial-radio")).color})')
       assert colors=={'bg':expected[ink+'-bg'],'border':expected[ink+'-line'],'radio':expected[ink+'-ink']},(theme,brand,colors)
       expect(p.get_by_role('button',name='Next',exact=True)).to_be_enabled()
       if width==390:p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{brand}-{outcome}.png'))
      # Theme switching retains draft, and portalled menu inherits theme.
      saved=p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")')
      p.get_by_role('combobox',name='Visual theme',exact=True).click()
      p.get_by_role('option',name='Fluid' if theme=='spatial' else 'Spatial',exact=True).click()
      assert p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")')==saved
      p.get_by_role('combobox',name='Visual theme',exact=True).click();p.get_by_role('option',name=theme.title(),exact=True).click()
      p.get_by_role('button',name='Sections',exact=True).click()
      dialog=p.get_by_role('dialog');expect(dialog).to_be_visible()
      if theme=='fluid':assert 'blur(24px)' in dialog.evaluate('(e)=>getComputedStyle(e).backdropFilter')
      critical=dialog.locator('.spatial-section-list button').nth(1);critical.click();p.wait_for_timeout(450)
      expect(p.locator('.spatial-badge[data-tone=critical]')).to_be_visible()
      if width==390:p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{brand}-critical.png'))
     if screen=='submission':expect(p.get_by_role('button',name='Submit assessment',exact=True)).to_be_disabled()
     if width==390:p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{brand}-{screen}.png'))
    # Entry/notification is the existing participant assignment entrypoint.
    p.goto(BASE+query);p.wait_for_timeout(450)
    if width==390:p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{brand}-entry.png'))
    assert not errors,errors
    reports.append({'width':width,'theme':theme,'brand':brand,'screens':5,'semanticStates':'pass/fail/critical','errors':errors})
    ctx.close()
 # Explorer uses the actual components, including original assignment component.
 p=b.new_page(viewport={'width':1440,'height':1000});p.goto(BASE+'?view=design-system&visualTheme=fluid&brand=ocean&section=rosa&pattern=assignment');p.wait_for_timeout(600)
 expect(p.get_by_role('combobox',name='Visual theme',exact=True)).to_be_visible()
 p.screenshot(path=str(OUT/'explorer.png'),full_page=True)
 # Legacy and tools remain reachable without Fluid activation.
 for query in ['?version=2','?version=3','?version=4','?studio=1','?preview=1']:
  p.goto(BASE+query);p.wait_for_timeout(250);assert p.locator('body').inner_text().strip()
 b.close()
(OUT/'validation.json').write_text(json.dumps(reports,indent=2))
print('PASS: 18 mobile/theme/brand configurations, five journey screens, exact selected semantic colors, critical tags, portals, live switching, disabled submission, Explorer and legacy/tool smoke.')
